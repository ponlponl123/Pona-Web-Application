import React from 'react'
import { Metadata } from 'next';
import App_notOk from './app_notOk';
import App_notReady from './app_notReady';
import handshake from '@/server-side-api/handshake'

export const metadata: Metadata = {
    title: "Pona! Application",
    description: "Pona! is a useful discord application and free to use.",
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function Layout({ children }: { children?: React.ReactNode }) {
    const app_isOk = await handshake();
    return (
        <main>
            {
                app_isOk ? (
                    // children
                    <App_notReady />
                ) : (
                    <App_notOk />
                )
            }
        </main>
    )
}

export default Layout