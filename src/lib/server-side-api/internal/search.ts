"use server"
import { EndpointHTTP } from "../endpoint"
import {
  ArtistFull as ArtistFullv1,
  PlaylistFull as PlaylistFullv1,
} from "@/types/youtube/ytmusic"
import {
  AlbumFull,
  ArtistFull,
  ArtistVideo,
  SearchResult as HTTP_SearchResult,
  PlaylistFull,
  ProfileFull,
  SongFull,
  SongRelated,
  TopResult_Song,
  VideoDetailed,
  VideoFull,
  WatchPlaylist,
} from "@/types/youtube/ytmusic-api"

export type YTMusicSearchResultType =
  | "SONG"
  | "ALBUM"
  | "VIDEO"
  | "PLAYLIST"
  | "PODCAST"
  | "ARTIST"
export type YTMusicSearchCategoryType =
  | "Top result"
  | null
  | "Songs"
  | "Videos"
  | "Albums"
  | "Community Playlists"
  | "Artists"
  | "Podcasts"
  | "Episodes"
  | "Profiles"

export interface SearchResult {
  message: string
  result: HTTP_SearchResult[]
}

export interface SearchSuggestion {
  message: string
  searchSuggestions: string[]
}

export interface ChannelResult {
  v1: ArtistFullv1 | undefined
  v2: ArtistFull | undefined
  user: ProfileFull | undefined
}

export interface SongRelatedResult {
  watch_playlist: WatchPlaylist | undefined
  related: SongRelated | undefined
}

async function safeFetch<T>(
  url: URL,
  tokenType: string,
  tokenKey: string
): Promise<T | false> {
  try {
    const response = await fetch(url.toString(), {
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

export async function fetchSearchSuggestionResult(
  tokenType: string,
  tokenKey: string,
  search: string
): Promise<false | SearchSuggestion> {
  const endpoint = new URL(`${EndpointHTTP}/v1/music/search`)
  endpoint.searchParams.append("is_suggestion", "true")
  endpoint.searchParams.append("q", search)
  return safeFetch<SearchSuggestion>(endpoint, tokenType, tokenKey)
}

export default async function fetchSearchResult(
  tokenType: string,
  tokenKey: string,
  search: string,
  filter?: string
): Promise<false | SearchResult> {
  try {
    const endpoint = new URL(`${EndpointHTTP}/v1/music/search`)
    if (filter) endpoint.searchParams.append("filter", filter)
    endpoint.searchParams.append("q", search)

    const response = await fetch(endpoint.toString(), {
      method: "GET",
      headers: { Authorization: `${tokenType} ${tokenKey}` },
      signal: AbortSignal.timeout(20000),
    })

    if (response.ok) {
      const data = await response.json()
      const topResult = (data.result as HTTP_SearchResult[]).filter(
        (result) => result.category === "Top result"
      )

      if (
        topResult?.length > 0 &&
        topResult[0].resultType === "video" &&
        topResult[0].videoType?.includes("MUSIC_VIDEO") &&
        topResult[0].videoId &&
        !topResult[0].title.toLowerCase().includes("cover") &&
        !topResult[0].title.toLowerCase().includes("nightcore")
      ) {
        const track = topResult[0]
        const fetchSong = await getSong(
          tokenType,
          tokenKey,
          track.title,
          track.artists[0].name,
          topResult[0].videoId
        )

        if (fetchSong) {
          return {
            ...data,
            result: [
              {
                artists: fetchSong.artists,
                category: "Top result",
                duration: fetchSong.duration,
                duration_seconds: fetchSong.duration_seconds,
                resultType: "song",
                thumbnails: fetchSong.thumbnails,
                title: fetchSong.title,
                videoId: fetchSong.videoId,
                videoType: fetchSong.videoType,
              } as TopResult_Song as HTTP_SearchResult,
              ...(data.result as HTTP_SearchResult[]).filter(
                (result) => result.category !== "Top result"
              ),
            ],
          } as SearchResult
        }
      }
      return data as SearchResult
    }
    return false
  } catch {
    return false
  }
}

export async function getPlaylistv1(
  tokenType: string,
  tokenKey: string,
  playlistId: string
): Promise<false | PlaylistFullv1> {
  const endpoint = new URL(`${EndpointHTTP}/v1/music/fetch`)
  endpoint.searchParams.append("type", "playlist")
  endpoint.searchParams.append("id", playlistId)
  const res = await safeFetch<{ result: PlaylistFullv1 }>(
    endpoint,
    tokenType,
    tokenKey
  )
  return res ? res.result : false
}

export async function getPlaylist(
  tokenType: string,
  tokenKey: string,
  playlistId: string
): Promise<false | PlaylistFull> {
  const endpoint = new URL(`${EndpointHTTP}/v2/music/fetch/playlist`)
  endpoint.searchParams.append("id", playlistId)
  const res = await safeFetch<{ result: PlaylistFull }>(
    endpoint,
    tokenType,
    tokenKey
  )
  return res ? res.result : false
}

export async function getAlbum(
  tokenType: string,
  tokenKey: string,
  albumId: string
): Promise<false | AlbumFull> {
  const endpoint = new URL(`${EndpointHTTP}/v2/music/fetch/album`)
  endpoint.searchParams.append("id", albumId)
  const res = await safeFetch<{ result: AlbumFull }>(
    endpoint,
    tokenType,
    tokenKey
  )
  return res ? res.result : false
}

export async function getArtistv1(
  tokenType: string,
  tokenKey: string,
  artistId: string
): Promise<false | ArtistFullv1> {
  const endpoint = new URL(`${EndpointHTTP}/v1/music/fetch`)
  endpoint.searchParams.append("type", "artist")
  endpoint.searchParams.append("id", artistId)
  const res = await safeFetch<{ result: ArtistFullv1 }>(
    endpoint,
    tokenType,
    tokenKey
  )
  return res ? res.result : false
}

export async function getArtist(
  tokenType: string,
  tokenKey: string,
  artistId: string
): Promise<false | ArtistFull> {
  const endpoint = new URL(`${EndpointHTTP}/v2/music/fetch/artist`)
  endpoint.searchParams.append("id", artistId)
  const res = await safeFetch<{ result: ArtistFull }>(
    endpoint,
    tokenType,
    tokenKey
  )
  return res ? res.result : false
}

export async function getArtistVideos(
  tokenType: string,
  tokenKey: string,
  artistId: string
): Promise<false | ArtistVideo[]> {
  const endpoint = new URL(`${EndpointHTTP}/v2/music/fetch/artist`)
  endpoint.searchParams.append("id", artistId)
  endpoint.searchParams.append("query", "videos")
  const res = await safeFetch<{ result: ArtistVideo[] }>(
    endpoint,
    tokenType,
    tokenKey
  )
  return res ? res.result : false
}

export async function getSongRelated(
  tokenType: string,
  tokenKey: string,
  videoId: string
): Promise<false | SongRelatedResult> {
  const endpoint = new URL(`${EndpointHTTP}/v2/music/fetch/related`)
  endpoint.searchParams.append("id", videoId)
  const res = await safeFetch<{ result: SongRelatedResult }>(
    endpoint,
    tokenType,
    tokenKey
  )
  return res ? res.result : false
}

export async function getChannel(
  tokenType: string,
  tokenKey: string,
  artistId: string
): Promise<false | ChannelResult> {
  const endpoint = new URL(`${EndpointHTTP}/v2/music/fetch/channel`)
  endpoint.searchParams.append("id", artistId)
  const res = await safeFetch<{ result: ChannelResult }>(
    endpoint,
    tokenType,
    tokenKey
  )
  return res ? res.result : false
}

export async function getChannelVideos(
  tokenType: string,
  tokenKey: string,
  artistId: string
): Promise<false | VideoDetailed[] | ArtistVideo[]> {
  const endpoint = new URL(`${EndpointHTTP}/v2/music/fetch/channel`)
  endpoint.searchParams.append("id", artistId)
  endpoint.searchParams.append("query", "videos")
  const res = await safeFetch<{ result: VideoDetailed[] | ArtistVideo[] }>(
    endpoint,
    tokenType,
    tokenKey
  )
  return res ? res.result : false
}

export async function getUser(
  tokenType: string,
  tokenKey: string,
  userId: string
): Promise<false | ProfileFull> {
  const endpoint = new URL(`${EndpointHTTP}/v2/music/fetch/user`)
  endpoint.searchParams.append("id", userId)
  const res = await safeFetch<{ result: ProfileFull }>(
    endpoint,
    tokenType,
    tokenKey
  )
  return res ? res.result : false
}

export async function getUserVideos(
  tokenType: string,
  tokenKey: string,
  userId: string
): Promise<false | VideoFull[]> {
  const endpoint = new URL(`${EndpointHTTP}/v2/music/fetch/user`)
  endpoint.searchParams.append("id", userId)
  endpoint.searchParams.append("query", "videos")
  const res = await safeFetch<{ result: VideoFull[] }>(
    endpoint,
    tokenType,
    tokenKey
  )
  return res ? res.result : false
}

export async function getSong(
  tokenType: string,
  tokenKey: string,
  title: string,
  artist: string,
  identifier: string
): Promise<false | SongFull> {
  const endpoint = new URL(`${EndpointHTTP}/v2/music/fetch/av`)
  endpoint.searchParams.append("type", "song")
  endpoint.searchParams.append("t", title)
  endpoint.searchParams.append("a", artist)
  endpoint.searchParams.append("id", identifier)
  const res = await safeFetch<{ result: SongFull }>(
    endpoint,
    tokenType,
    tokenKey
  )
  return res ? res.result : false
}
