import React from 'react'
import { Metadata } from 'next';
import Providers from './providers';
import App_notOk from './app_notOk';
import handshake from '@/server-side-api/handshake'

export const metadata: Metadata = {
    title: "Pona! Application",
    description: "Pona! is a useful discord application and free to use.",
};

async function Layout({ children }: { children?: React.ReactNode }) {
    const app_isOk = await handshake();

    return (
        <main>
            {
                app_isOk ? (
                    <Providers>
                        {children}
                    </Providers>
                    // <App_notReady />
                ) : (
                    <App_notOk />
                )
            }
        </main>
    )
}

export default Layout