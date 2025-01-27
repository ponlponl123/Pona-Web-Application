"use client"
import React from 'react'
import { Button, Link, Spinner } from '@nextui-org/react';
import { useLanguageContext } from '@/contexts/languageContext';
import { useDiscordGuildInfo } from '@/contexts/discordGuildInfo';
import { Coffee, Heart } from '@phosphor-icons/react/dist/ssr';
import { useRouter } from 'next/navigation';

function Page() {
  const { guild } = useDiscordGuildInfo();
  const { language } = useLanguageContext();
    const router = useRouter();
  return (
    guild ? (
      <>
        <div className='flex flex-col gap-4 items-center justify-center w-full' style={{height:'calc(96vh - 4rem)'}}>
          <Coffee size={56} weight='fill' />
          <h1 className='text-2xl max-w-screen-md text-center'>{language.data.app.guilds.player.dev}</h1>
          <Link href='/app/updates' rel='noopener' onClick={()=>{router.push('/app/updates')}}>
            <Button color='secondary' className='mt-2' radius='full'><Heart weight='fill' /> {language.data.app.updates.follow}</Button>
          </Link>
        </div>
        {/* <div className='w-full max-w-screen-lg mt-16 gap-4 flex flex-col items-center justify-center text-center'>
        </div> */}
      </>
    ) : (
      <>
        <Spinner/>
      </>
    )
  )
}

export default Page