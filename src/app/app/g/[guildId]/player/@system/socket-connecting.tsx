'use client';

import React, { useState } from 'react';
import CountUp from 'react-countup';
import { motion } from 'framer-motion';
import {
  PlugsIcon,
  PlugsConnectedIcon,
  WarningIcon,
  ArrowClockwiseIcon,
} from '@phosphor-icons/react/dist/ssr';
import { useAppStore } from '@/store/coreStore';
import { useSocket } from '@/contexts/ponaMusicContext';
import { Button } from '@/components/ui/button';
import { AnimateIcon } from '@/components/animate-ui/icons/icon';
import { Unplug } from '@/components/animate-ui/icons/unplug';
import { CloudRainWind } from '@/components/animate-ui/icons/cloud-rain-wind';

export default function SocketConnecting() {
  const language = useAppStore((state) => state.language);
  const { socket } = useSocket();
  const [timedOut, setTimedOut] = useState<boolean>(false);
  const [isRetrying, setIsRetrying] = useState<boolean>(false);

  const handleRetry = () => {
    setIsRetrying(true);
    setTimedOut(false);
    if (socket) {
      socket.connect();
    } else {
      window.location.reload();
    }
    setTimeout(() => {
      setIsRetrying(false);
    }, 1500);
  };

  return (
    <motion.div
      className='relative min-h-[calc(100dvh-6rem)] w-full flex flex-col gap-6 items-center justify-center bg-background/30 backdrop-blur-xl z-10 p-4 select-none'
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.48 }}
    >
      {timedOut ? (
        <motion.div
          className='relative bg-card/50 backdrop-blur-2xl rounded-3xl p-8 overflow-hidden w-full max-w-xs flex flex-col gap-5 items-center justify-center shadow-2xl text-center'
          initial={{ opacity: 0, scale: 0.9, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.48, type: 'spring', bounce: 0.2 }}
        >
          <AnimateIcon animate>
            <CloudRainWind className='size-12' />
          </AnimateIcon>

          <div className='flex flex-col gap-2'>
            <h1 className='text-2xl font-extrabold tracking-tight text-foreground'>
              {language.data.app.guilds.player.socket.failed.title}
            </h1>
            <p className='text-sm text-muted-foreground leading-relaxed px-2'>
              {language.data.app.guilds.player.socket.failed.description}
            </p>
          </div>

          <Button
            onClick={handleRetry}
            disabled={isRetrying}
            className='w-full mt-2 gap-2 font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg transition-all active:scale-[0.98] rounded-2xl'
            size='lg'
          >
            <ArrowClockwiseIcon
              size={18}
              className={isRetrying ? 'animate-spin' : ''}
            />
            <span>{isRetrying ? 'Reconnecting...' : 'Retry Connection'}</span>
          </Button>
        </motion.div>
      ) : (
        <div className='flex flex-col gap-4 items-center justify-center w-full max-w-sm'>
          <motion.div
            className='relative bg-card/40 border border-primary/20 backdrop-blur-2xl rounded-3xl p-8 overflow-hidden w-full flex flex-col gap-6 items-center justify-center shadow-2xl text-center'
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.48, type: 'spring', bounce: 0.2 }}
          >
            <AnimateIcon animate="default-loop" loopDelay={1000} loop >
              <Unplug size={40} className={"size-12"} />
            </AnimateIcon>

            <div className='flex flex-col gap-1.5'>
              <h1 className='text-2xl font-bold tracking-tight text-foreground'>
                {language.data.app.guilds.player.socket.connecting.title}
              </h1>
              <p className='text-xs text-muted-foreground'>
                {language.data.app.guilds.player.socket.connecting.description}
              </p>
              <span className='text-xs text-muted-foreground mt-4'>
                <CountUp
                  start={0}
                  end={300}
                  duration={1000}
                  useEasing={false}
                  onEnd={() => {
                    setTimedOut(true);
                  }}
                />
                {language.data.app.guilds.player.socket.connecting.sec}</span>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}


