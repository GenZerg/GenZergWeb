import type {
  AnilistFavorite,
  AnilistProfile,
  AnilistScoredEntry,
  AnilistWatchingEntry,
} from '../../shared/types/anilist'

type AnilistMediaListResponse = {
  data?: {
    MediaListCollection?: {
      lists?: Array<{
        entries?: Array<{
          progress?: number | null
          score?: number | null
          media?: {
            id: number
            siteUrl?: string | null
            episodes?: number | null
            format?: string | null
            coverImage?: {
              large?: string | null
              color?: string | null
            } | null
            title?: {
              userPreferred?: string | null
              english?: string | null
              romaji?: string | null
            } | null
          } | null
        }>
      }>
    }
  }
  errors?: Array<{ message: string }>
}

type AnilistUserResponse = {
  data?: {
    User?: {
      id: number
      name: string
      siteUrl?: string | null
      avatar?: { large?: string | null } | null
      bannerImage?: string | null
      statistics?: {
        anime?: {
          count?: number | null
          meanScore?: number | null
          minutesWatched?: number | null
          episodesWatched?: number | null
          genres?: Array<{ genre?: string | null; count?: number | null }> | null
          formats?: Array<{ format?: string | null; count?: number | null }> | null
          tags?: Array<{ tag?: { name?: string | null } | null; count?: number | null }> | null
          statuses?: Array<{ status?: string | null; count?: number | null }> | null
        } | null
        manga?: { count?: number | null } | null
      } | null
      favourites?: {
        anime?: {
          nodes?: Array<{
            id: number
            siteUrl?: string | null
            title?: { english?: string | null; romaji?: string | null } | null
            coverImage?: { large?: string | null } | null
          }> | null
        } | null
        manga?: {
          nodes?: Array<{
            id: number
            siteUrl?: string | null
            title?: { english?: string | null; romaji?: string | null } | null
            coverImage?: { large?: string | null } | null
          }> | null
        } | null
      } | null
    } | null
  }
  errors?: Array<{ message: string }>
}

const QUERY = `
  query CurrentlyWatching($userName: String!) {
    MediaListCollection(userName: $userName, type: ANIME, status: CURRENT) {
      lists {
        entries {
          progress
          media {
            id
            siteUrl
            episodes
            format
            coverImage {
              large
              color
            }
            title {
              userPreferred
              english
              romaji
            }
          }
        }
      }
    }
  }
`

const PROFILE_QUERY = `
  query AnilistProfile($name: String!) {
    User(name: $name) {
      id
      name
      siteUrl
      avatar { large }
      bannerImage
      statistics {
        anime {
          count
          meanScore
          minutesWatched
          episodesWatched
          genres { genre count }
          formats { format count }
          tags { tag { name } count }
          statuses { status count }
        }
        manga { count }
      }
      favourites {
        anime {
          nodes {
            id
            siteUrl
            title { english romaji }
            coverImage { large }
          }
        }
        manga {
          nodes {
            id
            siteUrl
            title { english romaji }
            coverImage { large }
          }
        }
      }
    }
  }
`

const TOP_RATED_QUERY = `
  query TopRatedAnime($userName: String!) {
    MediaListCollection(userName: $userName, type: ANIME, status: COMPLETED, sort: SCORE_DESC) {
      lists {
        entries {
          score
          progress
          media {
            id
            siteUrl
            episodes
            format
            coverImage { large }
            title { userPreferred english romaji }
          }
        }
      }
    }
  }
`

async function anilistPost<T>(query: string, variables: Record<string, string>): Promise<T> {
  const payload = await $fetch<T & { errors?: Array<{ message: string }> }>('https://graphql.anilist.co', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: { query, variables },
  })

  if (payload.errors?.length) {
    throw createError({
      statusCode: 502,
      statusMessage: payload.errors.map((e) => e.message).join('; ') || 'AniList GraphQL error',
    })
  }

  return payload
}

function mediaTitle(media: {
  title?: {
    userPreferred?: string | null
    english?: string | null
    romaji?: string | null
  } | null
  id: number
}): string {
  return media.title?.userPreferred
    || media.title?.english
    || media.title?.romaji
    || `Anime #${media.id}`
}

function mapFavorite(node: {
  id: number
  siteUrl?: string | null
  title?: { english?: string | null; romaji?: string | null } | null
  coverImage?: { large?: string | null } | null
}, kind: 'anime' | 'manga' = 'anime'): AnilistFavorite {
  return {
    id: node.id,
    title: node.title?.english || node.title?.romaji || `${kind} #${node.id}`,
    cover: node.coverImage?.large ?? null,
    url: node.siteUrl || `https://anilist.co/${kind}/${node.id}`,
  }
}

export async function fetchCurrentlyWatching(userName: string): Promise<AnilistWatchingEntry[]> {
  const payload = await anilistPost<AnilistMediaListResponse>(QUERY, { userName })
  const entries = payload.data?.MediaListCollection?.lists?.flatMap((list) => list.entries ?? []) ?? []

  return entries
    .filter((entry) => entry.media?.id)
    .map((entry) => {
      const media = entry.media!
      return {
        id: media.id,
        progress: entry.progress ?? 0,
        episodes: media.episodes ?? null,
        title: mediaTitle(media),
        cover: media.coverImage?.large ?? null,
        color: media.coverImage?.color ?? null,
        url: media.siteUrl || `https://anilist.co/anime/${media.id}`,
        format: media.format ?? null,
      }
    })
}

export async function fetchTopRatedAnime(userName: string, limit = 18): Promise<AnilistScoredEntry[]> {
  const payload = await anilistPost<AnilistMediaListResponse>(TOP_RATED_QUERY, { userName })
  const entries = payload.data?.MediaListCollection?.lists?.flatMap((list) => list.entries ?? []) ?? []

  return entries
    .filter((entry) => entry.media?.id && (entry.score ?? 0) >= 9)
    .slice(0, limit)
    .map((entry) => {
      const media = entry.media!
      return {
        id: media.id,
        title: mediaTitle(media),
        cover: media.coverImage?.large ?? null,
        url: media.siteUrl || `https://anilist.co/anime/${media.id}`,
        score: entry.score ?? 0,
        episodes: media.episodes ?? null,
        format: media.format ?? null,
      }
    })
}

export async function fetchAnilistProfile(userName: string): Promise<AnilistProfile> {
  const [payload, topRated] = await Promise.all([
    anilistPost<AnilistUserResponse>(PROFILE_QUERY, { name: userName }),
    fetchTopRatedAnime(userName).catch(() => [] as AnilistScoredEntry[]),
  ])

  const user = payload.data?.User
  if (!user) {
    throw createError({ statusCode: 404, statusMessage: `AniList user ${userName} not found` })
  }

  const anime = user.statistics?.anime
  const statusCount = (status: string) =>
    anime?.statuses?.find((entry) => entry.status === status)?.count ?? 0

  const genres = (anime?.genres ?? [])
    .filter((entry): entry is { genre: string; count: number } => Boolean(entry.genre && entry.count != null))
    .map((entry) => ({ genre: entry.genre, count: entry.count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)

  const formats = (anime?.formats ?? [])
    .filter((entry): entry is { format: string; count: number } => Boolean(entry.format && entry.count != null))
    .map((entry) => ({ format: entry.format, count: entry.count }))
    .sort((a, b) => b.count - a.count)

  const tags = (anime?.tags ?? [])
    .filter((entry): entry is { tag: { name: string }; count: number } => Boolean(entry.tag?.name && entry.count != null))
    .map((entry) => ({ tag: entry.tag.name, count: entry.count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)

  const favorites = (user.favourites?.anime?.nodes ?? []).map((node) => mapFavorite(node, 'anime'))
  const mangaFavoriteNode = user.favourites?.manga?.nodes?.[0]
  const mangaFavorite = mangaFavoriteNode ? mapFavorite(mangaFavoriteNode, 'manga') : null
  const minutes = anime?.minutesWatched ?? 0

  return {
    id: user.id,
    name: user.name,
    profileUrl: user.siteUrl || `https://anilist.co/user/${userName}/`,
    avatar: user.avatar?.large ?? null,
    banner: user.bannerImage ?? null,
    animeCount: anime?.count ?? 0,
    mangaCount: user.statistics?.manga?.count ?? 0,
    meanScore: anime?.meanScore ?? 0,
    daysWatched: Math.round((minutes / 60 / 24) * 10) / 10,
    episodesWatched: anime?.episodesWatched ?? 0,
    completed: statusCount('COMPLETED'),
    current: statusCount('CURRENT'),
    planning: statusCount('PLANNING'),
    paused: statusCount('PAUSED'),
    dropped: statusCount('DROPPED'),
    genres,
    formats,
    tags,
    favorites,
    mangaFavorite,
    topRated,
  }
}
