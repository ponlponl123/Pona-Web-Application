"use server";
import axios from 'axios';
import { EndpointHTTP } from '../endpoint';
import { ArtistFull as ArtistFullv1 } from '@/interfaces/ytmusic';
import { ArtistFull, ProfileFull } from '@/interfaces/ytmusic-api';

export interface SubscribeResult {
    "message": string,
    "state": number
}
export interface SubscribedChannelsResult {
    artistId: string;
    info: {
        v1: ArtistFullv1 | undefined,
        v2: ArtistFull | undefined,
        user: ProfileFull | undefined
    }
}

export async function IsSubscribed(tokenType: string, tokenKey: string, channelId: string): Promise<false | SubscribeResult> {
    try {
        const endpoint = new URL(`${EndpointHTTP}/v1/channel/subscribe`);
        endpoint.searchParams.append('c', channelId);
        const handshakeRequest = await axios.get(endpoint.toString(), {
            headers: {
                'Authorization': `${tokenType} ${tokenKey}`,
            }
        });
        if ( handshakeRequest.status === 200 ) return handshakeRequest.data as SubscribeResult;
        else return false;
    } catch {
        return false;
    }
}

export default async function subscribe(tokenType: string, tokenKey: string, channelId: string): Promise<boolean> {
    try {
        const endpoint = new URL(`${EndpointHTTP}/v1/channel/subscribe`);
        endpoint.searchParams.append('c', channelId);
        const handshakeRequest = await axios.post(endpoint.toString(), null, {
            headers: {
                'Authorization': `${tokenType} ${tokenKey}`,
            }
        });
        if ( handshakeRequest.status === 200 ) return true;
        else return false;
    } catch {
        return false;
    }
}

export async function fetchSubscribedChannels(tokenType: string, tokenKey: string, lim?: number): Promise<false | SubscribedChannelsResult[]> {
    try {
        const endpoint = new URL(`${EndpointHTTP}/v1/channel/subscribe/s`);
        if (lim) endpoint.searchParams.append('limit', String(lim));
        const handshakeRequest = await axios.get(endpoint.toString(), {
            headers: {
                'Authorization': `${tokenType} ${tokenKey}`,
            }
        });
        if ( handshakeRequest.status === 200 ) return handshakeRequest.data.result as SubscribedChannelsResult[];
        else return false;
    } catch {
        return false;
    }
}

export async function unsubscribe(tokenType: string, tokenKey: string, channelId: string): Promise<boolean> {
    try {
        const endpoint = new URL(`${EndpointHTTP}/v1/channel/subscribe`);
        endpoint.searchParams.append('c', channelId);
        const handshakeRequest = await axios.delete(endpoint.toString(), {
            headers: {
                'Authorization': `${tokenType} ${tokenKey}`,
            }
        });
        if ( handshakeRequest.status === 200 ) return true;
        else return false;
    } catch {
        return false;
    }
}