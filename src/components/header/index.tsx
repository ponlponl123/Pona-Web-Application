"use client"
import React from 'react'
import Link from 'next/link';
import MyButton from '@/components/button'
import { useGlobalContext } from '@/contexts/globalContext';
import { useLanguageContext } from '@/contexts/languageContext';
import { useDiscordUserInfo } from '@/contexts/discordUserInfo';
import { DiscordLogo, Confetti, Hamburger, Question, Gear, Leaf, MagnifyingGlass } from "@phosphor-icons/react/dist/ssr";
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem, Avatar, Button, Form, Input } from '@nextui-org/react';
import { usePathname, useRouter } from 'next/navigation';
import PonaIcon from '@/app/favicon.ico';
import { getCookie } from 'cookies-next';
import Scrollbar from '../scrollbar';
import Image from 'next/image';
import { useDiscordGuildInfo } from '@/contexts/discordGuildInfo';
import { fetchSearchSuggestionResult } from '@/server-side-api/internal/search';

function UserAccountAction({className, minimize = false}: {className?: string, minimize?: boolean}) {
    const { userInfo, revokeUserAccessToken } = useDiscordUserInfo();
    const { language } = useLanguageContext();
    return (
        userInfo &&
        <Dropdown placement="bottom-start">
            <DropdownTrigger>
                <button type='button' className={`${className} outline-none ${!minimize ? 'backdrop-blur-md rounded-2xl px-3 py-2 flex gap-3 items-center justify-center w-fit' : ''}`}>
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
    const router = useRouter();
    const { guild } = useDiscordGuildInfo();
    const { language } = useLanguageContext();
    const { userInfo } = useDiscordUserInfo();
    const { ponaCommonState, isSameVC, isMemberInVC } = useGlobalContext();

    const isApp = pathname.startsWith('/app');
    const isInGuild = (isApp && pathname.split('/').includes('g') && typeof Number(pathname.split('/')[3]) === 'number');
    const guildPath = isInGuild ? pathname.split('/')[4] : '';
    const isMusicApp = isApp && pathname.includes('/player');
    const isIndex = (pathname === '/');

    const searchSuggestionElement = React.useRef<HTMLDivElement>(null);
    const searchInputElement = React.useRef<HTMLInputElement>(null);
    const [searching, setSearching] = React.useState<boolean>(false);
    const [searchValue, setSearchValue] = React.useState<string>("");
    const [searchSuggestions, setSearchSuggestions] = React.useState<string[]>([]);
    const [typingTimeout, setTypingTimeout] = React.useState<NodeJS.Timeout | null>(null);

    const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
        if (searchSuggestionElement.current && !searchSuggestionElement.current.contains(event.relatedTarget as Node)) 
            setSearching(false);
    };

    const handleClickOutside = (event: MouseEvent) => {
        if (
            searchSuggestionElement.current && !searchSuggestionElement.current.contains(event.target as Node) &&
            searchInputElement.current && !searchInputElement.current.contains(event.target as Node)
        ) {
            setSearching(false);
        }
    };

    React.useEffect(() => {
        if (searching) {
            window.addEventListener('click', handleClickOutside);
        } else {
            window.removeEventListener('click', handleClickOutside);
        }
        return () => {
            window.removeEventListener('click', handleClickOutside);
        };
    }, [searching]);

    return (
        <header className={`nav-opened-${navOpened} ${(!isIndex && !isMusicApp) ? 'max-md:backdrop-blur-md':(!isIndex && isMusicApp)?'max-md:[body.pona-app-music-scrolled_&]:border-foreground/10 max-md:[body.pona-app-music-scrolled_&]:backdrop-blur-md max-md:[body.pona-app-music-scrolled_&]:bg-playground-background/40 bg-transparent border-b-2 border-foreground/0 !duration-1000 apply-soft-transition':''} ${(!isIndex && isMemberInVC && isSameVC)?'max-md:[body.pona-player-focused_&]:opacity-0 max-md:[body.pona-player-focused_&]:pointer-events-none':''} pona-header absolute w-full h-20 p-6 px-8 flex items-center justify-center gap-3`}>
            <div className={`w-full ${!isApp && 'max-w-5xl'} h-full flex items-center justify-between gap-6`}>
                <div className='flex gap-2 z-20 active:scale-95'>
                    <Link href={isApp ? '/app' : '/'} onClick={()=>{setNavOpened(false)}}>
                        <h1 className='text-xl max-md:text-base flex gap-2 items-center'>{
                            isApp ? (
                                <>
                                    <Image src={PonaIcon} alt='Pona! Application' className='max-md:h-6 max-md:w-6' width={32} height={32} />
                                    {
                                        pathname.includes('player') ?
                                        <>
                                            <span className='max-md:hidden md:contents'>Pona! {language.data.app.title}</span>
                                            <span className='max-md:contents hidden'>{language.data.app.guilds.player.name}</span>
                                        </> :
                                        <>
                                            <span className='max-sm:hidden sm:contents'>Pona! {language.data.app.title}</span>
                                        </>
                                    }
                                </>
                            ) : 'Pona!'
                        }</h1>
                    </Link>
                </div>
                <div className='z-20 flex items-center gap-4'>
                    {
                        (pathname.includes('player') && ponaCommonState && ponaCommonState.pona.voiceChannel && isSameVC) &&
                        <div className={`${(navOpened) ? 'hidden' : 'contents'}`}>
                            <Button
                                className={`${(navOpened || (pathname.includes('player') && pathname.includes('search'))) ? 'hidden' : ''} miniscreen:translate-y-8 miniscreen:pointer-events-none miniscreen:opacity-0 absolute left-1/2 -translate-x-1/2 bg-black text-white z-20`}
                                radius='full' size='sm' onPress={()=>{
                                    router.push(`/app/g/${guild?.id}/player/search`);
                                }}
                            ><MagnifyingGlass size={14} /></Button>
                            <Form className='contents' onSubmit={(e) => {
                                e.preventDefault();
                                const data = Object.fromEntries(new FormData(e.currentTarget));
                                router.push(`/app/g/${guild?.id}/player/search?q=${data.search}`);
                            }}>
                            <div className='absolute miniscreen:w-80 max-miniscreen:top-24 max-miniscreen:left-4 max-miniscreen:translate-x-0 max-miniscreen:max-w-full max-miniscreen:w-[calc(100%_-_2rem)] max-md:max-w-[32vw] max-md:fixed max-md:-translate-x-1/2 max-md:left-1/2 md:absolute md:left-80 md:[body.sidebar-collapsed_&]:left-24 [body.pona-player-focused_&]:opacity-0 [body.pona-player-focused_&]:pointer-events-none [body.pona-player-focused_&]:-translate-y-6'>
                                <Input ref={searchInputElement} startContent={<MagnifyingGlass size={18} className='mr-1 max-miniscreen:absolute max-miniscreen:scale-75' />} name='search'
                                    placeholder={language.data.app.guilds.player.search.search_box}
                                    onValueChange={(value) => {
                                        setSearching(true);
                                        setSearchValue(value);
                                        if (typingTimeout) clearTimeout(typingTimeout);
                                        setTypingTimeout(setTimeout(async () => {
                                            if ( !value ) return;
                                            const accessTokenType = getCookie('LOGIN_TYPE_');
                                            const accessToken = getCookie('LOGIN_');
                                            if (!accessTokenType || !accessToken) return false;
                                            const searcher = await fetchSearchSuggestionResult(accessTokenType, accessToken, value);
                                            if (searcher) setSearchSuggestions(searcher.searchSuggestions);
                                            else setSearchSuggestions([]);
                                        }, 500));
                                    }}
                                    onFocus={()=>{
                                        if ( searchValue ) setSearching(true);
                                    }}
                                    onBlur={handleBlur}
                                    classNames={{
                                        inputWrapper: 'max-md:rounded-full bg-foreground/10 border-2 border-foreground/10 max-miniscreen:bg-playground-background',
                                        input: 'max-miniscreen:placeholder:opacity-0 placeholder:text-content1-foreground/40'
                                    }}
                                    className={`${
                                        (pathname.includes('player') && pathname.includes('search')) ?
                                            'max-miniscreen:translate-x-0' :
                                            'max-miniscreen:min-w-0 max-miniscreen:w-10 max-miniscreen:pointer-events-none max-miniscreen:opacity-0 max-miniscreen:-translate-y-8'
                                        } backdrop-blur pona-music-searchbox z-10`
                                    }
                                />
                                <div id='pona-search-suggestions' ref={searchSuggestionElement} className={
                                    `absolute w-full min-h-6 bg-foreground/10 max-miniscreen:bg-playground-background border-2 border-foreground/10 miniscreen:backdrop-blur-xl rounded-xl top-12 p-1 z-30 ${(searching && searchValue)?'':'opacity-0 pointer-events-none -translate-y-6'}`
                                }>
                                    {
                                        searchValue &&
                                        <Button onPress={()=>{router.push(`/app/g/${guild?.id}/player/search?q=${searchValue}`);setSearching(false)}}
                                            value={searchValue} variant='light' radius='sm'
                                            className='text-start justify-start gap-3' fullWidth><MagnifyingGlass size={14} /> {searchValue}</Button>
                                    }
                                    {
                                        searchSuggestions &&
                                        searchSuggestions?.map((value, index)=>(
                                            <Button key={index} onPress={()=>{router.push(`/app/g/${guild?.id}/player/search?q=${value}`);setSearching(false)}}
                                                value={value} variant='light' radius='sm'
                                                className='text-start justify-start gap-3' fullWidth><MagnifyingGlass size={14} /> {value}</Button>
                                        ))
                                    }
                                </div>
                            </div>
                            </Form>
                        </div>
                    }
                    <MyButton className={`md:hidden btn-icon m-0 ${isMusicApp?'max-miniscreen:hidden':''}`} style='rounded' variant='text' onClick={()=>{
                        setNavOpened((value)=>!value);
                    }}>
                        <Hamburger size={26} weight={ navOpened ? 'fill' : 'regular' } />
                    </MyButton>
                    <UserAccountAction minimize={true} className='md:hidden'/>
                </div>
                <nav className={`nav-opened-${navOpened}`}>
                    <div className='md:hidden w-full h-28 border-b mb-6 header border-foreground/10'>
                        
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
                        {
                            (userInfo && isInGuild && guildPath === 'player') ? (
                                <>
                                    <UserAccountAction minimize={true}/>
                                </>
                            ) : (
                                <>
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
                                </>
                            )
                        }
                    </div>
                </nav>
            </div>
        </header>
    )
}

export default Header