"use client"
import Map from '@/components/map-picker';
import { Radio } from '@/components/radio'
import { useLanguageContext } from '@/contexts/languageContext';
import { useUserSettingContext } from '@/contexts/userSettingContext';
import { RadioGroup } from '@nextui-org/react'
import { MapPinArea } from '@phosphor-icons/react/dist/ssr';
import React from 'react'

function PrivacyLocation() {
  const { language } = useLanguageContext();
  const { userSetting, setUserSetting } = useUserSettingContext();
  return (
    <section className='w-full min-h-full flex flex-col gap-6' id='privacy-location' data-section>
      <h2 className='text-3xl flex items-center gap-4 pt-4'><MapPinArea weight='fill' />{language.data.app.setting.privacy.location.title}</h2>
      <h3 className='text-xl text-start gap-4 pt-1'>{language.data.app.setting.privacy.location.description}</h3>
      <RadioGroup className='w-full' defaultValue={
        typeof userSetting.location === 'object' ? 'custom' : userSetting.location
      } onValueChange={(value) => {setUserSetting({...userSetting,location:(value==='custom')?{lat:13.736717,lng:100.523186}:(value==='surprise')?'surprise':'auto'})}}>
        <Radio value="auto" description={language.data.app.setting.privacy.location.auto.description}>
          {language.data.app.setting.privacy.location.auto.title}
        </Radio>
        <Radio value="custom" description={language.data.app.setting.privacy.location.custom.description}>
          {language.data.app.setting.privacy.location.custom.title}
        </Radio>
        <Radio value="surprise" description={language.data.app.setting.privacy.location.surprise.description}>
          {language.data.app.setting.privacy.location.surprise.title}
        </Radio>
      </RadioGroup>
      {
        typeof userSetting.location === 'object' && (
          <>
            <div className='flex flex-col gap-2'>
              <div className='w-full h-96 overflow-hidden rounded-3xl bg-primary-200/20 block relative z-0'>
                <Map center={userSetting.location} className='w-full' style={{height: 'calc(100% + 32px)'}} onDragging={(center) => {
                  setUserSetting({...userSetting,location:center})
                }}></Map>
              </div>
              <span className='text-foreground/30 text-xs'>Map by OpenStreetMap 💚, Map Components by Leaflet 🌿</span>
            </div>
          </>
        )
      }
    </section>
  )
}

export default PrivacyLocation