"use client"
import React from 'react'
import { UserInfo } from '@/server-side-api/discord/fetchUser'
import { House, Confetti, Gear, Planet, CaretLeft, Wrench, Guitar, Playlist, ChartPieSlice, Palette, Bug } from '@phosphor-icons/react/dist/ssr'
import { useDiscordGuildInfo } from '@/contexts/discordGuildInfo'
import { useLanguageContext } from '@/contexts/languageContext'
import { AnimatePresence, motion } from 'framer-motion'
import ActivationLink from './activationLink'
import { usePathname } from 'next/navigation'
import FrozenRoute from '../HOC/FrozenRoute'
import { Avatar } from '@nextui-org/react'

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
    const inGuild = pathname.startsWith('/app/g/');
    const inSetting = pathname.startsWith('/app/setting');
    const handlePushLocation = () => {
        if (onPushLocation) onPushLocation()
    }

    return (
        <main className={`scrollbar ${!nav ? 'w-80 h-screen max-md:hidden p-6 pt-24 flex flex-col gap-2' : 'md:hidden w-full flex flex-col gap-2'}`}>
            <AnimatePresence mode="wait">
                <motion.div key={String(`${inGuild} ${inSetting}`)}>
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
                                    <ActivationLink onClick={handlePushLocation} href={`#layout`} icon={Palette}>{language.data.app.setting.layout.title}</ActivationLink>
                                    <ActivationLink onClick={handlePushLocation} href={`#devzone`} icon={Bug}>{language.data.app.setting.dev_mode.title}</ActivationLink>
                                </>
                            ) : !inGuild ? (
                                <>
                                    <ActivationLink onClick={handlePushLocation} href='/app' icon={House}>{language.data.app.home.name}</ActivationLink>
                                    <ActivationLink onClick={handlePushLocation} href='/app/guilds' icon={Confetti}>{language.data.app.guilds.name}</ActivationLink>
                                    <ActivationLink onClick={handlePushLocation} href='/app/playlists' icon={Playlist}>{language.data.app.playlist.name}</ActivationLink>
                                    <ActivationLink onClick={handlePushLocation} href='/app/updates' icon={Wrench}>{language.data.app.updates.name}</ActivationLink>
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
                                    <ActivationLink onClick={handlePushLocation} href={`/app/g/${guild.id}/player`} icon={Guitar}>{language.data.app.guilds.player.name}</ActivationLink>
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
                                        <ActivationLink onClick={handlePushLocation} href={`/app`} icon={CaretLeft}>{language.data.app.setting.back}</ActivationLink>
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