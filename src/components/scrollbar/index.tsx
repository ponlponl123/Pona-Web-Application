"use client"
import React from 'react'
import { UserInfo } from '@/server-side-api/discord/fetchUser'
import { House, Confetti, Gear, Planet, CaretLeft, Wrench, Playlist, ChartPieSlice, Palette, Bug, StarAndCrescent, PaintBrush, SunHorizon, Keyboard, MusicNoteSimple, Thermometer, ShieldCheckered, MapPinArea, MagnifyingGlass, HouseSimple, Sparkle, PersonSimpleRun } from '@phosphor-icons/react/dist/ssr'
import { useDiscordGuildInfo } from '@/contexts/discordGuildInfo'
import { useLanguageContext } from '@/contexts/languageContext'
import { AnimatePresence, motion } from 'framer-motion'
import ActivationLink from './activationLink'
import { usePathname, useRouter } from 'next/navigation'
import FrozenRoute from '../HOC/FrozenRoute'
import { Avatar, Chip } from '@nextui-org/react'
import { useGlobalContext } from '@/contexts/globalContext'

const variants = {
    hidden: { opacity: 0, x: -12, y: 0 },
    enter: { opacity: 1, x: 0, y: 0 },
    exit: { opacity: 0, x: 12, y: 0 }
}

function Scrollbar({ userInfo, nav = false, onPushLocation }: { userInfo: UserInfo, nav?: boolean, onPushLocation?: () => void}) {
    const pathname = usePathname();
    const ownerId = process.env.NEXT_PUBLIC_DISCORD_OWNER_ID;
    const isOwner = userInfo.id === ownerId;
    const { language } = useLanguageContext();
    const { guild } = useDiscordGuildInfo();
    const { ponaCommonState } = useGlobalContext();
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
    };

    return (
        <main className={`scrollbar ${!nav ? 'w-80 h-screen max-md:hidden p-6 pt-24 flex flex-col gap-2' : 'md:hidden w-full flex flex-col gap-2'}`}>
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
                                    <span className='px-4 font-bold text-lg'>{language.data.app.setting.name}</span>
                                    <ActivationLink onClick={handlePushLocation} href={`#account`} icon={StarAndCrescent}>{language.data.app.setting.account.title}</ActivationLink>
                                    <div className='group-menu'>
                                        <div className='group-title'>
                                            <ActivationLink onClick={handlePushLocation} href={`#layout`} icon={Palette}>{language.data.app.setting.layout.title}</ActivationLink>
                                        </div>
                                        <div className='group-content'>
                                            <ActivationLink onClick={handlePushLocation} href={`#layout-theme`} icon={PaintBrush}>{language.data.app.setting.layout.theme.title}</ActivationLink>
                                            <ActivationLink onClick={handlePushLocation} href={`#layout-timeformat`} icon={SunHorizon}>{language.data.app.setting.layout.time_format.title}</ActivationLink>
                                            <ActivationLink onClick={handlePushLocation} href={`#layout-thermometer`} icon={Thermometer}>{language.data.app.setting.layout.thermometer.title}</ActivationLink>
                                            <ActivationLink onClick={handlePushLocation} href={`#layout-animations`} icon={PersonSimpleRun}>{language.data.app.setting.layout.animation.title}</ActivationLink>
                                        </div>
                                    </div>
                                    <div className='group-menu'>
                                        <div className='group-title'>
                                            <ActivationLink onClick={handlePushLocation} href={`#privacy`} icon={ShieldCheckered}>{language.data.app.setting.privacy.title}</ActivationLink>
                                        </div>
                                        <div className='group-content'>
                                            <ActivationLink onClick={handlePushLocation} href={`#privacy-location`} icon={MapPinArea}>{language.data.app.setting.privacy.location.title}</ActivationLink>
                                        </div>
                                    </div>
                                    <ActivationLink onClick={handlePushLocation} href={`#keybinds`} icon={Keyboard}>{language.data.app.setting.keybinds.title}</ActivationLink>
                                    <ActivationLink onClick={handlePushLocation} href={`#devzone`} icon={Bug}>{language.data.app.setting.dev_mode.title}</ActivationLink>
                                </>
                            ) : !inGuild ? (
                                <>
                                    <ActivationLink onClick={handlePushLocation} href='/app' icon={House}>{language.data.app.home.name}</ActivationLink>
                                    <ActivationLink onClick={handlePushLocation} href='/app/guilds' icon={Confetti}>{language.data.app.guilds.name}</ActivationLink>
                                    <ActivationLink onClick={handlePushLocation} href='/app/chat' icon={Sparkle}>{language.data.app.chat.name} <Chip size='sm'>{language.data.extensions.comingsoon}</Chip></ActivationLink>
                                    <ActivationLink onClick={handlePushLocation} href='/app/playlists' icon={Playlist}>{language.data.app.playlist.name}</ActivationLink>
                                    <ActivationLink onClick={handlePushLocation} href='/app/updates' icon={Wrench}
                                        isActive={pathname.includes('/app/updates')}>{language.data.app.updates.name} <Chip color='primary' size='sm'>{language.data.extensions.new}</Chip></ActivationLink>
                                </>
                            ) : guild && (
                                <>
                                    <ActivationLink onClick={handlePushLocation} href='/app/guilds' icon={CaretLeft} className='h-fit p-2'>
                                        <div className='flex gap-2 items-center'>
                                            <Avatar className='h-8 w-8' src={guild.iconURL as string} />
                                            <h1 className='text-base'>{guild.name}</h1>
                                        </div>
                                    </ActivationLink>
                                    <ActivationLink onClick={handlePushLocation} href={`/app/g/${guild.id}`} icon={ChartPieSlice}>{language.data.app.overview.name}</ActivationLink>
                                    {
                                        !(ponaCommonState && ponaCommonState.pona.voiceChannel) ?
                                        <ActivationLink onClick={handlePushLocation} href={`/app/g/${guild.id}/player`} icon={MusicNoteSimple}>{language.data.app.guilds.player.name}</ActivationLink> :
                                        <div className='group-menu' aria-label={`/app/g/${guild.id}/player`}>
                                            <div className='group-title'>
                                                <ActivationLink onClick={handlePushLocation} href={`/app/g/${guild.id}/player`} icon={MusicNoteSimple}>{language.data.app.guilds.player.name} <Chip size='sm'>{language.data.extensions.beta}</Chip></ActivationLink>
                                            </div>
                                            <div className='group-content'>
                                                <ActivationLink onClick={handlePushLocation} href={`/app/g/${guild.id}/player`} icon={HouseSimple}>{language.data.app.guilds.player.home.title}</ActivationLink>
                                                <ActivationLink onClick={handlePushLocation} href={`/app/g/${guild.id}/player/search`} icon={MagnifyingGlass}>{language.data.app.guilds.player.search.title}</ActivationLink>
                                            </div>
                                        </div>
                                    }
                                    <ActivationLink onClick={handlePushLocation} href={`/app/g/${guild.id}/setting`} icon={Gear}>{language.data.app.guilds.setting.name}</ActivationLink>
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
                        <ActivationLink onClick={handlePushLocation} href='/app/stats' icon={Planet}>Stats</ActivationLink>
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
                                        <ActivationLink onClick={handleBackNavigation} icon={CaretLeft}>{language.data.app.setting.back}</ActivationLink>
                                    </>
                                ) : (
                                    <>
                                        <ActivationLink onClick={handlePushLocation} href='/app/setting' icon={Gear}>{language.data.app.setting.name}</ActivationLink>
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