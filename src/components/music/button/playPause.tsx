'use client';
import React from 'react';
import { Pause, Play } from '@phosphor-icons/react/dist/ssr';
import { toast } from 'sonner';
import { useAtomValue } from 'jotai';

import { useSocket } from '@/contexts/ponaMusicContext';
import { ponaCommonStateAtom } from '@/store/musicAtoms';
import { useAppStore } from '@/store/coreStore';
import { Button } from '@/components/ui/button';

function PlayPauseButton({
  className,
  iconSize = 32,
}: {
  className?: string;
  iconSize?: number;
}) {
  const { socket } = useSocket();
  const language = useAppStore((state) => state.language);
  const ponaCommonState = useAtomValue(ponaCommonStateAtom);

  const isPaused = ponaCommonState?.pona?.paused ?? true;

  return (
    <Button
      size='icon'
      variant='ghost'
      className={`rounded-full p-2 hover:bg-accent/20 transition-transform ${className ? className : 'scale-125 max-lg:scale-100'}`}
      onClick={() => {
        const action = isPaused ? 'play' : 'pause';
        toast.promise(
          new Promise<void>((resolve, reject) => {
            socket?.emit(action, (error: unknown) => {
              if (error && (error as { status?: string }).status !== 'ok') {
                reject(error);
              } else {
                resolve();
              }
            });
          }),
          {
            loading: action === 'play'
              ? language.data.app.guilds.player.toast.play.loading
              : language.data.app.guilds.player.toast.pause.loading,
            success: action === 'play'
              ? language.data.app.guilds.player.toast.play.success
              : language.data.app.guilds.player.toast.pause.success,
            error: action === 'play'
              ? language.data.app.guilds.player.toast.play.error
              : language.data.app.guilds.player.toast.pause.error,
          }
        );
      }}
    >
      {isPaused ? (
        <Play weight='fill' size={iconSize} />
      ) : (
        <Pause weight='fill' size={iconSize} />
      )}
    </Button>
  );
}

export default PlayPauseButton;
