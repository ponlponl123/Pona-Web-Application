"use client"
import React from 'react'
import { useLanguageContext } from '@/contexts/languageContext'
import { CaretLineLeft, CaretLineRight, MusicNoteSimple, Play, Repeat, SpeakerSimpleHigh } from '@phosphor-icons/react/dist/ssr'
import PageAnimatePresence from '@/components/HOC/PageAnimatePresence'
import { motion } from 'framer-motion'
import { Button, Image, Link } from '@nextui-org/react'
import { Track } from '@/interfaces/ponaPlayer'

import defaultImage from '@/../public/Ponlponl123 (1459).png';

function Providers({ children }: { children: React.ReactNode }) {
    const { language } = useLanguageContext();
    const [ currentTrack ] = React.useState<Track | null>(null);
    return (
        <>
            <main id='app-panel' className='relative bg-gradient-to-t from-warning/40 to-primary/10 dark:from-primary/20 dark:to-secondary/10 h-screen -mb-6'>
                <main id='app-workspace'>
                    <h1 className='absolute top-6 left-6 text-2xl flex items-center gap-4'>
                        <MusicNoteSimple weight='fill' size={24} /> {language.data.app.guilds.player.name}
                    </h1>
                    <PageAnimatePresence>
                        {children}
                    </PageAnimatePresence>
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