"use client";
import React from 'react'
import { useLanguageContext } from '@/contexts/languageContext'
import { Palette } from '@phosphor-icons/react/dist/ssr'

function Page() {
    const { language } = useLanguageContext();
    return (
      <main id="app-panel">
          <main id="app-workspace" className='flex flex-col'>
              <h1 className='text-2xl mb-4'>{language.data.app.setting.name}</h1>
              <section className='w-full min-h-full mt-6 flex flex-col gap-4'>
                <h1 className='text-5xl flex items-center gap-4'><Palette weight='fill' />{language.data.app.setting.layout.title}</h1>
              </section>
          </main>
      </main>
    )
}

export default Page