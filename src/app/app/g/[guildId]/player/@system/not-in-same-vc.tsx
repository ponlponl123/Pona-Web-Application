import React from 'react';
import { motion } from 'framer-motion';
import { Confetti } from '@phosphor-icons/react/dist/ssr';
import { useDiscordGuildInfo } from '@/contexts/discordGuildInfo';
import { useAppStore } from '@/store/coreStore';

function NotInSameVC() {
  const language = useAppStore((state) => state.language);
  const { guild } = useDiscordGuildInfo();

  return (
    <motion.div
      className='absolute w-full h-full top-0 left-0 flex flex-col gap-4 items-center justify-center bg-background/20 z-10 backdrop-blur-xl'
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.48, delay: 0.1 }}
    >
      <motion.div
        className='relative bg-primary/10 border border-primary/20 rounded-3xl p-8 overflow-hidden w-full max-w-96 flex flex-col gap-4 items-center justify-center'
        initial={{ opacity: 0, scale: 1.32 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{
          duration: 0.48,
          delay: 0.2,
          type: 'spring',
        }}
      >
        <div className='w-full max-h-64 overflow-y-auto px-2 py-4'>
          <div className='flex flex-col gap-2 items-center justify-center h-full w-full m-auto text-center'>
            <Confetti className='text-muted-foreground' size={48} />
            <h2 className='text-xl font-semibold text-muted-foreground'>
              {language.data.app.guilds.player.notSameVC.title}
            </h2>
            <span className='text-sm text-muted-foreground/60'>
              {language.data.app.guilds.player.notSameVC.description.replace(
                '[guildName]',
                guild?.name || ''
              )}
            </span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default NotInSameVC;
