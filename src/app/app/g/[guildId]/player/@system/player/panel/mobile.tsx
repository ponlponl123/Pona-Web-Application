'use client';
import { useAtom, useAtomValue } from 'jotai';
import { AnimatePresence, motion } from 'framer-motion';
import React, { useState } from 'react';

import { msToTime } from '@/utils/time';
import { useRouter } from 'next/navigation';

import {
  CaretLineLeft,
  CaretLineRight,
  Coffee,
  Equalizer,
  Heart,
  MusicNotes,
  Pause,
  Play,
  Repeat,
  RepeatOnce,
  SpeakerSimpleHigh,
} from '@phosphor-icons/react/dist/ssr';

import LyricsDisplay from '@/components/music/lyricsDisplay';
import { Track } from '@/types/ponaPlayer';
import { MobilePonaPlayerPanelAnimationState } from '../mobile';
import { useAppStore } from '@/store/coreStore';
import { playbackAtom, ponaCommonStateAtom } from '@/store/musicAtoms';
import { playerPopupAtom } from '@/store/uiAtoms';
import { useSocket } from '@/contexts/ponaMusicContext';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

function MobilePonaPlayerPanel({
  trackFocus,
  setTrackFocus,
  beforeState,
  setBeforeState,
  afterState,
  setAfterState,
}: {
  trackFocus: boolean;
  setTrackFocus: React.Dispatch<React.SetStateAction<boolean>>;
  beforeState: MobilePonaPlayerPanelAnimationState;
  setBeforeState: React.Dispatch<
    React.SetStateAction<MobilePonaPlayerPanelAnimationState>
  >;
  afterState: MobilePonaPlayerPanelAnimationState;
  setAfterState: React.Dispatch<
    React.SetStateAction<MobilePonaPlayerPanelAnimationState>
  >;
}) {
  const router = useRouter();
  const language = useAppStore((state) => state.language);
  const userSetting = useAppStore((state) => state.userSetting);
  const ponaCommonState = useAtomValue(ponaCommonStateAtom);
  const playback = useAtomValue(playbackAtom);
  const [playerPopup, setPlayerPopup] = useAtom(playerPopupAtom);
  const { socket } = useSocket();

  const currentTrack = ponaCommonState?.current;
  const lyricsContainerRef = React.useRef<HTMLDivElement>(null);

  const [isRepeatModalOpen, setIsRepeatModalOpen] = useState(false);
  const [isEqualizerModalOpen, setIsEqualizerModalOpen] = useState(false);
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
    <>
      <AnimatePresence>
        {currentTrack && playerPopup && trackFocus && (
          <motion.div
            className='absolute left-0 top-0 p-8 w-full h-full overflow-hidden pointer-events-auto flex flex-col justify-center items-center'
            id='pona=player-panel-player-focus'
            transition={{
              duration: 0.12,
            }}
            initial={
              beforeState === 'none'
                ? {
                    opacity: 0,
                    pointerEvents: 'none',
                    translateY: '100%',
                    translateX: '-100%',
                    scale: 0,
                  }
                : {
                    opacity: 0,
                    pointerEvents: 'none',
                    translateY: '-100%',
                    translateX: '-100%',
                    scale: 0,
                  }
            }
            animate={{
              opacity: 1,
              pointerEvents: 'auto',
              translateY: 0,
              translateX: 0,
              scale: 1,
            }}
            exit={
              afterState === 'none'
                ? {
                    opacity: 0,
                    pointerEvents: 'none',
                    translateY: '100%',
                    translateX: '-100%',
                    scale: 0,
                  }
                : {
                    opacity: 0,
                    pointerEvents: 'none',
                    translateY: '-100%',
                    translateX: '-100%',
                    scale: 0,
                  }
            }
          >
            <div className='flex flex-col items-center gap-6 w-full max-w-sm m-auto'>
              <div className='aspect-square w-full rounded-2xl overflow-hidden shadow-2xl relative'>
                <img
                  src={
                    currentTrack.proxyHighResArtworkUrl ||
                    currentTrack.proxyArtworkUrl ||
                    '/static/backdrop.png'
                  }
                  alt={currentTrack.title}
                  className='w-full h-full object-cover'
                />
              </div>

              <div className='flex flex-col w-full gap-1 text-center'>
                <h2 className='text-xl font-bold truncate'>{currentTrack.title}</h2>
                <p className='text-sm text-muted-foreground truncate'>{currentTrack.author}</p>
              </div>

              {/* Controls */}
              <div className='flex items-center justify-center gap-4 w-full'>
                <Button
                  variant='ghost'
                  size='icon'
                  onClick={() => socket?.emit('previous')}
                >
                  <CaretLineLeft size={24} weight='fill' />
                </Button>
                <Button
                  size='icon'
                  className='rounded-full w-14 h-14'
                  onClick={() => {
                    if (ponaCommonState?.pona?.paused) socket?.emit('play');
                    else socket?.emit('pause');
                  }}
                >
                  {ponaCommonState?.pona?.paused ? (
                    <Play size={24} weight='fill' />
                  ) : (
                    <Pause size={24} weight='fill' />
                  )}
                </Button>
                <Button
                  variant='ghost'
                  size='icon'
                  onClick={() => socket?.emit('next')}
                >
                  <CaretLineRight size={24} weight='fill' />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default MobilePonaPlayerPanel;
