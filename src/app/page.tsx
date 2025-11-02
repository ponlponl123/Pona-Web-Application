'use client';
import React from 'react';
import MyButton from '@/components/button';
import {
  ClockCountdown,
  Confetti as ConfettiIcon,
  Cookie,
} from '@phosphor-icons/react/dist/ssr';
import { useLanguageContext } from '@/contexts/languageContext';
import { Link as NextLink } from '@nextui-org/react';
import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';

import confetti from 'canvas-confetti';
import CountdownTimer from '@/components/timer';
import WavyText from '@/components/motion/wavytext';
import { usePathname, useRouter } from 'next/navigation';

const TextVariants = {
  before: { y: 24, opacity: 0 },
  visible: { y: 0, opacity: 1 },
  hidden: { y: -24, opacity: 0 },
};

export default function Home() {
  const { language } = useLanguageContext();
  const router = useRouter();
  const pathname = usePathname() || '';
  const date = new Date();
  const hours = date.getHours();

  const newYearIn =
    new Date(date.getFullYear() + 1, 0, 1).getTime() - date.getTime();
  const newYearEvent = date.getDate() < 7 && date.getMonth() === 0;

  const TEXTS = language.data.home.features.before;
  const TEXTS1 = language.data.home.features.after;
  const [index, setIndex] = React.useState(0);

  React.useEffect(() => {
    const intervalId = setInterval(() => setIndex(index => index + 1), 3200);
    return () => clearTimeout(intervalId);
  }, []);

  React.useEffect(() => {
    const leaf = confetti.shapeFromPath({
      path: 'M223.45,40.07a8,8,0,0,0-7.52-7.52C139.8,28.08,78.82,51,52.82,94a87.09,87.09,0,0,0-12.76,49A101.72,101.72,0,0,0,46.7,175.2a4,4,0,0,0,6.61,1.43l85-86.3a8,8,0,0,1,11.32,11.32L56.74,195.94,42.55,210.13a8.2,8.2,0,0,0-.6,11.1,8,8,0,0,0,11.71.43l16.79-16.79c14.14,6.84,28.41,10.57,42.56,11.07q1.67.06,3.33.06A86.93,86.93,0,0,0,162,203.18C205,177.18,227.93,116.21,223.45,40.07Z',
    });

    const duration = 4 * 1000;
    const animationEnd = Date.now() + duration;
    let skew = 24;

    const randomInRange = (min: number, max: number) =>
      Math.random() * (max - min) + min;

    (function frame() {
      if (pathname !== '/') return;
      const timeLeft = animationEnd - Date.now();
      const ticks = Math.max(64, 256 * (timeLeft / duration));
      skew = Math.max(0.8, skew - 0.001);

      confetti({
        particleCount: 1,
        startVelocity: 0,
        ticks: ticks,
        origin: {
          x: Math.random(),
          y: Math.random() * skew - 0.2,
        },
        colors: ['#FFB8E0'],
        shapes: [leaf],
        gravity: randomInRange(0.2, 0.6),
        scalar: randomInRange(0.4, 2.4),
        drift: randomInRange(-0.6, 0.6),
      });

      if (timeLeft > 0) {
        requestAnimationFrame(frame);
      }
    })();
  });

  return (
    <main className='w-full min-h-screen main-bg-2 mb-24'>
      <div className='relative flex items-center justify-center min-h-screen p-12 sm:p-20'>
        <main className='w-full sm:h-[calc(100vh_-_10rem)] h-[calc(100vh_-_6rem)] flex flex-col gap-8 row-start-2 items-center relative'>
          <motion.span
            initial={{ opacity: 0, y: -24 }}
            animate={{ opacity: 0.4, y: 0 }}
            transition={{ delay: 2 }}
            className='text-sm tracking-wider opacity-40 mt-6 flex items-center gap-2'
          >
            <Cookie weight='fill' /> {language.data.cookie.description}
          </motion.span>
          <motion.div
            initial={{ scale: 1.12 }}
            animate={{ scale: 1 }}
            transition={{ delay: 1.86, duration: 0.36, type: 'spring' }}
            className='m-auto flex flex-col'
          >
            <h3 className='-mt-12'></h3>
            <motion.div
              initial={{ opacity: 0, scale: 1.2 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.32 }}
              className='flex flex-row justify-center text-8xl leading-relaxed text-center max-lg:text-6xl max-sm:text-4xl max-miniscreen:text-2xl max-sm:leading-10 m-0'
            >
              <AnimatePresence presenceAffectsLayout mode='popLayout'>
                {TEXTS.map(
                  (text, i) =>
                    index % TEXTS.length === i && (
                      <motion.div
                        key={'text1-' + i}
                        layout
                        initial='before'
                        animate='visible'
                        exit='hidden'
                        variants={TextVariants}
                      >
                        <WavyText
                          text={TEXTS[index % TEXTS.length]}
                          replay={true}
                        />
                      </motion.div>
                    )
                )}
                <motion.div
                  layout
                  key='text2'
                  initial='before'
                  animate='visible'
                  exit='hidden'
                  variants={TextVariants}
                >
                  <WavyText
                    text={
                      TEXTS[index % TEXTS.length] !== '' ? 'Pona!' : 'Pona! '
                    }
                    delay={0.32}
                    replay={true}
                  />
                </motion.div>
                {TEXTS1.map(
                  (text, i) =>
                    index % TEXTS1.length === i && (
                      <motion.div
                        key={'text2-' + i}
                        layout
                        initial='before'
                        animate='visible'
                        exit='hidden'
                        variants={TextVariants}
                      >
                        <WavyText
                          text={TEXTS1[index % TEXTS1.length]}
                          replay={true}
                        />
                      </motion.div>
                    )
                )}
              </AnimatePresence>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: -6, marginTop: -82 }}
              animate={{ opacity: 1, x: 0, marginTop: 0 }}
              transition={{ delay: 0.86 }}
              className='text-2xl -mb-2 text-primary-700 leading-relaxed w-full max-lg:mt-6 max-lg:text-lg items-center justify-center text-center max-sm:text-sm max-lg:mt-3 max-miniscreen:text-2xl max-sm:leading-10'
            >
              <WavyText
                className='text-center justify-center flex flex-wrap'
                duration={0.01}
                delay={0.64}
                text={
                  hours > 4 && hours < 10
                    ? language.data.home.welcome_message.morning
                    : hours > 9 && hours < 16
                      ? language.data.home.welcome_message.afternoon
                      : hours > 15 && hours < 20
                        ? language.data.home.welcome_message.evening
                        : language.data.home.welcome_message.night
                }
                replay={true}
              />
            </motion.div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 2 }}
            className='flex gap-4 items-center flex-row max-sm:flex-col'
          >
            <Link
              href='/invite'
              rel='noopener noreferrer'
              className='max-sm:mx-auto'
            >
              <MyButton
                variant='normal'
                style='rounded'
                size='medium'
                effect='confetti'
                className='btn-responsive max-sm:scale-90'
              >
                <ConfettiIcon weight='fill' alt='Confetti' />
                {language.data.home.actions.invite}
              </MyButton>
            </Link>
            <div className='flex gap-4 sm:contents'>
              <motion.span
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 2.06 }}
              >
                {language.data.home.actions.or}
              </motion.span>
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 2.12 }}
              >
                <NextLink
                  href='/app'
                  color='foreground'
                  underline='hover'
                  rel='noopener noreferrer'
                  onPress={() => {
                    router.push('/app');
                  }}
                >
                  {language.data.home.actions.login}
                </NextLink>
              </motion.div>
            </div>
          </motion.div>
        </main>
        {(newYearIn / 1000 < 24 * 60 * 60 || newYearEvent) && (
          <div
            id='newYearTimer'
            className='flex gap-2 items-center justify-center z-40 fixed bottom-4 left-1/2 -translate-x-1/2 p-3 bg-white bg-opacity-60 border-white border-2 rounded-full max-sm:hidden backdrop-blur-sm'
          >
            <ClockCountdown size={18} />
            <p className='text-sm font-bold max-sm:text-xxs'>
              Happy New Year in{' '}
              <CountdownTimer
                timeLeft={!newYearEvent ? Math.floor(newYearIn / 1000) : 0}
                onEnd={() => {
                  const duration = 15 * 1000;
                  const animationEnd = Date.now() + duration;
                  const defaults = {
                    startVelocity: 30,
                    spread: 360,
                    ticks: 60,
                    zIndex: 0,
                  };

                  document
                    .getElementById('newYearTimer')
                    ?.classList.add('opacity-0');
                  document
                    .getElementById('newYearTimer')
                    ?.classList.add('bottom-0');
                  document
                    .getElementById('newYearTimer')
                    ?.classList.add('pointer-events-none');

                  function randomInRange(min: number, max: number) {
                    return Math.random() * (max - min) + min;
                  }

                  const interval = setInterval(function () {
                    const timeLeft = animationEnd - Date.now();

                    if (timeLeft <= 0) {
                      return clearInterval(interval);
                    }

                    const particleCount = 50 * (timeLeft / duration);
                    confetti({
                      ...defaults,
                      particleCount,
                      origin: {
                        x: randomInRange(0.1, 0.3),
                        y: Math.random() - 0.2,
                      },
                    });
                    confetti({
                      ...defaults,
                      particleCount,
                      origin: {
                        x: randomInRange(0.7, 0.9),
                        y: Math.random() - 0.2,
                      },
                    });
                  }, 250);
                }}
              />
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
