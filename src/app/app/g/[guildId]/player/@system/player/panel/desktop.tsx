'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import { useParams, usePathname, useRouter, useSearchParams } from 'next/navigation';
import { AnimatePresence, HTMLMotionProps, motion } from 'framer-motion';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
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
  SpinnerIcon,
  TrashIcon,
} from '@phosphor-icons/react/dist/ssr';

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

import { useSocket } from '@/contexts/ponaMusicContext';
import { useAppStore } from '@/store/coreStore';
import {
  playbackAtom,
  ponaCommonStateAtom,
  queueAtom,
} from '@/store/musicAtoms';
import { isFullscreenModeAtom, playerPopupAtom } from '@/store/uiAtoms';
import { Track, UnresolvedTrack } from '@/types/ponaPlayer';
import { cn } from '@/lib/utils';
import Related from './related';
import CustomScrollArea from '@/components/ui/custom/scroll-area';
import { Tabs, TabsContent, TabsContents, TabsList, TabsTrigger } from '@/components/animate-ui/components/animate/tabs';
import { AnimateIcon } from '@/components/animate-ui/icons/icon';
import { AudioLines } from '@/components/animate-ui/icons/audio-lines';
import { Bot } from '@/components/animate-ui/icons/bot';


export default function DesktopPonaPlayerPanel() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchParamsString = searchParams ? searchParams.toString() : '';
  const setPlayerPopup = useSetAtom(playerPopupAtom);

  useEffect(() => {
    setPlayerPopup(false);
    document.body.classList.remove('pona-player-focused');
  }, [pathname, setPlayerPopup]);

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

  const playingNextQueue = useMemo(() => {
    const queue = ponaTrackQueue?.queue;
    const currentUniqueId = currentTrack?.uniqueId;
    if (!queue) return [];
    return queue.filter((track) => track.uniqueId !== currentUniqueId);
  }, [ponaTrackQueue, currentTrack]);

  return (
    <AnimatePresence>
      {currentTrack && playerPopup && (
        <motion.div
          className={
            cn(
              (userSetting.dev_pona_player_style === 'modern'
                ? 'absolute z-40 left-2 p-8 bottom-[6.1rem] max-lg:bottom-[5.3rem] max-lg:h-[calc(100vh-5.8rem)] rounded-lg w-[calc(100%-1rem)] h-[calc(100vh-6.6rem)] transition-all ease-out duration-250 overflow-hidden'
                : 'absolute z-40 left-2 p-8 bottom-[6.4rem] max-lg:bottom-[5.3rem] max-lg:h-[calc(100vh-6rem)] rounded-lg w-[calc(100%-1rem)] h-[calc(100vh-6.8rem)] transition-all ease-out duration-250 overflow-hidden') +
              (userSetting.transparency
                ? ' to-playground-background/100'
                : ' [html.light_&]:from-[hsl(var(--pona-app-music-accent-color-200))]! [html.light_&]:to-[hsl(var(--pona-app-music-accent-color-50))]! [html.dark_&]:to-[hsl(var(--pona-app-music-accent-color-800))]! [html.dark_&]:from-[hsl(var(--pona-app-music-accent-color-400))]!'),
              'disable-default-transition'
            )
          }
          id='pona-player-panel'
          transition={{ duration: 0.12 }}
          initial={{ opacity: 0, pointerEvents: 'none', translateY: 32 }}
          animate={{ opacity: 1, pointerEvents: 'auto', translateY: 0 }}
          exit={{ opacity: 0, pointerEvents: 'none', translateY: 64 }}
        >
          {userSetting.transparency && (
            <Image
              src={`/api/proxy/image?r=${encodeURIComponent(
                currentTrack?.proxyArtworkUrl ||
                '/static/Ponlponl123 (1459).png'
              )}&s=512&blur=24&saturation=96&contrast=16&brightness=24`}
              alt={currentTrack ? currentTrack?.title : 'Backdrop'}
              fill
              unoptimized
              className='absolute -z-10 scale-[2] w-full h-full top-0 left-0 object-cover [html.dark_&]:brightness-36 contrast-125 blur-3xl [html.light_&]:blur-[128px] [html.light_&]:contrast-75 [html.light_&]:brightness-140 [html.dark_&]:saturate-150'
            />
          )}
          <div
            className={
              cn('absolute -z-10 w-full h-full top-0 left-0 mask-t-from-0 mask-t-to-30%',
                userSetting.transparency
                  ? ' bg-linear-to-t [html.light_&]:from-[hsl(var(--pona-app-music-accent-color-50))]! [html.dark_&]:from-[hsl(var(--pona-app-music-accent-color-900))]!'
                  : '[html.light_&]:bg-[hsl(var(--pona-app-music-accent-color-50))]! [html.dark_&]:bg-[hsl(var(--pona-app-music-accent-color-900))]!'
              )
            }
          />
          <div className='w-full h-full flex gap-6 justify-between items-center pt-16'>
            <motion.div
              layoutId='pona-music-panel-artwork'
              className='m-auto flex flex-1 min-w-0 flex-col items-center gap-6 max-lg:[body:not(.sidebar-collapsed)_&]:hidden'
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
                <Image
                  src={
                    (currentTrack
                      ? currentTrack?.proxyHighResArtworkUrl ||
                      currentTrack?.proxyArtworkUrl
                      : '/static/Ponlponl123 (1459).png') || '/static/Ponlponl123 (1459).png'
                  }
                  alt={currentTrack ? currentTrack?.title : 'Artwork'}
                  fill
                  unoptimized
                  className='w-full h-full object-cover select-none rounded-2xl shadow-xl'
                  id='pona-music-artwork'
                />
                <div className='absolute top-0 left-0 z-14 w-full h-full bg-linear-to-t to-transparent rounded-2xl [html.light_&]:from-white/40 [html.dark_&]:from-black/40 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity' />
              </div>
            </motion.div>
            <div
              className='w-lg h-full flex max-w-3xl justify-end'
              id='pona-music-queue'
            >
              <Tabs defaultValue='next' className='w-lg h-full flex flex-col'>
                <TabsList className='w-lg max-w-lg justify-start rounded-none bg-transparent p-0 gap-4' highlightClassname='border-none!'>
                  <TabsTrigger
                    value='next'
                    className='rounded-none data-[state=active]:bg-transparent data-[state=active]:text-[hsl(var(--pona-app-music-accent-color-500))]'
                  >
                    {language.data.app.guilds.player.tabs.next}
                  </TabsTrigger>
                  <TabsTrigger
                    value='lyrics'
                    className='rounded-none data-[state=active]:bg-transparent data-[state=active]:text-[hsl(var(--pona-app-music-accent-color-500))]'
                  >
                    {language.data.app.guilds.player.tabs.lyrics}
                  </TabsTrigger>
                  <TabsTrigger
                    value='related'
                    className='rounded-none data-[state=active]:bg-transparent data-[state=active]:text-[hsl(var(--pona-app-music-accent-color-500))]'
                  >
                    {language.data.app.guilds.player.tabs.related}
                  </TabsTrigger>
                </TabsList>
                <TabsContents className='min-h-0 flex-1 max-h-full w-full flex'>
                  <TabsContent value='next'
                    className='flex-1 w-lg flex min-h-0 max-h-full'
                  >
                    <CustomScrollArea
                      className="min-h-0 flex-1 border-0 outline-0"
                      classNames={{
                        viewport: "relative rounded-none pt-4 pb-12 pr-2 mask-t-from-90% mask-b-from-90%",
                      }}
                    >
                      <div className='flex flex-col gap-3 px-3 py-1'>
                        {currentTrack && (
                          <div className='flex flex-col gap-1.5'>
                            <span className='text-xs font-semibold text-[hsl(var(--pona-app-music-accent-color-500)/0.48)] uppercase tracking-wider px-2'>
                              {language.data.app.guilds.player.tabs.now_playing}
                            </span>
                            <TrackQueue
                              active={true}
                              index={0}
                              track={currentTrack}
                            />
                          </div>
                        )}

                        {playingNextQueue.length > 0 && (
                          <div className='flex flex-col gap-1.5 mt-2'>
                            <span className='text-xs font-semibold text-[hsl(var(--pona-app-music-accent-color-500)/0.48)] uppercase tracking-wider px-2'>
                              {language.data.app.guilds.player.tabs.playing_next}
                            </span>
                            <DndContext
                              sensors={sensors}
                              collisionDetection={closestCenter}
                              onDragEnd={handleDragEnd}
                              autoScroll
                            >
                              <SortableContext
                                items={playingNextQueue
                                  .filter((track: Track | UnresolvedTrack) => track.uniqueId !== undefined)
                                  .map((track: Track | UnresolvedTrack) => track.uniqueId as string)}
                                strategy={verticalListSortingStrategy}
                              >
                                {playingNextQueue.map((track: Track | UnresolvedTrack, targetIdx: number) => (
                                  <DraggableTrack
                                    isLoading={ponaTrackQueue.updating}
                                    active={false}
                                    index={targetIdx + 1}
                                    queueIndex={targetIdx}
                                    key={track.uniqueId || targetIdx}
                                    track={track}
                                  />
                                ))}
                              </SortableContext>
                            </DndContext>
                          </div>
                        )}
                      </div>
                    </CustomScrollArea>
                  </TabsContent>
                  <TabsContent
                    value='lyrics'
                    className='flex-1 w-lg flex min-h-0 max-h-full'
                  >
                    <CustomScrollArea
                      className="max-h-full flex-1 border-0 outline-0"
                      classNames={{
                        viewport: "relative rounded-none pt-4 pb-12 pr-2 mask-t-from-90% mask-b-from-90%",
                      }}
                      ref={setLyricsContainer}
                    >
                      {lyricsContainer && (
                        <>
                          {!currentTrack?.lyrics ? (
                            <div className='flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground'>
                              <SpinnerIcon className='size-8 animate-spin text-[hsl(var(--pona-app-music-accent-color-500))]' />
                              <span className='text-sm font-medium'>
                                {(language.data.app.guilds.player.tabs as Record<string, string>).fetching_lyrics || 'Loading lyrics...'}
                              </span>
                            </div>
                          ) : currentTrack.lyrics.error || !currentTrack.lyrics.lyrics || currentTrack.lyrics.lyrics.length === 0 ? (
                            <div className='text-center py-16 flex flex-col justify-center items-center gap-3 text-[hsl(var(--pona-app-music-accent-color-800))] dark:text-[hsl(var(--pona-app-music-accent-color-500))]'>
                              <AnimateIcon animate loop loopDelay={1200}>
                                <Bot size={48} />
                              </AnimateIcon>
                              <strong>
                                {language.data.app.guilds.player.tabs.no_lyrics_available || 'No lyrics available'}
                              </strong>
                            </div>
                          ) : currentTrack.lyrics.isTimestamp ? (
                            <LyricsDisplay
                              playerPosition={playerPos}
                              currentTrack={currentTrack as Track}
                              lyricsProvider={lyricsContainer}
                            />
                          ) : (
                            <div className='w-full text-center pb-[8vh]'>
                              {(currentTrack.lyrics.lyrics as string[]).map(
                                (lyric, index) => (
                                  <div key={index} className='flex items-center justify-center gap-2'>
                                    <span className='text-2xl my-4 text-[hsl(var(--pona-app-music-accent-color-800))] dark:text-[hsl(var(--pona-app-music-accent-color-500))] font-medium'>
                                      {lyric}
                                    </span>
                                  </div>
                                )
                              )}
                              {currentTrack.lyrics.source && (
                                <div className='mt-12 mb-4 text-xs text-[hsl(var(--pona-app-music-accent-color-500)/0.5)] font-semibold tracking-wider uppercase text-center'>
                                  {(
                                    language.data.app.guilds.player.tabs.lyrics_provided_by ||
                                    'Lyrics provided by [provider]'
                                  ).replace('[provider]', currentTrack.lyrics.source)}
                                </div>
                              )}
                            </div>
                          )}
                        </>
                      )}
                    </CustomScrollArea>
                  </TabsContent>
                  <TabsContent value='related'
                    className='flex-1 w-lg flex min-h-0 max-h-full'
                  >
                    <CustomScrollArea
                      className="min-h-0 flex-1 w-lg border-0 outline-0"
                      classNames={{
                        viewport: "relative rounded-none pt-4 pr-2 mask-t-from-90% mask-b-from-90%",
                      }}
                    >
                      <Related videoId={videoId} />
                    </CustomScrollArea>
                  </TabsContent>
                </TabsContents>
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
  queueIndex,
  track,
  active,
  isLoading,
}: {
  index: number;
  queueIndex?: number;
  track: Track | UnresolvedTrack;
  active: boolean;
  isLoading?: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id: (track.uniqueId as string) || index,
    });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <TrackQueue
      active={active}
      index={index}
      queueIndex={queueIndex}
      ref={setNodeRef}
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
          if (track?.artist && track?.artist[0]) {
            const currentPath = window.location.pathname;
            const basePath = currentPath.includes('/player')
              ? currentPath.split('/player')[0] + '/player'
              : currentPath;
            router.push(`${basePath}/c?c=${track.artist[0].id}`);
          }
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
  queueIndex,
  track,
  active,
  isLoading,
  ref,
  params,
}: {
  index: number;
  queueIndex?: number;
  track: Track | UnresolvedTrack;
  active: boolean;
  isLoading?: boolean;
  ref?: React.Ref<HTMLDivElement>;
  params?: HTMLMotionProps<'div'>;
}) {
  const router = useRouter();
  const routeParams = useParams();
  const guildId = routeParams?.guildId;
  const ponaCommonState = useAtomValue(ponaCommonStateAtom);
  const { socket } = useSocket();
  const paused = ponaCommonState?.pona?.paused || false;
  const language = useAppStore((state) => state.language);

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <motion.div
          ref={ref}
          className={`w-full p-1 pl-2 flex gap-4 items-center rounded-xl group ${active
            ? 'in-[.light]:bg-[hsl(var(--pona-app-music-accent-color-100))] in-[.dark]:bg-[hsl(var(--pona-app-music-accent-color-900)/.64)] active'
            : ''
            } ${isLoading ? 'pointer-events-none' : ''}`}
          key={index}
          {...params}
        >
          <div className='flex-[0 1 auto] size-10 select-none relative overflow-hidden rounded-lg'>
            {!isLoading ? (
              <Image
                src={
                  track?.proxyArtworkUrl ||
                  track?.artworkUrl ||
                  (track?.identifier
                    ? `/api/proxy/watch?v=${track.identifier}&s=md`
                    : '/static/Ponlponl123 (1459).png')
                }
                alt={track.title}
                height={40}
                width={40}
                unoptimized
                className={
                  'object-cover rounded-lg z-0 size-10 ' +
                  (!paused && active
                    ? 'brightness-50 saturate-0'
                    : 'group-hover:brightness-75 transition-all')
                }
              />
            ) : (
              <Skeleton className='w-full h-full rounded-lg' />
            )}
            <div
              className={
                'absolute top-0 left-0 w-full h-full bg-background/35 z-5 ' +
                (!paused && active
                  ? 'opacity-100'
                  : 'group-hover:opacity-100 opacity-0')
              }
            />
            {!paused && active ? (
              <Button
                variant='ghost'
                size='icon'
                className='absolute z-10 top-0 left-0 w-full h-full opacity-100 backdrop-blur-[1px]'
                onClick={(e) => {
                  e.stopPropagation();
                  socket?.emit('pause');
                }}
              >
                <AnimateIcon animate loop>
                  <AudioLines className='text-[hsl(var(--pona-app-music-accent-color-200))] dark:text-[hsl(var(--pona-app-music-accent-color-500))] size-4' />
                </AnimateIcon>
              </Button>
            ) : (
              <Button
                variant='ghost'
                size='icon'
                className='absolute z-20 top-0 left-0 w-full h-full group-hover:opacity-100 opacity-0 pointer-events-auto backdrop-blur-[2px]'
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  if (active) socket?.emit('play');
                  else if (typeof queueIndex === 'number')
                    socket?.emit('skipto', queueIndex);
                }}
              >
                <PlayIcon className='text-[hsl(var(--pona-app-music-accent-color-500))] size-5' weight='fill' />
              </Button>
            )}
          </div>
          <div
            className={`w-0 min-w-0 flex-1 ${isLoading ? 'flex flex-col gap-1' : ''
              }`}
          >
            {!isLoading ? (
              <>
                <h1 className='max-w-full text-[hsl(var(--pona-app-music-accent-color-800))] dark:text-[hsl(var(--pona-app-music-accent-color-500))] text-sm truncate font-medium'>
                  {track.title}
                </h1>
                {track.artist ? (
                  <div className='max-w-full text-xs text-[hsl(var(--pona-app-music-accent-color-800))]/60 dark:text-[hsl(var(--pona-app-music-accent-color-500))]/60 truncate'>
                    {combineArtistName(track.artist, true, router, {
                      className: 'text-[hsl(var(--pona-app-music-accent-color-800))]/60! dark:text-[hsl(var(--pona-app-music-accent-color-500))]/60! text-xs',
                    })}{' '}
                    <span className='text-[hsl(var(--pona-app-music-accent-color-800))]/60 dark:text-[hsl(var(--pona-app-music-accent-color-500))]/60 text-xs'>
                      (
                      {track.requester?.displayName ||
                        '@' + track.requester?.username}
                      )
                    </span>
                  </div>
                ) : (
                  <span className='max-w-full text-xs text-[hsl(var(--pona-app-music-accent-color-800))]/60 dark:text-[hsl(var(--pona-app-music-accent-color-500))]/60 truncate'>
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
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button variant='ghost' size='icon' className='rounded-full'>
                    <DotsThreeVerticalIcon className='size-5' />
                  </Button>
                }
              />
              <DropdownMenuContent align='end' className='w-56 rounded-lg'>
                <DropdownMenuLabel>{track.title}</DropdownMenuLabel>
                <DropdownMenuItem disabled>
                  <HeartIcon className='size-4 mr-2' />
                  {
                    language.data.app.guilds.player.context_menu
                      .add_to_favorite
                  }
                </DropdownMenuItem>
                {ponaCommonState?.current?.uniqueId !== track.uniqueId && (
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
                    if (track?.artist && track?.artist[0]) {
                      const currentPath = window.location.pathname;
                      const basePath = currentPath.includes('/player')
                        ? currentPath.split('/player')[0] + '/player'
                        : `/app/g/${guildId}/player`;
                      router.push(`${basePath}/c?c=${track.artist[0].id}`);
                    }
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

      <ContextMenuContent className='w-56 rounded-lg'>
        <TrackQueueContextFunction track={track} />
      </ContextMenuContent>
    </ContextMenu>
  );
}

