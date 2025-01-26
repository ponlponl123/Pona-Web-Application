"use client";
import React from 'react'
import Link from 'next/link';
import { useDiscordUserInfo } from '@/contexts/discordUserInfo';
import { useLanguageContext } from '@/contexts/languageContext';
import { Compass } from '@phosphor-icons/react/dist/ssr';

function Page() {
    const { language } = useLanguageContext();
    const { userInfo } = useDiscordUserInfo();
    const clientId = process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID;
    const redirect_uri = process.env.NEXT_PUBLIC_DISCORD_REDIRECT_ENDPOINT || 'https://pona.ponlponl123.com/app/callback';
    const invite_pona = `https://discord.com/oauth2/authorize?client_id=${clientId}`;
    const invite_pona_with_oauth = `https://discord.com/oauth2/authorize?client_id=${clientId}&permissions=690008452688&response_type=code&redirect_uri=${encodeURIComponent(redirect_uri+"?from=invite")}&integration_type=0&scope=identify+guilds+guilds.members.read+email+bot`;
    const invite_link = userInfo ? invite_pona : invite_pona_with_oauth;
    
    React.useEffect(()=>{
        window.location.replace(invite_link);
    }, [invite_link])

    return (
        <div className='w-full h-full min-h-screen flex'>
            <div className='m-auto flex flex-col gap-2 text-center items-center'>
                <Compass size={48} />
                <strong className='text-3xl'>{language.data.redirect.title}</strong>
                <p className='text-xl'>
                    {
                        language.data.redirect.description.split('[clickme]').map((part, index) => (
                            index === 1 ? (
                                <Link key={index} className='underline' href={invite_link}>
                                    {language.data.redirect.clickme}
                                </Link>
                            ) : part
                        ))
                    }
                </p>
            </div>
        </div>
    )
}

export default Page