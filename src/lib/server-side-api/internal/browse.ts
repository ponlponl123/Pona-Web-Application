"use server"
import { EndpointHTTP, fetchWithForwardHeaders } from "../endpoint"

export interface HomeFeedItem {
  title?: string
  videoId?: string
  playlistId?: string
  browseId?: string
  artists?: { name: string; id?: string }[]
  thumbnails?: { url: string; width?: number; height?: number }[]
  resultType?: string
  year?: string
  isExplicit?: boolean
  [key: string]: unknown
}

export interface HomeFeedSection {
  title: string
  contents: HomeFeedItem[]
}

export interface HomeFeedResult {
  message: string
  result: HomeFeedSection[]
}

export interface MoodCategory {
  title: string
  params: string
}

export interface MoodSection {
  title?: string
  moods?: MoodCategory[]
  categories?: MoodCategory[]
  [key: string]: unknown
}

export interface ExploreResult {
  message: string
  result: {
    moods?: MoodSection[]
    trending?: unknown[]
    [key: string]: unknown
  }
}

export interface ChartsEntry {
  title?: string
  name?: string
  videoId?: string
  browseId?: string
  playlistId?: string
  type?: string
  year?: number | string
  isExplicit?: boolean
  artists?: { name: string; id?: string }[]
  thumbnails?: { url: string; width?: number; height?: number }[]
  rank?: number
  trend?: string
  [key: string]: unknown
}

export interface ChartsResult {
  message: string
  country: string
  result: {
    songs?: { items?: ChartsEntry[]; [key: string]: unknown }
    artists?: { items?: ChartsEntry[]; [key: string]: unknown }
    trending?: { items?: ChartsEntry[]; [key: string]: unknown }
    genres?: { items?: ChartsEntry[]; [key: string]: unknown }
    [key: string]: unknown
  }
}

async function safeFetch<T>(
  url: URL,
  tokenType: string,
  tokenKey: string
): Promise<T | false> {
  try {
    const response = await fetchWithForwardHeaders(url.toString(), {
      method: "GET",
      headers: { Authorization: `${tokenType} ${tokenKey}` },
      signal: AbortSignal.timeout(15000),
    })
    if (response.ok) return (await response.json()) as T
    return false
  } catch {
    return false
  }
}

export async function fetchHomeFeed(
  tokenType: string,
  tokenKey: string
): Promise<false | HomeFeedResult> {
  const endpoint = new URL(`${EndpointHTTP}/v2/music/browse/home`)
  return safeFetch<HomeFeedResult>(endpoint, tokenType, tokenKey)
}

export async function fetchExplore(
  tokenType: string,
  tokenKey: string
): Promise<false | ExploreResult> {
  const endpoint = new URL(`${EndpointHTTP}/v2/music/browse/explore`)
  return safeFetch<ExploreResult>(endpoint, tokenType, tokenKey)
}

export async function fetchCharts(
  tokenType: string,
  tokenKey: string,
  country: string = "ZZ"
): Promise<false | ChartsResult> {
  const endpoint = new URL(
    `${EndpointHTTP}/v2/music/browse/charts/${encodeURIComponent(country.toUpperCase())}`
  )
  return safeFetch<ChartsResult>(endpoint, tokenType, tokenKey)
}
