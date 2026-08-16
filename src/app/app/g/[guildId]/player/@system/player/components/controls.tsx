'use client';

import React, { memo, useCallback } from 'react';
import { toast } from 'sonner';
import { Socket } from 'socket.io-client';
import {
  CaretLineLeftIcon,
  CaretLineRightIcon,
  PauseIcon,
  PlayIcon,
} from '@phosphor-icons/react/dist/ssr';

import { Button } from '@/components/ui/button';
import { msToTime } from '@/lib/utils';
import { Language } from '@/lib/i18n';

import { emitWithTimeout } from '@/lib/promiseWithTimeout';

export const PlayerControls = memo(function PlayerControls({
  socket,
  language,
  isPaused,
  playback,
  maxLength,
  isMobile = false,
}: {
  socket: Socket | null;
  language: Language;
  isPaused: boolean;
  playback: number;
  maxLength: number;
  isMobile?: boolean;
}) {
  const formattedPlayback = React.useMemo(() => msToTime(playback), [playback]);
  const formattedMaxLength = React.useMemo(() => msToTime(maxLength), [maxLength]);

  const handlePause = useCallback(() => socket?.emit('pause'), [socket]);
  const handlePlay = useCallback(() => socket?.emit('play'), [socket]);
  const handlePrevious = useCallback(() => {
    toast.promise(
      emitWithTimeout((resolve, reject) => {
        socket?.emit('previous', (error: unknown) => {
          if (error && (error as { status?: string }).status !== 'ok') {
            reject(error);
          } else {
            resolve();
          }
        });
      }),
      {
        loading: language.data.app.guilds.player.toast['previous']?.loading || 'Loading...',
        success: language.data.app.guilds.player.toast['previous']?.success || 'Done',
        error: language.data.app.guilds.player.toast['previous']?.error || 'Error',
      }
    );
  }, [socket, language]);

  const handleNext = useCallback(() => {
    toast.promise(
      emitWithTimeout((resolve, reject) => {
        socket?.emit('next', (error: unknown) => {
          if (error && (error as { status?: string }).status !== 'ok') {
            reject(error);
          } else {
            resolve();
          }
        });
      }),
      {
        loading: language.data.app.guilds.player.toast['next']?.loading || 'Loading...',
        success: language.data.app.guilds.player.toast['next']?.success || 'Done',
        error: language.data.app.guilds.player.toast['next']?.error || 'Error',
      }
    );
  }, [socket, language]);

  if (isMobile) {
    return (
      <div
        className='flex items-center justify-end gap-4 w-16'
      >
        {!isPaused ? (
          <Button
            variant='ghost'
            size='icon'
            className='rounded-full size-10'
            onClick={handlePause}
          >
            <PauseIcon weight='fill' className='size-5 text-default-foreground' />
          </Button>
        ) : (
          <Button
            variant='ghost'
            size='icon'
            className='rounded-full size-10'
            onClick={handlePlay}
          >
            <PlayIcon weight='fill' className='size-5 text-default-foreground' />
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className='flex items-center justify-center gap-4 z-10'>
      <span className='w-16 z-10 text-center max-lg:hidden text-[hsl(var(--pona-app-music-accent-color-800))] dark:text-[hsl(var(--pona-app-music-accent-color-500))] text-sm font-medium'>
        {formattedPlayback}
      </span>
      <Button
        variant='ghost'
        size='icon'
        className='rounded-full size-10 scale-110 max-lg:scale-100 max-md:hidden'
        data-smooth-interaction="true"
        onClick={handlePrevious}
      >
        <CaretLineLeftIcon weight='fill' className='size-5 text-[hsl(var(--pona-app-music-accent-color-800))] dark:text-[hsl(var(--pona-app-music-accent-color-500))]' />
      </Button>
      {!isPaused ? (
        <Button
          variant='ghost'
          size='icon'
          className='rounded-full size-12 scale-125 max-lg:scale-100'
          data-smooth-interaction="true"
          onClick={handlePause}
        >
          <PauseIcon weight='fill' className='size-6 text-[hsl(var(--pona-app-music-accent-color-800))] dark:text-[hsl(var(--pona-app-music-accent-color-500))]' />
        </Button>
      ) : (
        <Button
          variant='ghost'
          size='icon'
          className='rounded-full size-12 scale-125 max-lg:scale-100'
          data-smooth-interaction="true"
          onClick={handlePlay}
        >
          <PlayIcon weight='fill' className='size-6 text-[hsl(var(--pona-app-music-accent-color-800))] dark:text-[hsl(var(--pona-app-music-accent-color-500))]' />
        </Button>
      )}
      <Button
        variant='ghost'
        size='icon'
        className='rounded-full size-10 scale-110 max-lg:scale-100 max-md:hidden'
        data-smooth-interaction="true"
        onClick={handleNext}
      >
        <CaretLineRightIcon weight='fill' className='size-5 text-[hsl(var(--pona-app-music-accent-color-800))] dark:text-[hsl(var(--pona-app-music-accent-color-500))]' />
      </Button>
      <div className='w-16 z-10 max-lg:w-max max-md:hidden flex gap-1 text-center whitespace-nowrap text-[hsl(var(--pona-app-music-accent-color-800))] dark:text-[hsl(var(--pona-app-music-accent-color-500))] text-sm font-medium'>
        <span className='lg:hidden flex text-[hsl(var(--pona-app-music-accent-color-800))] dark:text-[hsl(var(--pona-app-music-accent-color-500))]'>
          {formattedPlayback} /{' '}
        </span>
        {formattedMaxLength}
      </div>
    </div>
  );
});
