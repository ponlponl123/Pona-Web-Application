'use client';
import React from 'react'
import { usePathname } from 'next/navigation';
import { useDiscordUserInfo } from '@/contexts/discordUserInfo';
import PageAnimatePresence from '@/components/HOC/PageAnimatePresence';
import Scrollbar from '@/components/scrollbar';
import RedirectOauth from './redirectOauth';
import { Spinner } from '@nextui-org/react';

function Providers({ children }: { children: React.ReactNode }) {
    const pathname = usePathname() || '';
    const { userInfo, loading } = useDiscordUserInfo();
    const appContent = React.useRef<HTMLElement>(null);

    React.useEffect(() => {
        if (appContent.current) {
            appContent.current.addEventListener('scroll', (e) => {
                if (e.target instanceof Element && e.target.scrollTop > 0) {
                    document.body.classList.add('app-scrolled');
                } else {
                    document.body.classList.add('app-scrolled');
                }
            });
        }
    }, [appContent]);

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
                        <Scrollbar canCollapsed={true} userInfo={userInfo} />
                        <main ref={appContent} id='app-content' className='w-full md:h-screen max-md:h-[calc(100vh_+_1rem)] md:rounded-l-3xl max-md:rounded-b-3xl relative overflow-y-auto overflow-x-hidden scrollbar-hide pb-6 bg-playground-background'>
                            <PageAnimatePresence customKey={pathname} mode='wait'>
                                {children}
                            </PageAnimatePresence>
                        </main>
                    </main>
                )
            }
        </>
    )
}

export default Providers