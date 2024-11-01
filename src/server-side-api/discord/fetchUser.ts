"use server";
import axios from "axios";
const API_ENDPOINT = 'https://discord.com/api/v10';

export interface UserInfo {
    id: string;
    username: string;
    avatar: string;
    discriminator: string;
    public_flags: number;
    flags: number;
    banner: string;
    accent_color: number;
    global_name: string;
    avatar_decoration_data: {
        asset: string;
        sku_id: string;
        expires_at: string;
    };
    banner_color: string;
    mfa_enabled: boolean;
    locale: string;
    premium_type: number;
}

export interface Login {
    key: string;
    type: string;
}

export async function fetchByAccessToken(key: string, keyType: string): Promise<false | UserInfo> {
    // https://discord.com/api/oauth2/authorize
    try {
        const user = await axios.get(API_ENDPOINT + '/users/@me', {
            headers: {
                Authorization: `${keyType} ${key}`,
                'Content-Type': 'application/x-www-form-urlencoded',
                "User-Agent": "Pona! Application (OpenPonlponl123.com/v1)"
            }
        })
        if ( user.status === 200 ) return user.data;
    } catch { return false }
    return false;
}

export async function authorizeUserAccessToken(key: string): Promise<false | Login> {
    const clientId = process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID as string;
    const clientSecret = process.env.DISCORD_CLIENT_SECRET as string;
    if ( typeof key === "string" && clientId && clientSecret ) {
        try {
            const params = new URLSearchParams();
            params.append('grant_type', 'authorization_code');
            params.append('redirect_uri', 'http://localhost:3000/app/callback');
            params.append('code', key);
            const token = await axios.post(API_ENDPOINT + '/oauth2/token', params, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    "User-Agent": "Pona! Application (OpenPonlponl123.com/v1)"
                },
                auth: {
                    username: clientId,
                    password: clientSecret,
                }
            })            
            if ( token.status === 200 && token.data.access_token ) return {
                key: token.data.access_token,
                type: token.data.token_type
            }
        } catch { return false }
    }
    return false;
}