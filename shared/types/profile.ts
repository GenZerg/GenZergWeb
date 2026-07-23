export type SteamProfile = {
  steamId64: string
  name: string
  customUrl: string
  profileUrl: string
  avatar: string | null
  location: string | null
  memberSince: string | null
  onlineState: string | null
  level: number | null
  gamesOwned: number | null
  badges: number | null
  friends: number | null
  achievements: number | null
  recentGames: string[]
}

export type ProfileLink = {
  id: string
  label: string
  url: string
  detail: string
}

export type ProfileHighlight = {
  label: string
  value: string
  hint?: string
}

export type ProfileMediaItem = {
  id: string
  title: string
  subtitle?: string
  meta?: string
  url: string
  image: string | null
  score?: number | null
}

export type ProfileStat = {
  label: string
  value: string
  hint?: string
}

export type ProfileCategoryId = 'overview' | 'anime' | 'films' | 'music' | 'games' | 'code'

export type ProfileCategoryMeta = {
  id: ProfileCategoryId
  label: string
  blurb: string
  href: string
  sourceUrl: string
  sourceLabel: string
  cover: string | null
}

export type ProfileAnimeCategory = {
  stats: ProfileStat[]
  favorites: ProfileMediaItem[]
  topRated: ProfileMediaItem[]
  watching: ProfileMediaItem[]
  genres: Array<{ genre: string; count: number }>
  formats: Array<{ format: string; count: number }>
  tags: Array<{ tag: string; count: number }>
  mangaFavorite: ProfileMediaItem | null
}

export type ProfileFilmsCategory = {
  stats: ProfileStat[]
  recent: ProfileMediaItem[]
  topRated: ProfileMediaItem[]
}

export type ProfileMusicCategory = {
  stats: ProfileStat[]
  artists: Array<{ name: string; detail: string; plays?: number }>
  recentTracks: Array<{ name: string; artist: string }>
  lovedTracks: Array<{ name: string; artist: string }>
}

export type ProfileGamesCategory = {
  stats: ProfileStat[]
  recentGames: string[]
  notes: string[]
}

export type ProfileCodeCategory = {
  stats: ProfileStat[]
  repos: Array<{
    name: string
    description: string | null
    language: string | null
    url: string
    updatedAt: string | null
  }>
}

export type ProfileCategories = {
  anime: ProfileAnimeCategory
  films: ProfileFilmsCategory
  music: ProfileMusicCategory
  games: ProfileGamesCategory
  code: ProfileCodeCategory
}

export type ProfileResponse = {
  handle: string
  location: string | null
  tagline: string
  avatar: string | null
  banner: string | null
  links: ProfileLink[]
  highlights: ProfileHighlight[]
  categories: ProfileCategoryMeta[]
  genres: Array<{ genre: string; count: number }>
  favorites: Array<{
    id: number
    title: string
    cover: string | null
    url: string
  }>
  listeningFlavor: Array<{ name: string; detail: string }>
  anilist: {
    animeCount: number
    daysWatched: number
    meanScore: number
    completed: number
    current: number
  } | null
  letterboxd: {
    filmsLogged: number | null
    profileUrl: string
  }
  steam: SteamProfile | null
  lastfm: {
    profileUrl: string
    since: string | null
    scrobbles: number | null
    scrobblesPerDay: number | null
  }
  github: {
    profileUrl: string
    location: string | null
    name: string | null
  }
  details: ProfileCategories
}
