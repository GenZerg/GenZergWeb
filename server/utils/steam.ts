import type { SteamProfile } from '../../shared/types/profile'

const STEAM_CUSTOM_URL = 'GenZerG'
const STEAM_PROFILE_XML = `https://steamcommunity.com/id/${STEAM_CUSTOM_URL}/?xml=1`

function xmlTag(xml: string, tag: string): string | null {
  const match = xml.match(new RegExp(`<${tag}><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>`))
    || xml.match(new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`))
  if (!match?.[1]) return null
  return match[1].trim() || null
}

export async function fetchSteamProfile(): Promise<SteamProfile | null> {
  try {
    const xml = await $fetch<string>(STEAM_PROFILE_XML, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; GenZergWeb/1.0; +https://github.com/GenZerg)',
        Accept: 'application/xml,text/xml,*/*',
      },
      responseType: 'text',
    })

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
    }
  }
  catch {
    return null
  }
}
