"use client"
import React from 'react'
import Link from 'next/link';
import MyButton from '@/components/button'
import { useLanguageContext } from '@/contexts/languageContext';
import { DiscordLogo, Confetti, Hamburger } from "@phosphor-icons/react/dist/ssr";

function Header() {
    const [navOpened, setNavOpened] = React.useState<boolean>(false);
    const { language } = useLanguageContext();

    return (
        <header className={`nav-opened-${navOpened} absolute w-full h-20 p-6 px-12 flex items-center justify-center gap-3`}>
            <div className='w-full max-w-5xl h-full flex items-center justify-between gap-6'>
                <div className='flex gap-2 z-20 active:scale-95'>
                    <Link href={'/'} onClick={()=>{setNavOpened(false)}}>
                        <h1 className='text-xl'>Pona!</h1>
                    </Link>
                </div>
                <MyButton className='md:hidden btn-icon z-20 m-0' style='rounded' variant='text' onClick={()=>{
                    setNavOpened((value)=>!value);
                }}>
                    <Hamburger size={26} weight={ navOpened ? 'fill' : 'regular' } />
                </MyButton>
                <nav className={`nav-opened-${navOpened}`}>
                    <div className='md:hidden w-full h-28 border-b mb-6 header' style={{borderColor: 'rgb(var(--foreground-rgb),0.1)'}}>
                        
                    </div>
                    <div className='flex gap-3'>

                    </div>
                    <div className='flex gap-3'>
                        <Link href='/app' rel="noopener noreferrer">
                            <MyButton size='small' variant='text' style='rounded' onClick={()=>{setNavOpened(false)}}>
                                <DiscordLogo weight='fill' />
                                { language.data.header.actions.login }
                            </MyButton>
                        </Link>
                        <Link href='/invite' rel="noopener noreferrer">
                            <MyButton size='small' variant='primary' effect='confetti' onClick={()=>{setNavOpened(false)}}>
                                <Confetti weight='fill' />
                                { language.data.header.actions.invite }
                            </MyButton>
                        </Link>
                    </div>
                </nav>
            </div>
        </header>
    )
}

export default Header