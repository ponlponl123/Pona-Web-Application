'use server';
import axios from 'axios';
import { EndpointHTTP } from './endpoint';

export default async function handshake(): Promise<boolean> {
  try {
    const handshakeRequest = await axios.get(`${EndpointHTTP}/v1/redis`);
    if (handshakeRequest.status === 200) return true;
    else {
      // console.error('Failed to handshake with Pona! Web Socket:', handshakeRequest.status);
      return false;
    }
  } catch {
    // console.error('Failed to handshake with Pona! Web Socket:', err);
    return false;
  }
}
