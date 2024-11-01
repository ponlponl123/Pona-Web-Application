'use client';
import React from 'react'
import { usePathname } from 'next/navigation';
import { useDiscordUserInfo } from '@/contexts/discordUserInfo';
import Scrollbar from '@/components/scrollbar';
import RedirectOauth from './redirectOauth';
import { Spinner } from '@nextui-org/react';

function Providers({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { userInfo, loading } = useDiscordUserInfo();

    return (
        <>
            {
                pathname.startsWith('/app/callback') ? children :
                loading ? (
                    <div className='w-full min-h-screen flex items-center justify-center'>
                        <Spinner color='current' />
                    </div>
                ) : !userInfo ? <RedirectOauth/> : (
                    <main className='app flex'>
                        <Scrollbar userInfo={userInfo} />
                        <main className='w-full min-h-screen lg:p-12 lg:pt-16 max-lg:p-6 max-lg:pt-24 md:rounded-l-3xl max-md:rounded-b-3xl relative overflow-auto' style={{backgroundColor: 'rgb(var(--foreground-rgb),0.06)'}}>{children}</main>
                    </main>
                )
            }
        </>
    )
}

export default Providers