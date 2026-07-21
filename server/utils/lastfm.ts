import type { LastfmDayBucket, LastfmRecentTrack, LastfmTopTrack } from '../../shared/types/lastfm'

const LASTFM_BASE = 'https://ws.audioscrobbler.com/2.0/'
const LASTFM_USER = 'GenZerg'

type LastfmImage = { size: string; '#text'?: string }
type LastfmArtistField = string | { '#text'?: string; name?: string }

type RawRecentTrack = {
  name?: string
  url?: string
  mbid?: string
  date?: { uts?: string; '#text'?: string }
  album?: { '#text'?: string }
  artist?: LastfmArtistField
  image?: LastfmImage[]
  '@attr'?: { nowplaying?: string }
}

type RawTopTrack = {
  name?: string
  url?: string
  mbid?: string
  playcount?: string
  '@attr'?: { rank?: string }
  artist?: { name?: string; url?: string; mbid?: string }
  image?: LastfmImage[]
}

function asArray<T>(value: T | T[] | undefined | null): T[] {
  if (!value) return []
  return Array.isArray(value) ? value : [value]
}

function artistName(artist: LastfmArtistField | undefined): string {
  if (!artist) return 'Unknown artist'
  if (typeof artist === 'string') return artist
  return artist['#text'] || artist.name || 'Unknown artist'
}

function bestImage(images: LastfmImage[] | undefined): string | null {
  if (!images?.length) return null
  const preferred = [...images].reverse().find((img) => img['#text'])
  return preferred?.['#text'] || null
}

function trackId(parts: Array<string | undefined>): string {
  return parts.filter(Boolean).join('::') || `track-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

async function lastfmGet<T>(method: string, params: Record<string, string | number>): Promise<T> {
  const config = useRuntimeConfig()
  const apiKey = config.lastfmApiKey as string

  if (!apiKey) {
    throw createError({
      statusCode: 503,
      statusMessage: 'Last.fm API key is not configured. Set NUXT_LASTFM_API_KEY.',
    })
  }

  const query = new URLSearchParams({
    method,
    api_key: apiKey,
    format: 'json',
    ...Object.fromEntries(
      Object.entries(params).map(([key, value]) => [key, String(value)]),
    ),
  })

  const payload = await $fetch<T & { error?: number; message?: string }>(
    `${LASTFM_BASE}?${query.toString()}`,
  )

  if (payload && typeof payload === 'object' && 'error' in payload && payload.error) {
    throw createError({
      statusCode: 502,
      statusMessage: payload.message || `Last.fm error ${payload.error}`,
    })
  }

  return payload
}

function mapRecent(track: RawRecentTrack): LastfmRecentTrack {
  const artist = artistName(track.artist)
  return {
    id: trackId([track.mbid, artist, track.name, track.date?.uts || 'now']),
    name: track.name || 'Unknown track',
    artist,
    album: track.album?.['#text'] || null,
    url: track.url || 'https://www.last.fm/',
    image: bestImage(track.image),
    playedAt: track.date?.['#text'] || null,
    nowPlaying: track['@attr']?.nowplaying === 'true',
  }
}

function mapTop(track: RawTopTrack, index: number): LastfmTopTrack {
  const artist = track.artist?.name || 'Unknown artist'
  return {
    id: trackId([track.mbid, artist, track.name, track['@attr']?.rank || String(index)]),
    name: track.name || 'Unknown track',
    artist,
    url: track.url || 'https://www.last.fm/',
    image: bestImage(track.image),
    playcount: Number(track.playcount || 0),
    rank: Number(track['@attr']?.rank || index + 1),
  }
}

function emptyDayBuckets(days: number): LastfmDayBucket[] {
  const buckets: LastfmDayBucket[] = []
  const now = new Date()

  for (let i = days - 1; i >= 0; i--) {
    const day = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - i))
    const date = day.toISOString().slice(0, 10)
    buckets.push({
      date,
      label: day.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' }),
      count: 0,
    })
  }

  return buckets
}

async function fetchRecentPage(user: string, from: number, page: number) {
  return lastfmGet<{
    recenttracks?: {
      track?: RawRecentTrack | RawRecentTrack[]
      '@attr'?: { totalPages?: string; page?: string }
    }
  }>('user.getRecentTracks', {
    user,
    from,
    limit: 200,
    page,
  })
}

async function buildActivity(days: number): Promise<LastfmDayBucket[]> {
  const buckets = emptyDayBuckets(days)
  const index = new Map(buckets.map((bucket, i) => [bucket.date, i]))
  const from = Math.floor(Date.now() / 1000) - days * 24 * 60 * 60
  let page = 1
  let totalPages = 1

  while (page <= totalPages && page <= 6) {
    const payload = await fetchRecentPage(LASTFM_USER, from, page)
    const tracks = asArray(payload.recenttracks?.track)
    totalPages = Number(payload.recenttracks?.['@attr']?.totalPages || 1)

    for (const track of tracks) {
      if (track['@attr']?.nowplaying === 'true') continue
      const uts = Number(track.date?.uts || 0)
      if (!uts) continue
      const date = new Date(uts * 1000).toISOString().slice(0, 10)
      const bucketIndex = index.get(date)
      if (bucketIndex === undefined) continue
      buckets[bucketIndex]!.count += 1
    }

    page += 1
  }

  return buckets
}

export async function fetchLastfmMusic() {
  const config = useRuntimeConfig()
  const apiKey = config.lastfmApiKey as string
  const profileUrl = `https://www.last.fm/user/${LASTFM_USER}`

  if (!apiKey) {
    return {
      user: LASTFM_USER,
      profileUrl,
      configured: false,
      message: 'Add NUXT_LASTFM_API_KEY to enable Last.fm. Get a free key at https://www.last.fm/api/account/create',
      recent: [],
      topWeekly: [],
      topMonthly: [],
      weeklyActivity: emptyDayBuckets(7),
      monthlyActivity: emptyDayBuckets(30),
    }
  }

  const [recentPayload, weeklyTopPayload, monthlyTopPayload, weeklyActivity, monthlyActivity] =
    await Promise.all([
      lastfmGet<{ recenttracks?: { track?: RawRecentTrack | RawRecentTrack[] } }>(
        'user.getRecentTracks',
        { user: LASTFM_USER, limit: 12, extended: 1 },
      ),
      lastfmGet<{ toptracks?: { track?: RawTopTrack | RawTopTrack[] } }>(
        'user.getTopTracks',
        { user: LASTFM_USER, period: '7day', limit: 8 },
      ),
      lastfmGet<{ toptracks?: { track?: RawTopTrack | RawTopTrack[] } }>(
        'user.getTopTracks',
        { user: LASTFM_USER, period: '1month', limit: 8 },
      ),
      buildActivity(7),
      buildActivity(30),
    ])

  return {
    user: LASTFM_USER,
    profileUrl,
    configured: true,
    recent: asArray(recentPayload.recenttracks?.track).map(mapRecent),
    topWeekly: asArray(weeklyTopPayload.toptracks?.track).map(mapTop),
    topMonthly: asArray(monthlyTopPayload.toptracks?.track).map(mapTop),
    weeklyActivity,
    monthlyActivity,
  }
}
