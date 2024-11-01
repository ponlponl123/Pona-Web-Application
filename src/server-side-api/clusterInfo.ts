"use server";
import axios from 'axios';

export interface ClusterInfo {
    "message": string,
    "lastShard": number,
    "firstShard": number,
    "totalShards": number,
    "shardList": number[]
}

export default async function clusterInfo(): Promise<false | ClusterInfo> {
    try {
        const env = process.env;
        const handshakeRequest = await axios.get(`${env.PONA_APPLICATION_ENDPOINT}:${env.PONA_APPLICATION_ENDPOINT_PORT}/v1/cluster`, {
            headers: {
                'Authorization': `Pona! ${env.PONA_APPLICATION_ENDPOINT_KEY}`,
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