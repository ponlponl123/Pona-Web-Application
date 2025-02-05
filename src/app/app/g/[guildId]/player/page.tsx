"use client"
import React from 'react'
import { Spinner } from '@nextui-org/react';
// import { useLanguageContext } from '@/contexts/languageContext';
import { useDiscordGuildInfo } from '@/contexts/discordGuildInfo';
import LetsPonaJoin from './@system/lets-pona-join';

function Page() {
  const { guild } = useDiscordGuildInfo();
  // const { language } = useLanguageContext();
  const isPonaInVC = true;
  return (
    guild ? (
      <>
        {
          !isPonaInVC ?
          <div className='flex flex-col gap-4 items-center justify-center w-full' style={{height:'calc(96vh - 4rem)'}}>
            <LetsPonaJoin />
          </div> :
          <div className='w-full max-w-screen-lg mt-16 gap-4 flex flex-col items-center justify-center text-center'>
            {/* Soon... :) */}
          </div>
        }
      </>
    ) : (
      <>
        <Spinner/>
      </>
    )
  )
}

export default Page