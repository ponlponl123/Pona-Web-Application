"use server"
import { Track } from "@/types/ponaPlayer"
import { EndpointHTTP, fetchWithForwardHeaders } from "../endpoint"

export interface History {
  id: number
  requestby: string
  track: Track
  uniqueid: string
}

export interface Pagination {
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface Tracks {
  message: string
  tracks: History[]
  pagination?: Pagination
}

export interface TopArtistEntry {
  name: string
  count: number
  artistId?: string
  thumbnail?: string
}

export interface HistoryStats {
  totalTracks: number
  totalDurationMs: number
  topArtist: string
  topArtists?: TopArtistEntry[]
}

export interface HistoryStatsResponse {
  message: string
  stats: HistoryStats
}

export default async function fetchHistory(
  tokenType: string,
  tokenKey: string,
  page: number = 1,
  limit: number = 15,
  query?: string
): Promise<false | Tracks> {
  try {
    const endpoint = new URL(`${EndpointHTTP}/v1/music/history`)
    endpoint.searchParams.append("p", String(page))
    endpoint.searchParams.append("l", String(limit))
    if (query && query.trim()) {
      endpoint.searchParams.append("q", query.trim())
    }

    const response = await fetchWithForwardHeaders(endpoint.toString(), {
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

export async function fetchHistoryStats(
  tokenType: string,
  tokenKey: string
): Promise<false | HistoryStatsResponse> {
  try {
    const endpoint = new URL(`${EndpointHTTP}/v1/music/history/stats`)

    const response = await fetchWithForwardHeaders(endpoint.toString(), {
      method: "GET",
      headers: {
        Authorization: `${tokenType} ${tokenKey}`,
      },
      signal: AbortSignal.timeout(10000),
    })

    if (response.ok) {
      return (await response.json()) as HistoryStatsResponse
    }
    return false
  } catch (error) {
    console.error(
      "[FetchHistoryStats] Error:",
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

    const response = await fetchWithForwardHeaders(endpoint.toString(), {
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

