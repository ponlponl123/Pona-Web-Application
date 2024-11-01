"use client"
import React from 'react'
import { Confetti, FishSimple, Plant } from '@phosphor-icons/react/dist/ssr'
import { useLanguageContext } from '@/contexts/languageContext';
import MyButton from '@/components/button';
import Link from 'next/link'

function NotFound() {
  const { language } = useLanguageContext();
  return (
    <main className="w-full min-h-screen">
      <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
        <main className="w-full max-w-screen-sm flex flex-row max-sm:flex-col gap-10 row-start-2 items-center justify-center">
          <FishSimple fontSize={64} />
          <div className='flex flex-col gap-2 max-w-screen-md items-center sm:items-start'>
            <h1 className='font-bold text-3xl max-sm:text-center'>{language.data.not_found.title}</h1>
            <p className='text-lg max-sm:text-center'>{language.data.not_found.description}</p>
            <div className='flex flex-wrap sm:gap-3 max-sm:justify-center'>
              <Link href={'/app'} className='mt-4'>
                <MyButton variant='invert' size='medium'>
                  <Confetti />
                  {language.data.not_found.actions.app}
                </MyButton>
              </Link>
              <Link href={'/'} className='mt-4'>
                <MyButton variant='invert' size='medium'>
                  <Plant />
                  {language.data.not_found.actions.home}
                </MyButton>
              </Link>
            </div>
          </div>
        </main>
      </div>
    </main>
  )
}

export default NotFound