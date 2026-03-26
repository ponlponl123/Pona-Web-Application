"use server"
import { Track } from "@/types/ponaPlayer"
import { EndpointHTTP } from "../endpoint"

export interface History {
  id: number
  requestby: string
  track: Track
  uniqueid: string
}

export interface Tracks {
  message: string
  tracks: History[]
}

export default async function fetchHistory(
  tokenType: string,
  tokenKey: string,
  limit?: number
): Promise<false | Tracks> {
  try {
    const endpoint = new URL(`${EndpointHTTP}/v1/music/history`)
    endpoint.searchParams.append("l", String(limit || 14))

    const response = await fetch(endpoint.toString(), {
      method: "GET",
      headers: {
        Authorization: `${tokenType} ${tokenKey}`,
      },
      signal: AbortSignal.timeout(10000),
    })

    if (response.ok) {
      return (await response.json()) as Tracks
    }
    return false
  } catch (error) {
    console.error(
      "[FetchHistory] Error:",
      error instanceof Error ? error.message : "Unknown error"
    )
    return false
  }
}

export async function fetchSearchHistory(
  tokenType: string,
  tokenKey: string
): Promise<false | string[]> {
  try {
    const endpoint = new URL(`${EndpointHTTP}/v1/music/history/search`)

    const response = await fetch(endpoint.toString(), {
      method: "GET",
      headers: {
        Authorization: `${tokenType} ${tokenKey}`,
      },
      signal: AbortSignal.timeout(10000),
    })

    if (response.ok) {
      const data = await response.json()
      return data.results as string[]
    }
    return false
  } catch (error) {
    console.error(
      "[FetchSearchHistory] Error:",
      error instanceof Error ? error.message : "Unknown error"
    )
    return false
  }
}
