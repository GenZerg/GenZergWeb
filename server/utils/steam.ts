import type { SteamProfile } from '../../shared/types/profile'

const STEAM_CUSTOM_URL = 'GenZerG'
const STEAM_PROFILE_XML = `https://steamcommunity.com/id/${STEAM_CUSTOM_URL}/?xml=1`
const STEAM_PROFILE_HTML = `https://steamcommunity.com/id/${STEAM_CUSTOM_URL}`

function xmlTag(xml: string, tag: string): string | null {
  const match = xml.match(new RegExp(`<${tag}><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>`))
    || xml.match(new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`))
  if (!match?.[1]) return null
  return match[1].trim() || null
}

async function scrapeSteamExtras(): Promise<{
  level: number | null
  gamesOwned: number | null
  badges: number | null
  friends: number | null
  achievements: number | null
  recentGames: string[]
}> {
  try {
    const html = await $fetch<string>(STEAM_PROFILE_HTML, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; GenZergWeb/1.0; +https://github.com/GenZerg)',
        Accept: 'text/html',
      },
      responseType: 'text',
    })

    const levelMatch = html.match(/friendPlayerLevelNum[^>]*>\s*(\d+)/)
    const totals = [...html.matchAll(/profile_count_link_total[^>]*>\s*([0-9,]+)/g)]
      .map((match) => Number(match[1]!.replace(/,/g, '')))
    // Public order observed: awards, badges, games, workshop, artwork, groups, friends
    const badges = totals[1] ?? null
    const gamesOwned = totals[2] ?? null
    const friends = totals[6] ?? null
    const achievementsMatch = html.match(/([0-9,]+)<\/div>\s*<div[^>]*>Achievements/)
    const recentGames = [...html.matchAll(/class="game_name[^"]*"[^>]*>\s*<a[^>]*>([^<]+)<\/a>/g)]
      .map((match) => match[1]!.trim())
      .filter(Boolean)
      .slice(0, 6)

    return {
      level: levelMatch ? Number(levelMatch[1]) : null,
      gamesOwned,
      badges,
      friends,
      achievements: achievementsMatch ? Number(achievementsMatch[1]!.replace(/,/g, '')) : null,
      recentGames,
    }
  }
  catch {
    return {
      level: null,
      gamesOwned: null,
      badges: null,
      friends: null,
      achievements: null,
      recentGames: [],
    }
  }
}

export async function fetchSteamProfile(): Promise<SteamProfile | null> {
  try {
    const [xml, extras] = await Promise.all([
      $fetch<string>(STEAM_PROFILE_XML, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; GenZergWeb/1.0; +https://github.com/GenZerg)',
          Accept: 'application/xml,text/xml,*/*',
        },
        responseType: 'text',
      }),
      scrapeSteamExtras(),
    ])

    const steamId64 = xmlTag(xml, 'steamID64')
    const name = xmlTag(xml, 'steamID')
    if (!steamId64 || !name) return null

    const customUrl = xmlTag(xml, 'customURL') || STEAM_CUSTOM_URL

    return {
      steamId64,
      name,
      customUrl,
      profileUrl: `https://steamcommunity.com/id/${customUrl}`,
      avatar: xmlTag(xml, 'avatarFull') || xmlTag(xml, 'avatarMedium'),
      location: xmlTag(xml, 'location'),
      memberSince: xmlTag(xml, 'memberSince'),
      onlineState: xmlTag(xml, 'onlineState'),
      level: extras.level,
      gamesOwned: extras.gamesOwned,
      badges: extras.badges,
      friends: extras.friends,
      achievements: extras.achievements,
      recentGames: extras.recentGames,
    }
  }
  catch {
    return null
  }
}
