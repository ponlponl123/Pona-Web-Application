'use client';
import React from 'react'
import { usePathname } from 'next/navigation';
import { useDiscordUserInfo } from '@/contexts/discordUserInfo';
import PageAnimatePresence from '@/components/HOC/PageAnimatePresence';
import Scrollbar from '@/components/scrollbar';
import RedirectOauth from './redirectOauth';
import { Spinner } from '@nextui-org/react';

function Providers({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { userInfo, loading } = useDiscordUserInfo();

    const PagePresenceKey = (pathname.startsWith('/app/g/') && pathname.includes('/player')) ? `Pona! ${pathname}` : pathname;

    return (
        <>
            {
                pathname.startsWith('/app/callback') ? children :
                loading ? (
                    <div className='w-full min-h-screen flex items-center justify-center'>
                        <Spinner color='current' />
                    </div>
                ) : !userInfo ? <RedirectOauth/> : (
                    <main className='app flex bg-background'>
                        <Scrollbar userInfo={userInfo} />
                        <main id='app-content' className='w-full h-screen md:rounded-l-3xl max-md:rounded-b-3xl relative overflow-y-auto overflow-x-hidden scrollbar-hide pb-6 bg-playground-background'>
                            {
                                <PageAnimatePresence customKey={PagePresenceKey} mode='wait'>{children}</PageAnimatePresence>
                            }
                        </main>
                    </main>
                )
            }
        </>
    )
}

export default Providers