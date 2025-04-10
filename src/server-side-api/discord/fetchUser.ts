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
    try {
        const user = await axios.get(API_ENDPOINT + '/users/@me', {
            headers: {
                Authorization: `${keyType} ${key}`,
                'Content-Type': 'application/x-www-form-urlencoded',
                "User-Agent": "Pona! Application (OpenPonlponl123.com/v1)"
            }
        })
        if ( user.status === 200 )
        {
            // cleanup user data before returning
            // this will remove any sensitive data e.g. email, phone number, etc.
            // and return only the necessary data
            const userData = user.data as UserInfo;
            return {
                id: userData.id,
                username: userData.username,
                avatar: userData.avatar,
                discriminator: userData.discriminator,
                public_flags: userData.public_flags,
                flags: userData.flags,
                banner: userData.banner,
                accent_color: userData.accent_color,
                global_name: userData.global_name,
                avatar_decoration_data: userData.avatar_decoration_data,
                banner_color: userData.banner_color,
                mfa_enabled: userData.mfa_enabled,
                locale: userData.locale,
                premium_type: userData.premium_type
            }
        }
    } catch { return false }
    return false;
}

export async function authorizeUserAccessToken(key: string, type: 'auth_only' | 'invite'): Promise<false | Login> {
    const clientId = process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID as string;
    const clientSecret = process.env.DISCORD_CLIENT_SECRET as string;
    const redirect_uri = process.env.NEXT_PUBLIC_DISCORD_REDIRECT_ENDPOINT || 'https://pona.ponlponl123.com/app/callback';
    if ( typeof key === "string" && clientId && clientSecret ) {
        try {
            const params = new URLSearchParams();
            params.append('grant_type', 'authorization_code');
            params.append('redirect_uri', `${redirect_uri}${(type === 'invite') ? '?from=invite' : ''}`);
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

export async function revokeUserAccessToken(key: string): Promise<boolean> {
    const clientId = process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID as string;
    const clientSecret = process.env.DISCORD_CLIENT_SECRET as string;
    if ( typeof key === "string" && clientId && clientSecret ) {
        try {
            const params = new URLSearchParams();
            params.append('token_type_hint', 'access_token');
            params.append('token', key);
            const token = await axios.post(API_ENDPOINT + '/oauth2/token/revoke', params, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    "User-Agent": "Pona! Application (OpenPonlponl123.com/v1)"
                },
                auth: {
                    username: clientId,
                    password: clientSecret,
                }
            })            
            if ( token.status === 200 && token.data.access_token ) return true;
        } catch { return false }
    }
    return false;
}