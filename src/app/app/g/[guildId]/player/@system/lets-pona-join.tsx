import React from 'react';
import { motion } from 'framer-motion';
import { useLanguageContext } from '@/contexts/languageContext';
import { Button, Chip, Progress, ScrollShadow } from '@nextui-org/react';
import { Island, SpeakerHigh } from '@phosphor-icons/react/dist/ssr';
import { usePonaMusicContext } from '@/contexts/ponaMusicContext';
import { VoiceBasedChannel } from 'discord.js';
import { useDiscordGuildInfo } from '@/contexts/discordGuildInfo';
import { useGlobalContext } from '@/contexts/globalContext';

function JoinVoiceChannelButton({
  voiceChannel,
}: {
  voiceChannel: VoiceBasedChannel;
}) {
  const [loading, setLoading] = React.useState<boolean>(false);
  const { guild } = useDiscordGuildInfo();
  const { socket } = usePonaMusicContext();
  return (
    <Button
      className='w-full h-max justify-start bg-primary/25 relative'
      color='primary'
      variant={loading ? 'shadow' : 'solid'}
      startContent={
        <SpeakerHigh className='text-content1-foreground' weight='fill' />
      }
      onPress={() => {
        setLoading(true);
        socket?.emit('join', guild?.id, voiceChannel.id);
      }}
    >
      {loading && (
        <Progress
          isIndeterminate
          aria-label='Loading...'
          className='w-full absolute top-0 left-0'
          size='sm'
        />
      )}
      <div className='flex flex-row justify-between items-center gap-2 w-full py-2 pl-1'>
        <div className='flex flex-col gap-2 justify-start text-start mr-auto py-2'>
          <h1 className='text-lg text-content1-foreground leading-3'>
            {voiceChannel.name}
          </h1>
          <span className='text-xs text-content1-foreground leading-3'>
            ({voiceChannel.id})
          </span>
        </div>
        <div className='flex gap-2 ml-auto'>
          {voiceChannel.userLimit ? (
            <Chip size='sm' color='primary'>
              Limit {voiceChannel.userLimit}
            </Chip>
          ) : (
            <></>
          )}
        </div>
      </div>
    </Button>
  );
}

function LetsPonaJoin() {
  const { language } = useLanguageContext();
  const { isMemberInVC } = useGlobalContext();

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
        <h1 className='text-4xl text-center'>
          {language.data.app.guilds.player.ponaIsNotInVC.select.title}
        </h1>
        <ScrollShadow className='w-full h-64 px-2 py-4'>
          {isMemberInVC ? (
            <>
              <JoinVoiceChannelButton voiceChannel={isMemberInVC} />
            </>
          ) : (
            <div className='flex flex-col gap-2 items-center justify-center h-full w-full m-auto'>
              <Island className='text-foreground/60' size={48} />
              <h1 className='text-2xl text-center text-foreground/60'>
                {
                  language.data.app.guilds.player.ponaIsNotInVC.select.notfound
                    .title
                }
              </h1>
              <span className='text-base text-center text-foreground/30'>
                {
                  language.data.app.guilds.player.ponaIsNotInVC.select.notfound
                    .description
                }
              </span>
            </div>
          )}
        </ScrollShadow>
        <span className='text-xs text-center text-foreground/40'>
          {language.data.app.guilds.player.ponaIsNotInVC.select.description}
        </span>
      </motion.div>
    </motion.div>
  );
}

export default LetsPonaJoin;
