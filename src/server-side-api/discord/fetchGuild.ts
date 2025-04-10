"use server";
import axios from "axios";
import { EndpointHTTP, EndpointKey } from "../endpoint";
import { fetchByAccessToken } from "./fetchUser";
const API_ENDPOINT = 'https://discord.com/api/v10';

export interface GuildInfo extends BasicGuildInfo {
    basic: false;
}

export interface BasicGuildInfo {
    id: string;
    name: string;
    icon: string | null;
    banner: string | null;
    memberCount: number;
    ownerId: string;
    iconURL: string | null;
    nameAcronym: string;
    bannerURL: string | null;
}

export async function fetchGuildsV1(key: string, keyType: string): Promise<false | GuildInfo[]> {
    try {
        const guildsFromUser = await axios.get(API_ENDPOINT + '/users/@me/guilds', {
            headers: {
                Authorization: `${keyType} ${key}`,
                'Content-Type': 'application/x-www-form-urlencoded',
                "User-Agent": "Pona! Application (OpenPonlponl123.com/v1)"
            }
        })
        if ( guildsFromUser.status === 200 && guildsFromUser.data.length > 0 ) {
            try {
                const guilds = await axios.get(EndpointHTTP + '/v1/guilds', {
                    headers: {
                        Authorization: `Pona! ${EndpointKey}`,
                        'Content-Type': 'application/json',
                        "User-Agent": "Pona! Application (OpenPonlponl123.com/v1)"
                    },
                    data: guildsFromUser.data.map((guild: GuildInfo) => guild.id)
                })
                if ( guildsFromUser.status === 200 ) 
                    return guilds.data.guilds as GuildInfo[];
            } catch { return false }
        }
    } catch { return false }
    return false;
}

export async function fetchGuilds(key: string, keyType: string): Promise<false | GuildInfo[]> {
    try {
        const guilds = await axios.get(EndpointHTTP + '/v2/guilds', {
            headers: {
                Authorization: `Pona! ${EndpointKey}`,
                'Content-Type': 'application/json',
                "User-Agent": "Pona! Application (OpenPonlponl123.com/v1)",
                Cookie: `type=${keyType}; key=${key};`
            }
        })
        if ( guilds.status === 200 ) 
            return guilds.data.guilds as GuildInfo[];
    } catch { return false }
    return false;
}

export async function fetchGuild(key: string, keyType: string, guildId: string): Promise<false | GuildInfo> {
    try {
        const user = await fetchByAccessToken(key, keyType);
        if ( !user ) return false;
        const guild = await axios.get(EndpointHTTP + '/v1/guild/' + guildId, {
            headers: {
                Authorization: `Pona! ${EndpointKey}`,
                'Content-Type': 'application/json',
                "User-Agent": "Pona! Application (OpenPonlponl123.com/v1)",
                "User-Id": user.id
            }
        })
        if ( guild.status === 200 ) return guild.data.guild
    } catch { return false }
    return false;
}

export async function fetchBasicGuildInfo(key: string, keyType: string, guildId: string): Promise<false | BasicGuildInfo> {
    try {
        const user = await fetchByAccessToken(key, keyType);
        if ( !user ) return false;
        const guild = await axios.get(EndpointHTTP + '/v1/guild/' + guildId, {
            headers: {
                Authorization: `Pona! ${EndpointKey}`,
                'Content-Type': 'application/json',
                "User-Agent": "Pona! Application (OpenPonlponl123.com/v1)",
                "User-Id": user.id
            }
        })
        if ( guild.status === 200 )
        {
            const guildInfo = guild.data.guild as GuildInfo;
            return {
                name: guildInfo.name,
                id: guildInfo.id,
                icon: guildInfo.icon,
                banner: guildInfo.banner,
                memberCount: guildInfo.memberCount,
                ownerId: guildInfo.ownerId,
                iconURL: guildInfo.iconURL,
                nameAcronym: guildInfo.nameAcronym,
                bannerURL: guildInfo.bannerURL
            } as BasicGuildInfo;
        }
    } catch { return false }
    return false;
}