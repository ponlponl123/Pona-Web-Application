import React from 'react'
import { Confetti, FishSimple, Plant } from '@phosphor-icons/react/dist/ssr'
import MyButton from '@/components/button';
import Link from 'next/link'

function NotFound() {
  return (
    <main className="w-full min-h-screen">
      <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
        <main className="w-full max-w-screen-sm flex flex-row max-sm:flex-col gap-10 row-start-2 items-center justify-center">
          <FishSimple fontSize={64} />
          <div className='flex flex-col gap-2 max-w-screen-md items-center sm:items-start'>
            <h1 className='font-bold text-3xl max-sm:text-center'>Sorry to disappoint you :(</h1>
            <p className='text-lg max-sm:text-center'>The page you are looking for may have moved to another location or may be hidden ^0^</p>
            <div className='flex flex-wrap sm:gap-3 max-sm:justify-center'>
              <Link href={'/app'} className='mt-4'>
                <MyButton style='invert' size='medium'>
                  <Confetti />
                  Get into pona app
                </MyButton>
              </Link>
              <Link href={'/'} className='mt-4'>
                <MyButton style='invert' size='medium'>
                  <Plant />
                  Back to home
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