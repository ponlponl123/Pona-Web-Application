'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { useAtom, useAtomValue } from 'jotai';
import { toast } from 'sonner';
import {
  CaretDownIcon,
  CaretLineLeftIcon,
  CaretLineRightIcon,
  CaretUpIcon,
  EqualizerIcon,
  InfoIcon,
  MusicNotesIcon,
  PauseIcon,
  PlayIcon,
  RepeatIcon,
  RepeatOnceIcon,
  SpeakerSimpleHighIcon,
} from '@phosphor-icons/react/dist/ssr';

import { combineArtistName } from '@/components/music/searchResult/track';
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

import { useSocket } from '@/contexts/ponaMusicContext';
import { useAppStore } from '@/store/coreStore';
import { playbackAtom, ponaCommonStateAtom } from '@/store/musicAtoms';
import { playerPopupAtom } from '@/store/uiAtoms';
import { msToTime } from '@/lib/utils';

export default function DesktopPonaPlayer() {
  const router = useRouter();
  const language = useAppStore((state) => state.language);
  const userSetting = useAppStore((state) => state.userSetting);

  const ponaCommonState = useAtomValue(ponaCommonStateAtom);
  const playback = useAtomValue(playbackAtom);
  const [playerPopup, setPlayerPopup] = useAtom(playerPopupAtom);
  const { socket } = useSocket();

  const currentTrack = ponaCommonState?.current;
  const isLoopTrack = ponaCommonState?.pona.repeat.track;
  const isLoopQueue = ponaCommonState?.pona.repeat.queue;

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
          <div className='absolute top-0 left-0 z-0 w-full h-full [body.pona-player-focused_&]:bg-none [html.light_&]:[body.pona-player-focused_&]:bg-[hsl(var(--pona-app-music-accent-color-500))] [html.dark_&]:[body.pona-player-focused_&]:bg-[hsl(var(--pona-app-music-accent-color-900))] max-md:rounded-lg rounded-3xl' />

          {/* Seekbar */}
          <div
            className={
              userSetting.dev_pona_player_style === 'modern'
                ? 'absolute -top-3 left-2 z-20 w-[calc(100%_-_1rem)] h-3 cursor-pointer group'
                : 'absolute top-0 left-24 z-20 max-lg:-top-2.5 max-lg:left-2 w-[calc(100%_-_7rem)] max-lg:w-[calc(100%_-_1rem)] max-md:max-w-none max-md:w-full max-md:left-0 h-3 cursor-pointer group'
            }
          >
            <input
              type='range'
              min={0}
              max={maxLength}
              value={sliderValue}
              onChange={(e) => setSliderValue(Number(e.target.value))}
              onMouseUp={(e) =>
                socket?.emit('seek', Number((e.target as HTMLInputElement).value))
              }
              onTouchEnd={(e) =>
                socket?.emit('seek', Number((e.target as HTMLInputElement).value))
              }
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
            className='rounded-3xl max-md:rounded-lg max-md:p-2 p-2 max-lg:p-1 flex flex-row items-center justify-between gap-4 absolute overflow-hidden w-full h-full select-none'
          >
            <div
              className='absolute top-0 left-0 w-full h-full z-0'
              onClick={() => {
                setPlayerPopup((value) => {
                  if (!value)
                    document.body.classList.add('pona-player-focused');
                  else document.body.classList.remove('pona-player-focused');
                  return !value;
                });
              }}
              id='pona-music-panel-trigger'
            />

            <motion.div className='flex items-center justify-start gap-4 w-full -ml-4 max-lg:max-w-[calc(50%_-_2.4rem)] max-md:max-w-[calc(100%_-_4rem)] max-w-[calc(33.33%_-_1rem)] z-10'>
              <img
                src={
                  currentTrack
                    ? currentTrack?.proxyArtworkUrl
                    : '/static/Ponlponl123 (1459).png'
                }
                alt={currentTrack ? currentTrack.title : 'Thumbnail'}
                className={
                  userSetting.dev_pona_player_style === 'modern'
                    ? 'w-[3.6rem] h-[3.6rem] object-cover max-lg:h-12 max-lg:w-12 rounded-xl shadow-lg'
                    : 'w-[4.4rem] h-[4.4rem] object-cover max-lg:h-12 max-lg:w-12 rounded-xl shadow-lg'
                }
                loading='lazy'
                id='pona-music-thumbnail'
              />
              <div
                className='flex flex-col justify-center items-start'
                style={{ width: 'calc(100% - 5.4rem)' }}
              >
                <div className='text-xl max-w-full flex gap-2 items-center'>
                  <h1 className='text-xl max-lg:text-base font-medium text-[hsl(var(--pona-app-music-accent-color-500))] w-full whitespace-nowrap overflow-hidden overflow-ellipsis'>
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
                <div className='w-full flex flex-row gap-1 items-center justify-start'>
                  {currentTrack?.artist ? (
                    <div className='text-sm max-lg:text-xs text-[hsl(var(--pona-app-music-accent-color-500))]/60 max-w-[calc(100%_-_1rem)] whitespace-nowrap overflow-hidden overflow-ellipsis'>
                      {combineArtistName(currentTrack?.artist, true, router, {
                        className:
                          'text-sm max-lg:text-xs text-[hsl(var(--pona-app-music-accent-color-500))]/60',
                      })}
                    </div>
                  ) : (
                    <span className='text-sm max-lg:text-xs text-[hsl(var(--pona-app-music-accent-color-500))]/60 max-w-[calc(100%_-_1rem)] whitespace-nowrap overflow-hidden overflow-ellipsis'>
                      {currentTrack?.author}
                    </span>
                  )}
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <div className='relative group w-3 opacity-60 cursor-pointer'>
                          <InfoIcon
                            size={12}
                            className='text-[hsl(var(--pona-app-music-accent-color-500))]'
                          />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        {`${language.data.app.guilds.player.request_by} ${currentTrack.requester?.displayName ||
                          '@' + currentTrack.requester?.username
                          }`}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            </motion.div>

            {/* Controls */}
            <div className='flex items-center justify-center gap-4 w-full max-lg:max-w-[calc(50%_-_3rem)] max-md:max-w-[3rem] max-w-[calc(33.33%_-_1rem)] z-10'>
              <span className='w-16 text-center max-lg:hidden text-[hsl(var(--pona-app-music-accent-color-500))] text-sm font-medium'>
                {msToTime(playback)}
              </span>
              <Button
                variant='ghost'
                size='icon'
                className='rounded-full size-10 scale-110 max-lg:scale-100 max-md:hidden'
                onClick={() => {
                  toast.promise(
                    new Promise<void>((resolve, reject) => {
                      socket?.emit('previous', (error: unknown) => {
                        if (
                          error &&
                          (error as { status?: string }).status !== 'ok'
                        ) {
                          reject(error);
                        } else {
                          resolve();
                        }
                      });
                    }),
                    {
                      loading:
                        language.data.app.guilds.player.toast.previous.loading,
                      success:
                        language.data.app.guilds.player.toast.previous.success,
                      error:
                        language.data.app.guilds.player.toast.previous.error,
                    }
                  );
                }}
              >
                <CaretLineLeftIcon weight='fill' className='size-5' />
              </Button>
              {!ponaCommonState?.pona.paused ? (
                <Button
                  variant='ghost'
                  size='icon'
                  className='rounded-full size-12 scale-125 max-lg:scale-100'
                  onClick={() => {
                    toast.promise(
                      new Promise<void>((resolve, reject) => {
                        socket?.emit('pause', (error: unknown) => {
                          if (
                            error &&
                            (error as { status?: string }).status !== 'ok'
                          ) {
                            reject(error);
                          } else {
                            resolve();
                          }
                        });
                      }),
                      {
                        loading:
                          language.data.app.guilds.player.toast.pause.loading,
                        success:
                          language.data.app.guilds.player.toast.pause.success,
                        error:
                          language.data.app.guilds.player.toast.pause.error,
                      }
                    );
                  }}
                >
                  <PauseIcon weight='fill' className='size-6' />
                </Button>
              ) : (
                <Button
                  variant='ghost'
                  size='icon'
                  className='rounded-full size-12 scale-125 max-lg:scale-100'
                  onClick={() => {
                    toast.promise(
                      new Promise<void>((resolve, reject) => {
                        socket?.emit('play', (error: unknown) => {
                          if (
                            error &&
                            (error as { status?: string }).status !== 'ok'
                          ) {
                            reject(error);
                          } else {
                            resolve();
                          }
                        });
                      }),
                      {
                        loading:
                          language.data.app.guilds.player.toast.play.loading,
                        success:
                          language.data.app.guilds.player.toast.play.success,
                        error:
                          language.data.app.guilds.player.toast.play.error,
                      }
                    );
                  }}
                >
                  <PlayIcon weight='fill' className='size-6' />
                </Button>
              )}
              <Button
                variant='ghost'
                size='icon'
                className='rounded-full size-10 scale-110 max-lg:scale-100 max-md:hidden'
                onClick={() => {
                  toast.promise(
                    new Promise<void>((resolve, reject) => {
                      socket?.emit('next', (error: unknown) => {
                        if (
                          error &&
                          (error as { status?: string }).status !== 'ok'
                        ) {
                          reject(error);
                        } else {
                          resolve();
                        }
                      });
                    }),
                    {
                      loading:
                        language.data.app.guilds.player.toast.next.loading,
                      success:
                        language.data.app.guilds.player.toast.next.success,
                      error: language.data.app.guilds.player.toast.next.error,
                    }
                  );
                }}
              >
                <CaretLineRightIcon weight='fill' className='size-5' />
              </Button>
              <div className='w-16 max-lg:w-max max-md:hidden flex gap-1 text-center whitespace-nowrap text-[hsl(var(--pona-app-music-accent-color-500))] text-sm font-medium'>
                <span className='lg:hidden flex text-[hsl(var(--pona-app-music-accent-color-500))]'>
                  {msToTime(playback)} /{' '}
                </span>
                {msToTime(ponaCommonState?.pona.length || 0)}
              </div>
            </div>

            {/* Actions / Dropdown */}
            <div className='flex items-center justify-end gap-2 w-full max-lg:max-w-[2rem] max-md:hidden mr-3 max-w-[calc(33.33%_-_1rem)] z-10'>
              <DropdownMenu>
                <DropdownMenuTrigger>
                  <Button
                    variant='ghost'
                    size='icon'
                    className='rounded-lg size-10 scale-110 max-lg:hidden'
                  >
                    <RepeatIcon weight='fill' className='size-5' />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align='end' className='w-48'>
                  <DropdownMenuLabel>
                    {language.data.app.guilds.player.repeat.title}
                  </DropdownMenuLabel>
                  <DropdownMenuItem
                    onClick={() => {
                      socket?.emit('repeat', 'none');
                    }}
                  >
                    <MusicNotesIcon className='size-4 mr-2' />
                    {language.data.app.guilds.player.repeat.off}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      socket?.emit('repeat', 'track');
                    }}
                  >
                    <RepeatOnceIcon className='size-4 mr-2' />
                    {language.data.app.guilds.player.repeat.track}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      socket?.emit('repeat', 'queue');
                    }}
                  >
                    <RepeatIcon className='size-4 mr-2' />
                    {language.data.app.guilds.player.repeat.queue}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Popover>
                <PopoverTrigger>
                  <Button
                    variant='ghost'
                    size='icon'
                    className='rounded-lg size-10 scale-110 max-lg:hidden'
                  >
                    <EqualizerIcon weight='fill' className='size-5' />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className='w-72 p-4'>
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
                className='rounded-lg size-10 scale-110 max-lg:hidden hidden'
              >
                <SpeakerSimpleHighIcon weight='fill' className='size-5' />
              </Button>

              <Button
                variant='ghost'
                size='icon'
                className='rounded-lg size-10 scale-110 max-md:hidden'
                onClick={() => {
                  setPlayerPopup((value) => {
                    if (!value)
                      document.body.classList.add('pona-player-focused');
                    else document.body.classList.remove('pona-player-focused');
                    return !value;
                  });
                }}
              >
                <CaretUpIcon
                  className={`absolute ${playerPopup ? 'opacity-0 -translate-y-6' : ''}`}
                />
                <CaretDownIcon
                  className={`absolute ${!playerPopup ? 'opacity-0 translate-y-6' : ''}`}
                />
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}


