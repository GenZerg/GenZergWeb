import type { AnilistWatchingEntry } from '../../shared/types/anilist'

type AnilistMediaListResponse = {
  data?: {
    MediaListCollection?: {
      lists?: Array<{
        entries?: Array<{
          progress?: number | null
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

export async function fetchCurrentlyWatching(userName: string): Promise<AnilistWatchingEntry[]> {
  const payload = await $fetch<AnilistMediaListResponse>('https://graphql.anilist.co', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: {
      query: QUERY,
      variables: { userName },
    },
  })

  if (payload.errors?.length) {
    throw createError({
      statusCode: 502,
      statusMessage: payload.errors.map((e) => e.message).join('; ') || 'AniList GraphQL error',
    })
  }

  const entries = payload.data?.MediaListCollection?.lists?.flatMap((list) => list.entries ?? []) ?? []

  return entries
    .filter((entry) => entry.media?.id)
    .map((entry) => {
      const media = entry.media!
      const title =
        media.title?.userPreferred
        || media.title?.english
        || media.title?.romaji
        || `Anime #${media.id}`

      return {
        id: media.id,
        progress: entry.progress ?? 0,
        episodes: media.episodes ?? null,
        title,
        cover: media.coverImage?.large ?? null,
        color: media.coverImage?.color ?? null,
        url: media.siteUrl || `https://anilist.co/anime/${media.id}`,
        format: media.format ?? null,
      }
    })
}
