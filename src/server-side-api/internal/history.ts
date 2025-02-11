"use server";
import { Track } from '@/interfaces/ponaPlayer';
import axios from 'axios';
import { Endpoint, EndpointPort } from '../endpoint';

export interface History {
    id: number,
    requestby: string,
    track: Track,
    uniqueid: string
}

export interface Tracks {
    "message": string,
    "tracks": History[]
}

export default async function fetchHistory(tokenType: string, tokenKey: string): Promise<false | Tracks> {
    try {
        const handshakeRequest = await axios.get(`${Endpoint}:${EndpointPort}/v1/music/history`, {
            headers: {
                'Authorization': `${tokenType} ${tokenKey}`,
            },
        });
        if ( handshakeRequest.status === 200 ) return handshakeRequest.data as Tracks;
        else return false;
    } catch {
        // console.error('Failed to handshake with Pona! API:', err);
        return false;
    }
}