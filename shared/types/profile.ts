export type SteamProfile = {
  steamId64: string
  name: string
  customUrl: string
  profileUrl: string
  avatar: string | null
  location: string | null
  memberSince: string | null
  onlineState: string | null
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

export type ProfileResponse = {
  handle: string
  location: string | null
  tagline: string
  avatar: string | null
  banner: string | null
  links: ProfileLink[]
  highlights: ProfileHighlight[]
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
  }
  github: {
    profileUrl: string
    location: string | null
  }
}
