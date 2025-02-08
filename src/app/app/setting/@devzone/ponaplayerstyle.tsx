import { Radio } from '@/components/radio';
import { type PonaPlayerStyle, useUserSettingContext } from '@/contexts/userSettingContext';
import { RadioGroup } from '@nextui-org/react';
import React from 'react'

function PonaPlayerStyle() {
  const { userSetting, setUserSetting } = useUserSettingContext();
  return (
    <section className='w-full min-h-full flex flex-col gap-6' id='layout-transparency' data-section>
      <h2 className='text-3xl flex items-center gap-4 pt-4'>dev_pona_player_style</h2>
      <RadioGroup className='w-full' defaultValue={userSetting.dev_pona_player_style || 'modern'}
        onValueChange={(value) => {
          setUserSetting({...userSetting,dev_pona_player_style:value as PonaPlayerStyle})
        }}>
        <Radio value="modern">modern</Radio>
        <Radio value="compact">compact</Radio>
      </RadioGroup>
    </section>
  )
}

export default PonaPlayerStyle