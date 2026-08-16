'use client';

import React, { useCallback, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAtom, useAtomValue } from 'jotai';
import { toast } from 'sonner';
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
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
  DotsSixVerticalIcon,
  DotsThreeVerticalIcon,
  PersonSimpleIcon,
  PlayIcon,
  PlusIcon,
  TrashIcon,
} from '@phosphor-icons/react/dist/ssr';

import { combineArtistName } from '@/components/music/searchResult/track';
import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { useSocket } from '@/contexts/ponaMusicContext';
import { useAppStore } from '@/store/coreStore';
import {
  isPNPTEnabledAtom,
  pnptQueueAtom,
  ponaCommonStateAtom,
  queueAtom,
} from '@/store/musicAtoms';
import { Track, UnresolvedTrack } from '@/types/ponaPlayer';
import { emitWithTimeout } from '@/lib/promiseWithTimeout';
import { AnimateIcon } from '@/components/animate-ui/icons/icon';
import { AudioLines } from '@/components/animate-ui/icons/audio-lines';
import CustomScrollArea from '@/components/ui/custom/scroll-area';
import { cn } from '@/lib/utils';

export function MobileDraggableTrack({
  track,
  queueIndex,
  onPlay,
  onOpenAction,
}: {
  track: Track | UnresolvedTrack;
  queueIndex: number;
  onPlay: () => void;
  onOpenAction: (track: Track | UnresolvedTrack, queueIndex: number) => void;
}) {
  const language = useAppStore((state) => state.language);
  const router = useRouter();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: track.uniqueId || `track-${queueIndex}`,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.35 : 1,
  };

  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const touchStartPosRef = useRef<{ x: number; y: number } | null>(null);
  const isLongPressedRef = useRef(false);

  const handlePointerDown = (e: React.PointerEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('[data-drag-handle]')) return;
    isLongPressedRef.current = false;
    touchStartPosRef.current = { x: e.clientX, y: e.clientY };
    longPressTimerRef.current = setTimeout(() => {
      isLongPressedRef.current = true;
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        try {
          navigator.vibrate(40);
        } catch {
          // Ignore vibration errors
        }
      }
      onOpenAction(track, queueIndex);
    }, 400);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (touchStartPosRef.current) {
      const dx = Math.abs(e.clientX - touchStartPosRef.current.x);
      const dy = Math.abs(e.clientY - touchStartPosRef.current.y);
      if (dx > 8 || dy > 8) {
        if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
        longPressTimerRef.current = null;
      }
    }
  };

  const handlePointerUp = () => {
    if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
    longPressTimerRef.current = null;
    touchStartPosRef.current = null;
  };

  const handleClick = (e: React.MouseEvent) => {
    if (isLongPressedRef.current) {
      e.preventDefault();
      e.stopPropagation();
      isLongPressedRef.current = false;
      return;
    }
    onPlay();
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={handleClick}
      onContextMenu={(e) => {
        e.preventDefault();
        onOpenAction(track, queueIndex);
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      className="flex items-center gap-3 py-2 px-4 cursor-pointer active:bg-default/90 select-none group transform-gpu"
    >
      <div className="size-10 shrink-0 relative overflow-hidden rounded-sm bg-default/60">
        <Image
          src={
            track.proxyArtworkUrl ||
            track.artworkUrl ||
            (track.identifier ? `/api/proxy/watch?v=${track.identifier}&s=md` : '/static/Ponlponl123 (1459).png')
          }
          alt={track.title}
          fill
          unoptimized
          className="object-cover"
        />
      </div>

      <div className="min-w-0 flex-1">
        <h4 className="text-sm font-semibold text-default-foreground truncate">
          {track.title}
        </h4>
        <p className="text-xs text-default-foreground/60 truncate">
          {track.artist ? (
            combineArtistName(track.artist, true, router, {
              className: 'text-xs text-default-foreground/60 hover:underline',
            })
          ) : (
            track.author || ''
          )}
        </p>
      </div>

      {track._isPNPT && (
        <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[hsl(var(--pona-app-music-accent-color-500)/0.15)] text-[hsl(var(--pona-app-music-accent-color-500))] select-none">
          {(language.data.app.guilds.player.tabs as Record<string, string>)?.pnpt_auto_badge || 'Auto'}
        </span>
      )}

      <div
        {...attributes}
        {...listeners}
        data-drag-handle="true"
        className="p-2 cursor-grab active:cursor-grabbing text-default-foreground/40 hover:text-default-foreground touch-none select-none shrink-0"
        onClick={(e) => e.stopPropagation()}
      >
        <DotsSixVerticalIcon weight="bold" className="size-5" />
      </div>
    </div>
  );
}

export default function MobileQueueView({
  onScroll,
  className,
}: {
  onScroll?: (e: React.UIEvent<HTMLDivElement>) => void;
  className?: string;
}) {
  const language = useAppStore((state) => state.language);
  const router = useRouter();
  const ponaCommonState = useAtomValue(ponaCommonStateAtom);
  const [ponaTrackQueue, setPonaTrackQueue] = useAtom(queueAtom);
  const [isPNPTEnabled] = useAtom(isPNPTEnabledAtom);
  const [pnptQueue] = useAtom(pnptQueueAtom);
  const { socket } = useSocket();

  const currentTrack = ponaCommonState?.current;
  const isPaused = Boolean(ponaCommonState?.pona?.paused);

  const playingNextQueue = useMemo(() => {
    const queue = ponaTrackQueue?.queue;
    const currentUniqueId = currentTrack?.uniqueId;
    if (!queue) return [];
    return queue.filter((track) => track.uniqueId !== currentUniqueId);
  }, [ponaTrackQueue, currentTrack]);

  const [activeDragTrack, setActiveDragTrack] = useState<Track | UnresolvedTrack | null>(null);
  const [actionTrackData, setActionTrackData] = useState<{
    track: Track | UnresolvedTrack;
    queueIndex: number;
  } | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const track = playingNextQueue.find(
        (t, idx) => (t.uniqueId || `track-${idx + 1}`) === event.active.id
      );
      if (track) setActiveDragTrack(track);
    },
    [playingNextQueue]
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveDragTrack(null);
      if (!ponaTrackQueue) return;
      const { active, over } = event;
      if (over && active.id !== over.id) {
        setPonaTrackQueue((value) => {
          if (!value.queue) return value;
          const oldIndex = value.queue.findIndex(
            (track) => (track.uniqueId || '') === active.id
          );
          const newIndex = value.queue.findIndex(
            (track) => (track.uniqueId || '') === over.id
          );
          if (oldIndex >= 0 && newIndex >= 0) {
            socket?.emit('move', oldIndex, newIndex);
            return {
              queue: arrayMove(value.queue, oldIndex, newIndex),
              updating: true,
            };
          }
          return value;
        });
      }
    },
    [ponaTrackQueue, setPonaTrackQueue, socket]
  );

  const handlePlayCurrent = useCallback(() => {
    if (isPaused) socket?.emit('play');
    else socket?.emit('pause');
  }, [isPaused, socket]);

  const handleSkipTo = useCallback(
    (index: number, trackTitle?: string) => {
      toast.promise(
        emitWithTimeout((resolve, reject) => {
          socket?.emit('skipto', index, (error: unknown) => {
            if (error && (error as { status?: string }).status !== 'ok') {
              reject(error);
            } else {
              resolve();
            }
          });
        }),
        {
          loading: language.data.app.guilds.player.toast.next.loading,
          success: trackTitle
            ? `${language.data.app.guilds.player.toast.next.success}: ${trackTitle}`
            : language.data.app.guilds.player.toast.next.success,
          error: language.data.app.guilds.player.toast.next.error,
        }
      );
    },
    [socket, language]
  );

  const drawerOpenTimeRef = useRef(0);

  const handleOpenAction = useCallback(
    (track: Track | UnresolvedTrack, queueIndex: number) => {
      drawerOpenTimeRef.current = Date.now();
      setActionTrackData({ track, queueIndex });
    },
    []
  );

  const handleRemoveTrack = useCallback(
    (track: Track | UnresolvedTrack) => {
      setActionTrackData(null);
      toast.promise(
        emitWithTimeout((resolve, reject) => {
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
    },
    [socket, language]
  );

  const handleMovePNPTToQueue = useCallback(
    (track: Track | UnresolvedTrack) => {
      setActionTrackData(null);
      toast.promise(
        emitWithTimeout((resolve, reject) => {
          socket?.emit('move_pnpt_to_queue', track.uniqueId, (error: unknown) => {
            if (error && (error as { status?: string }).status !== 'ok') {
              reject(error);
            } else {
              resolve();
            }
          });
        }),
        {
          loading: (language.data.app.guilds.player.toast?.rm_track?.loading || 'Moving...')
            .replace('[track_name]', track.title)
            .replace('[artist]', String(track.author)),
          success: (language.data.app.guilds.player.context_menu?.move_to_queue || 'Move to Queue') + `: ${track.title}`,
          error: 'Error moving track to queue',
        }
      );
    },
    [socket, language]
  );

  const nowPlayingLongPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const nowPlayingTouchStartPosRef = useRef<{ x: number; y: number } | null>(null);
  const nowPlayingIsLongPressedRef = useRef(false);

  const handleNowPlayingPointerDown = (e: React.PointerEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('button')) return;
    nowPlayingIsLongPressedRef.current = false;
    nowPlayingTouchStartPosRef.current = { x: e.clientX, y: e.clientY };
    nowPlayingLongPressTimerRef.current = setTimeout(() => {
      nowPlayingIsLongPressedRef.current = true;
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        try {
          navigator.vibrate(40);
        } catch {
          // Ignore
        }
      }
      if (currentTrack) handleOpenAction(currentTrack, -1);
    }, 400);
  };

  const handleNowPlayingPointerMove = (e: React.PointerEvent) => {
    if (nowPlayingTouchStartPosRef.current) {
      const dx = Math.abs(e.clientX - nowPlayingTouchStartPosRef.current.x);
      const dy = Math.abs(e.clientY - nowPlayingTouchStartPosRef.current.y);
      if (dx > 8 || dy > 8) {
        if (nowPlayingLongPressTimerRef.current) clearTimeout(nowPlayingLongPressTimerRef.current);
        nowPlayingLongPressTimerRef.current = null;
      }
    }
  };

  const handleNowPlayingPointerUp = () => {
    if (nowPlayingLongPressTimerRef.current) clearTimeout(nowPlayingLongPressTimerRef.current);
    nowPlayingLongPressTimerRef.current = null;
    nowPlayingTouchStartPosRef.current = null;
  };

  const handleNowPlayingClick = (e: React.MouseEvent) => {
    if (nowPlayingIsLongPressedRef.current) {
      e.preventDefault();
      e.stopPropagation();
      nowPlayingIsLongPressedRef.current = false;
      return;
    }
  };

  return (
    <div
      className={cn('size-full flex flex-col min-h-0', className)}
      onPointerDown={(e) => e.stopPropagation()}
    >
      <CustomScrollArea
        onScroll={onScroll}
        className="flex-1 min-h-0 border-0 outline-0"
        classNames={{
          viewport: 'pt-2 pb-24',
        }}
      >
        {currentTrack && (
          <div className="mb-4 flex flex-col gap-1.5">
            <span className="text-xs px-4 font-bold text-default-foreground/40 tracking-wider">
              {language.data.app.guilds.player.tabs.now_playing}
            </span>
            <div
              onClick={handleNowPlayingClick}
              onContextMenu={(e) => {
                e.preventDefault();
                handleOpenAction(currentTrack, -1);
              }}
              onPointerDown={handleNowPlayingPointerDown}
              onPointerMove={handleNowPlayingPointerMove}
              onPointerUp={handleNowPlayingPointerUp}
              onPointerCancel={handleNowPlayingPointerUp}
              className="flex items-center gap-3 py-2 px-4 cursor-pointer active:bg-default/90 select-none group transform-gpu"
            >
              <div className="size-12 shrink-0 relative overflow-hidden rounded-xl bg-default/60">
                <Image
                  src={
                    currentTrack.proxyArtworkUrl ||
                    currentTrack.artworkUrl ||
                    (currentTrack.identifier
                      ? `/api/proxy/watch?v=${currentTrack.identifier}&s=md`
                      : '/static/Ponlponl123 (1459).png')
                  }
                  alt={currentTrack.title}
                  fill
                  unoptimized
                  className={cn(
                    'object-cover',
                    !isPaused && 'brightness-75 blur-[2px]'
                  )}
                />
                {!isPaused && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <AnimateIcon animate loop>
                      <AudioLines className="size-5 text-white" />
                    </AnimateIcon>
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <h4 className="text-sm font-bold text-default-foreground truncate">
                  {currentTrack.title}
                </h4>
                <p className="text-xs text-default-foreground/70 truncate">
                  {currentTrack.artist ? (
                    combineArtistName(currentTrack.artist, true, router, {
                      className: 'text-xs text-default-foreground/70 hover:underline',
                    })
                  ) : (
                    currentTrack.author || ''
                  )}
                </p>
              </div>

              <Button
                variant="ghost"
                size="icon"
                className="size-9 rounded-full text-default-foreground/60 hover:text-default-foreground hover:bg-default-foreground/10 shrink-0"
                onClick={(e) => {
                  e.stopPropagation();
                  handleOpenAction(currentTrack, -1);
                }}
              >
                <DotsThreeVerticalIcon weight="bold" className="size-5" />
              </Button>
            </div>
          </div>
        )}

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between px-4 mb-1">
            <span className="text-xs font-bold text-default-foreground/40 tracking-wider">
              {language.data.app.guilds.player.tabs.next} ({playingNextQueue.length})
            </span>
          </div>

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragCancel={() => setActiveDragTrack(null)}
          >
            <SortableContext
              items={playingNextQueue.map((t, idx) => t.uniqueId || `track-${idx + 1}`)}
              strategy={verticalListSortingStrategy}
            >
              <div className="flex flex-col gap-2">
                {playingNextQueue.map((track, idx) => (
                  <MobileDraggableTrack
                    key={track.uniqueId || `queue-item-${idx}`}
                    track={track}
                    queueIndex={idx + 1}
                    onPlay={() => handleSkipTo(idx + 1, track.title)}
                    onOpenAction={handleOpenAction}
                  />
                ))}
              </div>
            </SortableContext>

            {typeof document !== 'undefined' &&
              createPortal(
                <DragOverlay
                  adjustScale={false}
                  zIndex={1000}
                  dropAnimation={{
                    duration: 200,
                    easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)',
                  }}
                >
                  {activeDragTrack ? (
                    <div className="flex items-center gap-3 p-2 rounded-xl bg-default shadow-2xl border border-default-foreground/10 opacity-95 w-[calc(100vw-32px)] max-w-lg">
                      <div className="size-11 shrink-0 relative overflow-hidden rounded-lg">
                        <Image
                          src={
                            activeDragTrack.proxyArtworkUrl ||
                            activeDragTrack.artworkUrl ||
                            '/static/Ponlponl123 (1459).png'
                          }
                          alt={activeDragTrack.title}
                          fill
                          unoptimized
                          className="object-cover"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-sm font-semibold text-default-foreground truncate">
                          {activeDragTrack.title}
                        </h4>
                        <p className="text-xs text-default-foreground/60 truncate">
                          {activeDragTrack.author || ''}
                        </p>
                      </div>
                    </div>
                  ) : null}
                </DragOverlay>,
                document.body
              )}
          </DndContext>

          {isPNPTEnabled && pnptQueue && pnptQueue.length > 0 && (
            <div className="mt-4 flex flex-col gap-2">
              <span className="text-xs font-bold text-default-foreground/40 tracking-wider px-4">
                {(language.data.app.guilds.player.tabs as Record<string, string>)?.pnpt_title || 'PNPT Recommendations'}
              </span>
              <div className="flex flex-col gap-2">
                {pnptQueue.map((track, idx) => (
                  <MobileDraggableTrack
                    key={track.uniqueId || `pnpt-${idx}`}
                    track={{ ...track, _isPNPT: true }}
                    queueIndex={playingNextQueue.length + idx + 1}
                    onPlay={() => handleSkipTo(playingNextQueue.length + idx + 1, track.title)}
                    onOpenAction={handleOpenAction}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </CustomScrollArea>

      <Drawer
        open={Boolean(actionTrackData)}
        onOpenChange={(open) => {
          if (!open) {
            // Prevent immediate backdrop dismiss from the trailing pointer-up of the long-press gesture
            if (Date.now() - drawerOpenTimeRef.current < 450) return;
            setActionTrackData(null);
          }
        }}
      >
        <DrawerContent className="p-4 flex flex-col gap-4 max-w-lg mx-auto">
          <DrawerHeader className="p-0 text-left flex items-center gap-3">
            {actionTrackData && (
              <>
                <div className="size-14 shrink-0 relative overflow-hidden rounded-xl bg-default/60">
                  <Image
                    src={
                      actionTrackData.track.proxyArtworkUrl ||
                      actionTrackData.track.artworkUrl ||
                      '/static/Ponlponl123 (1459).png'
                    }
                    alt={actionTrackData.track.title}
                    fill
                    unoptimized
                    className="object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <DrawerTitle className="text-base font-bold text-default-foreground truncate">
                    {actionTrackData.track.title}
                  </DrawerTitle>
                  <p className="text-xs text-default-foreground/60 truncate mt-0.5">
                    {actionTrackData.track.author || ''}
                  </p>
                </div>
              </>
            )}
          </DrawerHeader>

          {actionTrackData && (
            <div className="flex flex-col gap-1.5 pt-2 border-t border-default-foreground/10">
              {actionTrackData.queueIndex !== undefined && actionTrackData.queueIndex >= 0 && (
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-3 h-12 rounded-xl text-default-foreground"
                  onClick={() => {
                    handleSkipTo(actionTrackData.queueIndex!);
                    setActionTrackData(null);
                  }}
                >
                  <PlayIcon weight="fill" className="size-5 text-[hsl(var(--pona-app-music-accent-color-500))]" />
                  <span className="font-medium">
                    {language.data.app.guilds.player.toast?.play?.success || 'Play'}
                  </span>
                </Button>
              )}

              {actionTrackData.track._isPNPT && (
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-3 h-12 rounded-xl text-default-foreground"
                  onClick={() => handleMovePNPTToQueue(actionTrackData.track)}
                >
                  <PlusIcon weight="bold" className="size-5" />
                  <span className="font-medium">
                    {language.data.app.guilds.player.context_menu?.move_to_queue || 'Move to Queue'}
                  </span>
                </Button>
              )}

              {actionTrackData.track.artist && actionTrackData.track.artist[0] && (
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-3 h-12 rounded-xl text-default-foreground"
                  onClick={() => {
                    const artistId = actionTrackData.track.artist![0].id;
                    setActionTrackData(null);
                    const currentPath = window.location.pathname;
                    const basePath = currentPath.includes('/player')
                      ? currentPath.split('/player')[0] + '/player'
                      : currentPath;
                    router.push(`${basePath}/c?c=${artistId}`);
                  }}
                >
                  <PersonSimpleIcon weight="bold" className="size-5" />
                  <span className="font-medium">
                    {language.data.app.guilds.player.context_menu.goto_artist}
                  </span>
                </Button>
              )}

              {actionTrackData.queueIndex !== undefined && actionTrackData.queueIndex >= 0 && (
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-3 h-12 rounded-xl text-danger hover:text-danger hover:bg-danger/10"
                  onClick={() => handleRemoveTrack(actionTrackData.track)}
                >
                  <TrashIcon weight="bold" className="size-5" />
                  <span className="font-medium">
                    {language.data.app.guilds.player.context_menu.rm_from_queue}
                  </span>
                </Button>
              )}
            </div>
          )}
        </DrawerContent>
      </Drawer>
    </div>
  );
}
