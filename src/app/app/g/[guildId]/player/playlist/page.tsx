"use client"
import { useLanguageContext } from '@/contexts/languageContext';
import { Button, Link } from '@nextui-org/react';
import { Coffee, Heart } from '@phosphor-icons/react/dist/ssr';
import { useRouter, useSearchParams } from 'next/navigation';
import React from 'react'

function Page() {
  const searchParams = useSearchParams()
  const playlist_id = searchParams.get('list')
  const { language } = useLanguageContext();
  const router = useRouter();

  if ( !playlist_id ) return (
    <div className='flex flex-col gap-4 items-center justify-center w-full' style={{height:'calc(96vh - 4rem)'}}>
      <Coffee size={56} weight='fill' />
      <h1 className='text-2xl max-w-screen-md text-center'>{language.data.app.guilds.player.dev}</h1>
    </div>
  )

  return (
    <div className='flex flex-col gap-4 items-center justify-center w-full' style={{height:'calc(96vh - 4rem)'}}>
      <Coffee size={56} weight='fill' />
      <h1 className='text-2xl max-w-screen-md text-center'>{language.data.app.guilds.player.dev}</h1>
      <Link href='/app/updates' rel='noopener' onPress={()=>{router.push('/app/updates')}}>
        <Button color='secondary' className='mt-2' radius='full'><Heart weight='fill' /> {language.data.app.updates.follow}</Button>
      </Link>
    </div>
  )
}

export default Page