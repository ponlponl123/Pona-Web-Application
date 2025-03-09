"use server";
import axios from 'axios';
import { Endpoint, EndpointPort } from '../endpoint';
import { ArtistFull } from '@/interfaces/ytmusic';
import { AlbumFull, SearchResult as HTTP_SearchResult, PlaylistFull, SongFull, TopResult_Song } from '@/interfaces/ytmusic-api';

export type YTMusicSearchResultType = "SONG" | "ALBUM" | "VIDEO" | "PLAYLIST" | "PODCAST" | "ARTIST";
export type YTMusicSearchCategoryType = "Top result" | null | "Songs" | "Videos" | "Albums" | "Community Playlists" | "Artists" | "Podcasts" | "Episodes" | "Profiles";

export interface SearchResult {
    "message": string,
    "result": HTTP_SearchResult[]
}

export interface SearchSuggestion {
    "message": string,
    "searchSuggestions": string[]
}

export async function fetchSearchSuggestionResult(tokenType: string, tokenKey: string, search: string): Promise<false | SearchSuggestion> {
    try {
        const endpoint = new URL(`${Endpoint}:${EndpointPort}/v1/music/search`);
        endpoint.searchParams.append('is_suggestion', 'true');
        endpoint.searchParams.append('q', search);
        const handshakeRequest = await axios.get(endpoint.toString(), {
            headers: {
                'Authorization': `${tokenType} ${tokenKey}`,
            },
        });
        if ( handshakeRequest.status === 200 ) return handshakeRequest.data as SearchSuggestion;
        else return false;
    } catch {
        // console.error('Failed to handshake with Pona! API:', err);
        return false;
    }
}

export default async function fetchSearchResult(tokenType: string, tokenKey: string, search: string): Promise<false | SearchResult> {
    try {
        const endpoint = new URL(`${Endpoint}:${EndpointPort}/v1/music/search`);
        endpoint.searchParams.append('q', search);
        const handshakeRequest = await axios.get(endpoint.toString(), {
            headers: {
                'Authorization': `${tokenType} ${tokenKey}`,
            },
        });
        if ( handshakeRequest.status === 200 ) {
            const topResult = (handshakeRequest.data.result as HTTP_SearchResult[]).filter((result: HTTP_SearchResult) => result.category === "Top result");
            if ( topResult && topResult.length > 0 && topResult[0].resultType === "video" && topResult[0].videoId )
            {
                const track = topResult[0];
                const fetchSong = await getSong(tokenType, tokenKey, track.title, track.artists[0].name, topResult[0].videoId);
                if ( fetchSong )
                return {
                    ...handshakeRequest.data,
                    result:
                        (topResult && topResult[0].resultType === "video") ? [
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
                            ...(handshakeRequest.data.result as HTTP_SearchResult[]).filter((result: HTTP_SearchResult) => result.category !== "Top result")
                        ] : handshakeRequest.data.result as HTTP_SearchResult[]
                } as SearchResult;
            }
            return handshakeRequest.data as SearchResult;
    }
        else return false;
    } catch {
        // console.error('Failed to handshake with Pona! API:', err);
        return false;
    }
}

export async function getPlaylist(tokenType: string, tokenKey: string, playlistId: string): Promise<false | PlaylistFull> {
    try {
        const endpoint = new URL(`${Endpoint}:${EndpointPort}/v1/music/fetch`);
        endpoint.searchParams.append('type', 'playlist');
        endpoint.searchParams.append('id', playlistId);
        const handshakeRequest = await axios.get(endpoint.toString(), {
            headers: {
                'Authorization': `${tokenType} ${tokenKey}`,
            },
        });
        if ( handshakeRequest.status === 200 && handshakeRequest.data.result ) return handshakeRequest.data.result as PlaylistFull;
        else return false;
    } catch {
        // console.error('Failed to handshake with Pona! API:', err);
        return false;
    }
}

export async function getAlbum(tokenType: string, tokenKey: string, albumId: string): Promise<false | AlbumFull> {
    try {
        const endpoint = new URL(`${Endpoint}:${EndpointPort}/v1/music/fetch`);
        endpoint.searchParams.append('type', 'album');
        endpoint.searchParams.append('id', albumId);
        const handshakeRequest = await axios.get(endpoint.toString(), {
            headers: {
                'Authorization': `${tokenType} ${tokenKey}`,
            },
        });
        if ( handshakeRequest.status === 200 && handshakeRequest.data.result ) return handshakeRequest.data.result as AlbumFull;
        else return false;
    } catch {
        // console.error('Failed to handshake with Pona! API:', err);
        return false;
    }
}

export async function getArtist(tokenType: string, tokenKey: string, artistId: string): Promise<false | ArtistFull> {
    try {
        const endpoint = new URL(`${Endpoint}:${EndpointPort}/v1/music/fetch`);
        endpoint.searchParams.append('type', 'artist');
        endpoint.searchParams.append('id', artistId);
        const handshakeRequest = await axios.get(endpoint.toString(), {
            headers: {
                'Authorization': `${tokenType} ${tokenKey}`,
            },
        });
        if ( handshakeRequest.status === 200 && handshakeRequest.data.result ) return handshakeRequest.data.result as ArtistFull;
        else return false;
    } catch {
        // console.error('Failed to handshake with Pona! API:', err);
        return false;
    }
}

export async function getSong(tokenType: string, tokenKey: string, title: string, artist: string, identifier: string): Promise<false | SongFull> {
    try {
        const endpoint = new URL(`${Endpoint}:${EndpointPort}/v2/music/fetch/av`);
        endpoint.searchParams.append('type', 'song');
        endpoint.searchParams.append('t', title);
        endpoint.searchParams.append('a', artist);
        endpoint.searchParams.append('id', identifier);
        const handshakeRequest = await axios.get(endpoint.toString(), {
            headers: {
                'Authorization': `${tokenType} ${tokenKey}`,
            },
        });
        if ( handshakeRequest.status === 200 && handshakeRequest.data.result ) return handshakeRequest.data.result as SongFull;
        else return false;
    } catch {
        // console.error('Failed to handshake with Pona! API:', err);
        return false;
    }
}