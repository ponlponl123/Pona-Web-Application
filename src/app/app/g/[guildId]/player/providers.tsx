"use client"
import React from 'react'
import { motion } from 'framer-motion'
import { useLanguageContext } from '@/contexts/languageContext'
import { CaretLineLeft, CaretLineRight, MusicNoteSimple, Pause, Play, Repeat, SpeakerSimpleHigh } from '@phosphor-icons/react/dist/ssr'
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
    const backdropBg = currentTrack ? currentTrack.artworkUrl ? currentTrack.artworkUrl : currentTrack.thumbnail : guild?.bannerURL ? guild.bannerURL+'?size=640' :
        guild?.iconURL ? guild.iconURL+'?size=640' : userInfo?.banner ? `https://cdn.discordapp.com/banners/${userInfo.id}/${userInfo.banner}?size=640` : userInfo?.avatar ? `https://cdn.discordapp.com/avatars/${userInfo.id}/${userInfo.avatar}?size=640` :
        backdrop.src;

    return (
        <>
            <main id='app-panel' className='relative bg-gradient-to-t light:from-warning/10 to-primary/20 h-screen -mb-6 border-l-2 border-foreground/10'>
                <div className='absolute w-full h-1/2 max-h-96 min-h-48 top-0 left-0 z-[1] opacity-40'>
                    <Image src={backdropBg || backdrop.src} alt={currentTrack?currentTrack.title:guild?.name || ''} width={"100%"} height={320}
                        className='object-cover blur-3xl scale-125 w-full h-96 pointer-events-none'
                    />
                </div>
                <main id='app-workspace' style={{maxWidth:'unset'}}>
                    <div className='absolute top-6 left-6 flex items-center gap-12 z-50 w-full'>
                        <h1 className='items-center text-2xl gap-4 hidden'>
                            <MusicNoteSimple weight='fill' size={24} /> {language.data.app.guilds.player.name}
                        </h1>
                    </div>
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
                    `p-2 flex flex-row items-center justify-between gap-4 absolute overflow-hidden bottom-2 left-2 bg-warning-50/5 border-2 border-white/5 rounded-2xl backdrop-blur-md ${currentTrack ?? 'opacity-0 pointer-events-none translate-x-full'}`
                }
                style={{width:'calc(100% - 1rem)',height:'5.6rem'}}
            >
                <Image src={currentTrack ? currentTrack.artworkUrl : defaultImage.src} alt={currentTrack ? currentTrack.title : 'Thumbnail'} height={'4.4rem'} className='z-10 blur-3xl absolute left-0 -translate-y-1/2 w-1/4 min-w-32 object-cover' />
                <motion.div
                    className='flex items-center justify-start gap-4 w-full -ml-4'
                    style={{maxWidth:'calc(33.33% - 1rem)'}}
                    animate={{
                        transition: {
                            duration: 0.2,
                            type: 'spring'
                        }
                    }}
                >
                    <Image src={currentTrack ? currentTrack.artworkUrl : defaultImage.src} alt={currentTrack ? currentTrack.title : 'Thumbnail'} height={'4.4rem'} width={'4.4rem'} className='w-[4.4rem] object-cover'
                        loading='lazy' shadow='lg' isBlurred id='pona-music-thumbnail' />
                    <div className='flex flex-col justify-center items-start' style={{width:'calc(100% - 5.4rem)'}}>
                        <div className='text-xl w-full flex gap-2'>
                            <h1 className='text-xl text-music-accent-color-foreground w-full whitespace-nowrap overflow-hidden overflow-ellipsis'>{currentTrack ? currentTrack.title : 'Music Name'}</h1>
                            {currentTrack ? <Link href={currentTrack.uri} showAnchorIcon /> : <></>}
                        </div>
                        <span className='text-sm text-foreground/40 w-full whitespace-nowrap overflow-hidden overflow-ellipsis'>{currentTrack ? currentTrack.author : 'Author'}</span>
                    </div>
                </motion.div>
                <div className='flex items-center justify-center gap-4 w-full' style={{maxWidth:'calc(33.33% - 1rem)'}}>
                    <Button isIconOnly radius='full' size='md' variant='light' className='scale-110'><CaretLineLeft weight='fill' /></Button>
                    {
                        !ponaCommonState?.pona.paused ? <>
                            <Button isIconOnly radius='full' size='lg' variant='light' className='scale-125'><Pause weight='fill' /></Button>
                        </> : <>
                            <Button isIconOnly radius='full' size='lg' variant='light' className='scale-125'><Play weight='fill' /></Button>
                        </>
                    }
                    <Button isIconOnly radius='full' size='md' variant='light' className='scale-110'><CaretLineRight weight='fill' /></Button>
                </div>
                <div className='flex items-center justify-end gap-2 w-full mr-3' style={{maxWidth:'calc(33.33% - 1rem)'}}>
                    <Button isIconOnly radius='lg' size='md' variant='light' className='scale-110'><Repeat weight='fill' /></Button>
                    <Button isIconOnly radius='lg' size='md' variant='light' className='scale-110'><SpeakerSimpleHigh weight='fill' /></Button>
                </div>
            </div>
        </>
    )
}

export default Providers