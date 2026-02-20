'use client';
import MyButton from '@/components/button';
import { useLanguageContext } from '@/contexts/languageContext';
import {
  BirdIcon,
  CubeIcon,
  PersonSimpleRunIcon,
} from '@phosphor-icons/react/dist/ssr';
import Link from 'next/link';

function App_notReady() {
  const { language } = useLanguageContext();
  return (
    <main className='w-full min-h-screen'>
      <div className='grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20'>
        <main className='w-full max-w-4xl flex flex-row max-sm:flex-col gap-10 row-start-2 items-center justify-center'>
          <div className='flex flex-col gap-3 items-center justify-center'>
            <PersonSimpleRunIcon fontSize={96} />
            <span className='bg-red-500/10 p-1 px-3 rounded-lg mt-2 whitespace-nowrap text-center'>
              ERR: APP_NOT_READY
            </span>
          </div>
          <div className='flex flex-col gap-2 max-w-lg items-center sm:items-start'>
            <h1 className='font-bold text-3xl max-sm:text-center'>
              {language.data.app_notready.title}
            </h1>
            <p className='text-lg max-sm:text-center'>
              {language.data.app_notready.description}
            </p>
            <div className='flex flex-wrap sm:gap-3 max-sm:justify-center mt-2'>
              <Link href={'https://ponlponl123.com/discord'}>
                <MyButton variant='invert' size='medium'>
                  <BirdIcon />
                  {language.data.app_notready.actions.support}
                </MyButton>
              </Link>
              <Link href={'/status'}>
                <MyButton variant='invert' size='medium'>
                  <CubeIcon />
                  {language.data.app_notready.actions.status}
                </MyButton>
              </Link>
            </div>
          </div>
        </main>
      </div>
    </main>
  );
}

export default App_notReady;
