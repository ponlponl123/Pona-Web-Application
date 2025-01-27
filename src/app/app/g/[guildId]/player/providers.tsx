"use client"
import React from 'react'
import { motion } from 'framer-motion'
import { useLanguageContext } from '@/contexts/languageContext'
import { MusicNoteSimple } from '@phosphor-icons/react/dist/ssr'
import PageAnimatePresence from '@/components/HOC/PageAnimatePresence'

function Providers({ children }: { children: React.ReactNode }) {
    const { language } = useLanguageContext()
    return (
        <main id='app-panel' className='relative bg-gradient-to-t from-warning/40 to-primary/10 dark:from-primary/20 dark:to-secondary/10 h-screen -mb-6'>
            <main id='app-workspace'>
                <motion.h1 className='absolute top-6 left-6 text-2xl flex items-center gap-4'
                    initial={{
                        scale: 1.2,
                        y: -24,
                        opacity: 0
                    }}
                    animate={{
                        scale: 1,
                        y: 0,
                        opacity: 1
                    }}
                    transition={{
                        duration: 0.32,
                        scale: {
                        type: 'spring',
                        visualDuration: 0.4,
                        bounce: 0.5
                        }
                    }}
                >
                    <MusicNoteSimple weight='fill' size={24} /> {language.data.app.guilds.player.name}
                </motion.h1>
                <PageAnimatePresence>
                    {children}
                </PageAnimatePresence>
            </main>
        </main>
    )
}

export default Providers