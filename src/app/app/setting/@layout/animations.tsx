import { Radio } from '@/components/radio';
import { useLanguageContext } from '@/contexts/languageContext';
import { Animation, useUserSettingContext } from '@/contexts/userSettingContext';
import { RadioGroup } from '@nextui-org/react';
import { PersonSimpleRun } from '@phosphor-icons/react/dist/ssr'
import React from 'react'

function Animations() {
  const { language } = useLanguageContext();
  const { userSetting, setUserSetting } = useUserSettingContext();
  return (
    <section className='w-full min-h-full flex flex-col gap-6' id='layout-animations' data-section>
      <h2 className='text-3xl flex items-center gap-4 pt-4'><PersonSimpleRun weight='fill' />{language.data.app.setting.layout.animation.title}</h2>
      <RadioGroup className='w-full' defaultValue={String(userSetting.animation) || 'true'}
        onValueChange={(value) => {
          const animateValue: Animation = value==="true"?true:value==="false"?false:value as Animation;
          setUserSetting({...userSetting,animation:animateValue})
          if ( animateValue === '30 fps' )
          {
            document.documentElement.classList.add('animation-30fps');
            document.documentElement.classList.remove('animation-disabled');
          }
          else if ( animateValue === false )
          {
            document.documentElement.classList.remove('animation-30fps');
            document.documentElement.classList.add('animation-disabled');
          }
          else
          {
            document.documentElement.classList.remove('animation-30fps');
            document.documentElement.classList.remove('animation-disabled');
          }
        }}>
        <Radio value="true" description={language.data.app.setting.layout.animation.smooth.description}>
          {language.data.app.setting.layout.animation.smooth.title}
        </Radio>
        <Radio value="30 fps" description={language.data.app.setting.layout.animation['30 fps'].description}>
          {language.data.app.setting.layout.animation['30 fps'].title}
        </Radio>
        <Radio value="false" description={language.data.app.setting.layout.animation.none.description}>
          {language.data.app.setting.layout.animation.none.title}
        </Radio>
      </RadioGroup>
    </section>
  )
}

export default Animations