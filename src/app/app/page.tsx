'use client';
import Button from '@/components/button';
import { useDiscordUserInfo } from '@/contexts/discordUserInfo';
import { useLanguageContext } from '@/contexts/languageContext';
import { Link } from '@heroui/react';
import { NutIcon, SmileyWinkIcon } from '@phosphor-icons/react/dist/ssr';
import { motion } from 'framer-motion';
import NextLink from 'next/link';

function Page() {
  const { language } = useLanguageContext();
  const { userInfo } = useDiscordUserInfo();
  const date = new Date();
  const hours = date.getHours();
  const isNow =
    hours > 4 && hours < 10
      ? 'morning'
      : hours > 9 && hours < 16
        ? 'afternoon'
        : hours > 9 && hours < 20
          ? 'evening'
          : 'night';

  return (
    <main id='app-panel'>
      <div className='min-h-36 max-h-96 h-screen w-full absolute'>
        <div
          className={`absolute w-full min-h-36 h-screen top-0 left-0 apphome-banner ${isNow}`}
          style={{ maxHeight: '512px' }}
        ></div>
      </div>
      <main id='app-workspace' className='relative z-10'>
        <motion.h1
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.32, delay: 0.24 }}
          className='text-2xl mb-4 mt-64'
        >
          {hours > 4 && hours < 10
            ? language.data.home.welcome_message.morning
            : hours > 9 && hours < 16
              ? language.data.home.welcome_message.afternoon
              : hours > 15 && hours < 20
                ? language.data.home.welcome_message.evening
                : language.data.home.welcome_message.night}
        </motion.h1>
        <motion.h1
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.32, delay: 0.32 }}
          className='text-6xl font-bold flex items-center gap-3'
        >
          <SmileyWinkIcon weight='fill' size={64} />{' '}
          {language.data.app.home.title.replace(
            '[user]',
            userInfo?.global_name as string
          )}
        </motion.h1>
        <div className='mt-16'></div>
        <div className='flex max-lg:flex-wrap items-start gap-6 p-4 mt-4 w-full'>
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.32, delay: 0.48 }}
            className='relative overflow-hidden w-full p-16 max-sm:p-8 rounded-3xl flex flex-col gap-3 bg-linear-to-br from-primary-50/10 to-primary-300/10 shadow-2xl shadow-primary-300/10'
          >
            <h1 className='text-4xl max-sm:text-2xl font-bold'>
              {language.data.app.home.whatnew.title.replace(
                '[version]',
                ('v' + process.env.NEXT_PUBLIC_APP_VERSION) as string
              )}
            </h1>
            <p>{language.data.app.home.whatnew.description}</p>
            <div className='flex flex-col gap-2 mt-4'>
              <Link as={NextLink} href='/app/updates' className='w-max'>
                <Button size='small' variant='primary' className='w-max'>
                  {language.data.app.home.whatnew.button}
                </Button>
              </Link>
            </div>
            <div className='absolute bottom-4 right-4'>
              <NutIcon
                size={128}
                className='fill-current opacity-10 scale-200 -rotate-z-45'
                weight='fill'
              />
            </div>
          </motion.div>
        </div>
      </main>
    </main>
  );
}

export default Page;
