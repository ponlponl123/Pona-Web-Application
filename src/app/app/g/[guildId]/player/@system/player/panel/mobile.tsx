'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { useAtom, useAtomValue } from 'jotai';
import {
  CaretLineLeftIcon,
  CaretLineRightIcon,
  CoffeeIcon,
  EqualizerIcon,
  HeartIcon,
  MusicNotesIcon,
  PauseIcon,
  PlayIcon,
  RepeatIcon,
  RepeatOnceIcon,
  SpeakerSimpleHighIcon,
} from '@phosphor-icons/react/dist/ssr';

import LyricsDisplay from '@/components/music/lyricsDisplay';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { useSocket } from '@/contexts/ponaMusicContext';
import { useAppStore } from '@/store/coreStore';
import { playbackAtom, ponaCommonStateAtom } from '@/store/musicAtoms';
import { playerPopupAtom } from '@/store/uiAtoms';
import { Track, UnresolvedTrack } from '@/types/ponaPlayer';
import { msToTime } from '@/lib/utils';
import { MobilePonaPlayerPanelAnimationState } from '../index';


export default function MobilePonaPlayerPanel({
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
  const [lyricsContainer, setLyricsContainer] = useState<HTMLDivElement | null>(null);

  const playingNextQueue = useMemo(() => {
    const queue = ponaCommonState?.queue;
    const currentUniqueId = currentTrack?.uniqueId;
    if (!queue) return [];
    return queue.filter((track) => track.uniqueId !== currentUniqueId);
  }, [ponaCommonState, currentTrack]);

  const [isRepeatModalOpen, setIsRepeatModalOpen] = useState(false);
  const [isEqualizerModalOpen, setIsEqualizerModalOpen] = useState(false);
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
  const progressPercent = Math.min(
    100,
    Math.max(0, (sliderValue / maxLength) * 100)
  );

  const handleSliderChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSliderValue(Number(e.target.value));
  }, []);

  const handleSeek = useCallback(
    (e: React.MouseEvent<HTMLInputElement> | React.TouchEvent<HTMLInputElement>) => {
      socket?.emit('seek', Number((e.target as HTMLInputElement).value));
    },
    [socket]
  );

  const handlePrevious = useCallback(() => socket?.emit('previous'), [socket]);
  const handlePause = useCallback(() => socket?.emit('pause'), [socket]);
  const handlePlay = useCallback(() => socket?.emit('play'), [socket]);
  const handleNext = useCallback(() => socket?.emit('next'), [socket]);
  const handleOpenEqualizer = useCallback(() => setIsEqualizerModalOpen(true), []);
  const handleOpenRepeat = useCallback(() => setIsRepeatModalOpen(true), []);

  return (
    <>
      <AnimatePresence>
        {currentTrack && playerPopup && trackFocus && (
          <motion.div
            className='absolute left-0 top-0 p-8 w-full h-full overflow-hidden pointer-events-auto flex flex-col justify-center items-center'
            id='pona=player-panel-player-focus'
            transition={{ duration: 0.12 }}
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
            <div
              className='absolute top-0 left-0 w-full h-full'
              onClick={() => {
                setAfterState('none');
                setBeforeState('playerPanel');
                setTimeout(() => {
                  setPlayerPopup(false);
                }, 100);
              }}
              id='pona-music-panel-trigger'
            />
            <div
              className='max-w-full max-h-full m-auto flex flex-col gap-4 justify-center items-center py-16 z-10'
              id='mobile-pona-player-controller'
            >
              <div className='w-[calc(100vw_-_3rem)] max-w-[48vh] aspect-square relative flex pointer-events-none'>
                <Image
                  src={
                    currentTrack
                      ? currentTrack.proxyHighResArtworkUrl ||
                      currentTrack?.proxyArtworkUrl ||
                      '/static/Ponlponl123 (1459).png'
                      : '/static/Ponlponl123 (1459).png'
                  }
                  alt={currentTrack ? currentTrack.title : 'Artwork'}
                  fill
                  unoptimized
                  className='w-full h-full object-cover rounded-2xl shadow-xl'
                  id='pona-music-artwork'
                />
              </div>
              <div
                className='w-full max-h-full flex flex-col gap-2 text-center'
                id='mobile-pona-music-player-controller-track'
              >
                <h1 className='text-3xl text-[hsl(var(--pona-app-music-accent-color-500))] w-full whitespace-nowrap overflow-hidden overflow-ellipsis font-bold'>
                  {currentTrack.title}
                </h1>
                <h1 className='text-base text-[hsl(var(--pona-app-music-accent-color-500))]/60 w-full whitespace-nowrap overflow-hidden overflow-ellipsis'>
                  {currentTrack.author}
                </h1>
                <div
                  className='my-4 relative'
                  id='mobile-pona-music-player-controller-track-slider'
                >
                  <div className='relative w-full h-3 cursor-pointer group'>
                    <input
                      type='range'
                      min={0}
                      max={maxLength}
                      value={sliderValue}
                      onChange={handleSliderChange}
                      onMouseUp={handleSeek}
                      onTouchEnd={handleSeek}
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
                  <div className='w-full flex flex-row gap-2 justify-between items-center mt-1'>
                    <span className='text-xs text-[hsl(var(--pona-app-music-accent-color-500))/0.6]'>
                      {msToTime(playback)}
                    </span>
                    <span className='text-xs text-[hsl(var(--pona-app-music-accent-color-500))/0.6]'>
                      {msToTime(ponaCommonState?.pona.length || 0)}
                    </span>
                  </div>
                </div>
                <div
                  className='w-full flex items-center justify-evenly my-4'
                  id='mobile-pona-music-player-controller-track-action'
                >
                  <Button
                    variant='ghost'
                    size='icon'
                    className='mr-auto rounded-lg'
                    onClick={handleOpenEqualizer}
                  >
                    <EqualizerIcon weight='fill' className='size-5' />
                  </Button>
                  <Button
                    variant='ghost'
                    size='icon'
                    className='rounded-full size-10'
                    onClick={handlePrevious}
                  >
                    <CaretLineLeftIcon weight='fill' className='size-5' />
                  </Button>
                  {!ponaCommonState?.pona.paused ? (
                    <Button
                      variant='ghost'
                      size='icon'
                      className='rounded-full size-14 scale-125 mx-auto'
                      onClick={handlePause}
                    >
                      <PauseIcon weight='fill' className='size-7' />
                    </Button>
                  ) : (
                    <Button
                      variant='ghost'
                      size='icon'
                      className='rounded-full size-14 scale-125 mx-auto'
                      onClick={handlePlay}
                    >
                      <PlayIcon weight='fill' className='size-7' />
                    </Button>
                  )}
                  <Button
                    variant='ghost'
                    size='icon'
                    className='rounded-full size-10'
                    onClick={handleNext}
                  >
                    <CaretLineRightIcon weight='fill' className='size-5' />
                  </Button>
                  <Button
                    variant='ghost'
                    size='icon'
                    className='ml-auto rounded-lg'
                    onClick={handleOpenRepeat}
                  >
                    <RepeatIcon weight='fill' className='size-5' />
                  </Button>
                </div>
              </div>
            </div>
            <Button
              variant='ghost'
              className='absolute bottom-8 left-8 w-[calc(100%_-_4rem)] rounded-full z-20'
              onClick={() => setTrackFocus(false)}
            >
              {language.data.app.guilds.player.tabs.open_queue}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      <Dialog open={isRepeatModalOpen} onOpenChange={setIsRepeatModalOpen}>
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle>
              {language.data.app.guilds.player.repeat.title}
            </DialogTitle>
          </DialogHeader>
          <div className='flex flex-col gap-2 py-4'>
            <Button
              variant={
                !ponaCommonState?.pona.repeat.track &&
                  !ponaCommonState?.pona.repeat.queue
                  ? 'default'
                  : 'outline'
              }
              className='justify-start'
              onClick={() => {
                socket?.emit('repeat', 'none');
                setIsRepeatModalOpen(false);
              }}
            >
              <MusicNotesIcon className='size-4 mr-2' />
              {language.data.app.guilds.player.repeat.off}
            </Button>
            <Button
              variant={ponaCommonState?.pona.repeat.track ? 'default' : 'outline'}
              className='justify-start'
              onClick={() => {
                socket?.emit('repeat', 'track');
                setIsRepeatModalOpen(false);
              }}
            >
              <RepeatOnceIcon className='size-4 mr-2' />
              {language.data.app.guilds.player.repeat.track}
            </Button>
            <Button
              variant={ponaCommonState?.pona.repeat.queue ? 'default' : 'outline'}
              className='justify-start'
              onClick={() => {
                socket?.emit('repeat', 'queue');
                setIsRepeatModalOpen(false);
              }}
            >
              <RepeatIcon className='size-4 mr-2' />
              {language.data.app.guilds.player.repeat.queue}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isEqualizerModalOpen} onOpenChange={setIsEqualizerModalOpen}>
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle>
              {language.data.app.guilds.player.equalizer.title}
            </DialogTitle>
          </DialogHeader>
          <div className='py-6 text-center text-muted-foreground'>
            {language.data.extensions.comingsoon}
          </div>
        </DialogContent>
      </Dialog>

      <AnimatePresence>
        {currentTrack && playerPopup && !trackFocus && (
          <motion.div
            className='absolute left-0 top-0 p-8 w-full h-full overflow-hidden pointer-events-auto'
            id='pona=player-panel-queue-focus'
            transition={{ duration: 0.12 }}
            initial={{ opacity: 0, pointerEvents: 'none', translateY: 96 }}
            animate={{ opacity: 1, pointerEvents: 'auto', translateY: 0 }}
            exit={{ opacity: 0, pointerEvents: 'none', translateY: 64 }}
          >
            <div
              className='absolute top-0 left-0 w-full h-full'
              onClick={() => {
                setTrackFocus(true);
                setAfterState('playerPanel');
                setBeforeState('queuePanel');
              }}
              id='pona-music-panel-trigger'
            />
            <div className='w-full h-full flex gap-12 justify-evenly items-center pt-16'>
              <div className='w-full h-full' id='pona-music-queue'>
                <Tabs defaultValue='next' className='w-full h-full flex flex-col'>
                  <TabsList className='w-full justify-start border-b rounded-none bg-transparent p-0 gap-4'>
                    <TabsTrigger
                      value='next'
                      className='rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent'
                    >
                      {language.data.app.guilds.player.tabs.next}
                    </TabsTrigger>
                    <TabsTrigger
                      value='lyrics'
                      disabled={
                        !(
                          currentTrack.lyrics &&
                          currentTrack.lyrics.lyrics?.length > 0
                        )
                      }
                      className='rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent'
                    >
                      {language.data.app.guilds.player.tabs.lyrics}
                    </TabsTrigger>
                    <TabsTrigger
                      value='related'
                      className='rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent'
                    >
                      {language.data.app.guilds.player.tabs.related}
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent
                    value='next'
                    className='flex-1 overflow-y-auto pt-4 pb-4 pr-2 scrollbar-hide'
                  >
                    <div className='flex flex-col gap-3'>
                      {ponaCommonState.current && (
                        <div className='flex flex-col gap-1.5'>
                          <span className='text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2'>
                            Now Playing
                          </span>
                          <div
                            className='w-full py-2 px-2.5 flex gap-4 items-center rounded-3xl hover:bg-foreground/5 group [.light_&]:bg-[hsl(var(--pona-app-music-accent-color-100))] [.dark_&]:bg-[hsl(var(--pona-app-music-accent-color-800))] active'
                          >
                            <div className='w-11 h-11 select-none relative overflow-hidden rounded-2xl'>
                              <Image
                                src={ponaCommonState.current?.proxyArtworkUrl || '/static/Ponlponl123 (1459).png'}
                                alt={ponaCommonState.current.title}
                                height={44}
                                width={44}
                                unoptimized
                                className={
                                  'object-cover rounded-lg z-0 ' +
                                  (!ponaCommonState.pona.paused
                                    ? 'brightness-50 saturate-0'
                                    : 'group-hover:brightness-75 transition-all')
                                }
                              />
                              <div
                                className={
                                  'absolute top-0 left-0 w-full h-full bg-background/35 z-[5] ' +
                                  (!ponaCommonState.pona.paused
                                    ? 'opacity-100'
                                    : 'group-hover:opacity-100 opacity-0')
                                }
                              />
                              {!ponaCommonState.pona.paused ? (
                                <Button
                                  variant='ghost'
                                  size='icon'
                                  className='absolute z-10 top-0 left-0 w-full h-full opacity-100'
                                  onClick={() => socket?.emit('pause')}
                                >
                                  <SpeakerSimpleHighIcon
                                    className='text-white size-5'
                                    weight='fill'
                                  />
                                </Button>
                              ) : (
                                <Button
                                  variant='ghost'
                                  size='icon'
                                  className='absolute z-10 top-0 left-0 w-full h-full group-hover:opacity-100 opacity-0'
                                  onClick={() => socket?.emit('play')}
                                >
                                  <PlayIcon
                                    className='text-white size-5'
                                    weight='fill'
                                  />
                                </Button>
                              )}
                            </div>
                            <div className='w-[calc(100%_-_10rem)]'>
                              <h1 className='w-full text-[hsl(var(--pona-app-music-accent-color-500))] truncate font-medium'>
                                {ponaCommonState.current.title}
                              </h1>
                              <span className='w-full text-xs text-foreground/60 truncate block'>
                                {ponaCommonState.current.author} (
                                {ponaCommonState.current.requester?.displayName ||
                                  '@' + ponaCommonState.current.requester?.username}
                                )
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      {playingNextQueue.length > 0 && (
                        <div className='flex flex-col gap-1.5 mt-2'>
                          <span className='text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2'>
                            Playing Next
                          </span>
                          {playingNextQueue.map((track: Track | UnresolvedTrack, targetIdx: number) => {
                            return (
                              <div
                                className='w-full py-2 px-2.5 flex gap-4 items-center rounded-3xl hover:bg-foreground/5 group'
                                key={track.uniqueId || targetIdx}
                              >
                                <div className='w-11 h-11 select-none relative overflow-hidden rounded-2xl'>
                                  <Image
                                    src={
                                      track?.proxyArtworkUrl ||
                                      track?.artworkUrl ||
                                      (track?.identifier
                                        ? `/api/proxy/watch?v=${track.identifier}&s=md`
                                        : '/static/Ponlponl123 (1459).png')
                                    }
                                    alt={track.title}
                                    height={44}
                                    width={44}
                                    unoptimized
                                    className='object-cover rounded-lg z-0 group-hover:brightness-75 transition-all'
                                  />
                                  <div className='absolute top-0 left-0 w-full h-full bg-background/35 z-[5] group-hover:opacity-100 opacity-0' />
                                  <Button
                                    variant='ghost'
                                    size='icon'
                                    className='absolute z-10 top-0 left-0 w-full h-full group-hover:opacity-100 opacity-0'
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      socket?.emit('skipto', targetIdx);
                                    }}
                                  >
                                    <PlayIcon
                                      className='text-white size-5'
                                      weight='fill'
                                    />
                                  </Button>
                                </div>
                            <div className='w-[calc(100%_-_10rem)]'>
                              <h1 className='w-full [div.active_&]:text-[hsl(var(--pona-app-music-accent-color-500))] truncate font-medium'>
                                {track.title}
                              </h1>
                              <span className='w-full text-xs text-foreground/60 truncate block'>
                                {track.author} (
                                {track.requester?.displayName ||
                                  '@' + track.requester?.username}
                                )
                              </span>
                            </div>
                            <div className='ml-auto relative w-12 h-12 flex items-center justify-center'>
                              <span className='text-xs text-muted-foreground'>
                                {msToTime(track.duration || 0)}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                        </div>
                      )}
                    </div>
                  </TabsContent>
                  <TabsContent
                    value='lyrics'
                    className='flex-1 overflow-y-auto pt-4 pr-2 scrollbar-hide'
                    ref={setLyricsContainer}
                  >
                    {lyricsContainer &&
                      (currentTrack.lyrics?.isTimestamp ? (
                        <LyricsDisplay
                          playerPosition={playback}
                          currentTrack={currentTrack as Track}
                          lyricsProvider={lyricsContainer}
                        />
                      ) : (
                        currentTrack.lyrics?.lyrics &&
                        currentTrack.lyrics.lyrics.length > 0 &&
                        (currentTrack.lyrics.lyrics as string[]).map(
                          (lyric, index) => (
                            <div key={index} className='flex items-center gap-2'>
                              <span className='text-2xl my-6 text-[hsl(var(--pona-app-music-accent-color-500))] font-medium'>
                                {lyric}
                              </span>
                            </div>
                          )
                        )
                      ))}
                  </TabsContent>
                  <TabsContent
                    value='related'
                    className='flex-1 overflow-y-auto pt-4 pr-2 scrollbar-hide'
                  >
                    <div className='flex flex-col gap-4 items-center justify-center w-full h-full py-12'>
                      <CoffeeIcon
                        size={56}
                        weight='fill'
                        className='text-[hsl(var(--pona-app-music-accent-color-500))]'
                      />
                      <h1 className='text-2xl max-w-screen-md text-center text-[hsl(var(--pona-app-music-accent-color-500))/0.64]'>
                        {language.data.app.guilds.player.dev}
                      </h1>
                      <Link href='/app/updates'>
                        <Button
                          variant='secondary'
                          className='mt-2 bg-[hsl(var(--pona-app-music-accent-color-500))] rounded-full text-white'
                          onClick={() => router.push('/app/updates')}
                        >
                          <HeartIcon weight='fill' className='size-4 mr-2' />
                          {language.data.app.updates.follow}
                        </Button>
                      </Link>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

