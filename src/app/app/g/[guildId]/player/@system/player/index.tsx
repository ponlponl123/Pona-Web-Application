'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { useAtom, useAtomValue } from 'jotai';
import { CaretDownIcon, CaretUpIcon } from '@phosphor-icons/react/dist/ssr';

import { Button } from '@/components/ui/button';
import { useSocket } from '@/contexts/ponaMusicContext';
import { useAppStore } from '@/store/coreStore';
import { playbackAtom, ponaCommonStateAtom } from '@/store/musicAtoms';
import { playerPopupAtom } from '@/store/uiAtoms';

import { PlayerSeekBar } from './components/seekBar';
import { PlayerTrackInfo } from './components/trackInfo';
import { PlayerControls } from './components/controls';
import { PlayerActions } from './components/actions';
import MobilePonaPlayerPanel from './panel/mobile';
import { cn } from '@/lib/utils';

export type MobilePonaPlayerPanelAnimationState =
  | 'none'
  | 'playerPanel'
  | 'queuePanel';

export { PlayerSeekBar, PlayerTrackInfo, PlayerControls, PlayerActions };

export default function PonaPlayer({ isMobileOverride }: { isMobileOverride?: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchParamsString = searchParams ? searchParams.toString() : '';
  const language = useAppStore((state) => state.language);
  const userSetting = useAppStore((state) => state.userSetting);
  const isMobileStore = useAppStore((state) => state.isMobile);

  const ponaCommonState = useAtomValue(ponaCommonStateAtom);
  const playback = useAtomValue(playbackAtom);
  const [playerPopup, setPlayerPopup] = useAtom(playerPopupAtom);
  const { socket } = useSocket();

  const isMobile = isMobileOverride ?? isMobileStore;
  const currentTrack = ponaCommonState?.current;

  const [sliderValue, setSliderValue] = useState<number>(playback);
  const [beforeState, setBeforeState] = useState<'none' | 'playerPanel' | 'queuePanel'>('none');
  const [afterState, setAfterState] = useState<'none' | 'playerPanel' | 'queuePanel'>('none');
  const [trackFocus, setTrackFocus] = useState<boolean>(true);

  useEffect(() => {
    setSliderValue(playback);
  }, [playback]);

  useEffect(() => {
    setPlayerPopup(false);
    document.body.classList.remove('pona-player-focused');
  }, [pathname, setPlayerPopup, searchParamsString]);

  useEffect(() => {
    if (!currentTrack) {
      setPlayerPopup(false);
      document.body.classList.remove('pona-player-focused');
    }
    if (!playerPopup || !currentTrack) {
      document.body.classList.remove('pona-player-focused');
    }
  }, [currentTrack, playerPopup, (setPlayerPopup || "")]);

  const handleSeek = useCallback(
    (val: number) => {
      socket?.emit('seek', val);
    },
    [socket]
  );

  const maxLength = ponaCommonState?.pona.length || 100;
  const isPaused = Boolean(ponaCommonState?.pona.paused);

  const handleTogglePanel = useCallback(
    (e?: React.MouseEvent) => {
      if (e) {
        const target = e.target as HTMLElement;
        if (target.closest('a') || target.closest('button') || target.closest('[role="slider"]')) return;
        e.stopPropagation();
      }
      setPlayerPopup((value) => {
        if (!value) {
          document.body.classList.add('pona-player-focused');
          if (isMobile) {
            setAfterState('playerPanel');
            setBeforeState('none');
            setTrackFocus(true);
          }
        } else {
          document.body.classList.remove('pona-player-focused');
          if (isMobile) {
            setAfterState('none');
            setBeforeState('queuePanel');
          }
        }
        return !value;
      });
    },
    [isMobile, setPlayerPopup]
  );

  const artworkUrl = (currentTrack?.proxyThumbnail
    ? currentTrack.proxyArtworkUrl
    : currentTrack?.thumbnail) || '/static/Ponlponl123 (1459).png';

  if (isMobile) {
    return (
      <AnimatePresence initial={false}>
        {currentTrack && (
          <motion.div
            id='pona-player-wrapper'
            initial={{ opacity: 0, pointerEvents: 'none', translateY: 32 }}
            animate={{ opacity: 1, pointerEvents: 'auto', translateY: 0 }}
            exit={{ opacity: 0, pointerEvents: 'none', translateY: 32 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className={
              cn(
                `absolute overflow-hidden z-50 transform-gpu [html.light_&]:bg-[hsl(var(--pona-app-music-accent-color-100))] [html.dark_&]:bg-[hsl(var(--pona-app-music-accent-color-900))] apply-soft-transition disable-default-transition`,
                userSetting.transparency ? ' backdrop-blur-md' : '',
                playerPopup ?
                  'w-full h-screen rounded-none bottom-4 left-0' : `h-16 rounded-lg ${isMobileStore ? 'bottom-[5.2rem]' : 'bottom-6'} left-2 w-[calc(100%-1rem)]`
              )
            }
          >
            <div className='absolute top-0 left-0 w-full h-full z-0 [body.pona-player-focused_&]:bg-none [html.light_&]:[body.pona-player-focused_&]:bg-[hsl(var(--pona-app-music-accent-color-500))] [html.dark_&]:[body.pona-player-focused_&]:bg-[hsl(var(--pona-app-music-accent-color-900))] rounded-lg' />

            <PlayerSeekBar
              sliderValue={sliderValue}
              maxLength={maxLength}
              setSliderValue={setSliderValue}
              onSeek={handleSeek}
              className={'absolute -top-1 z-20 left-0 w-full h-2 cursor-pointer group' + (playerPopup ? ' opacity-0 pointer-events-none' : '')}
            />

            <div
              id='pona-player'
              onClick={handleTogglePanel}
              className='rounded-lg p-2 flex flex-row items-center justify-between gap-4 absolute overflow-hidden w-full h-full select-none cursor-pointer'
            >
              <div
                className='absolute top-0 left-0 w-full h-full z-0 cursor-pointer'
                onClick={handleTogglePanel}
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
                className={`absolute right-4 top-4 z-30 rounded-lg ${playerPopup ? '' : 'opacity-0 pointer-events-none'}`}
                onClick={(e) => {
                  e.stopPropagation();
                  if (trackFocus) {
                    document.body.classList.remove('pona-player-focused');
                    setAfterState('none');
                    setBeforeState('playerPanel');
                    setTimeout(() => setPlayerPopup(false), 100);
                  } else {
                    setAfterState('playerPanel');
                    setBeforeState('queuePanel');
                    setTrackFocus(true);
                  }
                }}
              >
                <CaretUpIcon className={`absolute ${playerPopup ? 'opacity-0 -translate-y-6' : ''}`} />
                <CaretDownIcon className={`absolute ${!playerPopup ? 'opacity-0 translate-y-6' : ''}`} />
              </Button>

              <div
                className={
                  (!trackFocus && playerPopup
                    ? ' absolute w-[calc(100%-4rem)] top-4 left-4 z-20'
                    : ' w-full z-10 ' + (playerPopup ? ' opacity-0 pointer-events-none' : '')) +
                  ' flex flex-row justify-between items-center'
                }
              >
                <PlayerTrackInfo
                  currentTrack={currentTrack}
                  router={router}
                  language={language}
                  isMobile
                  onTogglePanel={handleTogglePanel}
                />
                <div onClick={(e) => e.stopPropagation()}>
                  <PlayerControls
                    socket={socket}
                    language={language}
                    isPaused={isPaused}
                    playback={playback}
                    maxLength={maxLength}
                    isMobile
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence initial={false}>
      {currentTrack && (
        <motion.div
          id='pona-player-wrapper'
          initial={{ opacity: 0, pointerEvents: 'none', translateY: 32 }}
          animate={{ opacity: 1, pointerEvents: 'auto', translateY: 0 }}
          exit={{ opacity: 0, pointerEvents: 'none', translateY: 32 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          className={
            cn(
              (userSetting.dev_pona_player_style === 'modern'
                ? `absolute max-md:overflow-hidden h-[4.8rem] z-50 max-lg:h-16 max-md:bottom-6 bottom-2 left-2 rounded-lg transform-gpu`
                : `absolute max-md:overflow-hidden h-[5.6rem] z-50 max-lg:h-16 max-md:bottom-6 bottom-2 left-2 rounded-lg transform-gpu`) +
              (userSetting.transparency
                ? ' in-[.dark]:bg-[hsl(var(--pona-app-music-accent-color-800)/.32)] backdrop-blur-2xl in-[.light]:bg-[hsl(var(--pona-app-music-accent-color-100)/.86)]'
                : ' in-[.dark]:bg-[hsl(var(--pona-app-music-accent-color-800))] in-[.light]:bg-[hsl(var(--pona-app-music-accent-color-100))]'),
              "w-[calc(100%-1rem)] disable-default-transition"
            )
          }
        >
          <div className='absolute top-0 left-0 w-full h-full z-0 overflow-hidden pointer-events-none rounded-lg [body.pona-player-focused_&]:opacity-0 opacity-20'>
            <Image
              src={`/api/proxy/image?r=${encodeURIComponent(
                artworkUrl
              )}&s=512&blur=32&saturation=96&contrast=12`}
              alt={currentTrack ? currentTrack.title : 'Thumbnail'}
              fill
              unoptimized
              className='object-cover w-full h-full pointer-events-none saturate-200 brightness-100 transform-gpu'
            />
          </div>
          <div className={cn(
            'absolute top-0 left-0 w-full h-full z-0 rounded-lg',
            '[body.pona-player-focused_&]:bg-none',
            'in-[.light]:[body.pona-player-focused_&]:bg-[hsl(var(--pona-app-music-accent-color-500)/.1)]',
            'in-[.dark]:[body.pona-player-focused_&]:bg-[hsl(var(--pona-app-music-accent-color-900)/.4)]'
          )} />

          <PlayerSeekBar
            sliderValue={sliderValue}
            maxLength={maxLength}
            setSliderValue={setSliderValue}
            onSeek={handleSeek}
            className={
              userSetting.dev_pona_player_style === 'modern'
                ? 'absolute -top-2 left-2 z-20 w-[calc(100%-1rem)] h-3 group'
                : 'absolute top-2.5 left-24 z-20 max-lg:top-1.5 max-lg:left-18.5 w-[calc(100%-7.2rem)] max-lg:w-[calc(100%-5rem)] max-md:max-w-none max-md:w-full max-md:left-0 h-3 group'
            }
          />

          <div
            id='pona-player'
            onClick={handleTogglePanel}
            className={cn(
              'rounded-lg max-md:p-2 p-2 max-lg:p-1 flex flex-row items-center justify-between gap-4 overflow-hidden w-full h-full select-none',
              userSetting.dev_pona_player_style === 'modern' ? '' : 'pt-4 max-lg:pt-3.5'
            )}
          >
            <div
              className='absolute top-0 left-0 w-full h-full z-0'
              onClick={handleTogglePanel}
              id='pona-music-panel-trigger'
            />

            <PlayerTrackInfo
              currentTrack={currentTrack}
              router={router}
              language={language}
              onTogglePanel={handleTogglePanel}
            />

            <div onClick={(e) => e.stopPropagation()} className='lg:w-1/3'>
              <PlayerControls
                socket={socket}
                language={language}
                isPaused={isPaused}
                playback={playback}
                maxLength={maxLength}
              />
            </div>

            <div onClick={(e) => e.stopPropagation()} className='lg:w-1/3'>
              <PlayerActions
                socket={socket}
                language={language}
                playerPopup={playerPopup}
                setPlayerPopup={setPlayerPopup}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Backward compatibility exports for existing import sites
export { PonaPlayer as DesktopPonaPlayer, PonaPlayer as MobilePonaPlayer };
