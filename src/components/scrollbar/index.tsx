"use client"
import React, { useState } from 'react'
import { UserInfo } from '@/server-side-api/discord/fetchUser'
import { House, Confetti, Gear, Planet, CaretLeft, Wrench, Playlist, ChartPieSlice, Palette, Bug, StarAndCrescent, PaintBrush, SunHorizon, Keyboard, MusicNoteSimple, Thermometer, ShieldCheckered, HouseSimple, Sparkle, PersonSimpleRun, MapPinArea, ClockCounterClockwise } from '@phosphor-icons/react/dist/ssr'
import { useDiscordGuildInfo } from '@/contexts/discordGuildInfo'
import { useLanguageContext } from '@/contexts/languageContext'
import { AnimatePresence, motion } from 'framer-motion'
import ActivationLink from './activationLink'
import { usePathname, useRouter } from 'next/navigation'
import FrozenRoute from '../HOC/FrozenRoute'
import { Avatar, Button, Chip } from '@nextui-org/react'
import { useGlobalContext } from '@/contexts/globalContext'

const variants = {
    hidden: { opacity: 0, x: -12, y: 0 },
    enter: { opacity: 1, x: 0, y: 0 },
    exit: { opacity: 0, x: 12, y: 0 }
}

function Scrollbar(
    {
        userInfo,
        nav = false,
        onPushLocation,
        canCollapsed,
        onCollapsed
    }:
    {
        userInfo: UserInfo,
        nav?: boolean,
        onPushLocation?: () => void,
        canCollapsed?: true | undefined,
        onCollapsed?: (value: boolean) => void
    }
) {
    const pathname = usePathname();
    const ownerId = process.env.NEXT_PUBLIC_DISCORD_OWNER_ID;
    const isOwner = userInfo.id === ownerId;
    const { guild } = useDiscordGuildInfo();
    const { language } = useLanguageContext();
    const { ponaCommonState } = useGlobalContext();
    const [ sidebarCollapsed, setSidebarCollapsed ] = useState<boolean>(false);
    const inGuild = pathname.startsWith('/app/g/');
    const inSetting = pathname.startsWith('/app/setting');
    const router = useRouter();
    const handlePushLocation = () => {
        if (onPushLocation) onPushLocation()
    }
    const handleBackNavigation = () => {
        const previousPath = document.referrer;
        if (previousPath && previousPath.includes(window.location.origin)) {
            router.back();
        } else {
            router.push('/app');
        }
    }

    return (
        <main className={`scrollbar ${!nav ? `${(canCollapsed && sidebarCollapsed) ? 'min-w-16 w-16 max-w-16 p-2' : 'min-w-72 w-72 max-w-72 p-6' } relative h-screen max-md:hidden pt-24 flex flex-col gap-2` : 'md:hidden w-full flex flex-col gap-2'}`}>
            {
                canCollapsed && <Button className={`absolute -right-0.5 top-24 min-w-0 w-1 max-w-1 h-[calc(100vh_-_12rem)] z-20 opacity-0 hover:opacity-100`} isIconOnly onPress={()=>{
                    setSidebarCollapsed((value)=>{
                        if (onCollapsed) onCollapsed(!value)
                        if ( (!value) ) document.body.classList.add("sidebar-collapsed");
                        else document.body.classList.remove("sidebar-collapsed");
                        return!value
                    })
                }}><CaretLeft/></Button>
            }
            <AnimatePresence mode="wait">
                <motion.div className='max-h-full overflow-x-hidden overflow-y-auto scroll-smooth' style={{scrollbarWidth: 'thin'}} key={String(`${inGuild} ${inSetting}`)}>
                    <FrozenRoute>
                        <motion.main
                            variants={variants}
                            initial="hidden"
                            exit="exit"
                            animate="enter"
                            transition={{ type: 'linear', duration: 0.12 }}
                            key="Menu"
                        >
                        {
                            inSetting ? (
                                <>
                                    <span className={`px-4 font-bold text-lg ${(canCollapsed && sidebarCollapsed)?'hidden':''}`}>{language.data.app.setting.name}</span>
                                    <ActivationLink iconOnly={(canCollapsed && sidebarCollapsed)} onClick={handlePushLocation} href={`#account`} icon={StarAndCrescent}>{language.data.app.setting.account.title}</ActivationLink>
                                    <div className={`group-menu ${(canCollapsed && sidebarCollapsed)?'collapsed':''}`}>
                                        <div className='group-title'>
                                            <ActivationLink iconOnly={(canCollapsed && sidebarCollapsed)} onClick={handlePushLocation} href={`#layout`} icon={Palette}>{language.data.app.setting.layout.title}</ActivationLink>
                                        </div>
                                        <div className='group-content'>
                                            <ActivationLink iconOnly={(canCollapsed && sidebarCollapsed)} onClick={handlePushLocation} href={`#layout-theme`} icon={PaintBrush}>{language.data.app.setting.layout.theme.title}</ActivationLink>
                                            <ActivationLink iconOnly={(canCollapsed && sidebarCollapsed)} onClick={handlePushLocation} href={`#layout-timeformat`} icon={SunHorizon}>{language.data.app.setting.layout.time_format.title}</ActivationLink>
                                            <ActivationLink iconOnly={(canCollapsed && sidebarCollapsed)} onClick={handlePushLocation} href={`#layout-thermometer`} icon={Thermometer}>{language.data.app.setting.layout.thermometer.title}</ActivationLink>
                                            <ActivationLink iconOnly={(canCollapsed && sidebarCollapsed)} onClick={handlePushLocation} href={`#layout-animations`} icon={PersonSimpleRun}>{language.data.app.setting.layout.animation.title}</ActivationLink>
                                        </div>
                                    </div>
                                    <div className={`group-menu ${(canCollapsed && sidebarCollapsed)?'collapsed':''}`}>
                                        <div className='group-title'>
                                            <ActivationLink iconOnly={(canCollapsed && sidebarCollapsed)} onClick={handlePushLocation} href={`#privacy`} icon={ShieldCheckered}>{language.data.app.setting.privacy.title}</ActivationLink>
                                        </div>
                                        <div className='group-content'>
                                            <ActivationLink iconOnly={(canCollapsed && sidebarCollapsed)} onClick={handlePushLocation} href={`#privacy-location`} icon={MapPinArea}>{language.data.app.setting.privacy.location.title}</ActivationLink>
                                        </div>
                                    </div>
                                    <ActivationLink iconOnly={(canCollapsed && sidebarCollapsed)} onClick={handlePushLocation} href={`#keybinds`} icon={Keyboard}>{language.data.app.setting.keybinds.title}</ActivationLink>
                                    <ActivationLink iconOnly={(canCollapsed && sidebarCollapsed)} onClick={handlePushLocation} href={`#devzone`} icon={Bug}>{language.data.app.setting.dev_mode.title}</ActivationLink>
                                </>
                            ) : !inGuild ? (
                                <>
                                    <ActivationLink iconOnly={(canCollapsed && sidebarCollapsed)} onClick={handlePushLocation} href='/app' icon={House}>{language.data.app.home.name}</ActivationLink>
                                    <ActivationLink iconOnly={(canCollapsed && sidebarCollapsed)} onClick={handlePushLocation} href='/app/guilds' icon={Confetti}>{language.data.app.guilds.name}</ActivationLink>
                                    <ActivationLink iconOnly={(canCollapsed && sidebarCollapsed)} onClick={handlePushLocation} href='/app/chat' icon={Sparkle}>{language.data.app.chat.name} <Chip size='sm'>{language.data.extensions.comingsoon}</Chip></ActivationLink>
                                    <ActivationLink iconOnly={(canCollapsed && sidebarCollapsed)} onClick={handlePushLocation} href='/app/playlists' icon={Playlist}>{language.data.app.playlist.name}</ActivationLink>
                                    <ActivationLink iconOnly={(canCollapsed && sidebarCollapsed)} onClick={handlePushLocation} href='/app/updates' icon={Wrench}
                                        isActive={pathname.includes('/app/updates')}>{language.data.app.updates.name} <Chip color='primary' size='sm'>{language.data.extensions.new}</Chip></ActivationLink>
                                </>
                            ) : guild && (
                                <>
                                    <ActivationLink iconOnly={(canCollapsed && sidebarCollapsed)} onClick={handlePushLocation} href='/app/guilds' icon={CaretLeft} className='h-fit p-2'>
                                        <div className='flex gap-2 items-center'>
                                            <Avatar className='h-8 w-8' src={guild.iconURL as string} />
                                            <h1 className='text-base'>{guild.name}</h1>
                                        </div>
                                    </ActivationLink>
                                    <ActivationLink iconOnly={(canCollapsed && sidebarCollapsed)} onClick={handlePushLocation} href={`/app/g/${guild.id}`} icon={ChartPieSlice}>{language.data.app.overview.name}</ActivationLink>
                                    {
                                        !(ponaCommonState && ponaCommonState.pona.voiceChannel) ?
                                        <ActivationLink iconOnly={(canCollapsed && sidebarCollapsed)} onClick={handlePushLocation} href={`/app/g/${guild.id}/player`} icon={MusicNoteSimple}>{language.data.app.guilds.player.name}</ActivationLink> :
                                        <div className={`group-menu ${(canCollapsed && sidebarCollapsed)?'collapsed':''}`} aria-label={`/app/g/${guild.id}/player`}>
                                            <div className='group-title'>
                                                <ActivationLink iconOnly={(canCollapsed && sidebarCollapsed)} onClick={handlePushLocation} href={`/app/g/${guild.id}/player`} icon={MusicNoteSimple}>{language.data.app.guilds.player.name} <Chip size='sm'>{language.data.extensions.beta}</Chip></ActivationLink>
                                            </div>
                                            <div className='group-content'>
                                                <ActivationLink iconOnly={(canCollapsed && sidebarCollapsed)} onClick={handlePushLocation} href={`/app/g/${guild.id}/player`} icon={HouseSimple}>{language.data.app.guilds.player.home.title}</ActivationLink>
                                                <ActivationLink iconOnly={(canCollapsed && sidebarCollapsed)} onClick={handlePushLocation} href={`/app/g/${guild.id}/player/history`} icon={ClockCounterClockwise}>{language.data.app.guilds.player.history.title}</ActivationLink>
                                                <ActivationLink iconOnly={(canCollapsed && sidebarCollapsed)} onClick={handlePushLocation} href={`/app/g/${guild.id}/player/playlists`} icon={Playlist}>{language.data.app.playlist.name}</ActivationLink>
                                            </div>
                                        </div>
                                    }
                                    <ActivationLink iconOnly={(canCollapsed && sidebarCollapsed)} onClick={handlePushLocation} href={`/app/g/${guild.id}/setting`} icon={Gear}>{language.data.app.guilds.setting.name}</ActivationLink>
                                </>
                            )
                        }
                        </motion.main>
                    </FrozenRoute>
                </motion.div>
            </AnimatePresence>
            { !nav && (<div className='mt-auto'></div>) }
            {
                isOwner && (
                    <>
                        <ActivationLink iconOnly={(canCollapsed && sidebarCollapsed)} onClick={handlePushLocation} href='/app/stats' icon={Planet}>Stats</ActivationLink>
                    </>
                )
            }
            <AnimatePresence mode="wait">
                <motion.div key={String(`${inSetting}`)}>
                    <FrozenRoute>
                        <motion.main
                            variants={variants}
                            initial="hidden"
                            exit="exit"
                            animate="enter"
                            transition={{ type: 'linear', duration: 0.12 }}
                            key="Bottom-Menu"
                        >
                            {
                                inSetting ? (
                                    <>
                                        <ActivationLink iconOnly={(canCollapsed && sidebarCollapsed)} onClick={handleBackNavigation} icon={CaretLeft}>{language.data.app.setting.back}</ActivationLink>
                                    </>
                                ) : (
                                    <>
                                        <ActivationLink iconOnly={(canCollapsed && sidebarCollapsed)} onClick={handlePushLocation} href='/app/setting' icon={Gear}>{language.data.app.setting.name}</ActivationLink>
                                    </>
                                )
                            }
                        </motion.main>
                    </FrozenRoute>
                </motion.div>
            </AnimatePresence>
        </main>
    )
}

export default Scrollbar