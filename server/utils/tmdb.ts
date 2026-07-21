type TmdbSearchResult = {
  id: number
  poster_path?: string | null
  title?: string
  name?: string
  release_date?: string
  first_air_date?: string
}

type TmdbSearchResponse = {
  results?: TmdbSearchResult[]
}

const posterCache = new Map<string, string | null>()

function cacheKey(title: string, year: number | null) {
  return `${title.toLowerCase()}::${year ?? ''}`
}

async function tmdbSearch(
  apiKey: string,
  path: 'search/movie' | 'search/tv',
  title: string,
  year: number | null,
): Promise<string | null> {
  const query: Record<string, string> = {
    api_key: apiKey,
    query: title,
    include_adult: 'false',
  }
  if (year) {
    if (path === 'search/movie') query.year = String(year)
    else query.first_air_date_year = String(year)
  }

  const payload = await $fetch<TmdbSearchResponse>(`https://api.themoviedb.org/3/${path}`, {
    query,
  })

  const hit = payload.results?.find((item) => item.poster_path)
  return hit?.poster_path
    ? `https://image.tmdb.org/t/p/w342${hit.poster_path}`
    : null
}

export async function resolveTmdbPoster(title: string, year: number | null): Promise<string | null> {
  const config = useRuntimeConfig()
  const apiKey = config.tmdbApiKey as string
  if (!apiKey) return null

  const key = cacheKey(title, year)
  if (posterCache.has(key)) return posterCache.get(key) ?? null

  try {
    let poster = await tmdbSearch(apiKey, 'search/movie', title, year)
    if (!poster) poster = await tmdbSearch(apiKey, 'search/tv', title, year)
    posterCache.set(key, poster)
    return poster
  } catch {
    posterCache.set(key, null)
    return null
  }
}

export async function attachTmdbPosters<T extends { title: string, year: number | null, posterUrl: string | null }>(
  items: T[],
  concurrency = 6,
): Promise<T[]> {
  const config = useRuntimeConfig()
  if (!(config.tmdbApiKey as string)) return items

  const results = [...items]
  let index = 0

  async function worker() {
    while (index < results.length) {
      const current = index
      index += 1
      const item = results[current]!
      if (item.posterUrl) continue
      const posterUrl = await resolveTmdbPoster(item.title, item.year)
      results[current] = { ...item, posterUrl }
    }
  }

  await Promise.all(Array.from({ length: Math.min(concurrency, results.length) }, () => worker()))
  return results
}
