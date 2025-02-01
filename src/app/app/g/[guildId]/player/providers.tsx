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

function Providers({ children }: { children: React.ReactNode }) {
    const { language } = useLanguageContext();
    const {
        isConnected,
        currentTrack
    } = usePonaMusicContext();

    return (
        <>
            <main id='app-panel' className='relative bg-gradient-to-t from-warning/40 to-primary/10 dark:from-primary/20 dark:to-secondary/10 h-screen -mb-6'>
                {
                    /* <div className='absolute z-10 w-full h-full top-0 left-0 bg-transparent'>
                        <div className='absolute left-[max(-7rem,calc(50%-52rem))] top-1/2 -z-10 -translate-y-1/2 transform-gpu blur-2xl'>
                            <div className="aspect-[577/310] w-[36.0625rem] bg-gradient-to-r from-[#ff80b5] to-[#9089fc] dark:from-[#F54180] dark:to-[#338EF7] opacity-20 dark:opacity-10"
                                style={{clipPath:"polygon(74.8% 41.9%, 97.2% 73.2%, 100% 34.9%, 92.5% 0.4%, 87.5% 0%, 75% 28.6%, 58.5% 54.6%, 50.1% 56.8%, 46.9% 44%, 48.3% 17.4%, 24.7% 53.9%, 0% 27.9%, 11.9% 74.2%, 24.9% 54.1%, 68.6% 100%, 74.8% 41.9%)"}}></div>
                        </div>
                        <div className='absolute left-[max(45rem,calc(50%+8rem))] top-1/2 -z-10 -translate-y-1/2 transform-gpu blur-2xl'>
                            <div className="aspect-[577/310] w-[36.0625rem] bg-gradient-to-r  from-[#ff80b5] to-[#9089fc] dark:from-[#F54180] dark:to-[#338EF7]  opacity-30 dark:opacity-20"
                                style={{clipPath:"polygon(74.8% 41.9%, 97.2% 73.2%, 100% 34.9%, 92.5% 0.4%, 87.5% 0%, 75% 28.6%, 58.5% 54.6%, 50.1% 56.8%, 46.9% 44%, 48.3% 17.4%, 24.7% 53.9%, 0% 27.9%, 11.9% 74.2%, 24.9% 54.1%, 68.6% 100%, 74.8% 41.9%)"}}></div>
                        </div>
                    </div> */
                }
                <main id='app-workspace'>
                    <h1 className='absolute top-6 left-6 text-2xl flex items-center gap-4 z-20'>
                        <MusicNoteSimple weight='fill' size={24} /> {language.data.app.guilds.player.name}
                    </h1>
                    {
                        isConnected ? <PageAnimatePresence>{children}</PageAnimatePresence>
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
                    <Image src={currentTrack ? currentTrack.current.thumbnail : defaultImage.src} alt={currentTrack ? currentTrack.current.title : 'Thumbnail'} height={'4.4rem'} />
                    <div className='flex flex-col justify-center items-start'>
                        <h1 className='text-xl'>{currentTrack ? currentTrack.current.title : 'Music Name'} {currentTrack ? <Link href={currentTrack.current.uri} showAnchorIcon /> : <></>}</h1>
                        <span className='text-sm text-foreground/40'>{currentTrack ? currentTrack.current.author : 'Author'}</span>
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