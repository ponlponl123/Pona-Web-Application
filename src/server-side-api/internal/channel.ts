"use server";
import axios from 'axios';
import { Endpoint, EndpointPort } from '../endpoint';

export interface SubscribeResult {
    "message": string,
    "state": number
}

export async function IsSubscribed(tokenType: string, tokenKey: string, channelId: string): Promise<false | SubscribeResult> {
    try {
        const endpoint = new URL(`${Endpoint}:${EndpointPort}/v1/channel/subscribe`);
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
        const endpoint = new URL(`${Endpoint}:${EndpointPort}/v1/channel/subscribe`);
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

export async function unsubscribe(tokenType: string, tokenKey: string, channelId: string): Promise<boolean> {
    try {
        const endpoint = new URL(`${Endpoint}:${EndpointPort}/v1/channel/subscribe`);
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