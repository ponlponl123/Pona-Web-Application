'use client';
import React from 'react';
import * as motion from 'framer-motion/client';
import { useLanguageContext } from '@/contexts/languageContext';
import { useDiscordUserInfo } from '@/contexts/discordUserInfo';
import { Confetti, Smiley, SmileyWink } from '@phosphor-icons/react/dist/ssr';
import { Button, Spinner } from '@nextui-org/react';
import WeatherCard from '@/components/weathercard';

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

  const pona_chat_suggests = [
    {
      title: language.data.app.home.pona_ai.suggests.surprise_me,
      icon: Confetti,
    },
    {
      title: language.data.app.home.pona_ai.suggests.howareutoday,
      icon: Smiley,
    },
  ];

  return (
    <main id='app-panel'>
      <div className='min-h-36 max-h-96 h-screen w-full absolute'>
        <div
          className={`absolute w-full min-h-36 h-screen top-0 left-0 apphome-banner ${isNow}`}
          style={{ maxHeight: '512px' }}
        ></div>
      </div>
      <main id='app-workspace' className='relative z-10'>
        <h1 className='text-2xl mb-4 mt-64'>
          {language.data.app.home.title.replace(
            '[user]',
            userInfo?.global_name as string
          )}
        </h1>
        <h1 className='text-5xl'>
          {hours > 4 && hours < 10
            ? language.data.home.welcome_message.morning
            : hours > 9 && hours < 16
              ? language.data.home.welcome_message.afternoon
              : hours > 15 && hours < 20
                ? language.data.home.welcome_message.evening
                : language.data.home.welcome_message.night}
        </h1>
        <div className='mt-16'></div>
        <div className='flex max-lg:flex-wrap items-start gap-6 p-4 mt-4 w-full'>
          <motion.div
            initial={{ opacity: 0, y: -12, scale: 1.06 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
              duration: 0.4,
              scale: { type: 'spring', visualDuration: 0.4, bounce: 0.5 },
            }}
            className='w-full lg:max-w-sm'
          >
            <WeatherCard />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 1.06 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              duration: 0.4,
              delay: 0.2,
              scale: { type: 'spring', visualDuration: 0.4, bounce: 0.5 },
            }}
            className='w-full'
          >
            <div className='pona-chat-card w-full min-h-96 p-6 rounded-3xl flex flex-col gap-3 bg-primary-300/5'>
              <div className='flex gap-4 items-center justify-between'>
                <div className='flex items-center justify-center gap-4'>
                  <SmileyWink weight='fill' size={64} />
                  <div className='flex flex-col gap-2'>
                    <h1 className='text-3xl'>
                      {language.data.app.home.pona_ai.hello}
                    </h1>
                    <h3 className='flex flex-row flex-wrap text-sm gap-2 justify-start items-center'>
                      {pona_chat_suggests.map((suggest, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, scale: 1.96 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{
                            duration: 0.32,
                            delay: 0.64 + 0.32 * index,
                            scale: {
                              type: 'spring',
                              visualDuration: 0.4,
                              bounce: 0.5,
                            },
                          }}
                        >
                          <Button
                            radius='full'
                            color='primary'
                            size='sm'
                            startContent={<suggest.icon weight='fill' />}
                            className='px-2 gap-1'
                          >
                            {suggest.title}
                          </Button>
                        </motion.div>
                      ))}
                    </h3>
                  </div>
                </div>
              </div>
              <div className='flex flex-col gap-4'>
                <div className='flex flex-col'>
                  <Spinner color='primary' size='lg' className='mt-20' />
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.48 }}
                    transition={{
                      duration: 1.6,
                      delay: 4.8,
                      scale: {
                        type: 'spring',
                        visualDuration: 0.4,
                        bounce: 0.5,
                      },
                    }}
                    className='w-full text-center mt-4'
                  >
                    {language.data.app.home.pona_ai.connecting}
                  </motion.span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </main>
  );
}

export default Page;
