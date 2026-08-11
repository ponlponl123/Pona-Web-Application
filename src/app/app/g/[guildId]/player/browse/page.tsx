'use client';

import React from 'react';
import Link from 'next/link';
import { Coffee, Heart } from '@phosphor-icons/react/dist/ssr';

import { Button } from '@/components/ui/button';
import { useAppStore } from '@/store/coreStore';

function Page() {
  const language = useAppStore((state) => state.language);
  return (
    <div
      className='flex flex-col gap-4 items-center justify-center w-full'
      style={{ height: 'calc(96vh - 4rem)' }}
    >
      <Coffee size={56} weight='fill' />
      <h1 className='text-2xl max-w-3xl text-center'>
        {language.data.app.guilds.player.dev}
      </h1>
      <Link href='/app/updates'>
        <Button variant='secondary' className='mt-2 rounded-full gap-2'>
          <Heart weight='fill' /> {language.data.app.updates.follow}
        </Button>
      </Link>
    </div>
  );
}

export default Page;
