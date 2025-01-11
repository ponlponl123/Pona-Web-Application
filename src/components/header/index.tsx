"use client"
import React from 'react'
import Link from 'next/link';
import MyButton from '@/components/button'
import { useLanguageContext } from '@/contexts/languageContext';
import { useDiscordUserInfo } from '@/contexts/discordUserInfo';
import { DiscordLogo, Confetti, Hamburger, Question, Gear, Leaf } from "@phosphor-icons/react/dist/ssr";
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Avatar } from '@nextui-org/react';
import { usePathname } from 'next/navigation';
import PonaIcon from '@/app/favicon.ico';
import { getCookie } from 'cookies-next';
import Scrollbar from '../scrollbar';
import Image from 'next/image';

function UserAccountAction({className, minimize = false}: {className?: string, minimize?: boolean}) {
    const { userInfo, revokeUserAccessToken } = useDiscordUserInfo();
    const { language } = useLanguageContext();
    return (
        userInfo &&
        <Dropdown placement="bottom-start">
            <DropdownTrigger>
                <button type='button' className={`${className} outline-none ${!minimize ? 'bg-white bg-opacity-10 backdrop-blur-md rounded-2xl px-3 py-2 flex gap-3 items-center justify-center w-fit' : ''}`}>
                    <Avatar className='h-8 w-8' src={`https://cdn.discordapp.com/avatars/${userInfo.id}/${userInfo.avatar}.png`} />
                    {
                        !minimize &&
                        <div className='flex flex-col items-start'>
                            <h1 className='text-base font-bold tracking-wider leading-none'>{userInfo.global_name}</h1>
                            <span className='text-xs'>@{userInfo.username}</span>
                        </div>
                    }
                </button>
            </DropdownTrigger>
            <DropdownMenu aria-label="User Actions" variant="flat">
                <DropdownItem key="profile" className="h-14 gap-2">
                    <p className="font-bold">{language.data.header.account.signinas}</p>
                    <p className="font-bold">@{userInfo.username}</p>
                </DropdownItem>
                <DropdownItem key="app" startContent={'🏓'} href='/app'>{language.data.header.account.playground}</DropdownItem>
                <DropdownItem key="configurations" startContent={<Gear weight='fill' />} href='/app/setting'>{language.data.header.account.setting}</DropdownItem>
                <DropdownItem key="help_and_feedback" startContent={<Question weight='fill' />} href='https://ponlponl123.com/discord' target='_blank'>{language.data.header.account.support}</DropdownItem>
                <DropdownItem key="logout" startContent={<Leaf weight='fill' />} color="danger" onClick={()=>{revokeUserAccessToken(getCookie('LOGIN_') as string)}}>{language.data.header.account.logout}</DropdownItem>
            </DropdownMenu>
        </Dropdown>
    )
}

function Header() {
    const pathname = usePathname();
    const [navOpened, setNavOpened] = React.useState<boolean>(false);
    const { language } = useLanguageContext();
    const { userInfo } = useDiscordUserInfo();

    const isApp = pathname.startsWith('/app');
    const isIndex = (pathname === '/');

    return (
        <header className={`nav-opened-${navOpened} ${!isIndex ? 'max-md:backdrop-blur-md':''} absolute w-full h-20 p-6 px-8 flex items-center justify-center gap-3`}>
            <div className={`w-full ${!isApp && 'max-w-5xl'} h-full flex items-center justify-between gap-6`}>
                <div className='flex gap-2 z-20 active:scale-95'>
                    <Link href={isApp ? '/app' : '/'} onClick={()=>{setNavOpened(false)}}>
                        <h1 className='text-xl flex gap-2 items-center'>{
                            isApp ? (
                                <>
                                    <Image src={PonaIcon} alt='Pona! Application' width={32} height={32} /> Pona! {language.data.app.title}
                                </>
                            ) : 'Pona!'
                        }</h1>
                    </Link>
                </div>
                <div className='z-20 flex gap-4'>
                    <MyButton className='md:hidden btn-icon m-0' style='rounded' variant='text' onClick={()=>{
                        setNavOpened((value)=>!value);
                    }}>
                        <Hamburger size={26} weight={ navOpened ? 'fill' : 'regular' } />
                    </MyButton>
                    <UserAccountAction minimize={true} className='md:hidden'/>
                </div>
                <nav className={`nav-opened-${navOpened}`}>
                    <div className='md:hidden w-full h-28 border-b mb-6 header' style={{borderColor: 'rgb(var(--foreground-rgb),0.1)'}}>
                        
                    </div>
                    <div className='flex gap-3'>
                        {
                            (isApp && userInfo) && (
                                <Scrollbar userInfo={userInfo} nav={true} onPushLocation={()=>{setNavOpened(false)}} />
                            )
                        }
                    </div>
                    <div className='flex gap-3 items-center'>
                        {
                            !userInfo && (
                                <Link href='/app' rel="noopener noreferrer">
                                    <MyButton size='small' variant='text' style='rounded' onClick={()=>{setNavOpened(false)}}>
                                        <DiscordLogo weight='fill' />
                                        { language.data.header.actions.login }
                                    </MyButton>
                                </Link>
                            )
                        }
                        <Link href='/invite' rel="noopener noreferrer">
                            <MyButton size='small' variant='primary' effect='confetti' onClick={()=>{setNavOpened(false)}}>
                                <Confetti weight='fill' />
                                { language.data.header.actions.invite }
                            </MyButton>
                        </Link>
                        {
                            userInfo && (
                                <UserAccountAction className='max-md:hidden'/>
                            )
                        }
                    </div>
                </nav>
            </div>
        </header>
    )
}

export default Header