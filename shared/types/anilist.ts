export type AnilistFavorite = {
  id: number
  title: string
  cover: string | null
  url: string
}

export type AnilistGenreStat = {
  genre: string
  count: number
}

export type AnilistScoredEntry = {
  id: number
  title: string
  cover: string | null
  url: string
  score: number
  episodes: number | null
  format: string | null
}

export type AnilistProfile = {
  id: number
  name: string
  profileUrl: string
  avatar: string | null
  banner: string | null
  animeCount: number
  mangaCount: number
  meanScore: number
  daysWatched: number
  episodesWatched: number
  completed: number
  current: number
  planning: number
  paused: number
  dropped: number
  genres: AnilistGenreStat[]
  formats: Array<{ format: string; count: number }>
  tags: Array<{ tag: string; count: number }>
  favorites: AnilistFavorite[]
  mangaFavorite: AnilistFavorite | null
  topRated: AnilistScoredEntry[]
}

export type AnilistWatchingEntry = {
  id: number
  progress: number
  episodes: number | null
  title: string
  cover: string | null
  color: string | null
  url: string
  format: string | null
}

export type WatchingResponse = {
  user: string
  profileUrl: string
  count: number
  watching: AnilistWatchingEntry[]
}
