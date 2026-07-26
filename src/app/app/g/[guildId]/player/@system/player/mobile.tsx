'use client';
import { useAtom, useAtomValue } from 'jotai';
import { AnimatePresence, motion } from 'framer-motion';
import React from 'react';

import {
  CaretDown,
  CaretUp,
  Pause,
  Play,
} from '@phosphor-icons/react/dist/ssr';
import MobilePonaPlayerPanel from './panel/mobile';
import { useAppStore } from '@/store/coreStore';
import { playbackAtom, ponaCommonStateAtom } from '@/store/musicAtoms';
import { playerPopupAtom } from '@/store/uiAtoms';
import { useSocket } from '@/contexts/ponaMusicContext';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';

export type MobilePonaPlayerPanelAnimationState =
  | 'none'
  | 'playerPanel'
  | 'queuePanel';

function MobilePonaPlayer() {
  const userSetting = useAppStore((state) => state.userSetting);
  const isMobile = useAppStore((state) => state.isMobile);
  const playback = useAtomValue(playbackAtom);
  const ponaCommonState = useAtomValue(ponaCommonStateAtom);
  const [playerPopup, setPlayerPopup] = useAtom(playerPopupAtom);
  const { socket } = useSocket();

  const [beforeState, setBeforeState] =
    React.useState<MobilePonaPlayerPanelAnimationState>('none');
  const [afterState, setAfterState] =
    React.useState<MobilePonaPlayerPanelAnimationState>('none');
  const [trackFocus, setTrackFocus] = React.useState<boolean>(true);
  const currentTrack = ponaCommonState?.current;

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
          id='pona-player-wrapper'
          initial={{ opacity: 0, pointerEvents: 'none', translateY: 32 }}
          animate={{ opacity: 1, pointerEvents: 'auto', translateY: 0 }}
          exit={{ opacity: 0, pointerEvents: 'none', translateY: 32 }}
          className={
            `absolute overflow-hidden z-50 bg-card border shadow-xl ${playerPopup ? 'w-full h-screen rounded-none bottom-0 left-0' : `h-16 rounded-lg ${isMobile ? 'bottom-[5.2rem]' : 'bottom-6'} left-2 w-[calc(100%_-_1rem)]`}` +
            (userSetting.transparency ? ' backdrop-blur-md' : '')
          }
        >
          <div className='absolute top-0 left-0 z-0 w-full h-full rounded-lg'></div>
          {!playerPopup && (
            <div className='absolute -top-1 left-0 w-full z-20 px-2'>
              <Slider
                aria-label='PlayerSeekBar'
                className='h-1'
                min={0}
                max={currentTrack.duration || 100}
                value={[sliderValue]}
                onValueChange={(val) => setSliderValue(val[0])}
                onValueChangeEnd={(val) => socket?.emit('seek', val[0])}
              />
            </div>
          )}
          <div className='flex items-center justify-between w-full h-full relative z-10 px-4'>
            <MobilePonaPlayerPanel
              trackFocus={trackFocus}
              setTrackFocus={setTrackFocus}
              beforeState={beforeState}
              setBeforeState={setBeforeState}
              afterState={afterState}
              setAfterState={setAfterState}
            />
            <Button
              size='sm'
              variant='ghost'
              className={`absolute right-4 top-4 ${playerPopup ? '' : 'opacity-0 pointer-events-none'}`}
              onClick={() => {
                if (trackFocus) {
                  document.body.classList.remove('pona-player-focused');
                  setAfterState('none');
                  setBeforeState('playerPanel');
                  setTimeout(() => {
                    setPlayerPopup(false);
                  }, 100);
                } else {
                  setAfterState('playerPanel');
                  setBeforeState('queuePanel');
                  setTrackFocus(true);
                }
              }}
            >
              {trackFocus ? <CaretDown size={20} /> : <CaretUp size={20} />}
            </Button>
            <div
              className={`flex items-center gap-3 transition-opacity ${playerPopup ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
              onClick={() => {
                setPlayerPopup(true);
              }}
            >
              <img
                src={currentTrack.proxyArtworkUrl || currentTrack.artworkUrl || '/static/backdrop.png'}
                alt={currentTrack.title}
                className='w-10 h-10 rounded-md object-cover'
              />
              <div className='flex flex-col min-w-0 max-w-[50vw]'>
                <h4 className='text-sm font-semibold truncate'>{currentTrack.title}</h4>
                <p className='text-xs text-muted-foreground truncate'>{currentTrack.author}</p>
              </div>
            </div>

            <div className={`flex items-center gap-2 ${playerPopup ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
              {!ponaCommonState?.pona.paused ? (
                <Button
                  size='sm'
                  variant='ghost'
                  className='rounded-full h-10 w-10 p-0'
                  onClick={(e) => {
                    e.stopPropagation();
                    socket?.emit('pause');
                  }}
                >
                  <Pause weight='fill' size={20} />
                </Button>
              ) : (
                <Button
                  size='sm'
                  variant='ghost'
                  className='rounded-full h-10 w-10 p-0'
                  onClick={(e) => {
                    e.stopPropagation();
                    socket?.emit('play');
                  }}
                >
                  <Play weight='fill' size={20} />
                </Button>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default MobilePonaPlayer;
