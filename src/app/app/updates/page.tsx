"use client";
import React from 'react'
import { useLanguageContext } from '@/contexts/languageContext'

function Page() {
    const { language } = useLanguageContext();
    return (
        <main id="app-panel">
            <main id="app-workspace">
                <h1 className='text-2xl mb-4'>{language.data.app.updates.name}</h1>
            </main>
        </main>
    )
}

export default Page