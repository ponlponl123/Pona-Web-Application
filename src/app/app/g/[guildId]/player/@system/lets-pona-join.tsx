import React from 'react';
import { motion } from 'framer-motion';
import { VoiceBasedChannel } from 'discord.js';
import { Island, SpeakerHigh } from '@phosphor-icons/react/dist/ssr';
import { useAtomValue } from 'jotai';

import { useDiscordGuildInfo } from '@/contexts/discordGuildInfo';
import { useSocket } from '@/contexts/ponaMusicContext';
import { useAppStore } from '@/store/coreStore';
import { isMemberInVCAtom } from '@/store/uiAtoms';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

function JoinVoiceChannelButton({
  voiceChannel,
}: {
  voiceChannel: VoiceBasedChannel;
}) {
  const [loading, setLoading] = React.useState<boolean>(false);
  const { guild } = useDiscordGuildInfo();
  const { socket } = useSocket();
  return (
    <Button
      className='w-full h-auto justify-start p-4 relative'
      variant='outline'
      disabled={loading}
      onClick={() => {
        setLoading(true);
        socket?.emit('join', guild?.id, voiceChannel.id);
      }}
    >
      <SpeakerHigh className='mr-2' size={24} weight='fill' />
      <div className='flex flex-row justify-between items-center gap-2 w-full py-1 text-left'>
        <div className='flex flex-col gap-1'>
          <h4 className='text-base font-semibold leading-none'>
            {voiceChannel.name}
          </h4>
          <span className='text-xs text-muted-foreground'>
            ({voiceChannel.id})
          </span>
        </div>
        {voiceChannel.userLimit ? (
          <Badge variant='secondary'>Limit {voiceChannel.userLimit}</Badge>
        ) : null}
      </div>
    </Button>
  );
}

function LetsPonaJoin() {
  const language = useAppStore((state) => state.language);
  const isMemberInVC = useAtomValue(isMemberInVCAtom);

  return (
    <motion.div
      className='absolute w-full h-full top-0 left-0 flex flex-col gap-4 items-center justify-center bg-background/20 z-10 backdrop-blur-xl'
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.48, delay: 0.1 }}
    >
      <motion.div
        className='relative bg-primary/10 border border-primary/20 backdrop-blur-sm rounded-3xl p-8 overflow-hidden w-full max-w-96 flex flex-col gap-4 items-center justify-center'
        initial={{ opacity: 0, scale: 1.32 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{
          duration: 0.48,
          delay: 0.2,
          type: 'spring',
        }}
      >
        <h1 className='text-3xl font-bold text-center'>
          {language.data.app.guilds.player.ponaIsNotInVC.select.title}
        </h1>
        <div className='w-full max-h-64 overflow-y-auto px-2 py-4 flex flex-col gap-2'>
          {isMemberInVC ? (
            <JoinVoiceChannelButton voiceChannel={isMemberInVC} />
          ) : (
            <div className='flex flex-col gap-2 items-center justify-center h-full w-full m-auto py-8'>
              <Island className='text-muted-foreground' size={48} />
              <h3 className='text-xl font-medium text-center text-muted-foreground'>
                {
                  language.data.app.guilds.player.ponaIsNotInVC.select.notfound
                    .title
                }
              </h3>
              <span className='text-sm text-center text-muted-foreground/60'>
                {
                  language.data.app.guilds.player.ponaIsNotInVC.select.notfound
                    .description
                }
              </span>
            </div>
          )}
        </div>
        <span className='text-xs text-center text-muted-foreground'>
          {language.data.app.guilds.player.ponaIsNotInVC.select.description}
        </span>
      </motion.div>
    </motion.div>
  );
}

export default LetsPonaJoin;
