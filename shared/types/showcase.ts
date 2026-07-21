export type ShowcaseKind = 'anime' | 'film' | 'track'

export type ShowcaseItem = {
  id: string
  kind: ShowcaseKind
  title: string
  subtitle: string
  meta: string
  url: string
  image: string | null
}

export type ShowcaseZone = 'anime' | 'films' | 'music' | 'all'

export type MusicActivityPoint = {
  label: string
  count: number
}
