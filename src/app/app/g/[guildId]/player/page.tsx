"use client"
import React from 'react'
import { Spinner } from '@nextui-org/react';
import { useLanguageContext } from '@/contexts/languageContext';
import { useDiscordGuildInfo } from '@/contexts/discordGuildInfo';
import { GitPullRequest, Guitar } from '@phosphor-icons/react/dist/ssr';

function Page() {
  const { guild } = useDiscordGuildInfo();
  const { language } = useLanguageContext();

  return (
    <main id='app-panel'>
      <main id='app-workspace'>
        {
          guild ? (
            <>
              <h1 className='text-base'>{guild.name}</h1>
              <h1 className='text-5xl mt-4 flex items-center gap-4'><Guitar weight='fill' size={48} /> {language.data.app.guilds.player.name}</h1>
              <div className='w-full max-w-screen-lg mt-16 gap-4 flex flex-col items-center justify-center text-center' style={{minHeight: '48vh'}}>
                <GitPullRequest size={64} weight='bold' />
                <h1 className='text-4xl max-w-xl'>{language.data.app.guilds.player.dev}</h1>
              </div>
            </>
          ) : (
            <>
              <Spinner/>
            </>
          )
        }
      </main>
    </main>
  )
}

export default Page