"use server";
import axios from 'axios';
import { EndpointHTTP, EndpointKey } from './endpoint';

export default async function handshake(): Promise<boolean> {
    try {
        const handshakeRequest = await axios.get(`${EndpointHTTP}/socket.io/?EIO=4&transport=websocket`, {
            headers: {
                'Authorization': `Pona! ${EndpointKey}`,
            },
        });
        if ( handshakeRequest.status === 200 ) return true;
        else {
            // console.error('Failed to handshake with Pona! Web Socket:', handshakeRequest.status);
            return false;
        }
    } catch {
        // console.error('Failed to handshake with Pona! Web Socket:', err);
        return false;
    }
}