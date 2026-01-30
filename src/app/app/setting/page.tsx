'use client';
import { useDiscordUserInfo } from '@/contexts/discordUserInfo';
import { useLanguageContext } from '@/contexts/languageContext';
import { useUserSettingContext } from '@/contexts/userSettingContext';

import { Image } from '@heroui/react';

import { numberToHexColor } from '@/utils/colorUtils';
import { motion } from 'framer-motion';
import Account from './@account';
import DevZone from './@devzone';
import KeyBinds from './@Keybinds';
import Layout from './@layout';
import Privacy from './@privacy';

function Page() {
  const { language } = useLanguageContext();
  const { userSetting } = useUserSettingContext();
  const { userInfo } = useDiscordUserInfo();

  const backdropBg = userInfo?.banner
    ? `https://cdn.discordapp.com/banners/${userInfo?.id}/${userInfo?.banner}?size=640`
    : userInfo?.avatar
      ? `https://cdn.discordapp.com/avatars/${userInfo?.id}/${userInfo?.avatar}?size=640`
      : '/static/backdrop.png';
  return (
    <main id='app-panel'>
      <div className='absolute w-full h-max max-h-[64vh] min-h-64 top-0 left-0 z-1 opacity-40 pointer-events-none scale-[2.8]'>
        {userSetting.transparency ? (
          <Image
            src={`/api/proxy/image?r=${encodeURIComponent(backdropBg || '/static/backdrop.png')}&s=512&blur=16&saturation=96&contrast=12`}
            alt={userInfo?.global_name || ''}
            width={'100%'}
            height={undefined}
            classNames={{
              wrapper: 'w-full h-full absolute top-0 left-0',
            }}
            className='object-cover w-full h-full max-h-[64vh] pointer-events-none saturate-200 brightness-110 -translate-y-1'
          />
        ) : (
          <div
            className={`w-full h-96 bg-linear-to-t from-transparent to-[${numberToHexColor(userInfo?.accent_color || 0)}]`}
          />
        )}
        <div className='absolute top-[unset] bottom-0 left-0 w-full h-2/4 bg-linear-to-b from-transparent to-playground-background z-10' />
      </div>
      <main id='app-workspace' className='flex flex-col pb-[32vh] z-10'>
        <h1 className='text-2xl mb-4'>{language.data.app.setting.name}</h1>
        <Account />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1, delay: 1.2 }}
          className='flex flex-col gap-8'
        >
          <Layout />
          <Privacy />
          <KeyBinds />
          <DevZone />
        </motion.div>
      </main>
    </main>
  );
}

export default Page;
