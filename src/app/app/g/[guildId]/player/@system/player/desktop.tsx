'use client';
import { useAtom, useAtomValue } from 'jotai';
import { AnimatePresence, motion } from 'framer-motion';
import React from 'react';

import { msToTime } from '@/utils/time';
import { combineArtistName } from '@/components/music/searchResult/track';
import {
  CaretDown,
  CaretLineLeft,
  CaretLineRight,
  CaretUp,
  Equalizer,
  Info,
  MusicNotes,
  Pause,
  Play,
  Repeat,
  RepeatOnce,
  SpeakerSimpleHigh,
} from '@phosphor-icons/react/dist/ssr';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useAppStore } from '@/store/coreStore';
import { playbackAtom, ponaCommonStateAtom } from '@/store/musicAtoms';
import { playerPopupAtom } from '@/store/uiAtoms';
import { useSocket } from '@/contexts/ponaMusicContext';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Slider } from '@/components/ui/slider';

function DesktopPonaPlayer() {
  const router = useRouter();
  const language = useAppStore((state) => state.language);
  const userSetting = useAppStore((state) => state.userSetting);
  const ponaCommonState = useAtomValue(ponaCommonStateAtom);
  const playback = useAtomValue(playbackAtom);
  const [playerPopup, setPlayerPopup] = useAtom(playerPopupAtom);
  const { socket } = useSocket();

  const currentTrack = ponaCommonState?.current;
  const isLoopTrack = ponaCommonState?.pona?.repeat?.track;
  const isLoopQueue = ponaCommonState?.pona?.repeat?.queue;

  const [sliderValue, setSliderValue] = React.useState<number>(playback);

  React.useEffect(() => {
    setSliderValue(playback);
  }, [playback]);

  React.useEffect(() => {
    if (!currentTrack) {
      document.body.classList.remove('pona-player-focused');
      setPlayerPopup(false);
    }
    if (!playerPopup || !currentTrack)
      document.body.classList.remove('pona-player-focused');
  }, [currentTrack, playerPopup, setPlayerPopup]);

  return (
    <AnimatePresence>
      {currentTrack && (
        <motion.div
          id='pona=player-wrapper'
          initial={{ opacity: 0, pointerEvents: 'none', translateY: 32 }}
          animate={{ opacity: 1, pointerEvents: 'auto', translateY: 0 }}
          exit={{ opacity: 0, pointerEvents: 'none', translateY: 32 }}
          className={
            (userSetting.dev_pona_player_style === 'modern'
              ? `absolute max-md:overflow-hidden h-[4.8rem] z-50 max-lg:h-16 max-md:bottom-6 bottom-2 left-2 max-md:rounded-lg rounded-3xl`
              : `absolute max-md:overflow-hidden h-[5.6rem] z-50 max-lg:h-16 max-md:bottom-6 bottom-2 left-2 max-md:rounded-lg rounded-3xl`) +
            (userSetting.transparency
              ? ' [.dark_&]:bg-[hsl(var(--pona-app-music-accent-color-800)/.64)] backdrop-blur-lg [.light_&]:bg-[hsl(var(--pona-app-music-accent-color-100)/.86)]'
              : ' [.dark_&]:bg-[hsl(var(--pona-app-music-accent-color-800))] [.light_&]:bg-[hsl(var(--pona-app-music-accent-color-100))]')
          }
          style={{ width: 'calc(100% - 1rem)' }}
        >
          <div className='absolute top-0 left-0 w-full h-full z-0 overflow-hidden pointer-events-none rounded-3xl max-md:rounded-lg [body.pona-player-focused_&]:opacity-0 opacity-20'>
            <img
              src={`/api/proxy/image?r=${encodeURIComponent(
                currentTrack?.proxyArtworkUrl ||
                  '/static/Ponlponl123 (1459).png'
              )}&s=512&blur=16&saturation=96&contrast=12`}
              alt={currentTrack ? currentTrack.title : 'Thumbnail'}
              className='object-cover w-full h-full pointer-events-none saturate-200 brightness-100 -translate-y-1'
            />
          </div>
          <div className='absolute top-0 left-0 z-0 w-full h-full [body.pona-player-focused_&]:bg-none [html.light_&]:[body.pona-player-focused_&]:bg-[hsl(var(--pona-app-music-accent-color-50))] [html.dark_&]:[body.pona-player-focused_&]:bg-[hsl(var(--pona-app-music-accent-color-900))] max-md:rounded-lg rounded-3xl'></div>
          
          <div className='relative z-10 flex items-center justify-between h-full px-6 gap-4'>
            {/* Track info */}
            <div className='flex items-center gap-4 min-w-0 max-w-xs'>
              <img
                src={currentTrack.proxyArtworkUrl || '/static/backdrop.png'}
                alt={currentTrack.title}
                className='w-12 h-12 rounded-lg object-cover shadow-md'
              />
              <div className='flex flex-col min-w-0'>
                <h4 className='font-bold text-sm truncate'>{currentTrack.title}</h4>
                <p className='text-xs text-muted-foreground truncate'>{currentTrack.author}</p>
              </div>
            </div>

            {/* Playback Controls */}
            <div className='flex items-center gap-3'>
              <Button
                variant='ghost'
                size='icon'
                onClick={() => socket?.emit('previous')}
              >
                <CaretLineLeft size={20} weight='fill' />
              </Button>
              <Button
                size='icon'
                className='rounded-full w-10 h-10'
                onClick={() => {
                  if (ponaCommonState?.pona?.paused) socket?.emit('play');
                  else socket?.emit('pause');
                }}
              >
                {ponaCommonState?.pona?.paused ? (
                  <Play size={20} weight='fill' />
                ) : (
                  <Pause size={20} weight='fill' />
                )}
              </Button>
              <Button
                variant='ghost'
                size='icon'
                onClick={() => socket?.emit('next')}
              >
                <CaretLineRight size={20} weight='fill' />
              </Button>
            </div>

            {/* Right Panel Actions */}
            <div className='flex items-center gap-2'>
              <Button
                variant='ghost'
                size='icon'
                onClick={() => {
                  setPlayerPopup((value) => {
                    if (!value)
                      document.body.classList.add('pona-player-focused');
                    else document.body.classList.remove('pona-player-focused');
                    return !value;
                  });
                }}
              >
                {playerPopup ? <CaretDown size={20} /> : <CaretUp size={20} />}
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default DesktopPonaPlayer;
