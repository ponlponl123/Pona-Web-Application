import React, { memo, useCallback, useRef } from 'react';
import { useAtomValue } from 'jotai';
import { Socket } from 'socket.io-client';
import {
  CaretDownIcon,
  CaretUpIcon,
} from '@phosphor-icons/react/dist/ssr';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
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
import { ponaCommonStateAtom } from '@/store/musicAtoms';
import { cn } from '@/lib/utils';

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
  const ponaState = useAtomValue(ponaCommonStateAtom);
  const repeatMode = ponaState?.pona?.repeat?.track
    ? 'track'
    : ponaState?.pona?.repeat?.queue
      ? 'queue'
      : 'none';

  const handleRepeat = useCallback(
    (mode: 'none' | 'track' | 'queue') => {
      socket?.emit('repeat', mode);
    },
    [socket]
  );

  const noloopIconRef = useRef<MusicIconHandle>(null)
  const repeatIconRef = useRef<RepeatIconHandle>(null)
  const queueIconRef = useRef<RepeatIconHandle>(null)

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
                className={cn(
                  'rounded-lg p-0! size-10 scale-110 max-md:hidden',
                  repeatMode !== 'none' && 'bg-[hsl(var(--pona-app-music-accent-color-500)/0.12)]'
                )}
                data-smooth-interaction="true"
              >
                <RefreshCw
                  className={cn(
                    'size-4',
                    repeatMode !== 'none'
                      ? 'text-[hsl(var(--pona-app-music-accent-color-800))] dark:text-[hsl(var(--pona-app-music-accent-color-500))]'
                      : 'text-[hsl(var(--pona-app-music-accent-color-800)/0.24)] dark:text-[hsl(var(--pona-app-music-accent-color-500)/0.24)]'
                  )}
                />
              </Button>
            </AnimateIcon>
          }
        />
        <DropdownMenuContent align='end' className='w-48 rounded-lg'>
          <DropdownMenuLabel>
            {language.data.app.guilds.player.repeat.title}
          </DropdownMenuLabel>
          <DropdownMenuRadioGroup
            value={repeatMode}
            onValueChange={(val) => handleRepeat(val as 'none' | 'track' | 'queue')}
          >
            <DropdownMenuRadioItem
              value='none'
              onMouseEnter={() => noloopIconRef.current?.startAnimation()}
              onMouseLeave={() => noloopIconRef.current?.stopAnimation()}
            >
              <Music ref={noloopIconRef} className='size-4 mr-2' />
              {language.data.app.guilds.player.repeat.off}
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem
              value='track'
              onMouseEnter={() => repeatIconRef.current?.startAnimation()}
              onMouseLeave={() => repeatIconRef.current?.stopAnimation()}
            >
              <Repeat1 ref={repeatIconRef} className='size-4 mr-2' />
              {language.data.app.guilds.player.repeat.track}
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem
              value='queue'
              onMouseEnter={() => queueIconRef.current?.startAnimation()}
              onMouseLeave={() => queueIconRef.current?.stopAnimation()}
            >
              <Repeat ref={queueIconRef} className='size-4 mr-2' />
              {language.data.app.guilds.player.repeat.queue}
            </DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
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
                data-smooth-interaction="true"
              >
                <AudioLines className='size-4 text-[hsl(var(--pona-app-music-accent-color-800))] dark:text-[hsl(var(--pona-app-music-accent-color-500))]' />
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
        data-smooth-interaction="true"
        onClick={togglePopup}
      >
        <CaretUpIcon className={`absolute text-[hsl(var(--pona-app-music-accent-color-800))] dark:text-[hsl(var(--pona-app-music-accent-color-500))] ${playerPopup ? 'opacity-0 -translate-y-6' : ''}`} />
        <CaretDownIcon className={`absolute text-[hsl(var(--pona-app-music-accent-color-800))] dark:text-[hsl(var(--pona-app-music-accent-color-500))] ${!playerPopup ? 'opacity-0 translate-y-6' : ''}`} />
      </Button>
    </div>
  );
});
