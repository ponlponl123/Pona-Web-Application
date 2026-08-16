'use client';

import React, { useCallback, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { toast } from 'sonner';
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
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
  FastForwardIcon,
  PersonSimpleIcon,
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
  originTrackAtom,
  pnptQueueAtom,
  ponaCommonStateAtom,
  queueAtom,
} from '@/store/musicAtoms';
import { isQueueReorderingAtom } from '@/store/uiAtoms';
import { Track, UnresolvedTrack } from '@/types/ponaPlayer';
import { emitWithTimeout } from '@/lib/promiseWithTimeout';
import { AnimateIcon } from '@/components/animate-ui/icons/icon';
import { AudioLines } from '@/components/animate-ui/icons/audio-lines';
import CustomScrollArea from '@/components/ui/custom/scroll-area';
import { cn } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';

export const MobileDraggableTrack = React.memo(function MobileDraggableTrack({
  track,
  queueIndex,
  onPlay,
  onOpenAction,
  onHandleStart,
  onHandleEnd,
}: {
  track: Track | UnresolvedTrack;
  queueIndex: number;
  onPlay: () => void;
  onOpenAction: (track: Track | UnresolvedTrack, queueIndex: number) => void;
  onHandleStart?: () => void;
  onHandleEnd?: () => void;
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

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.35 : 1,
    contentVisibility: 'auto',
    containIntrinsicSize: '0 56px',
  };

  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const touchStartPosRef = useRef<{ x: number; y: number } | null>(null);
  const isLongPressedRef = useRef(false);
  const isMovedRef = useRef(false);

  const handlePointerDown = (e: React.PointerEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('[data-drag-handle]')) return;
    isMovedRef.current = false;
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
      if (dx > 6 || dy > 6) {
        isMovedRef.current = true;
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
    if (isLongPressedRef.current || isMovedRef.current) {
      e.preventDefault();
      e.stopPropagation();
      isLongPressedRef.current = false;
      isMovedRef.current = false;
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
        onPointerDown={(e) => {
          onHandleStart?.();
          listeners?.onPointerDown?.(e);
          e.stopPropagation();
        }}
        onPointerUp={() => onHandleEnd?.()}
        onPointerCancel={() => onHandleEnd?.()}
        onTouchStart={(e) => {
          onHandleStart?.();
          listeners?.onTouchStart?.(e);
          e.stopPropagation();
        }}
        onTouchEnd={() => onHandleEnd?.()}
        onTouchCancel={() => onHandleEnd?.()}
        onClick={(e) => e.stopPropagation()}
      >
        <DotsSixVerticalIcon weight="bold" className="size-5" />
      </div>
    </div>
  );
})

const MobileQueueView = React.memo(function MobileQueueView({
  onScroll,
  snapStage,
  className,
}: {
  onScroll?: (e: React.UIEvent<HTMLDivElement>) => void;
  snapStage?: number;
  className?: string;
}) {
  const language = useAppStore((state) => state.language);
  const router = useRouter();
  const ponaCommonState = useAtomValue(ponaCommonStateAtom);
  const originTrack = useAtomValue(originTrackAtom);
  const [ponaTrackQueue, setPonaTrackQueue] = useAtom(queueAtom);
  const [isPNPTEnabled, setIsPNPTEnabled] = useAtom(isPNPTEnabledAtom);
  const [pnptQueue, setPNPTQueue] = useAtom(pnptQueueAtom);
  const { socket } = useSocket();

  const isQueueRepeat = ponaCommonState?.pona?.repeat?.queue || false;
  const currentTrack = ponaCommonState?.current;
  const isPaused = Boolean(ponaCommonState?.pona?.paused);

  // Track local user override for instant UI response before WS confirmation
  const [userToggledEnabled, setUserToggledEnabled] = useState<boolean | null>(null);
  const pendingEnabled = userToggledEnabled !== null ? userToggledEnabled : isPNPTEnabled;
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleTogglePNPT = useCallback(
    (checked: boolean) => {
      if (isQueueRepeat) return;
      setUserToggledEnabled(checked);

      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      debounceTimerRef.current = setTimeout(() => {
        if (socket) {
          socket.emit('pnpt_toggle', checked, (res: { status: string; enabled?: boolean }) => {
            if (res?.status === 'ok' && typeof res.enabled === 'boolean') {
              setIsPNPTEnabled(res.enabled);
              setUserToggledEnabled(null);
            }
          });
        }
      }, 500);
    },
    [socket, isQueueRepeat, setIsPNPTEnabled]
  );

  const playingNextQueue = useMemo(() => {
    const queue = ponaTrackQueue?.queue;
    const currentUniqueId = currentTrack?.uniqueId;
    if (!queue) return [];
    return queue.filter((track) => track.uniqueId !== currentUniqueId);
  }, [ponaTrackQueue, currentTrack]);

  const [activeDragTrack, setActiveDragTrack] = useState<Track | UnresolvedTrack | null>(null);
  const [activeDragPnptTrack, setActiveDragPnptTrack] = useState<Track | UnresolvedTrack | null>(null);
  const [actionTrackData, setActionTrackData] = useState<{
    track: Track | UnresolvedTrack;
    queueIndex: number;
  } | null>(null);
  const setIsQueueReordering = useSetAtom(isQueueReorderingAtom);

  const handleHandleStart = useCallback(() => {
    setIsQueueReordering(true);
  }, [setIsQueueReordering]);

  const handleHandleEnd = useCallback(() => {
    if (!activeDragTrack && !activeDragPnptTrack) {
      setIsQueueReordering(false);
    }
  }, [activeDragTrack, activeDragPnptTrack, setIsQueueReordering]);

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 0,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      setIsQueueReordering(true);
      const track = playingNextQueue.find(
        (t, idx) => (t.uniqueId || `track-${idx + 1}`) === event.active.id
      );
      if (track) setActiveDragTrack(track);
    },
    [playingNextQueue, setIsQueueReordering]
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveDragTrack(null);
      setIsQueueReordering(false);
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
    [ponaTrackQueue, setPonaTrackQueue, socket, setIsQueueReordering]
  );

  const handlePnptDragStart = useCallback(
    (event: DragStartEvent) => {
      setIsQueueReordering(true);
      if (!pnptQueue) return;
      const track = pnptQueue.find(
        (t, idx) => (t.uniqueId || `pnpt-${idx + 1}`) === event.active.id
      );
      if (track) setActiveDragPnptTrack(track);
    },
    [pnptQueue, setIsQueueReordering]
  );

  const handlePnptDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveDragPnptTrack(null);
      setIsQueueReordering(false);
      if (!pnptQueue) return;
      const { active, over } = event;
      if (over && active.id !== over.id) {
        const oldIndex = pnptQueue.findIndex(
          (track, idx) => (track.uniqueId || `pnpt-${idx + 1}`) === active.id
        );
        const newIndex = pnptQueue.findIndex(
          (track, idx) => (track.uniqueId || `pnpt-${idx + 1}`) === over.id
        );
        if (oldIndex !== -1 && newIndex !== -1) {
          setPNPTQueue(arrayMove(pnptQueue, oldIndex, newIndex));
          socket?.emit('move_pnpt', oldIndex, newIndex);
        }
      }
    },
    [pnptQueue, setPNPTQueue, socket, setIsQueueReordering]
  );

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
  const nowPlayingIsMovedRef = useRef(false);

  const handleNowPlayingPointerDown = (e: React.PointerEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('button')) return;
    nowPlayingIsMovedRef.current = false;
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
      if (dx > 6 || dy > 6) {
        nowPlayingIsMovedRef.current = true;
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
    if (nowPlayingIsLongPressedRef.current || nowPlayingIsMovedRef.current) {
      e.preventDefault();
      e.stopPropagation();
      nowPlayingIsLongPressedRef.current = false;
      nowPlayingIsMovedRef.current = false;
      return;
    }
  };

  return (
    <div
      className={cn('size-full flex flex-col min-h-0', className)}
    >
      <div className={cn(
        "w-full border-b border-transparent p-4 pt-6 flex items-center sticky top-0 z-40",
        snapStage === 2 ? "bg-default border-default-foreground/10" : ""
      )}>
        <div className="w-full min-w-0 flex-1 pr-4">
          <p className="text-default-foreground/60 text-xs font-bold truncate block">
            {(language.data.app.guilds.player.tabs as Record<string, string>)?.playing_from || 'กำลังเล่นจาก'}
          </p>
          <span className="text-default-foreground text-base font-bold truncate block">
            {originTrack
              ? `${(language.data.app.guilds.player.tabs as Record<string, string>)?.mix_prefix || 'มิกซ์ '}${originTrack.title}`
              : currentTrack?.title || ''}
          </span>
        </div>
        <div className='flex items-center gap-1.5 shrink-0'>
          <span
            className={cn(
              'text-xs font-bold transition-colors select-none',
              isQueueRepeat ? 'text-default-foreground/25' : 'text-default-foreground/60'
            )}
          >
            {(language.data.app.guilds.player.tabs as Record<string, string>)?.pnpt_auto_badge || 'PNPT'}
          </span>
          <Switch
            size="sm"
            checked={!isQueueRepeat && pendingEnabled}
            disabled={isQueueRepeat}
            onCheckedChange={handleTogglePNPT}
            data-smooth-interaction="true"
            aria-label={(language.data.app.guilds.player.tabs as Record<string, string>)?.pnpt_toggle_label || 'Auto-continue'}
          />
        </div>
      </div>
      <CustomScrollArea
        onScroll={onScroll}
        className="flex-1 min-h-0 border-0 outline-0"
      >
        <div className={cn(
          "pointer-events-none absolute top-0 left-0 w-full h-full bg-linear-to-b from-default to-transparent -z-10",
          snapStage === 2 ? "opacity-100" : "opacity-0"
        )} />
        <div className='w-full pt-2 pb-24'>
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
                <div className="size-12 shrink-0 relative overflow-hidden rounded-sm bg-default/60">
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
              onDragCancel={() => {
                setActiveDragTrack(null);
                setIsQueueReordering(false);
              }}
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
                      queueIndex={idx}
                      onPlay={() => handleSkipTo(idx, track.title)}
                      onOpenAction={handleOpenAction}
                      onHandleStart={handleHandleStart}
                      onHandleEnd={handleHandleEnd}
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

            {pnptQueue && pnptQueue.length > 0 && (
              <div className={cn(
                "mt-4 flex flex-col gap-2",
                (!pendingEnabled || isQueueRepeat) && "pointer-events-none blur-[2px] opacity-40"
              )}>
                <span className="text-xs font-bold text-default-foreground/40 tracking-wider px-4">
                  {(language.data.app.guilds.player.tabs as Record<string, string>)?.pnpt_title || 'เล่นอัตโนมัติ'}
                </span>
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragStart={handlePnptDragStart}
                  onDragEnd={handlePnptDragEnd}
                  onDragCancel={() => {
                    setActiveDragPnptTrack(null);
                    setIsQueueReordering(false);
                  }}
                >
                  <SortableContext
                    items={pnptQueue.map((t, idx) => t.uniqueId || `pnpt-${idx + 1}`)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="flex flex-col gap-2">
                      {pnptQueue.map((track, idx) => (
                        <MobileDraggableTrack
                          key={track.uniqueId || `pnpt-${idx + 1}`}
                          track={{ ...track, _isPNPT: true }}
                          queueIndex={playingNextQueue.length + idx}
                          onPlay={() => handleSkipTo(playingNextQueue.length + idx, track.title)}
                          onOpenAction={handleOpenAction}
                          onHandleStart={handleHandleStart}
                          onHandleEnd={handleHandleEnd}
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
                        {activeDragPnptTrack ? (
                          <div className="flex items-center gap-3 p-2 rounded-xl bg-default shadow-2xl border border-default-foreground/10 opacity-95 w-[calc(100vw-32px)] max-w-lg">
                            <div className="size-11 shrink-0 relative overflow-hidden rounded-lg">
                              <Image
                                src={
                                  activeDragPnptTrack.proxyArtworkUrl ||
                                  activeDragPnptTrack.artworkUrl ||
                                  '/static/Ponlponl123 (1459).png'
                                }
                                alt={activeDragPnptTrack.title}
                                fill
                                unoptimized
                                className="object-cover"
                              />
                            </div>
                            <div className="min-w-0 flex-1">
                              <h4 className="text-sm font-semibold text-default-foreground truncate">
                                {activeDragPnptTrack.title}
                              </h4>
                              <p className="text-xs text-default-foreground/60 truncate">
                                {activeDragPnptTrack.author || ''}
                              </p>
                            </div>
                          </div>
                        ) : null}
                      </DragOverlay>,
                      document.body
                    )}
                </DndContext>
              </div>
            )}
          </div>
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
        modal
        showSwipeHandle
        swipeDirection="down"
      >
        <DrawerContent className="border-none bg-overlay backdrop-blur-xl">
          <DrawerHeader className="py-4 px-4 mb-2 border-b border-default-foreground/10 text-left flex items-center gap-3">
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
            <div className="flex flex-col pb-6">
              {actionTrackData.queueIndex !== undefined && actionTrackData.queueIndex >= 0 && (
                <Button
                  variant="ghost"
                  size="lg"
                  className="justify-start p-3 h-max border-0 text-default-foreground gap-3"
                  onClick={() => {
                    handleSkipTo(actionTrackData.queueIndex!);
                    setActionTrackData(null);
                  }}
                >
                  <FastForwardIcon weight="fill" className="size-5" />
                  <span className="font-medium">
                    Skip to
                  </span>
                </Button>
              )}

              {actionTrackData.track._isPNPT && (
                <Button
                  variant="ghost"
                  size="lg"
                  className="justify-start p-3 h-max border-0 text-default-foreground gap-3"
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
                  size="lg"
                  className="justify-start p-3 h-max border-0 text-default-foreground gap-3"
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
                  size="lg"
                  className="justify-start p-3 h-max border-0 text-danger hover:text-danger hover:bg-danger/10 gap-3"
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
});

export default MobileQueueView;
