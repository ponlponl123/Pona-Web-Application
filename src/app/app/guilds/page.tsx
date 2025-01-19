"use client";
import React from 'react'
import { useLanguageContext } from '@/contexts/languageContext'
import { fetchGuilds, GuildInfo } from '@/server-side-api/discord/fetchGuild';
import { Confetti, Ghost } from '@phosphor-icons/react/dist/ssr';
import { Spinner } from '@nextui-org/react';
import MyButton from '@/components/button';
import { getCookie } from 'cookies-next';
import Link from 'next/link';
import { useDiscordGuildInfo } from '@/contexts/discordGuildInfo';
import { GuildButton } from '@/components/guild/button';

function Page() {
    const { setCurrentGuild } = useDiscordGuildInfo();
    const { language } = useLanguageContext();
    const [guilds, setGuilds] = React.useState<GuildInfo[] | false | null>(null);
    const token = getCookie('LOGIN_');
    const tokenType = getCookie('LOGIN_TYPE_');

    React.useEffect(() => {
        async function fetchGuildsFromClient() {
            if ( !token || !tokenType ) return setGuilds(false);
            const res = await fetchGuilds(token, tokenType);
            setGuilds(res)
        }
        fetchGuildsFromClient();
    }, [token, tokenType])

    return (
        <main id="app-panel">
            <main id="app-workspace" className='flex flex-col'>
                <h1 className='text-2xl mb-4'>{language.data.app.guilds.name}</h1>
                <h1 className='text-5xl flex items-center gap-4'><Confetti weight='fill' />{language.data.app.guilds.title}</h1>
                <section className='w-full min-h-full mt-6 flex flex-col gap-4'>
                    {
                        guilds === null ?
                        (
                            <div className='w-full h-full flex flex-col justify-center items-center m-auto gap-3 my-24'>
                                <Spinner color='current' />
                            </div>
                        ) : (guilds as GuildInfo[]).length > 0 ? (
                            (guilds as GuildInfo[]).map(guild => {
                                const uri = `/app/g/${guild.id}`;
                                return (
                                    <GuildButton key={guild.id} guild={guild} uri={uri} setCurrentGuild={setCurrentGuild} />
                                )
                            })
                        ) : (
                            <div className='w-full h-full flex flex-col justify-center items-center m-auto gap-3 my-24'>
                                <Ghost size={48} />
                                <h1 className='text-3xl'>{language.data.app.guilds.not_found.title}</h1>
                                <span>{language.data.app.guilds.not_found.description}</span>
                                <div className='flex mt-3'>
                                    <Link href='/invite' rel="noopener noreferrer">
                                        <MyButton size='small' variant='primary' effect='confetti'>
                                            <Confetti weight='fill' />
                                            { language.data.header.actions.invite }
                                        </MyButton>
                                    </Link>
                                </div>
                            </div>
                        )
                    }
                </section>
            </main>
        </main>
    )
}

export default Page