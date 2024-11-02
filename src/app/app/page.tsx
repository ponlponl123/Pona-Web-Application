"use client"
import React from 'react'
import { useLanguageContext } from '@/contexts/languageContext'
import { useDiscordUserInfo } from '@/contexts/discordUserInfo'

function Page() {
  const { language } = useLanguageContext();
  const { userInfo } = useDiscordUserInfo();
  const date = new Date();
  const hours = date.getHours();
  const isNow = (hours > 4 && hours < 10) ? 'morning' :
                (hours > 9 && hours < 16) ? 'afternoon' :
                (hours > 9 && hours < 16) ? 'evening' :
                'night'
  return (
    <main id="app-panel">
      <div className='min-h-36 max-h-96 h-screen w-full absolute'>
        <div className={`absolute w-full min-h-36 h-screen top-0 left-0 apphome-banner ${isNow}`} style={{maxHeight: '512px'}}></div>
      </div>
      <main id="app-workspace" className='relative z-10'>
        <h1 className='text-2xl mb-4 mt-64'>{language.data.app.home.name}</h1>
        <h1 className='text-5xl'>👋 Welcome back, {userInfo?.global_name}!</h1>
      </main>
    </main>
  )
}

export default Page