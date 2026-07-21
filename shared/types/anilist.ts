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
