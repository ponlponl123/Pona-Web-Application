import React from 'react'
import Link from 'next/link';
import { useLanguageContext } from '@/contexts/languageContext';
import { Compass } from '@phosphor-icons/react/dist/ssr';

function RedirectOauth() {
    const { language } = useLanguageContext();
    const clientId = process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID;
    const redirect_uri = process.env.NEXT_PUBLIC_DISCORD_REDIRECT_ENDPOINT || 'https://pona.ponlponl123.com/app/callback';
    const login_oauth = `https://discord.com/oauth2/authorize?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(redirect_uri)}&scope=identify+guilds+guilds.members.read+email`;
    
    React.useEffect(() => {
        window.location.replace(login_oauth);
    })

    return (
        <div className='w-full h-full min-h-screen flex'>
            <div className='m-auto flex flex-col gap-2 text-center items-center'>
                <Compass size={48} />
                <strong className='text-3xl'>{language.data.redirect.title}</strong>
                <p className='text-xl'>
                    {
                        language.data.redirect.description.split('[clickme]').map((part, index) => (
                            index === 1 ? (
                                <Link key={index} className='underline' href={login_oauth}>
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

export default RedirectOauth