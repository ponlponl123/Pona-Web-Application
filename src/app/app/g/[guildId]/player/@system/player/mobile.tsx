'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { useAtom, useAtomValue } from 'jotai';
import {
  CaretDownIcon,
  CaretUpIcon,
  PauseIcon,
  PlayIcon,
} from '@phosphor-icons/react/dist/ssr';

import { Button } from '@/components/ui/button';
import { useSocket } from '@/contexts/ponaMusicContext';
import { useAppStore } from '@/store/coreStore';
import { playbackAtom, ponaCommonStateAtom } from '@/store/musicAtoms';
import { playerPopupAtom } from '@/store/uiAtoms';
import MobilePonaPlayerPanel from './panel/mobile';

export type MobilePonaPlayerPanelAnimationState =
  | 'none'
  | 'playerPanel'
  | 'queuePanel';

export default function MobilePonaPlayer() {
  const userSetting = useAppStore((state) => state.userSetting);
  const isMobile = useAppStore((state) => state.isMobile);

  const playback = useAtomValue(playbackAtom);
  const ponaCommonState = useAtomValue(ponaCommonStateAtom);
  const [playerPopup, setPlayerPopup] = useAtom(playerPopupAtom);
  const { socket } = useSocket();

  const [beforeState, setBeforeState] =
    useState<MobilePonaPlayerPanelAnimationState>('none');
  const [afterState, setAfterState] =
    useState<MobilePonaPlayerPanelAnimationState>('none');
  const [trackFocus, setTrackFocus] = useState<boolean>(true);

  const currentTrack = ponaCommonState?.current;

  const [sliderValue, setSliderValue] = useState<number>(playback);

  useEffect(() => {
    setSliderValue(playback);
  }, [playback]);

  useEffect(() => {
    if (!currentTrack) {
      setPlayerPopup(false);
      document.body.classList.remove('pona-player-focused');
    }
    if (!playerPopup || !currentTrack) {
      document.body.classList.remove('pona-player-focused');
    }
  }, [currentTrack, playerPopup, setPlayerPopup]);

  const maxLength = ponaCommonState?.pona.length || 100;
  const progressPercent = Math.min(100, Math.max(0, (sliderValue / maxLength) * 100));

  return (
    <AnimatePresence>
      {currentTrack && (
        <motion.div
          id='pona=player-wrapper'
          initial={{ opacity: 0, pointerEvents: 'none', translateY: 32 }}
          animate={{ opacity: 1, pointerEvents: 'auto', translateY: 0 }}
          exit={{ opacity: 0, pointerEvents: 'none', translateY: 32 }}
          className={
            `absolute overflow-hidden z-50 [html.light_&]:bg-[hsl(var(--pona-app-music-accent-color-100))] [html.dark_&]:bg-[hsl(var(--pona-app-music-accent-color-800))] apply-soft-transition ${playerPopup
              ? 'w-full h-screen rounded-none bottom-4 left-0'
              : `h-16 rounded-lg ${isMobile ? 'bottom-[5.2rem]' : 'bottom-6'} left-2 w-[calc(100%-1rem)]`
            }` + (userSetting.transparency ? ' backdrop-blur-md' : '')
          }
        >
          <div className='absolute top-0 left-0 z-0 w-full h-full [body.pona-player-focused_&]:bg-none [html.light_&]:[body.pona-player-focused_&]:bg-[hsl(var(--pona-app-music-accent-color-500))] [html.dark_&]:[body.pona-player-focused_&]:bg-[hsl(var(--pona-app-music-accent-color-900))] rounded-lg'></div>

          <div
            className={
              'absolute -top-1 z-20 left-0 w-full h-2 cursor-pointer group' +
              (playerPopup ? ' opacity-0 pointer-events-none' : '')
            }
          >
            <input
              type='range'
              min={0}
              max={maxLength}
              value={sliderValue}
              onChange={(e) => setSliderValue(Number(e.target.value))}
              onMouseUp={(e) => socket?.emit('seek', Number((e.target as HTMLInputElement).value))}
              onTouchEnd={(e) => socket?.emit('seek', Number((e.target as HTMLInputElement).value))}
              aria-label='PlayerSeekBar'
              className='absolute inset-0 w-full h-full opacity-0 cursor-pointer z-30'
            />
            <div className='w-full h-1 bg-muted/40 rounded-full overflow-hidden relative'>
              <div
                className='h-full bg-[hsl(var(--pona-app-music-accent-color-500))] transition-all duration-300'
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          <div
            id='pona-player'
            className='rounded-lg p-2 flex flex-row items-center justify-between gap-4 absolute overflow-hidden w-full h-full select-none'
          >
            <div
              className='absolute top-0 left-0 w-full h-full z-0'
              onClick={() => {
                if (playerPopup) {
                  setAfterState('none');
                  setBeforeState('queuePanel');
                  setPlayerPopup(false);
                  document.body.classList.remove('pona-player-focused');
                } else {
                  document.body.classList.add('pona-player-focused');
                  setAfterState('playerPanel');
                  setBeforeState('none');
                  setTrackFocus(true);
                  setPlayerPopup(true);
                }
              }}
              id='pona-music-panel-trigger'
            />

            <MobilePonaPlayerPanel
              trackFocus={trackFocus}
              setTrackFocus={setTrackFocus}
              beforeState={beforeState}
              setBeforeState={setBeforeState}
              afterState={afterState}
              setAfterState={setAfterState}
            />

            <Button
              variant='ghost'
              size='icon'
              className={`absolute right-4 top-4 z-30 rounded-lg ${playerPopup ? '' : 'opacity-0 pointer-events-none'
                }`}
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
              <CaretUpIcon
                className={`absolute ${playerPopup ? 'opacity-0 -translate-y-6' : ''}`}
              />
              <CaretDownIcon
                className={`absolute ${!playerPopup ? 'opacity-0 translate-y-6' : ''}`}
              />
            </Button>

            <div
              className={
                (!trackFocus && playerPopup
                  ? ' absolute w-[calc(100%-4rem)] top-4 left-4 z-20'
                  : ' w-full z-10 ' +
                  (playerPopup ? ' opacity-0 pointer-events-none' : '')) +
                ' flex flex-row justify-between items-center'
              }
            >
              <motion.div
                className='flex items-center justify-start gap-4 w-full max-w-[calc(100%-5rem)] cursor-pointer'
                animate={{
                  transition: {
                    duration: 0.2,
                    type: 'spring',
                  },
                }}
                onClick={() => {
                  if (!trackFocus && playerPopup) {
                    setAfterState('playerPanel');
                    setBeforeState('queuePanel');
                    setTrackFocus(true);
                  }
                }}
              >
                <img
                  src={
                    currentTrack
                      ? currentTrack?.proxyArtworkUrl
                      : '/static/Ponlponl123 (1459).png'
                  }
                  alt={currentTrack ? currentTrack.title : 'Thumbnail'}
                  className='object-cover h-12 w-12 rounded-lg shadow-lg'
                  loading='lazy'
                  id='pona-music-thumbnail'
                />
                <div
                  className='flex flex-col justify-center items-start'
                  style={{ width: 'calc(100% - 5.4rem)' }}
                >
                  <div className='text-xl max-w-full flex gap-2 items-center'>
                    <h1 className='text-base font-medium text-[hsl(var(--pona-app-music-accent-color-500))] w-full whitespace-nowrap overflow-hidden text-ellipsis'>
                      {currentTrack ? currentTrack.title : 'Music Name'}
                    </h1>
                    {currentTrack?.uri && (
                      <Link
                        href={currentTrack.uri}
                        className='text-xs text-[hsl(var(--pona-app-music-accent-color-500))] hover:underline'
                        target='_blank'
                      >
                        ↗
                      </Link>
                    )}
                  </div>
                  <span className='text-xs text-[hsl(var(--pona-app-music-accent-color-500))]/60 w-full whitespace-nowrap overflow-hidden text-ellipsis'>
                    {currentTrack ? currentTrack.author : 'Author'}
                  </span>
                </div>
              </motion.div>
              <div
                className={
                  'flex items-center justify-center gap-4 w-16' +
                  (!trackFocus && playerPopup ? ' absolute right-0 top-0' : '')
                }
              >
                {!ponaCommonState?.pona.paused ? (
                  <Button
                    variant='ghost'
                    size='icon'
                    className='rounded-full size-10'
                    onClick={() => {
                      socket?.emit('pause');
                    }}
                  >
                    <PauseIcon weight='fill' className='size-5' />
                  </Button>
                ) : (
                  <Button
                    variant='ghost'
                    size='icon'
                    className='rounded-full size-10'
                    onClick={() => {
                      socket?.emit('play');
                    }}
                  >
                    <PlayIcon weight='fill' className='size-5' />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

