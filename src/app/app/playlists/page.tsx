'use client';
import React from 'react';
import { useLanguageContext } from '@/contexts/languageContext';
import {
  MagnifyingGlass,
  Playlist,
  Plus,
} from '@phosphor-icons/react/dist/ssr';
import { Button } from '@nextui-org/react';

function Page() {
  const { language } = useLanguageContext();
  return (
    <main id='app-panel'>
      <main id='app-workspace'>
        <div className='flex mt-6 justify-between gap-12 flex-wrap items-center'>
          <h1 className='text-5xl flex gap-4 items-center'>
            <Playlist size={48} weight='fill' />{' '}
            {language.data.app.playlist.name}
          </h1>
          <Button color='primary' radius='full' size='lg' isDisabled>
            <Plus weight='bold' /> {language.data.app.playlist.create}
          </Button>
        </div>
        <div
          className='w-full mt-16 gap-4 flex flex-col items-center justify-center text-center'
          style={{ minHeight: '72vh' }}
          id='playlists'
        >
          <MagnifyingGlass size={64} weight='bold' />
          <h1 className='text-4xl'>{language.data.app.playlist.no_playlist}</h1>
        </div>
      </main>
    </main>
  );
}

export default Page;
