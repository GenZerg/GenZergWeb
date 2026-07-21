export type LetterboxdFilm = {
  id: string
  title: string
  year: number | null
  slug: string
  url: string
  rating: number | null
  posterUrl: string | null
}

export type FilmsResponse = {
  user: string
  profileUrl: string
  filmsUrl: string
  count: number
  films: LetterboxdFilm[]
  source: 'letterboxd-html'
  posters: boolean
}
