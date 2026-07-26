'use client';
import { Coffee, Heart } from '@phosphor-icons/react/dist/ssr';
import { useRouter } from 'next/navigation';
import React from 'react';
import { useAppStore } from '@/store/coreStore';
import { Button } from '@/components/ui/button';

function Page() {
  const language = useAppStore((state) => state.language);
  const router = useRouter();
  return (
    <div
      className='flex flex-col gap-4 items-center justify-center w-full'
      style={{ height: 'calc(96vh - 4rem)' }}
    >
      <Coffee size={56} weight='fill' className='text-muted-foreground' />
      <h1 className='text-2xl max-w-screen-md text-center font-bold'>
        {language.data.app.guilds.player.dev}
      </h1>
      <Button
        variant='secondary'
        className='mt-2 rounded-full'
        onClick={() => router.push('/app/updates')}
      >
        <Heart weight='fill' className='mr-2' /> {language.data.app.updates.follow}
      </Button>
    </div>
  );
}

export default Page;
