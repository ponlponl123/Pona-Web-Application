"use server"
import { EndpointHTTP } from "../endpoint"
import { ArtistFull as ArtistFullv1 } from "@/types/youtube/ytmusic"
import { ArtistFull, ProfileFull } from "@/types/youtube/ytmusic-api"

export interface SubscribeResult {
  message: string
  state: number
}
export interface SubscribedChannelsResult {
  artistId: string
  info: {
    v1: ArtistFullv1 | Partial<ArtistFullv1> | undefined
    v2: ArtistFull | Partial<ArtistFull> | undefined
    user: ProfileFull | Partial<ProfileFull> | undefined
  }
}

export async function IsSubscribed(
  tokenType: string,
  tokenKey: string,
  channelId: string
): Promise<false | SubscribeResult> {
  try {
    const endpoint = new URL(`${EndpointHTTP}/v1/channel/subscribe`)
    endpoint.searchParams.append("c", channelId)

    const response = await fetch(endpoint.toString(), {
      method: "GET",
      headers: { Authorization: `${tokenType} ${tokenKey}` },
      signal: AbortSignal.timeout(10000),
    })

    if (response.ok) return (await response.json()) as SubscribeResult
    return false
  } catch {
    return false
  }
}

export default async function subscribe(
  tokenType: string,
  tokenKey: string,
  channelId: string
): Promise<boolean> {
  try {
    const endpoint = new URL(`${EndpointHTTP}/v1/channel/subscribe`)
    endpoint.searchParams.append("c", channelId)

    const response = await fetch(endpoint.toString(), {
      method: "POST",
      headers: { Authorization: `${tokenType} ${tokenKey}` },
      signal: AbortSignal.timeout(10000),
    })

    return response.ok
  } catch {
    return false
  }
}

export async function fetchSubscribedChannels(
  tokenType: string,
  tokenKey: string,
  lim?: number
): Promise<false | SubscribedChannelsResult[]> {
  try {
    const endpoint = new URL(`${EndpointHTTP}/v1/channel/subscribe/s`)
    if (lim) endpoint.searchParams.append("limit", String(lim))

    const response = await fetch(endpoint.toString(), {
      method: "GET",
      headers: { Authorization: `${tokenType} ${tokenKey}` },
      signal: AbortSignal.timeout(10000),
    })

    if (response.ok) {
      const data = await response.json()
      const list = (data.result || []) as SubscribedChannelsResult[]
      return Array.isArray(list) ? list : []
    }
    return false
  } catch {
    return false
  }
}

export async function unsubscribe(
  tokenType: string,
  tokenKey: string,
  channelId: string
): Promise<boolean> {
  try {
    const endpoint = new URL(`${EndpointHTTP}/v1/channel/subscribe`)
    endpoint.searchParams.append("c", channelId)

    const response = await fetch(endpoint.toString(), {
      method: "DELETE",
      headers: { Authorization: `${tokenType} ${tokenKey}` },
      signal: AbortSignal.timeout(10000),
    })

    return response.ok
  } catch {
    return false
  }
}
