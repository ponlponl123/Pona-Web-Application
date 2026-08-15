'use client';

import { useCallback, useRef, useState } from 'react';
import { useAtom, useAtomValue } from 'jotai';
import { SparkleIcon, WarningCircleIcon, QuestionIcon } from '@phosphor-icons/react/dist/ssr';
import { isPNPTEnabledAtom, pnptQueueAtom, ponaCommonStateAtom } from '@/store/musicAtoms';
import { useAppStore } from '@/store/coreStore';
import { useSocket } from '@/contexts/ponaMusicContext';
import { Switch } from '@/components/ui/switch';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
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
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { DraggableTrack } from '@/app/app/g/[guildId]/player/@system/player/panel/desktop';
import { SearchTrackItemSkeleton } from '@/components/music/skeleton';
import { Track, UnresolvedTrack } from '@/types/ponaPlayer';

export default function PNPTQueueSection() {
  const [isPNPTEnabled, setIsPNPTEnabled] = useAtom(isPNPTEnabledAtom);
  const [pnptQueue, setPNPTQueue] = useAtom(pnptQueueAtom);
  const ponaCommonState = useAtomValue(ponaCommonStateAtom);
  const language = useAppStore((state) => state.language);
  const { socket } = useSocket();

  const isQueueRepeat = ponaCommonState?.pona?.repeat?.queue || false;
  const hasCurrentTrack = Boolean(ponaCommonState?.current);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    if (!pnptQueue) return;
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = pnptQueue.findIndex(
        (track) => track.uniqueId === active.id
      );
      const newIndex = pnptQueue.findIndex(
        (track) => track.uniqueId === over.id
      );
      if (oldIndex !== -1 && newIndex !== -1) {
        setPNPTQueue(arrayMove(pnptQueue, oldIndex, newIndex));
        socket?.emit('move_pnpt', oldIndex, newIndex);
      }
    }
  }

  // Track local user override for instant UI response before WS confirmation
  const [userToggledEnabled, setUserToggledEnabled] = useState<boolean | null>(null);
  const pendingEnabled = userToggledEnabled !== null ? userToggledEnabled : isPNPTEnabled;

  const handleToggle = useCallback(
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
    [socket, isQueueRepeat, setIsPNPTEnabled],
  );

  const tabsLang = (language.data.app.guilds.player.tabs as Record<string, string>) || {};
  const showShimmer = pendingEnabled && !isQueueRepeat && hasCurrentTrack && (!pnptQueue || pnptQueue.length === 0);

  return (
    <div className="flex flex-col gap-2 mt-4 pt-3 border-t border-[hsl(var(--pona-app-music-accent-color-500)/0.12)]">
      <div className="flex items-center justify-between px-2 py-1 select-none">
        <div className="flex items-center gap-2">
          <SparkleIcon weight='bold' className="size-4 text-[hsl(var(--pona-app-music-accent-color-500))]" />
          <span className="text-xs font-semibold text-[hsl(var(--pona-app-music-accent-color-500))] tracking-wider">
            {tabsLang.pnpt_toggle_label || 'Auto-continue'}
          </span>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger className="text-muted-foreground/60 hover:text-muted-foreground transition-colors cursor-pointer">
                <QuestionIcon className="size-3.5" />
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs text-xs">
                {tabsLang.pnpt_toggle_description || 'Automatically add recommended tracks when the queue is nearly empty.'}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {isQueueRepeat && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger className="text-amber-500 cursor-help flex items-center">
                  <WarningCircleIcon className="size-4" />
                </TooltipTrigger>
                <TooltipContent side="top" className="max-w-xs text-xs text-amber-500">
                  {tabsLang.pnpt_queue_repeat_incompatible || 'Auto-continue is not compatible with Queue Repeat mode.'}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>

        <Switch
          checked={!isQueueRepeat && pendingEnabled}
          disabled={isQueueRepeat}
          onCheckedChange={handleToggle}
          aria-label={tabsLang.pnpt_toggle_label || 'Auto-continue'}
          data-smooth-interaction="true"
        />
      </div>

      {showShimmer && (
        <div className="flex flex-col gap-1.5 transition-opacity duration-200">
          <span className="text-[10px] font-semibold text-[hsl(var(--pona-app-music-accent-color-500)/0.48)] uppercase tracking-wider px-2 mt-1">
            {tabsLang.pnpt_queue_title || 'Up Next (Auto)'}
          </span>
          <div className="flex flex-col gap-2 px-1 py-1">
            <SearchTrackItemSkeleton className="bg-[hsl(var(--pona-app-music-accent-color-500)/0.08)] border-none" />
            <SearchTrackItemSkeleton className="bg-[hsl(var(--pona-app-music-accent-color-500)/0.06)] border-none" />
            <SearchTrackItemSkeleton className="bg-[hsl(var(--pona-app-music-accent-color-500)/0.04)] border-none" />
          </div>
        </div>
      )}

      {!showShimmer && pnptQueue && pnptQueue.length > 0 && (
        <div
          className={`flex flex-col gap-1.5 transition-opacity duration-200 ${!pendingEnabled || isQueueRepeat ? 'opacity-40 pointer-events-none' : ''
            }`}
        >
          <span className="text-[10px] font-semibold text-[hsl(var(--pona-app-music-accent-color-500)/0.48)] uppercase tracking-wider px-2 mt-1">
            {tabsLang.pnpt_queue_title || 'Up Next (Auto)'}
          </span>
          <div className="flex flex-col gap-1 pr-1">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
              autoScroll
            >
              <SortableContext
                items={pnptQueue
                  .filter((track: Track | UnresolvedTrack) => track.uniqueId !== undefined)
                  .map((track: Track | UnresolvedTrack) => track.uniqueId as string)}
                strategy={verticalListSortingStrategy}
              >
                {pnptQueue.map((track: Track | UnresolvedTrack, idx: number) => (
                  <div key={track.uniqueId || `pnpt-${idx}`} className="relative group">
                    <DraggableTrack
                      active={false}
                      index={idx + 1}
                      queueIndex={idx}
                      track={track}
                    />
                    <span className="absolute hidden right-3 top-1/2 -translate-y-1/2 text-[10px] font-semibold px-1.5 py-0.5 rounded bg-[hsl(var(--pona-app-music-accent-color-500)/0.15)] text-[hsl(var(--pona-app-music-accent-color-500))] pointer-events-none">
                      {tabsLang.pnpt_auto_badge || 'Auto'}
                    </span>
                  </div>
                ))}
              </SortableContext>
            </DndContext>
          </div>
        </div>
      )}
    </div>
  );
}
