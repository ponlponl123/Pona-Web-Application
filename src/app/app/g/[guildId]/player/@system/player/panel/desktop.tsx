'use client';

import React, { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence, HTMLMotionProps, motion } from 'framer-motion';
import { useAtom, useAtomValue } from 'jotai';
import { toast } from 'sonner';
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  DotsThreeVerticalIcon,
  HeartIcon,
  MonitorPlayIcon,
  PersonSimpleIcon,
  PictureInPictureIcon,
  PlayIcon,
  TrashIcon,
} from '@phosphor-icons/react/dist/ssr';

import Equalizing from '@/components/equalizing';
import LyricsDisplay from '@/components/music/lyricsDisplay';
import { combineArtistName } from '@/components/music/searchResult/track';
import { Button } from '@/components/ui/button';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuTrigger,
} from '@/components/ui/context-menu';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { Spinner } from '@/components/ui/spinner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { useSocket } from '@/contexts/ponaMusicContext';
import { useAppStore } from '@/store/coreStore';
import {
  playbackAtom,
  ponaCommonStateAtom,
  queueAtom,
} from '@/store/musicAtoms';
import { isFullscreenModeAtom, playerPopupAtom } from '@/store/uiAtoms';
import { Track, UnresolvedTrack } from '@/types/ponaPlayer';
import { msToTime } from '@/lib/utils';
import Related from './related';


export default function DesktopPonaPlayerPanel() {
  const language = useAppStore((state) => state.language);
  const userSetting = useAppStore((state) => state.userSetting);

  const ponaCommonState = useAtomValue(ponaCommonStateAtom);
  const playback = useAtomValue(playbackAtom);
  const [ponaTrackQueue, setPonaTrackQueue] = useAtom(queueAtom);
  const [isFullscreenMode, setIsFullscreenMode] = useAtom(isFullscreenModeAtom);
  const playerPopup = useAtomValue(playerPopupAtom);
  const { socket } = useSocket();

  const currentTrack = ponaCommonState?.current;
  const videoId = currentTrack?.identifier;
  const [lyricsContainer, setLyricsContainer] = useState<HTMLDivElement | null>(null);
  const playerPos = playback;

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    if (!ponaTrackQueue) return;
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setPonaTrackQueue((value) => {
        if (!value.queue) return value;
        const oldIndex = value.queue.findIndex(
          (track) => track.uniqueId === active.id
        );
        const newIndex = value.queue.findIndex(
          (track) => track.uniqueId === over.id
        );
        socket?.emit('move', oldIndex, newIndex);
        return {
          queue: arrayMove(value.queue, oldIndex, newIndex),
          updating: true,
        };
      });
    }
  }

  return (
    <AnimatePresence>
      {currentTrack && playerPopup && (
        <motion.div
          className={
            (userSetting.dev_pona_player_style === 'modern'
              ? 'absolute z-40 left-2 p-8 bottom-[6.1rem] max-lg:bottom-[5.3rem] max-lg:h-[calc(100vh_-_5.8rem)] max-md:rounded-lg rounded-3xl w-[calc(100%_-_1rem)] h-[calc(100vh_-_6.6rem)] transition-all ease-out duration-250 overflow-hidden'
              : 'absolute z-40 left-2 p-8 bottom-[6.4rem] max-lg:bottom-[5.3rem] max-lg:h-[calc(100vh_-_6rem)] max-md:rounded-lg rounded-3xl w-[calc(100%_-_1rem)] h-[calc(100vh_-_6.8rem)] transition-all ease-out duration-250 overflow-hidden') +
            (userSetting.transparency
              ? ' to-playground-background/100'
              : ' [html.light_&]:!from-[hsl(var(--pona-app-music-accent-color-200))] [html.light_&]:!to-[hsl(var(--pona-app-music-accent-color-50))] [html.dark_&]:!to-[hsl(var(--pona-app-music-accent-color-800))] [html.dark_&]:!from-[hsl(var(--pona-app-music-accent-color-400))]')
          }
          id='pona=player-panel'
          transition={{ duration: 0.12 }}
          initial={{ opacity: 0, pointerEvents: 'none', translateY: 32 }}
          animate={{ opacity: 1, pointerEvents: 'auto', translateY: 0 }}
          exit={{ opacity: 0, pointerEvents: 'none', translateY: 64 }}
        >
          {userSetting.transparency && (
            <img
              src={`/api/proxy/image?r=${encodeURIComponent(
                currentTrack?.proxyArtworkUrl ||
                '/static/Ponlponl123 (1459).png'
              )}&s=512&blur=16&saturation=96&contrast=12`}
              alt={currentTrack ? currentTrack?.title : 'Backdrop'}
              className='absolute -z-10 scale-[2] w-full h-full top-0 left-0 object-cover [html.dark_&]:brightness-50 [html.light_&]:brightness-200 [html.dark_&]:saturate-150'
            />
          )}
          <div
            className={
              'absolute -z-10 w-full h-full top-0 left-0 ' +
              (userSetting.transparency
                ? ' bg-gradient-to-t [html.light_&]:!from-[hsl(var(--pona-app-music-accent-color-50))] [html.dark_&]:!from-[hsl(var(--pona-app-music-accent-color-900))]'
                : '[html.light_&]:!bg-[hsl(var(--pona-app-music-accent-color-50))] [html.dark_&]:!bg-[hsl(var(--pona-app-music-accent-color-900))]')
            }
          />
          <div className='w-full h-full flex gap-12 justify-between items-center pt-16'>
            <motion.div
              layoutId='pona-music-panel-artwork'
              className='m-auto flex flex-col items-center gap-6 max-lg:[body:not(.sidebar-collapsed)_&]:hidden'
            >
              <div className='flex flex-wrap max-xl:flex-col gap-4 items-center justify-center -mt-12'>
                <Button
                  variant='ghost'
                  disabled
                  className='rounded-full'
                  onClick={() => setIsFullscreenMode((value) => !value)}
                >
                  {!isFullscreenMode ? (
                    <>
                      <MonitorPlayIcon className='size-4 mr-2' />
                      {language.data.app.guilds.player.full_screen_mode.enter}
                    </>
                  ) : (
                    <Spinner className='size-4' />
                  )}
                </Button>
                <Button variant='ghost' disabled className='rounded-full'>
                  <PictureInPictureIcon className='size-4 mr-2' />
                  {language.data.app.guilds.player.picinpic_mode.enter}
                </Button>
              </div>
              <div className='w-[56vh] max-2xl:w-[42vh] max-xl:w-[28vh] max-xl:[body:not(.sidebar-collapsed)_&]:w-[20vh] max-lg:w-[12vh] aspect-square relative flex group hover:scale-[1.032] active:scale-[1.016] transition-transform'>
                <img
                  src={
                    currentTrack
                      ? currentTrack?.proxyHighResArtworkUrl ||
                      currentTrack?.proxyArtworkUrl
                      : '/static/Ponlponl123 (1459).png'
                  }
                  alt={currentTrack ? currentTrack?.title : 'Artwork'}
                  className='w-full h-full object-cover select-none rounded-2xl shadow-xl'
                  loading='lazy'
                  id='pona-music-artwork'
                />
                <div className='absolute top-0 left-0 z-14 w-full h-full bg-gradient-to-t to-transparent rounded-2xl [html.light_&]:from-white/40 [html.dark_&]:from-black/40 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity' />
              </div>
            </motion.div>
            <div
              className='flex-1 min-w-0 h-full max-w-3xl'
              id='pona-music-queue'
            >
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
                        currentTrack?.lyrics &&
                        currentTrack?.lyrics?.lyrics?.length > 0
                      )
                    }
                    className='rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent'
                  >
                    {language.data.app.guilds.player.tabs.lyrics}
                    <span className='ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/20 text-primary'>
                      {language.data.extensions.beta}
                    </span>
                  </TabsTrigger>
                  <TabsTrigger
                    value='related'
                    className='rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent'
                  >
                    {language.data.app.guilds.player.tabs.related}
                  </TabsTrigger>
                </TabsList>
                <TabsContent value='next' className='flex-1 overflow-y-auto pt-4 pr-2 scrollbar-hide'>
                  <div className='flex flex-col gap-2 px-3 py-1'>
                    {ponaTrackQueue?.queue?.[0] && (
                      <TrackQueue
                        active={
                          currentTrack?.uniqueId ===
                          ponaTrackQueue.queue[0].uniqueId
                        }
                        index={0}
                        track={ponaTrackQueue.queue[0]}
                      />
                    )}
                    {ponaTrackQueue?.queue && (
                      <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                        autoScroll
                      >
                        <SortableContext
                          items={ponaTrackQueue.queue
                            .filter((track) => track.uniqueId !== undefined)
                            .map((track) => track.uniqueId as string)}
                          strategy={verticalListSortingStrategy}
                        >
                          {ponaTrackQueue.queue
                            .slice(1)
                            .map((track, index) => {
                              const isThisTrack =
                                currentTrack?.uniqueId === track.uniqueId;
                              return (
                                <DraggableTrack
                                  isLoading={ponaTrackQueue.updating}
                                  active={isThisTrack}
                                  index={index + 1}
                                  key={track.uniqueId}
                                  track={track}
                                />
                              );
                            })}
                        </SortableContext>
                      </DndContext>
                    )}
                  </div>
                </TabsContent>
                <TabsContent
                  value='lyrics'
                  className='flex-1 overflow-y-auto pt-4 pb-12 pr-2 scrollbar-hide'
                  ref={setLyricsContainer}
                >
                  {lyricsContainer &&
                    (currentTrack?.lyrics?.isTimestamp ? (
                      <LyricsDisplay
                        playerPosition={playerPos}
                        currentTrack={currentTrack as Track}
                        lyricsProvider={lyricsContainer}
                      />
                    ) : (
                      currentTrack?.lyrics?.lyrics &&
                      currentTrack?.lyrics?.lyrics?.length > 0 &&
                      (currentTrack?.lyrics?.lyrics as string[]).map(
                        (lyric, index) => (
                          <div key={index} className='flex items-center gap-2'>
                            <span className='text-2xl my-4 text-[hsl(var(--pona-app-music-accent-color-500))] font-medium'>
                              {lyric}
                            </span>
                          </div>
                        )
                      )
                    ))}
                </TabsContent>
                <TabsContent value='related' className='flex-1 overflow-y-auto pr-2 scrollbar-hide'>
                  <Related videoId={videoId} />
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function DraggableTrack({
  index,
  track,
  active,
  isLoading,
}: {
  index: number;
  track: Track | UnresolvedTrack;
  active: boolean;
  isLoading?: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: track.uniqueId as string });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  return (
    <TrackQueue
      ref={setNodeRef}
      active={active}
      index={index}
      track={track}
      isLoading={isLoading}
      params={{
        layout: true,
        initial: false,
        whileTap: {
          outline: '2px hsl(var(--pona-app-music-accent-color-500)) solid',
          userSelect: 'none',
          zIndex: 24,
        },
        style,
        ...attributes,
        ...listeners,
      }}
      key={index}
    />
  );
}

export function TrackQueueContextFunction({
  track,
}: {
  track: Track | UnresolvedTrack;
}) {
  const router = useRouter();
  const language = useAppStore((state) => state.language);
  const ponaCommonState = useAtomValue(ponaCommonStateAtom);
  const { socket } = useSocket();

  return (
    <>
      <ContextMenuLabel>{track.title}</ContextMenuLabel>
      <ContextMenuItem disabled>
        <HeartIcon className='size-4 mr-2' />
        {language.data.app.guilds.player.context_menu.add_to_favorite}
      </ContextMenuItem>
      {ponaCommonState?.current?.uniqueId !== track.uniqueId && (
        <ContextMenuItem
          onClick={() => {
            toast.promise(
              new Promise<void>((resolve, reject) => {
                socket?.emit('rm', track.uniqueId, (error: unknown) => {
                  if (error && (error as { status?: string }).status !== 'ok') {
                    reject(error);
                  } else {
                    resolve();
                  }
                });
              }),
              {
                loading: language.data.app.guilds.player.toast.rm_track.loading
                  .replace('[track_name]', track.title)
                  .replace('[artist]', String(track.author)),
                success: language.data.app.guilds.player.toast.rm_track.success
                  .replace('[track_name]', track.title)
                  .replace('[artist]', String(track.author)),
                error: language.data.app.guilds.player.toast.rm_track.error,
              }
            );
          }}

        >
          <TrashIcon className='size-4 mr-2' />
          {language.data.app.guilds.player.context_menu.rm_from_queue}
        </ContextMenuItem>
      )}
      <ContextMenuItem
        disabled={!track?.artist}
        onClick={() => {
          if (track?.artist && track?.artist[0])
            router.push('player/c?c=' + track?.artist[0].id);
        }}
      >
        <PersonSimpleIcon className='size-4 mr-2' />
        {language.data.app.guilds.player.context_menu.goto_artist}
      </ContextMenuItem>
    </>
  );
}

export function TrackQueue({
  index,
  track,
  active,
  isLoading,
  ref,
  params,
}: {
  index: number;
  track: Track | UnresolvedTrack;
  active: boolean;
  isLoading?: boolean;
  ref?: React.Ref<HTMLDivElement>;
  params?: HTMLMotionProps<'div'>;
}) {
  const router = useRouter();
  const ponaCommonState = useAtomValue(ponaCommonStateAtom);
  const { socket } = useSocket();
  const paused = ponaCommonState?.pona?.paused || false;
  const language = useAppStore((state) => state.language);

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <motion.div
          ref={ref}
          className={`w-full py-2 px-2.5 flex gap-4 items-center rounded-3xl group ${active
              ? '[.light_&]:bg-[hsl(var(--pona-app-music-accent-color-100))] [.dark_&]:bg-[hsl(var(--pona-app-music-accent-color-800))] active'
              : ''
            } ${isLoading ? 'pointer-events-none' : ''}`}
          key={index}
          {...params}
        >
          <div className='flex-[0 1 auto] w-11 h-11 select-none relative overflow-hidden rounded-2xl'>
            {!isLoading ? (
              <img
                src={track?.proxyArtworkUrl}
                alt={track.title}
                height={44}
                width={44}
                className={
                  'object-cover rounded-lg z-0 ' +
                  (!paused && active
                    ? 'brightness-50 saturate-0'
                    : 'group-hover:brightness-50 group-hover:saturate-0')
                }
              />
            ) : (
              <Skeleton className='w-full h-full rounded-lg' />
            )}
            <div
              className={
                'absolute top-0 left-0 w-full h-full bg-background/35 z-[5] ' +
                (!paused && active
                  ? 'opacity-100'
                  : 'group-hover:opacity-100 opacity-0')
              }
            />
            {!paused && active ? (
              <Button
                variant='ghost'
                size='icon'
                className='absolute z-10 top-0 left-0 w-full h-full opacity-100'
                onClick={() => socket?.emit('pause')}
              >
                <Equalizing steps={3} />
              </Button>
            ) : (
              <Button
                variant='ghost'
                size='icon'
                className='absolute z-10 top-0 left-0 w-full h-full group-hover:opacity-100 opacity-0'
                onClick={() => {
                  if (active) socket?.emit('play');
                  else if (index - 1 === 0) socket?.emit('next');
                  else socket?.emit('skipto', index - 1);
                }}
              >
                <PlayIcon className='text-white size-5' weight='fill' />
              </Button>
            )}
          </div>
          <div
            className={`w-0 min-w-0 flex-1 ${isLoading ? 'flex flex-col gap-1' : ''
              }`}
          >
            {!isLoading ? (
              <>
                <h1 className='max-w-full [div.active_&]:text-[hsl(var(--pona-app-music-accent-color-500))] truncate font-medium'>
                  {track.title}
                </h1>
                {track.artist ? (
                  <div className='max-w-full text-xs text-foreground/60 truncate'>
                    {combineArtistName(track.artist, true, router, {
                      className: 'text-foreground/60 text-xs',
                    })}{' '}
                    <span>
                      (
                      {track.requester?.displayName ||
                        '@' + track.requester?.username}
                      )
                    </span>
                  </div>
                ) : (
                  <span className='max-w-full text-xs text-foreground/60 truncate'>
                    {track.author} (
                    {track.requester?.displayName ||
                      '@' + track.requester?.username}
                    )
                  </span>
                )}
              </>
            ) : (
              <>
                <Skeleton className='h-4 w-3/4 rounded' />
                <Skeleton className='h-3 w-1/2 rounded' />
              </>
            )}
          </div>
          <div
            className={`flex-[0 1 auto] ml-auto relative w-12 h-12 flex items-center justify-center ${isLoading ? 'opacity-0 pointer-events-none' : ''
              }`}
          >
            <span className='text-xs text-muted-foreground group-hover:opacity-0 opacity-100 transition-opacity'>
              {msToTime(track.duration || 0)}
            </span>
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Button
                  variant='ghost'
                  size='icon'
                  className='absolute z-10 top-0 left-0 w-full h-full group-hover:opacity-100 opacity-0'
                >
                  <DotsThreeVerticalIcon className='size-5' weight='bold' />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align='end' className='w-56'>
                <DropdownMenuLabel>{track.title}</DropdownMenuLabel>
                <DropdownMenuItem disabled>
                  <HeartIcon className='size-4 mr-2' />
                  {
                    language.data.app.guilds.player.context_menu
                      .add_to_favorite
                  }
                </DropdownMenuItem>
                {!active && (
                  <DropdownMenuItem
                    onClick={() => {
                      toast.promise(
                        new Promise<void>((resolve, reject) => {
                          socket?.emit(
                            'rm',
                            track.uniqueId,
                            (error: unknown) => {
                              if (
                                error &&
                                (error as { status?: string }).status !== 'ok'
                              ) {
                                reject(error);
                              } else {
                                resolve();
                              }
                            }
                          );
                        }),
                        {
                          loading:
                            language.data.app.guilds.player.toast.rm_track.loading
                              .replace('[track_name]', track.title)
                              .replace('[artist]', String(track.author)),
                          success:
                            language.data.app.guilds.player.toast.rm_track.success
                              .replace('[track_name]', track.title)
                              .replace('[artist]', String(track.author)),
                          error:
                            language.data.app.guilds.player.toast.rm_track
                              .error,
                        }
                      );
                    }}
                  >
                    <TrashIcon className='size-4 mr-2' />
                    {language.data.app.guilds.player.context_menu.rm_from_queue}
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  disabled={!track.artist}
                  onClick={() => {
                    if (track?.artist && track?.artist[0])
                      router.push('player/c?c=' + track?.artist[0].id);
                  }}
                >
                  <PersonSimpleIcon className='size-4 mr-2' />
                  {language.data.app.guilds.player.context_menu.goto_artist}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </motion.div>
      </ContextMenuTrigger>

      <ContextMenuContent className='w-56'>
        <TrackQueueContextFunction track={track} />
      </ContextMenuContent>
    </ContextMenu>
  );
}

