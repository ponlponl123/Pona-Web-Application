import { useLanguageContext } from '@/contexts/languageContext'
import { Bug } from '@phosphor-icons/react/dist/ssr'
import Switch from '@/components/switch'
import React from 'react'

function DevZone() {
  const { language } = useLanguageContext();
  return (
    <section className='w-full min-h-full my-6 flex flex-col gap-6 pb-12' id='devzone' data-section>
      <h1 className='text-5xl flex items-center gap-4 pt-4'><Bug weight='fill' />{language.data.app.setting.dev_mode.title}</h1>
      <Switch
        name='Experimental API Routes'
        description='Use the experimental API endpoints'
        isDisabled
      />
    </section>
  )
}

export default DevZone