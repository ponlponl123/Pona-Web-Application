'use client';
import React from 'react';
import CountUp from 'react-countup';
import { motion } from 'framer-motion';
import { Plugs, Warning } from '@phosphor-icons/react/dist/ssr';
import { useAppStore } from '@/store/coreStore';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';

function SocketConnecting() {
  const language = useAppStore((state) => state.language);
  const [timedOut, setTimedOut] = React.useState<boolean>(false);

  return (
    <motion.div
      className='absolute w-full h-full top-0 left-0 flex flex-col gap-3 items-center justify-center bg-background/20 z-10'
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.48, delay: 1 }}
    >
      {timedOut ? (
        <motion.div
          className='relative bg-primary/10 border border-primary/20 rounded-3xl p-8 overflow-hidden w-full max-w-96 flex flex-col gap-4 items-center justify-center'
          initial={{ opacity: 0, scale: 1.32 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            duration: 0.48,
            delay: 1.24,
            type: 'spring',
          }}
        >
          <Warning size={32} />
          <h2 className='text-xl font-bold text-center'>
            {language.data.app.guilds.player.socket.failed.title}
          </h2>
          <p className='text-sm text-center text-muted-foreground'>
            {language.data.app.guilds.player.socket.failed.description}
          </p>
        </motion.div>
      ) : (
        <>
          <motion.div
            initial={{ opacity: 0, scale: 0.64, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{
              duration: 0.48,
              delay: 1.96,
              type: 'spring',
            }}
          >
            <Badge variant='outline' className='flex items-center gap-1 px-3 py-1 text-sm'>
              <Plugs size={14} weight='fill' />
              {language.data.app.guilds.player.socket.connecting.chip} (
              <CountUp
                start={0}
                end={300}
                duration={1000}
                useEasing={false}
                onEnd={() => {
                  setTimedOut(true);
                }}
              />
              {language.data.app.guilds.player.socket.connecting.sec})
            </Badge>
          </motion.div>
          <motion.div
            className='relative bg-primary/10 border border-primary/20 rounded-3xl p-8 overflow-hidden w-full max-w-96 flex flex-col gap-4 items-center justify-center'
            initial={{ opacity: 0, scale: 1.32 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              duration: 0.48,
              delay: 1.24,
              type: 'spring',
            }}
          >
            <Spinner size='md' className='mt-2' />
            <h2 className='text-xl font-semibold text-center mt-2'>
              {language.data.app.guilds.player.socket.connecting.title}
            </h2>
          </motion.div>
        </>
      )}
    </motion.div>
  );
}

export default SocketConnecting;
