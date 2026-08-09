'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { BroadcastIcon } from '@phosphor-icons/react/dist/ssr';
import { useDiscordGuildInfo } from '@/contexts/discordGuildInfo';
import { useAppStore } from '@/store/coreStore';

export default function NotInSameVC() {
  const language = useAppStore((state) => state.language);
  const { guild } = useDiscordGuildInfo();

  return (
    <motion.div
      className='absolute w-full h-full top-0 left-0 flex flex-col gap-4 items-center justify-center bg-background/30 z-10 backdrop-blur-xl p-4 select-none'
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.48 }}
    >
      <motion.div
        className='relative bg-card/40 backdrop-blur-2xl rounded-3xl p-8 overflow-hidden w-full max-w-xs flex flex-col gap-6 items-center justify-center shadow-2xl text-center'
        initial={{ opacity: 0, scale: 0.92, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.48, type: 'spring', bounce: 0.2 }}
      >
        <div className='relative flex items-center justify-center size-20 rounded-3xl bg-primary/10 text-primary shadow-inner overflow-hidden'>
          {guild?.iconURL ? (
            <Image
              src={guild.iconURL}
              alt={guild.name}
              width={80}
              height={80}
              unoptimized
              className='size-full object-cover rounded-2xl'
            />
          ) : (
            <BroadcastIcon size={40} weight='duotone' />
          )}
        </div>

        <div className='flex flex-col gap-2.5 max-w-xs'>
          <h1 className='text-2xl font-extrabold tracking-tight text-foreground'>
            {language.data.app.guilds.player.notSameVC.title}
          </h1>
          <p className='text-xs text-muted-foreground leading-relaxed'>
            {language.data.app.guilds.player.notSameVC.description.replace(
              '[guildName]',
              guild?.name || 'this server'
            )}
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}


