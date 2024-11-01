import React from 'react'
import { UserInfo } from '@/server-side-api/discord/fetchUser'
import ActivationLink from './activationLink'

function Scrollbar({ userInfo, nav = false }: { userInfo: UserInfo, nav?: boolean }) {
    return (
        <main className={`scrollbar ${!nav ? 'w-80 h-screen max-md:hidden p-6 pt-24 flex flex-col gap-2' : 'md:hidden w-full flex flex-col gap-2'}`}>
            <ActivationLink href='/app/welcome'>👋 Welcome</ActivationLink>
            <ActivationLink href='/app'>Dashboard</ActivationLink>
            { !nav && (<div className='mt-auto'></div>) }
            <ActivationLink href='/app/setting'>Setting</ActivationLink>
        </main>
    )
}

export default Scrollbar