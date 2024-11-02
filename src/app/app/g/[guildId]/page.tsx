"use client"
import React from 'react'
import { useDiscordGuildInfo } from '@/contexts/discordGuildInfo';

function Page() {
  const { guild } = useDiscordGuildInfo();

  return (
    <main id='app-panel'>
      <main id='app-workspace'>
        <h1 className='text-2xl mb-4'>{guild?.name}</h1>
      </main>
    </main>
  )
}

export default Page