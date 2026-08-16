'use client';

import Image from 'next/image';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { AnimatePresence, motion, useMotionValue, useMotionValueEvent, useTransform, animate } from 'framer-motion';
import { useAtom, useAtomValue } from 'jotai';
import { useMediaQuery } from 'react-responsive';

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
  const isSmallScreen = useMediaQuery({ maxWidth: 768 });

  const ponaCommonState = useAtomValue(ponaCommonStateAtom);
  const playback = useAtomValue(playbackAtom);
  const [playerPopup, setPlayerPopup] = useAtom(playerPopupAtom);
  const { socket } = useSocket();

  const isMobile = isMobileOverride ?? (isMobileStore || isSmallScreen);
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
  }, [currentTrack, playerPopup, setPlayerPopup]);

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

  const [viewportH, setViewportH] = useState(800);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    setViewportH(window.innerHeight);
    const onResize = () => setViewportH(window.innerHeight);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const dragProgress = useMotionValue(0);

  useEffect(() => {
    animate(dragProgress, playerPopup ? 1 : 0, {
      type: 'spring',
      stiffness: 340,
      damping: 32,
      restDelta: 0.005,
    });
  }, [playerPopup, dragProgress]);

  const cardH = useTransform(dragProgress, [0, 1], [64, viewportH]);
  const cardRadius = useTransform(dragProgress, [0, 1], [8, 0]);
  const cardLeft = useTransform(dragProgress, [0, 1], [8, 0]);
  const cardRight = useTransform(dragProgress, [0, 1], [8, 0]);
  const cardBottom = useTransform(dragProgress, [0, 1], [isMobileStore ? 83.2 : 152, 80]);
  const backdropOpacity = useTransform(dragProgress, [0.05, 0.8], [0, 1]);
  const backdropVisibility = useTransform(dragProgress, (v) => (v < 0.05 ? 'hidden' : 'visible'));
  const seekBarOpacity = useTransform(dragProgress, [0, 0.25], [1, 0]);
  const seekBarVisibility = useTransform(dragProgress, (v) => (v > 0.3 ? 'hidden' : 'visible'));
  const handleOpacity = useTransform(dragProgress, [0.5, 1], [0, 1]);

  const headerElRef = useRef<HTMLElement | null>(null);
  const navElRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    return () => {
      if (headerElRef.current) headerElRef.current.style.removeProperty('--player-drag-prog');
      if (navElRef.current) navElRef.current.style.removeProperty('--player-drag-prog');
    };
  }, []);

  useMotionValueEvent(dragProgress, 'change', (latest) => {
    if (!headerElRef.current) headerElRef.current = document.querySelector<HTMLElement>('.pona-header');
    if (!navElRef.current) navElRef.current = document.querySelector<HTMLElement>('#pona-player-nav');
    const progStr = latest.toString();
    if (headerElRef.current) headerElRef.current.style.setProperty('--player-drag-prog', progStr);
    if (navElRef.current) navElRef.current.style.setProperty('--player-drag-prog', progStr);
  });

  const handleDismissPanel = useCallback(() => {
    animate(dragProgress, 0, { type: 'spring', stiffness: 340, damping: 32, restDelta: 0.005 });
    document.body.classList.remove('pona-player-focused');
    setAfterState('none');
    setBeforeState(trackFocus ? 'playerPanel' : 'queuePanel');
    setTimeout(() => setPlayerPopup(false), 80);
  }, [dragProgress, trackFocus, setPlayerPopup, setAfterState, setBeforeState]);

  const handleMobileDrag = useCallback((_: unknown, info: { offset: { y: number } }) => {
    if (!playerPopup) {
      dragProgress.set(Math.min(1, Math.max(0, -info.offset.y) / 220));
    } else {
      dragProgress.set(Math.max(0, 1 - Math.max(0, info.offset.y) / 220));
    }
  }, [playerPopup, dragProgress]);

  const handleMobileDragEnd = useCallback((_: unknown, info: { offset: { y: number }; velocity: { y: number } }) => {
    const toExpand = !playerPopup
      ? info.offset.y < -35 || info.velocity.y < -250
      : !(info.offset.y > 45 || info.velocity.y > 250);

    if (toExpand && !playerPopup) {
      document.body.classList.add('pona-player-focused');
      setAfterState('playerPanel');
      setBeforeState('none');
      setTrackFocus(true);
      setPlayerPopup(true);
    } else if (!toExpand && playerPopup) {
      handleDismissPanel();
    } else {
      animate(dragProgress, playerPopup ? 1 : 0, { type: 'spring', stiffness: 340, damping: 32, restDelta: 0.005 });
    }
  }, [playerPopup, dragProgress, setPlayerPopup, setAfterState, setBeforeState, setTrackFocus, handleDismissPanel]);

  const artworkUrl = (currentTrack?.proxyThumbnail
    ? currentTrack.proxyArtworkUrl
    : currentTrack?.thumbnail) || '/static/Ponlponl123 (1459).png';

  if (isMobile) {
    return (
      <AnimatePresence initial={false}>
        {currentTrack && (
          <motion.div
            id='pona-player-wrapper'
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 32 }}
            transition={{ type: 'spring', stiffness: 380, damping: 32 }}
            drag={playerPopup && !trackFocus ? false : 'y'}
            dragDirectionLock
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0}
            onDrag={handleMobileDrag}
            onDragEnd={handleMobileDragEnd}
            style={{
              position: 'absolute',
              height: cardH,
              borderRadius: cardRadius,
              bottom: cardBottom,
              left: cardLeft,
              right: cardRight,
              zIndex: 50,
              overflow: 'hidden',
              willChange: 'height, bottom, left, right, border-radius',
            }}
            className={cn(
              'transform-gpu bg-default backface-hidden',
            )}
          >
            <motion.div
              style={{ opacity: dragProgress }}
              className="absolute inset-0 z-0 bg-black pointer-events-none"
            />

            <motion.div
              style={{
                opacity: backdropOpacity,
                visibility: backdropVisibility,
              }}
              className="absolute inset-0 z-0 pointer-events-none overflow-hidden"
            >
              <Image
                src={`/api/proxy/image?r=${encodeURIComponent(
                  currentTrack?.proxyArtworkUrl || '/static/Ponlponl123 (1459).png'
                )}&s=512&blur=24&saturation=96&contrast=16&brightness=24`}
                alt={currentTrack ? currentTrack.title : 'Artwork'}
                fill
                unoptimized
                className="h-full w-full object-cover opacity-40"
                id="pona-music-artwork"
              />
              <div className="absolute inset-0 bg-linear-to-b from-transparent via-transparent to-black" />
            </motion.div>

            <motion.div
              style={{
                opacity: seekBarOpacity,
                visibility: seekBarVisibility,
                pointerEvents: playerPopup ? 'none' : 'auto',
              }}
              className='absolute bottom-0 z-20 left-0 w-full'
              onClick={(e) => e.stopPropagation()}
            >
              <PlayerSeekBar
                sliderValue={sliderValue}
                maxLength={maxLength}
                setSliderValue={setSliderValue}
                onSeek={handleSeek}
                isMobile
                className='w-full h-0.5 cursor-pointer group'
              />
            </motion.div>

            <MobilePonaPlayerPanel
              trackFocus={trackFocus}
              setTrackFocus={setTrackFocus}
              beforeState={beforeState}
              setBeforeState={setBeforeState}
              afterState={afterState}
              setAfterState={setAfterState}
              dragProgress={dragProgress}
              onTogglePanel={handleTogglePanel}
              onDismissPanel={handleDismissPanel}
            />
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
