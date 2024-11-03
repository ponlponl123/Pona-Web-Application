"use client"
import React from 'react'
import { Spinner } from '@nextui-org/react';
import { useLanguageContext } from '@/contexts/languageContext';
import { useDiscordGuildInfo } from '@/contexts/discordGuildInfo';

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
              <h1 className='text-4xl mt-4'>{language.data.app.guilds.setting.name}</h1>
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