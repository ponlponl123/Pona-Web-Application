"use client"
import React from 'react'
import { motion } from 'framer-motion'
import { useLanguageContext } from '@/contexts/languageContext'
import { CaretLineLeft, CaretLineRight, MusicNoteSimple, Play, Repeat, SpeakerSimpleHigh } from '@phosphor-icons/react/dist/ssr'
import PageAnimatePresence from '@/components/HOC/PageAnimatePresence'
import { Button, Image, Link } from '@nextui-org/react'

import defaultImage from '@/../public/Ponlponl123 (1459).png';
import SocketConnecting from './@system/socket-connecting'
import { usePonaMusicContext } from '@/contexts/ponaMusicContext'
import LetsPonaJoin from './@system/lets-pona-join'
import { useDiscordGuildInfo } from '@/contexts/discordGuildInfo'
import { useDiscordUserInfo } from '@/contexts/discordUserInfo'

import backdrop from '@/../public/backdrop.png'
import { useGlobalContext } from '@/contexts/globalContext'

function Providers({ children }: { children: React.ReactNode }) {
    const { language } = useLanguageContext();
    const { guild } = useDiscordGuildInfo();
    const { userInfo } = useDiscordUserInfo();
    const { isConnected } = usePonaMusicContext();
    const { ponaCommonState } = useGlobalContext();
    const currentTrack = ponaCommonState?.current;
    const backdropBg = currentTrack ? currentTrack.thumbnail : guild?.bannerURL ? guild.bannerURL+'?size=640' :
        guild?.iconURL ? guild.iconURL+'?size=640' : userInfo?.banner ? `https://cdn.discordapp.com/banners/${userInfo.id}/${userInfo.banner}?size=640` : userInfo?.avatar ? `https://cdn.discordapp.com/avatars/${userInfo.id}/${userInfo.avatar}?size=640` :
        backdrop.src;

    return (
        <>
            <main id='app-panel' className='relative bg-gradient-to-t from-warning/40 to-primary/10 dark:from-primary/20 dark:to-secondary/10 h-screen -mb-6'>
                <div className='absolute w-full h-1/2 max-h-96 min-h-48 top-0 left-0 z-[1] opacity-40'>
                    <Image src={backdropBg || backdrop.src} alt={currentTrack?currentTrack.title:guild?.name || ''} width={"100%"} height={320}
                        className='object-cover blur-3xl scale-125 w-full h-96'
                    />
                </div>
                <main id='app-workspace'>
                    <h1 className='absolute top-6 left-6 text-2xl flex items-center gap-4 z-20'>
                        <MusicNoteSimple weight='fill' size={24} /> {language.data.app.guilds.player.name}
                    </h1>
                    {
                        isConnected ?
                            !ponaCommonState?.pona.voiceChannel ?
                            <LetsPonaJoin /> :
                            <PageAnimatePresence>{children}</PageAnimatePresence>
                        : <SocketConnecting />
                    }
                </main>
            </main>
            <div
                id='pona-player'
                className={
                    `p-4 flex flex-row items-center justify-between gap-4 absolute bottom-2 left-2 bg-warning-50/40 border-2 border-white/20 rounded-3xl backdrop-blur-md ${currentTrack ?? 'opacity-0 pointer-events-none translate-x-full'}`
                }
                style={{width:'calc(100% - 1rem)',height:'6.5rem'}}
            >
                <motion.div
                    className='flex items-center justify-start gap-4 w-full'
                    animate={{
                        transition: {
                            duration: 0.2,
                            type: 'spring'
                        }
                    }}
                >
                    <Image src={currentTrack ? currentTrack.thumbnail : defaultImage.src} alt={currentTrack ? currentTrack.title : 'Thumbnail'} height={'4.4rem'} />
                    <div className='flex flex-col justify-center items-start'>
                        <h1 className='text-xl'>{currentTrack ? currentTrack.title : 'Music Name'} {currentTrack ? <Link href={currentTrack.uri} showAnchorIcon /> : <></>}</h1>
                        <span className='text-sm text-foreground/40'>{currentTrack ? currentTrack.author : 'Author'}</span>
                    </div>
                </motion.div>
                <div className='flex items-center justify-center gap-4 w-full'>
                    <Button isIconOnly radius='full' size='md' variant='light' className='scale-110'><CaretLineLeft weight='fill' /></Button>
                    <Button isIconOnly radius='full' size='lg' variant='shadow' color='primary' className='scale-125'><Play weight='fill' /></Button>
                    <Button isIconOnly radius='full' size='md' variant='light' className='scale-110'><CaretLineRight weight='fill' /></Button>
                </div>
                <div className='flex items-center justify-end gap-2 w-full'>
                    <Button isIconOnly radius='lg' size='md' variant='light' className='scale-110'><Repeat weight='fill' /></Button>
                    <Button isIconOnly radius='lg' size='md' variant='light' className='scale-110'><SpeakerSimpleHigh weight='fill' /></Button>
                </div>
            </div>
        </>
    )
}

export default Providers