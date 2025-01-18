"use client";
import React from 'react'
import { useLanguageContext } from '@/contexts/languageContext'
import { fetchGuilds, GuildInfo } from '@/server-side-api/discord/fetchGuild';
import { Confetti, Ghost, CaretRight } from '@phosphor-icons/react/dist/ssr';
import { Spinner, Avatar, Button } from '@nextui-org/react';
import MyButton from '@/components/button';
import { getCookie } from 'cookies-next';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useDiscordGuildInfo } from '@/contexts/discordGuildInfo';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';

function Page() {
    const router = useRouter();
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
                                    <GuildButton key={guild.id} guild={guild} uri={uri} router={router} setCurrentGuild={setCurrentGuild} />
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

export function GuildButton({ guild, uri, router, setCurrentGuild }: { guild: GuildInfo, uri: string, router: AppRouterInstance, setCurrentGuild: (guild: GuildInfo) => void }) {
    const [loading, setLoading] = React.useState<boolean>(false);
    const onClick = () => {
        setLoading(true);
        router.push(uri);
        setCurrentGuild(guild);
    }
    return (
        <Button onClick={onClick} href={uri} className='w-full py-12 group' style={{backgroundColor: 'rgb(var(--background-rgb))', borderRadius: '32px'}}>
            <div className='w-full p-2 flex items-center justify-center gap-3 max-h-none'>
                <div className='flex flex-col items-center justify-center h-16 w-16 relative'>
                    <Avatar src={guild.iconURL as string} className={`${loading?'h-12 w-12':'h-16 w-16'}`} />
                    <Spinner color='primary' size='lg' classNames={{base: 'w-14 h-14',wrapper: 'w-14 h-14'}} className={`absolute ${!loading?'hidden':''}`} />
                </div>
                <div className='flex flex-col gap-1'>
                    <h1 className='text-2xl leading-8'>{guild.name}</h1>
                    <span className='text-base text-start'>{guild.id}</span>
                </div>
                <div className='m-auto mr-4'>
                    <CaretRight className='group-hover:translate-x-1 group-active:-translate-x-1' size={18} />
                </div>
            </div>
        </Button>
    )
}

export default Page