"use server";
import axios from 'axios';

export default async function handshake(): Promise<boolean> {
    try {
        const env = process.env;
        const handshakeRequest = await axios.get(`${env.PONA_APPLICATION_ENDPOINT}:${env.PONA_APPLICATION_ENDPOINT_PORT}/socket.io/?EIO=4&transport=websocket`, {
            headers: {
                'Authorization': `Pona! ${env.PONA_APPLICATION_ENDPOINT_KEY}`,
            },
        });
        if ( handshakeRequest.status === 200 ) return true;
        else {
            console.error('Failed to handshake with Pona! Web Socket:', handshakeRequest.status);
            return false;
        }
    } catch (err: unknown) {
        console.error('Failed to handshake with Pona! Web Socket:', err);
        return false;
    }
}