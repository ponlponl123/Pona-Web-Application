'use client';
import { Radio } from '@/components/radio';
import { RadioGroup } from '@nextui-org/react';
import { SunHorizon } from '@phosphor-icons/react/dist/ssr';
import { useLanguageContext } from '@/contexts/languageContext';
import {
  TimeFormat as TimeFormatType,
  useUserSettingContext,
} from '@/contexts/userSettingContext';
import React from 'react';

function TimeFormat() {
  const { language } = useLanguageContext();
  const { userSetting, setUserSetting } = useUserSettingContext();
  return (
    <section
      className='w-full min-h-full flex flex-col gap-6'
      id='layout-timeformat'
      data-section
    >
      <h2 className='text-3xl flex items-center gap-4 pt-4'>
        <SunHorizon weight='fill' />
        {language.data.app.setting.layout.time_format.title}
      </h2>
      <RadioGroup
        className='w-full'
        defaultValue={String(userSetting.timeformat || 'auto')}
        onValueChange={value => {
          setUserSetting({
            ...userSetting,
            timeformat: value as TimeFormatType,
          });
        }}
      >
        <Radio
          description={
            language.data.app.setting.layout.time_format.auto.description
          }
          value='auto'
        >
          {language.data.app.setting.layout.time_format.auto.title}
        </Radio>
        <Radio
          description={
            language.data.app.setting.layout.time_format[12].description
          }
          value='12'
        >
          {language.data.app.setting.layout.time_format[12].title}
        </Radio>
        <Radio
          description={
            language.data.app.setting.layout.time_format[24].description
          }
          value='24'
        >
          {language.data.app.setting.layout.time_format[24].title}
        </Radio>
      </RadioGroup>
    </section>
  );
}

export default TimeFormat;
