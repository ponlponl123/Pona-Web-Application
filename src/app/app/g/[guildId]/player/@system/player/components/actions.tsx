'use client';

import React, { memo, useCallback, useRef } from 'react';
import { Socket } from 'socket.io-client';
import {
  CaretDownIcon,
  CaretUpIcon,
} from '@phosphor-icons/react/dist/ssr';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Language } from '@/lib/i18n';
import { Music, MusicIconHandle, Repeat, Repeat1, RepeatIconHandle } from '@animateicons/react/lucide';
import { AnimateIcon } from '@/components/animate-ui/icons/icon';
import { AudioLines } from '@/components/animate-ui/icons/audio-lines';
import { RefreshCw } from '@/components/animate-ui/icons/refresh-cw';

export const PlayerActions = memo(function PlayerActions({
  socket,
  language,
  playerPopup,
  setPlayerPopup,
}: {
  socket: Socket | null;
  language: Language;
  playerPopup: boolean;
  setPlayerPopup: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const handleRepeat = useCallback(
    (mode: 'none' | 'track' | 'queue') => {
      socket?.emit('repeat', mode);
    },
    [socket]
  );

  const noloopIconRef = useRef<MusicIconHandle>(null)
  const repeatIconRef = useRef<RepeatIconHandle>(null)
  const queueIconRef = useRef<RepeatIconHandle>(null)

  const handleRepeatNone = useCallback(() => handleRepeat('none'), [handleRepeat]);
  const handleRepeatTrack = useCallback(() => handleRepeat('track'), [handleRepeat]);
  const handleRepeatQueue = useCallback(() => handleRepeat('queue'), [handleRepeat]);

  const togglePopup = useCallback(() => {
    setPlayerPopup((value) => {
      if (!value) document.body.classList.add('pona-player-focused');
      else document.body.classList.remove('pona-player-focused');
      return !value;
    });
  }, [setPlayerPopup]);

  return (
    <div className='flex items-center justify-end gap-2 min-w-0 flex-1 max-md:hidden mr-3 z-10'>
      <DropdownMenu>
        <DropdownMenuTrigger
          nativeButton={false}
          render={
            <AnimateIcon animateOnHover>
              <Button
                variant='ghost'
                size='icon'
                className='rounded-lg p-0! size-10 scale-110 max-md:hidden'
                data-smooth-interaction="true"
              >
                <RefreshCw
                  className='size-4 text-[hsl(var(--pona-app-music-accent-color-500))]' />
              </Button>
            </AnimateIcon>
          }
        />
        <DropdownMenuContent align='end' className='w-48 rounded-lg'>
          <DropdownMenuLabel>
            {language.data.app.guilds.player.repeat.title}
          </DropdownMenuLabel>
          <DropdownMenuItem onMouseEnter={() => noloopIconRef.current?.startAnimation()} onMouseLeave={() => noloopIconRef.current?.stopAnimation()} onClick={handleRepeatNone}>
            <Music ref={noloopIconRef} className='size-4 mr-2' />
            {language.data.app.guilds.player.repeat.off}
          </DropdownMenuItem>
          <DropdownMenuItem onMouseEnter={() => repeatIconRef.current?.startAnimation()} onMouseLeave={() => repeatIconRef.current?.stopAnimation()} onClick={handleRepeatTrack}>
            <Repeat1 ref={repeatIconRef} className='size-4 mr-2' />
            {language.data.app.guilds.player.repeat.track}
          </DropdownMenuItem>
          <DropdownMenuItem onMouseEnter={() => queueIconRef.current?.startAnimation()} onMouseLeave={() => queueIconRef.current?.stopAnimation()} onClick={handleRepeatQueue}>
            <Repeat ref={queueIconRef} className='size-4 mr-2' />
            {language.data.app.guilds.player.repeat.queue}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Popover>
        <PopoverTrigger
          nativeButton={false}
          render={
            <AnimateIcon animateOnHover>
              <Button
                variant='ghost'
                size='icon'
                className='rounded-lg size-10 scale-110 max-md:hidden'
              >
                <AudioLines className='size-4 text-[hsl(var(--pona-app-music-accent-color-500))]' />
              </Button>
            </AnimateIcon>
          }
        />
        <PopoverContent className='w-72 p-4 rounded-lg'>
          <div className='w-full h-32 flex flex-col justify-between relative'>
            <div className='text-base font-bold'>
              {language.data.app.guilds.player.equalizer.title}
            </div>
            <div className='text-sm text-muted-foreground text-center my-auto'>
              {language.data.extensions.comingsoon}
            </div>
          </div>
        </PopoverContent>
      </Popover>

      <Button
        variant='ghost'
        size='icon'
        className='rounded-lg size-10 scale-110 max-md:hidden'
        onClick={togglePopup}
      >
        <CaretUpIcon className={`absolute text-[hsl(var(--pona-app-music-accent-color-500))] ${playerPopup ? 'opacity-0 -translate-y-6' : ''}`} />
        <CaretDownIcon className={`absolute text-[hsl(var(--pona-app-music-accent-color-500))] ${!playerPopup ? 'opacity-0 translate-y-6' : ''}`} />
      </Button>
    </div>
  );
});
