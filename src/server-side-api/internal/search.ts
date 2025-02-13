"use server";
import axios from 'axios';
import { Endpoint, EndpointPort } from '../endpoint';
import { AlbumFull, ArtistFull, SearchResult as HTTP_SearchResult, PlaylistFull } from '@/interfaces/ytmusic';

export interface Thumbnails {
    "url": string,
    "width": number,
    "height": number
}

export type YTMusicSearchResultType = "SONG" | "ALBUM" | "VIDEO" | "PLAYLIST" | "ARTIST";

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
        if ( handshakeRequest.status === 200 ) return handshakeRequest.data as SearchResult;
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