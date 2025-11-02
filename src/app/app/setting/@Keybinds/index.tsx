'use client';
import { useLanguageContext } from '@/contexts/languageContext';
import { Chip } from '@nextui-org/react';
import { Info, Keyboard } from '@phosphor-icons/react/dist/ssr';
import React from 'react';

function KeyBinds() {
  const { language } = useLanguageContext();
  return (
    <section
      className='w-full min-h-full my-6 flex flex-col gap-6 pb-12'
      id='keybinds'
      data-section
    >
      <h1 className='text-5xl flex items-center gap-4 pt-4'>
        <Keyboard weight='fill' />
        {language.data.app.setting.keybinds.title}
      </h1>
      <Chip
        color='primary'
        variant='flat'
        size='lg'
        startContent={<Info weight='fill' className='ml-2 mr-1' />}
      >
        {language.data.app.setting.keybinds.announcement}
      </Chip>
      <div
        className='flex flex-col gap-4'
        id='keybinds-list'
        data-section
      ></div>
    </section>
  );
}

export default KeyBinds;
