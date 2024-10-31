import React from 'react'
import { Cube, Bird, HardHat } from '@phosphor-icons/react/dist/ssr'
import MyButton from '@/components/button';
import Link from 'next/link'

function App_notOk() {
  return (
    <main className="w-full min-h-screen">
      <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
        <main className="w-full max-w-screen-sm flex flex-row max-sm:flex-col gap-10 row-start-2 items-center justify-center">
          <HardHat fontSize={96} />
          <div className='flex flex-col gap-2 max-w-screen-md items-center sm:items-start'>
            <h1 className='font-bold text-3xl max-sm:text-center'>There&apos;s a surprise waiting for you!</h1>
            <p className='text-lg max-sm:text-center'>We are preparing a special surprise for you. This new feature will definitely wow you. Stay tuned! (/≧▽≦)/</p>
            <div className='flex flex-wrap sm:gap-3 max-sm:justify-center'>
              <Link href={'/discord'} className='mt-4'>
                <MyButton style='invert' size='medium'>
                  <Bird />
                  Support
                </MyButton>
              </Link>
              <Link href={'/status'} className='mt-4'>
                <MyButton style='invert' size='medium'>
                  <Cube />
                  Visit Pona! Status
                </MyButton>
              </Link>
            </div>
          </div>
        </main>
      </div>
    </main>
  )
}

export default App_notOk