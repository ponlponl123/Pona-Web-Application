import { useLanguageContext } from '@/contexts/languageContext'
import { Thermometer as ThermometerType, useUserSettingContext } from '@/contexts/userSettingContext'
import { Thermometer as ThermometerIcon } from '@phosphor-icons/react/dist/ssr'
import { RadioGroup } from '@nextui-org/react'
import { Radio } from '@/components/radio'
import React from 'react'

function Thermometer() {
  const { language } = useLanguageContext();
  const { userSetting, setUserSetting } = useUserSettingContext();
  return (
    <section className='w-full min-h-full flex flex-col gap-6' id='layout-thermometer' data-section>
      <h2 className='text-3xl flex items-center gap-4 pt-4'><ThermometerIcon weight='fill' />{language.data.app.setting.layout.thermometer.title}</h2>
      <RadioGroup className='w-full' defaultValue={userSetting.thermometer}
        onValueChange={(value) => {setUserSetting({...userSetting,thermometer:value as ThermometerType})}}>
        <Radio value="c">
          {language.data.app.setting.layout.thermometer.celsius}
        </Radio>
        <Radio value="f">
          {language.data.app.setting.layout.thermometer.fahrenheit}
        </Radio>
      </RadioGroup>
    </section>
  )
}

export default Thermometer