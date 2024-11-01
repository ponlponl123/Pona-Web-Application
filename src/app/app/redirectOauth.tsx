import React from 'react'
import Link from 'next/link';
import { useLanguageContext } from '@/contexts/languageContext';
import { Compass } from '@phosphor-icons/react/dist/ssr';

function RedirectOauth() {
    const { language } = useLanguageContext();
    const clientId = process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID;
    const login_oauth = `https://discord.com/oauth2/authorize?client_id=${clientId}&response_type=code&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fapp%2Fcallback&scope=identify+guilds`;
    
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