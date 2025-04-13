"use server";
import axios from 'axios';
import { EndpointHTTP, EndpointKey } from './endpoint';

export interface ClusterInfo {
    "message": string,
    "lastShard": number,
    "firstShard": number,
    "totalShards": number,
    "shardList": number[]
}

export default async function clusterInfo(): Promise<false | ClusterInfo> {
    try {
        const handshakeRequest = await axios.get(`${EndpointHTTP}/v1/cluster`, {
            headers: {
                'Authorization': `Pona! ${EndpointKey}`,
            },
        });
        if ( handshakeRequest.status === 200 ) return handshakeRequest.data as ClusterInfo;
        else {
            // console.error('Failed to handshake with Pona! API:', handshakeRequest.status);
            return false;
        }
    } catch {
        // console.error('Failed to handshake with Pona! API:', err);
        return false;
    }
}