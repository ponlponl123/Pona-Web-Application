'use server';
import { Track } from '@/interfaces/ponaPlayer';
import axios from 'axios';
import { EndpointHTTP } from '../endpoint';

export interface History {
  id: number;
  requestby: string;
  track: Track;
  uniqueid: string;
}

export interface Tracks {
  message: string;
  tracks: History[];
}

export default async function fetchHistory(
  tokenType: string,
  tokenKey: string,
  limit?: number
): Promise<false | Tracks> {
  try {
    const endpoint = new URL(`${EndpointHTTP}/v1/music/history`);
    endpoint.searchParams.append('l', String(limit || 14));
    const handshakeRequest = await axios.get(endpoint.toString(), {
      headers: {
        Authorization: `${tokenType} ${tokenKey}`,
      },
    });
    if (handshakeRequest.status === 200) return handshakeRequest.data as Tracks;
    else return false;
  } catch {
    // console.error('Failed to handshake with Pona! API:', err);
    return false;
  }
}

export async function fetchSearchHistory(
  tokenType: string,
  tokenKey: string
): Promise<false | string[]> {
  try {
    const endpoint = new URL(`${EndpointHTTP}/v1/music/history/search`);
    const handshakeRequest = await axios.get(endpoint.toString(), {
      headers: {
        Authorization: `${tokenType} ${tokenKey}`,
      },
    });
    if (handshakeRequest.status === 200)
      return handshakeRequest.data.results as string[];
    else return false;
  } catch {
    return false;
  }
}
