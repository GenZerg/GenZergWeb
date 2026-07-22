import type { ProfileResponse } from '../../shared/types/profile'

const HANDLE = 'GenZerg'

/** Public listening flavor from GenZerg’s Last.fm profile (fallback when API key is unset). */
const LISTENING_FLAVOR = [
  { name: 'ONE OK ROCK', detail: 'Top rotation' },
  { name: 'Pierce the Veil', detail: 'So Far So Fake on loop' },
  { name: 'Michael Jackson', detail: 'Always in the mix' },
  { name: 'Yorushika', detail: 'JP indie favorite' },
  { name: 'Sakurazaka46', detail: 'Recent scrobbles' },
  { name: 'ZUTOMAYO', detail: 'Late-night listens' },
]

export default defineEventHandler(async (): Promise<ProfileResponse> => {
  const [anilist, steam, filmsLogged] = await Promise.all([
    fetchAnilistProfile(HANDLE).catch(() => null),
    fetchSteamProfile(),
    fetchLetterboxdFilmCount(),
  ])

  const location = anilist
    ? (steam?.location || 'Pathumthani, Thailand')
    : (steam?.location || null)

  const highlights = [
    anilist
      ? {
          label: 'Anime logged',
          value: String(anilist.animeCount),
          hint: `${anilist.daysWatched} days watched`,
        }
      : null,
    anilist
      ? {
          label: 'Completed',
          value: String(anilist.completed),
          hint: `${anilist.current} currently watching`,
        }
      : null,
    filmsLogged != null
      ? {
          label: 'Films logged',
          value: String(filmsLogged),
          hint: 'Letterboxd diary',
        }
      : null,
    steam
      ? {
          label: 'Steam since',
          value: steam.memberSince?.match(/\d{4}/)?.[0] || '2013',
          hint: steam.location || 'Gamer roots',
        }
      : null,
    {
      label: 'Scrobbling since',
      value: 'Jun 2023',
      hint: 'Last.fm pulse',
    },
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
      detail: 'Scrobbling since Jun 2023',
    },
    {
      id: 'steam',
      label: 'Steam',
      url: steam?.profileUrl || 'https://steamcommunity.com/id/GenZerG',
      detail: steam?.memberSince ? `Member since ${steam.memberSince}` : 'GenZerG',
    },
    {
      id: 'github',
      label: 'GitHub',
      url: 'https://github.com/GenZerg',
      detail: 'Builds in the open',
    },
  ]

  return {
    handle: HANDLE,
    location,
    tagline: 'Thailand-rooted creator energy — anime deep cuts, film diaries, loud playlists, and long Steam nights.',
    avatar: anilist?.avatar || steam?.avatar || null,
    banner: anilist?.banner || null,
    links,
    highlights,
    genres: anilist?.genres ?? [],
    favorites: anilist?.favorites ?? [],
    listeningFlavor: LISTENING_FLAVOR,
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
    },
    github: {
      profileUrl: 'https://github.com/GenZerg',
      location: 'Pathumthani, Thailand',
    },
  }
})
