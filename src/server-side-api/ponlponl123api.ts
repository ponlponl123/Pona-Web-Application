"use server";
import axios from 'axios';

export default async function handshake(): Promise<boolean> {
    try {
        const handshakeRequest = await axios.get('https://api.ponlponl123.com/');
        if ( handshakeRequest.status === 200 ) return true;
        else {
            // console.error('Failed to handshake with Pona! API:', handshakeRequest.status);
            return false;
        }
    } catch {
        // console.error('Failed to handshake with Pona! API:', err);
        return false;
    }
}