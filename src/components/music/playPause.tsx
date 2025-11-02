import { useGlobalContext } from '@/contexts/globalContext';
import { useLanguageContext } from '@/contexts/languageContext';
import { usePonaMusicContext } from '@/contexts/ponaMusicContext';
import { Button } from '@nextui-org/react';
import { Pause, Play } from '@phosphor-icons/react/dist/ssr';
import React from 'react';
import toast from 'react-hot-toast';

function PlayPauseButton({
  className,
  iconSize = 32,
}: {
  className?: string;
  iconSize?: number;
}) {
  const { socket } = usePonaMusicContext();
  const { language } = useLanguageContext();
  const { ponaCommonState } = useGlobalContext();
  if (!ponaCommonState?.pona.paused)
    return (
      <Button
        isIconOnly
        radius='full'
        size='lg'
        variant='light'
        className={className ? className : 'scale-125 max-lg:scale-100'}
        onPress={() => {
          toast.promise(
            new Promise<void>((resolve, reject) => {
              socket?.emit('pause', (error: unknown) => {
                if (error && (error as { status?: string }).status !== 'ok') {
                  reject(error);
                } else {
                  resolve();
                }
              });
            }),
            {
              loading: language.data.app.guilds.player.toast.pause.loading,
              success: language.data.app.guilds.player.toast.pause.success,
              error: language.data.app.guilds.player.toast.pause.error,
            },
            {
              position: 'top-center',
              duration: 1280,
            }
          );
        }}
      >
        <Pause weight='fill' size={iconSize} />
      </Button>
    );
  else
    return (
      <Button
        isIconOnly
        radius='full'
        size='lg'
        variant='light'
        className={className ? className : 'scale-125 max-lg:scale-100'}
        onPress={() => {
          toast.promise(
            new Promise<void>((resolve, reject) => {
              socket?.emit('play', (error: unknown) => {
                if (error && (error as { status?: string }).status !== 'ok') {
                  reject(error);
                } else {
                  resolve();
                }
              });
            }),
            {
              loading: language.data.app.guilds.player.toast.play.loading,
              success: language.data.app.guilds.player.toast.play.success,
              error: language.data.app.guilds.player.toast.play.error,
            },
            {
              position: 'top-center',
              duration: 1280,
            }
          );
        }}
      >
        <Play weight='fill' size={iconSize} />
      </Button>
    );
}

export default PlayPauseButton;
