import React from 'react'
import Link from 'next/link';
import MyButton from '@/components/button'
import MyRoundedButton from '@/components/rounded-button'
import { DiscordLogo, Confetti } from "@phosphor-icons/react/dist/ssr";

function Header() {
    const navOpened = false;

    return (
        <header className='absolute w-full h-20 p-6 px-12 flex items-center justify-center gap-3'>
            <div className='w-full max-w-5xl h-full flex items-center justify-between gap-6'>
                <div className='flex gap-2'>
                    <Link href={'/'}>
                        <h1 className='text-xl'>Pona!</h1>
                    </Link>
                </div>
                <nav className={`nav-opened-${navOpened}`}>
                    <div className='sm:hidden w-full h-9 border-b' style={{borderColor: 'rgb(var(--foreground-rgb),0.1)'}}>

                    </div>
                    <div className='flex gap-3'>

                    </div>
                    <div className='flex gap-3'>
                        <Link href={'/app'}>
                            <MyRoundedButton size='small' style='text'>
                                <DiscordLogo weight='fill' />
                                Login with Discord
                            </MyRoundedButton>
                        </Link>
                        <Link href={'/invite'}>
                            <MyButton size='small' style='primary'>
                                <Confetti weight='fill' />
                                Add pona to my server
                            </MyButton>
                        </Link>
                    </div>
                </nav>
            </div>
        </header>
    )
}

export default Header