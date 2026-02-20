'use client';
import MyButton from '@/components/button';
import { useLanguageContext } from '@/contexts/languageContext';
import {
  BirdIcon,
  PlugsConnectedIcon,
  PlugsIcon,
} from '@phosphor-icons/react/dist/ssr';
import Link from 'next/link';

function App_notOk() {
  const { language } = useLanguageContext();
  return (
    <main className='w-full min-h-screen'>
      <div className='grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20'>
        <main className='w-full max-w-3xl flex flex-row max-sm:flex-col gap-10 row-start-2 items-center justify-center'>
          <div className='flex flex-col gap-3 items-center justify-center'>
            <PlugsIcon fontSize={64} />
            <span className='bg-red-500/10 p-1 px-3 rounded-lg mt-2 whitespace-nowrap text-center'>
              ERR: APP_NOT_OK
            </span>
          </div>
          <div className='flex flex-col gap-2 max-w-lg items-center sm:items-start'>
            <h1 className='font-bold text-3xl max-sm:text-center'>
              {language.data.app_notok.title}
            </h1>
            <p className='text-lg max-sm:text-center'>
              {language.data.app_notok.description}
            </p>
            <div className='flex flex-wrap sm:gap-3 max-sm:justify-center mt-2'>
              <Link href={''}>
                <MyButton variant='invert' size='medium'>
                  <PlugsConnectedIcon />
                  {language.data.app_notok.actions.refresh}
                </MyButton>
              </Link>
              <Link href={'https://ponlponl123.com/discord'}>
                <MyButton variant='invert' size='medium'>
                  <BirdIcon />
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
