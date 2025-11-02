import React from 'react';
import { motion } from 'framer-motion';
import { useLanguageContext } from '@/contexts/languageContext';
import { ScrollShadow } from '@nextui-org/react';
import { Confetti } from '@phosphor-icons/react/dist/ssr';
import { useDiscordGuildInfo } from '@/contexts/discordGuildInfo';

function NotInSameVC() {
  const { language } = useLanguageContext();
  const { guild } = useDiscordGuildInfo();

  return (
    <motion.div
      className='absolute w-full h-full top-0 left-0 flex flex-col gap-4 items-center justify-center bg-background/20 z-10 backdrop-blur-xl'
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.48, delay: 0.1 }}
    >
      <motion.div
        className='relative bg-primary/10 border-2 border-primary/10 rounded-3xl p-8 overflow-hidden w-full max-w-96 flex flex-col gap-4 items-center justify-center'
        initial={{ opacity: 0, scale: 1.32 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{
          duration: 0.48,
          delay: 0.2,
          type: 'spring',
        }}
      >
        <ScrollShadow className='w-full h-64 px-2 py-4'>
          <div className='flex flex-col gap-2 items-center justify-center h-full w-full m-auto'>
            <Confetti className='text-foreground/60' size={48} />
            <h1 className='text-2xl text-foreground/60'>
              {language.data.app.guilds.player.notSameVC.title}
            </h1>
            <span className='text-base text-foreground/30'>
              {language.data.app.guilds.player.notSameVC.description.replace(
                '[guildName]',
                guild?.name || ''
              )}
            </span>
          </div>
        </ScrollShadow>
      </motion.div>
    </motion.div>
  );
}

export default NotInSameVC;
