'use client';
import { useLanguageContext } from '@/contexts/languageContext';
import { Palette } from '@phosphor-icons/react/dist/ssr';
import React from 'react';
import Theme from './theme';
import Transparency from './transparency';
import TimeFormat from './timeformat';
import Thermometer from './thermometer';
import Animations from './animations';

function Layout() {
  const { language } = useLanguageContext();
  return (
    <section
      className='w-full min-h-full my-6 flex flex-col gap-6 pb-12'
      id='layout'
      data-section
    >
      <h1 className='text-5xl flex items-center gap-4 pt-4'>
        <Palette weight='fill' />
        {language.data.app.setting.layout.title}
      </h1>
      <Theme />
      <Transparency />
      <TimeFormat />
      <Thermometer />
      <Animations />
    </section>
  );
}

export default Layout;
