"use client";
import React from 'react'
import { useLanguageContext } from '@/contexts/languageContext'

import Privacy from './@privacy';
import DevZone from './@devzone';
import KeyBinds from './@Keybinds';
import Account from './@account';
import Layout from './@layout';

function Page() {
    const { language } = useLanguageContext();
    return (
      <main id="app-panel">
          <main id="app-workspace" className='flex flex-col pb-[32vh]'>
              <h1 className='text-2xl mb-4'>{language.data.app.setting.name}</h1>
              <Account />
              <Layout />
              <Privacy />
              <KeyBinds />
              <DevZone />
          </main>
      </main>
    )
}

export default Page