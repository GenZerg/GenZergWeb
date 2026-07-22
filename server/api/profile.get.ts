import type { ProfileCategoryMeta, ProfileMediaItem, ProfileResponse } from '../../shared/types/profile'

const HANDLE = 'GenZerg'

const LISTENING_ARTISTS = [
  { name: 'ONE OK ROCK', detail: 'Top rotation', plays: 186 },
  { name: 'Michael Jackson', detail: 'Always in the mix', plays: 165 },
  { name: 'Pierce the Veil', detail: 'So Far So Fake on loop', plays: 76 },
  { name: 'Yorushika', detail: 'JP indie favorite', plays: 38 },
  { name: 'ZUTOMAYO', detail: 'Late-night listens', plays: 38 },
  { name: 'Sakurazaka46', detail: 'Recent scrobbles', plays: 37 },
  { name: 'Isekaijoucho', detail: 'Cover live sessions', plays: 36 },
  { name: 'Olivia Rodrigo', detail: 'Pop spike', plays: 31 },
]

const RECENT_TRACKS = [
  { name: "Nobody's Fault", artist: 'Sakurazaka46' },
  { name: 'Clock Strikes', artist: 'ONE OK ROCK' },
  { name: 'So Far So Fake', artist: 'Pierce the Veil' },
  { name: 'Chicago', artist: 'Michael Jackson' },
  { name: 'Bubble', artist: 'Yorushika' },
  { name: 'You Are Not Alone', artist: 'Michael Jackson' },
  { name: 'SAYONARA MAYBE', artist: 'NOMELON NOLEMON' },
  { name: 'Walking with you', artist: 'Novelbright' },
]

const LOVED_TRACKS = [
  { name: 'So Far So Fake', artist: 'Pierce the Veil' },
  { name: 'Clock Strikes', artist: 'ONE OK ROCK' },
  { name: 'Bubble', artist: 'Yorushika' },
  { name: 'You Are Not Alone', artist: 'Michael Jackson' },
  { name: 'My Love', artist: 'Westlife' },
]

const CATEGORIES: ProfileCategoryMeta[] = [
  {
    id: 'overview',
    label: 'Overview',
    blurb: 'The whole grove at a glance.',
    href: '/profile',
    sourceUrl: 'https://github.com/GenZerg',
    sourceLabel: 'GitHub',
  },
  {
    id: 'anime',
    label: 'Anime',
    blurb: 'AniList deep cuts, favorites, and score peaks.',
    href: '/profile/anime',
    sourceUrl: 'https://anilist.co/user/GenZerg/',
    sourceLabel: 'AniList',
  },
  {
    id: 'films',
    label: 'Films',
    blurb: 'Letterboxd diary — recent watches and five-star nights.',
    href: '/profile/films',
    sourceUrl: 'https://letterboxd.com/genzerg/',
    sourceLabel: 'Letterboxd',
  },
  {
    id: 'music',
    label: 'Music',
    blurb: 'Last.fm pulse — rock, idol, and late-night JP indie.',
    href: '/profile/music',
    sourceUrl: 'https://www.last.fm/user/GenZerg',
    sourceLabel: 'Last.fm',
  },
  {
    id: 'games',
    label: 'Games',
    blurb: 'Steam roots since 2013 — long sessions, badge grind.',
    href: '/profile/games',
    sourceUrl: 'https://steamcommunity.com/id/GenZerG',
    sourceLabel: 'Steam',
  },
  {
    id: 'code',
    label: 'Code',
    blurb: 'Public builds and experiments from Pathumthani.',
    href: '/profile/code',
    sourceUrl: 'https://github.com/GenZerg',
    sourceLabel: 'GitHub',
  },
]

function toMediaItem(entry: {
  id: number | string
  title: string
  cover?: string | null
  image?: string | null
  url: string
  subtitle?: string
  meta?: string
  score?: number | null
}): ProfileMediaItem {
  return {
    id: String(entry.id),
    title: entry.title,
    subtitle: entry.subtitle,
    meta: entry.meta,
    url: entry.url,
    image: entry.cover ?? entry.image ?? null,
    score: entry.score ?? null,
  }
}

export default defineEventHandler(async (): Promise<ProfileResponse> => {
  const [anilist, steam, filmsLogged, github, watching, films] = await Promise.all([
    fetchAnilistProfile(HANDLE).catch(() => null),
    fetchSteamProfile(),
    fetchLetterboxdFilmCount(),
    fetchGithubProfile(HANDLE),
    fetchCurrentlyWatching(HANDLE).catch(() => []),
    fetchLetterboxdFilms().catch(() => null),
  ])

  const location = steam?.location || github?.location || (anilist ? 'Pathumthani, Thailand' : null)
  const filmRows = films?.films ?? []
  const topFilms = [...filmRows]
    .filter((film) => film.rating != null)
    .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
    .slice(0, 12)

  const highlights = [
    anilist
      ? { label: 'Anime logged', value: String(anilist.animeCount), hint: `${anilist.daysWatched} days watched` }
      : null,
    anilist
      ? { label: 'Completed', value: String(anilist.completed), hint: `${anilist.current} currently watching` }
      : null,
    filmsLogged != null
      ? { label: 'Films logged', value: String(filmsLogged), hint: 'Letterboxd diary' }
      : null,
    { label: 'Scrobbles', value: '42k+', hint: '~37 per day since Jun 2023' },
    steam?.level != null
      ? { label: 'Steam level', value: String(steam.level), hint: steam.memberSince ? `Since ${steam.memberSince.match(/\d{4}/)?.[0]}` : 'GenZerG' }
      : null,
  ].filter(Boolean) as ProfileResponse['highlights']

  const links = [
    {
      id: 'anilist',
      label: 'AniList',
      url: anilist?.profileUrl || `https://anilist.co/user/${HANDLE}/`,
      detail: anilist ? `${anilist.animeCount} anime · mean ${anilist.meanScore}` : 'Anime list',
    },
    {
      id: 'letterboxd',
      label: 'Letterboxd',
      url: 'https://letterboxd.com/genzerg/',
      detail: filmsLogged != null ? `${filmsLogged} films logged` : 'Film diary',
    },
    {
      id: 'lastfm',
      label: 'Last.fm',
      url: 'https://www.last.fm/user/GenZerg',
      detail: '42,024 scrobbles · since Jun 2023',
    },
    {
      id: 'steam',
      label: 'Steam',
      url: steam?.profileUrl || 'https://steamcommunity.com/id/GenZerG',
      detail: steam?.level != null ? `Level ${steam.level}` : 'GenZerG',
    },
    {
      id: 'github',
      label: 'GitHub',
      url: github?.profileUrl || 'https://github.com/GenZerg',
      detail: github ? `${github.publicRepos} public repos` : 'Builds in the open',
    },
  ]

  return {
    handle: HANDLE,
    location,
    tagline: 'Thailand-rooted creator energy — anime deep cuts, film diaries, loud playlists, Steam nights, and code experiments.',
    avatar: anilist?.avatar || steam?.avatar || null,
    banner: anilist?.banner || null,
    links,
    highlights,
    categories: CATEGORIES,
    genres: anilist?.genres ?? [],
    favorites: anilist?.favorites ?? [],
    listeningFlavor: LISTENING_ARTISTS.map(({ name, detail }) => ({ name, detail })),
    anilist: anilist
      ? {
          animeCount: anilist.animeCount,
          daysWatched: anilist.daysWatched,
          meanScore: anilist.meanScore,
          completed: anilist.completed,
          current: anilist.current,
        }
      : null,
    letterboxd: {
      filmsLogged,
      profileUrl: 'https://letterboxd.com/genzerg/',
    },
    steam,
    lastfm: {
      profileUrl: 'https://www.last.fm/user/GenZerg',
      since: '28 Jun 2023',
      scrobbles: 42024,
      scrobblesPerDay: 37,
    },
    github: {
      profileUrl: github?.profileUrl || 'https://github.com/GenZerg',
      location: github?.location || 'Pathumthani, Thailand',
      name: github?.name || null,
    },
    details: {
      anime: {
        stats: [
          { label: 'Anime', value: String(anilist?.animeCount ?? 0) },
          { label: 'Days watched', value: String(anilist?.daysWatched ?? 0) },
          { label: 'Mean score', value: String(anilist?.meanScore ?? 0) },
          { label: 'Completed', value: String(anilist?.completed ?? 0), hint: `${anilist?.planning ?? 0} planned` },
          { label: 'Watching', value: String(anilist?.current ?? 0), hint: `${anilist?.paused ?? 0} paused` },
          { label: 'Manga', value: String(anilist?.mangaCount ?? 0) },
        ],
        favorites: (anilist?.favorites ?? []).map((fav) => toMediaItem({ ...fav, subtitle: 'Favorite' })),
        topRated: (anilist?.topRated ?? []).map((entry) => toMediaItem({
          ...entry,
          subtitle: entry.format || 'Anime',
          meta: `${entry.score}/10`,
          score: entry.score,
        })),
        watching: watching.slice(0, 18).map((entry) => toMediaItem({
          id: entry.id,
          title: entry.title,
          cover: entry.cover,
          url: entry.url,
          subtitle: entry.format || 'Watching',
          meta: entry.episodes
            ? `Ep ${entry.progress}/${entry.episodes}`
            : entry.progress > 0
              ? `Ep ${entry.progress}`
              : 'In progress',
        })),
        genres: anilist?.genres ?? [],
        formats: anilist?.formats ?? [],
        tags: anilist?.tags ?? [],
        mangaFavorite: anilist?.mangaFavorite
          ? toMediaItem({ ...anilist.mangaFavorite, subtitle: 'Manga favorite' })
          : null,
      },
      films: {
        stats: [
          { label: 'Films logged', value: filmsLogged != null ? String(filmsLogged) : '—' },
          { label: 'Recent batch', value: String(filmRows.length) },
          { label: 'Five-star picks', value: String(topFilms.filter((film) => film.rating === 5).length) },
        ],
        recent: filmRows.slice(0, 18).map((film) => toMediaItem({
          id: film.id,
          title: film.title,
          image: film.posterUrl,
          url: film.url,
          subtitle: film.year ? String(film.year) : 'Letterboxd',
          meta: film.rating != null ? `${film.rating}/5` : 'Unrated',
          score: film.rating,
        })),
        topRated: topFilms.map((film) => toMediaItem({
          id: film.id,
          title: film.title,
          image: film.posterUrl,
          url: film.url,
          subtitle: film.year ? String(film.year) : 'Letterboxd',
          meta: `${film.rating}/5`,
          score: film.rating,
        })),
      },
      music: {
        stats: [
          { label: 'Scrobbles', value: '42,024' },
          { label: 'Per day', value: '~37' },
          { label: 'Since', value: 'Jun 2023' },
        ],
        artists: LISTENING_ARTISTS,
        recentTracks: RECENT_TRACKS,
        lovedTracks: LOVED_TRACKS,
      },
      games: {
        stats: [
          { label: 'Level', value: steam?.level != null ? String(steam.level) : '—' },
          { label: 'Games', value: steam?.gamesOwned != null ? String(steam.gamesOwned) : '—' },
          { label: 'Badges', value: steam?.badges != null ? String(steam.badges) : '—' },
          { label: 'Achievements', value: steam?.achievements != null ? steam.achievements.toLocaleString('en-US') : '—' },
          { label: 'Friends', value: steam?.friends != null ? String(steam.friends) : '—' },
          { label: 'Member since', value: steam?.memberSince?.match(/\d{4}/)?.[0] || '2013' },
        ],
        recentGames: steam?.recentGames?.length
          ? steam.recentGames
          : ['PRAGMATA', 'Forza Horizon 6', 'Insaniquarium! Deluxe'],
        notes: [
          'Steam identity GenZerG — public profile from Thailand.',
          'Long-running account with badge collecting and achievement hunting energy.',
        ],
      },
      code: {
        stats: [
          { label: 'Repos', value: String(github?.publicRepos ?? 0) },
          { label: 'Followers', value: String(github?.followers ?? 0) },
          { label: 'Home', value: github?.location || 'Pathumthani, Thailand' },
        ],
        repos: github?.repos ?? [],
      },
    },
  }
})
