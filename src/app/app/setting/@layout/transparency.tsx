'use client';
import { Radio } from '@/components/radio';
import { useLanguageContext } from '@/contexts/languageContext';
import { useUserSettingContext } from '@/contexts/userSettingContext';
import { RadioGroup } from '@nextui-org/react';
import { CubeTransparent } from '@phosphor-icons/react/dist/ssr';
import React from 'react';

function Transparency() {
  const { language } = useLanguageContext();
  const { userSetting, setUserSetting } = useUserSettingContext();
  return (
    <section
      className='w-full min-h-full flex flex-col gap-6'
      id='layout-transparency'
      data-section
    >
      <h2 className='text-3xl flex items-center gap-4 pt-4'>
        <CubeTransparent weight='fill' />
        {language.data.app.setting.layout.transparency.title}
      </h2>
      <RadioGroup
        className='w-full'
        defaultValue={String(userSetting.transparency) || 'true'}
        onValueChange={value => {
          const transparentValue: boolean =
            value === 'false' ? false : (true as boolean);
          setUserSetting({ ...userSetting, transparency: transparentValue });
        }}
      >
        <Radio
          value='true'
          description={
            language.data.app.setting.layout.transparency.enabled.description
          }
        >
          {language.data.app.setting.layout.transparency.enabled.title}
        </Radio>
        <Radio
          value='false'
          description={
            language.data.app.setting.layout.transparency.disabled.description
          }
        >
          {language.data.app.setting.layout.transparency.disabled.title}
        </Radio>
      </RadioGroup>
    </section>
  );
}

export default Transparency;
