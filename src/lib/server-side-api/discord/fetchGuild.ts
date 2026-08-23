"use server"
import { EndpointHTTP, EndpointKey } from "../endpoint"
import { fetchByAccessToken } from "./fetchUser"

const API_ENDPOINT = "https://discord.com/api/v10"
const COMMON_USER_AGENT = "Pona! Application (OpenPonlponl123.com/v1)"

export interface GuildInfo extends BasicGuildInfo {
  basic: false
}

export interface BasicGuildInfo {
  id: string
  name: string
  icon: string | null
  banner: string | null
  memberCount: number
  ownerId: string
  iconURL: string | null
  nameAcronym: string
  bannerURL: string | null
  isConnected?: boolean
}

export async function fetchGuildsV1(
  key: string,
  keyType: string
): Promise<false | GuildInfo[]> {
  try {
    const discordResponse = await fetch(`${API_ENDPOINT}/users/@me/guilds`, {
      method: "GET",
      headers: {
        Authorization: `${keyType} ${key}`,
        "User-Agent": COMMON_USER_AGENT,
      },
      signal: AbortSignal.timeout(15000),
    })

    if (!discordResponse.ok) return false

    const guildsFromUser = await discordResponse.json()
    if (!Array.isArray(guildsFromUser) || guildsFromUser.length === 0)
      return false

    const ponaResponse = await fetch(`${EndpointHTTP}/v1/guilds`, {
      method: "POST",
      headers: {
        Authorization: `Pona! ${EndpointKey}`,
        "Content-Type": "application/json",
        "User-Agent": COMMON_USER_AGENT,
      },
      body: JSON.stringify(guildsFromUser.map((guild: GuildInfo) => guild.id)),
      signal: AbortSignal.timeout(15000),
    })

    if (ponaResponse.ok) {
      const data = await ponaResponse.json()
      return data.guilds as GuildInfo[]
    }

    return false
  } catch (error) {
    console.error(
      "[FetchGuildsV1] Error:",
      error instanceof Error ? error.message : "Unknown"
    )
    return false
  }
}

export async function fetchGuilds(
  key: string,
  keyType: string
): Promise<false | GuildInfo[]> {
  try {
    const response = await fetch(`${EndpointHTTP}/v2/guilds`, {
      method: "GET",
      headers: {
        Authorization: `Pona! ${EndpointKey}`,
        "Content-Type": "application/json",
        "User-Agent": COMMON_USER_AGENT,
        Cookie: `type=${keyType}; key=${key};`,
      },
      signal: AbortSignal.timeout(10000),
    })

    if (response.ok) {
      const data = await response.json()
      const rawGuilds = data.guilds
      if (Array.isArray(rawGuilds)) {
        return rawGuilds.map((g: Record<string, unknown>) => ({
          ...g,
          isConnected: Boolean(g.isConnected ?? g.is_connected ?? g.connected ?? false),
        })) as GuildInfo[]
      }
      return data.guilds as GuildInfo[]
    }
    return false
  } catch (error) {
    console.error(
      "[FetchGuilds] Error:",
      error instanceof Error ? error.message : "Unknown"
    )
    return false
  }
}

export async function fetchGuild(
  key: string,
  keyType: string,
  guildId: string
): Promise<false | GuildInfo> {
  try {
    const user = await fetchByAccessToken(key, keyType)
    if (!user) return false

    const response = await fetch(`${EndpointHTTP}/v1/guild/${guildId}`, {
      method: "GET",
      headers: {
        Authorization: `Pona! ${EndpointKey}`,
        "Content-Type": "application/json",
        "User-Agent": COMMON_USER_AGENT,
        "User-Id": user.id,
      },
      signal: AbortSignal.timeout(10000),
    })

    if (response.ok) {
      const data = await response.json()
      if (data.guild) {
        const rawGuild = data.guild as Record<string, unknown>
        return {
          ...rawGuild,
          isConnected: Boolean(rawGuild.isConnected ?? rawGuild.is_connected ?? rawGuild.connected ?? false),
        } as GuildInfo
      }
    }
    return false
  } catch (error) {
    console.error(
      "[FetchGuild] Error:",
      error instanceof Error ? error.message : "Unknown"
    )
    return false
  }
}

export async function fetchBasicGuildInfo(
  key: string,
  keyType: string,
  guildId: string
): Promise<false | BasicGuildInfo> {
  try {
    const guildInfo = await fetchGuild(key, keyType, guildId)
    if (!guildInfo) return false

    return {
      name: guildInfo.name,
      id: guildInfo.id,
      icon: guildInfo.icon,
      banner: guildInfo.banner,
      memberCount: guildInfo.memberCount,
      ownerId: guildInfo.ownerId,
      iconURL: guildInfo.iconURL,
      nameAcronym: guildInfo.nameAcronym,
      bannerURL: guildInfo.bannerURL,
      isConnected: guildInfo.isConnected ?? false,
    } as BasicGuildInfo
  } catch (error) {
    console.error(
      "[FetchBasicGuildInfo] Error:",
      error instanceof Error ? error.message : "Unknown"
    )
    return false
  }
}
