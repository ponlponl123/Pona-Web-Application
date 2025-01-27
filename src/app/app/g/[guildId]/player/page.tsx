"use client"
import React from 'react'
import { Spinner } from '@nextui-org/react';
import { useLanguageContext } from '@/contexts/languageContext';
import { useDiscordGuildInfo } from '@/contexts/discordGuildInfo';
import { MusicNoteSimple } from '@phosphor-icons/react/dist/ssr';
import { motion } from 'framer-motion';

function Page() {
  const { guild } = useDiscordGuildInfo();
  const { language } = useLanguageContext();

  return (
    guild ? (
      <>
        <div className='w-full max-w-screen-lg mt-16 gap-4 flex flex-col items-center justify-center text-center'>
          
        </div>
      </>
    ) : (
      <>
        <Spinner/>
      </>
    )
  )
}

export default Page