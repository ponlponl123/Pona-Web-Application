'use client';
import React from 'react';
import { PlugsConnected, Bird, Plugs } from '@phosphor-icons/react/dist/ssr';
import { useLanguageContext } from '@/contexts/languageContext';
import MyButton from '@/components/button';
import Link from 'next/link';

function App_notOk() {
  const { language } = useLanguageContext();
  return (
    <main className='w-full min-h-screen'>
      <div className='grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20'>
        <main className='w-full max-w-screen-sm flex flex-row max-sm:flex-col gap-10 row-start-2 items-center justify-center'>
          <Plugs fontSize={64} />
          <div className='flex flex-col gap-2 max-w-screen-md items-center sm:items-start'>
            <h1 className='font-bold text-3xl max-sm:text-center'>
              {language.data.app_notok.title}
            </h1>
            <p className='text-lg max-sm:text-center'>
              {language.data.app_notok.description}
            </p>
            <div className='flex flex-wrap sm:gap-3 max-sm:justify-center'>
              <Link href={''} className='mt-4'>
                <MyButton variant='invert' size='medium'>
                  <PlugsConnected />
                  {language.data.app_notok.actions.refresh}
                </MyButton>
              </Link>
              <Link href={'https://ponlponl123.com/discord'} className='mt-4'>
                <MyButton variant='invert' size='medium'>
                  <Bird />
                  {language.data.app_notok.actions.support}
                </MyButton>
              </Link>
            </div>
          </div>
        </main>
      </div>
    </main>
  );
}

export default App_notOk;
