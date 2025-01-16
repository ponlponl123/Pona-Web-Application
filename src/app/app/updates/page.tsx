"use client";
import React from 'react'
import { useLanguageContext } from '@/contexts/languageContext'
import { Wrench } from '@phosphor-icons/react/dist/ssr';

function Page() {
    const { language } = useLanguageContext();
    return (
        <main id="app-panel">
            <main id="app-workspace">
                <h1 className='text-2xl mb-4'>{language.data.app.updates.name}</h1>
                <h2 className='text-5xl mt-6 flex gap-4 items-center'><Wrench size={48} weight='fill' /> {language.data.app.updates.latest}: Pre-Release 0.1.6</h2>
            </main>
        </main>
    )
}

export default Page