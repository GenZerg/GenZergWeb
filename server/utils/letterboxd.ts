import type { LetterboxdFilm } from '../../shared/types/letterboxd'

const LETTERBOXD_USER = 'genzerg'
const MAX_PAGES = 3

function decodeEntities(value: string): string {
  return value
    .replace(/&#039;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
}

function parseTitleYear(rawName: string): { title: string, year: number | null } {
  const name = decodeEntities(rawName).trim()
  const match = name.match(/^(.*)\((\d{4})\)\s*$/)
  if (!match) return { title: name, year: null }
  return { title: match[1]!.trim(), year: Number(match[2]) }
}

function parseFilmsFromHtml(html: string): LetterboxdFilm[] {
  const posterRe =
    /<div class="react-component"[^>]*data-component-class="LazyPoster"[^>]*>/g
  const matches = [...html.matchAll(posterRe)]
  const films: LetterboxdFilm[] = []

  for (const match of matches) {
    const start = match.index ?? 0
    const chunk = html.slice(start, start + 3600)
    const name = chunk.match(/data-item-name="([^"]+)"/)?.[1]
    const slug = chunk.match(/data-item-slug="([^"]+)"/)?.[1]
    const link = chunk.match(/data-item-link="([^"]+)"/)?.[1]
    const uid = chunk.match(/film:(\d+)/)?.[1]
    if (!name || !slug || !link) continue

    const rated = chunk.match(/rated-(\d+)/)?.[1]
    const { title, year } = parseTitleYear(name)
    const rating = rated ? Number(rated) / 2 : null

    films.push({
      id: uid || slug,
      title,
      year,
      slug,
      url: link.startsWith('http') ? link : `https://letterboxd.com${link}`,
      rating,
      posterUrl: null,
    })
  }

  return films
}

async function fetchFilmsPage(page: number): Promise<string> {
  const path = page <= 1
    ? `https://letterboxd.com/${LETTERBOXD_USER}/films/`
    : `https://letterboxd.com/${LETTERBOXD_USER}/films/page/${page}/`

  return $fetch<string>(path, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; GenZergWeb/1.0; +https://github.com/genzerg)',
      Accept: 'text/html,application/xhtml+xml',
    },
    responseType: 'text',
  })
}

export async function fetchLetterboxdFilms() {
  const profileUrl = `https://letterboxd.com/${LETTERBOXD_USER}/`
  const filmsUrl = `https://letterboxd.com/${LETTERBOXD_USER}/films/`
  const films: LetterboxdFilm[] = []
  const seen = new Set<string>()

  for (let page = 1; page <= MAX_PAGES; page++) {
    let html = ''
    try {
      html = await fetchFilmsPage(page)
    } catch (error) {
      if (page === 1) {
        throw createError({
          statusCode: 502,
          statusMessage: 'Could not reach Letterboxd films page.',
          cause: error,
        })
      }
      break
    }

    const pageFilms = parseFilmsFromHtml(html)
    if (!pageFilms.length) break

    for (const film of pageFilms) {
      if (seen.has(film.id)) continue
      seen.add(film.id)
      films.push(film)
    }

    // Stop early if this page looked sparse (last page)
    if (pageFilms.length < 40) break
  }

  const withPosters = await attachTmdbPosters(films)

  return {
    user: 'GenZerg',
    profileUrl,
    filmsUrl,
    count: withPosters.length,
    films: withPosters,
    source: 'letterboxd-html' as const,
    posters: Boolean(useRuntimeConfig().tmdbApiKey),
  }
}
