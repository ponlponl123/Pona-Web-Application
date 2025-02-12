"use server";
import axios from 'axios';
import { Endpoint, EndpointPort } from '../endpoint';

export interface Thumbnails {
    "url": string,
    "width": number,
    "height": number
}

export type YTMusicSearchResultType = "SONG" | "ALBUM" | "VIDEO" | "PLAYLIST" | "ARTIST";

export interface HTTP_SearchResult {
    "type": YTMusicSearchResultType | string,
    "videoId": string,
    "name": string,
    "album"?: unknown,
    "year"?: number,
    "artist": {
        "artistId": string,
        "name": string
    },
    "duration"?: number,
    "thumbnails": Thumbnails[]
}

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