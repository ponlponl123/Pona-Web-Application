'use client';

import { cn } from '@/lib/utils';
import React, { memo, useCallback, useRef, useState } from 'react';
import { useAtomValue } from 'jotai';
import { playbackAtom } from '@/store/musicAtoms';

export const PlayerSeekBar = memo(function PlayerSeekBar({
  sliderValue,
  maxLength,
  setSliderValue,
  onSeek,
  className,
  isMobile = false,
}: {
  sliderValue?: number;
  maxLength: number;
  setSliderValue?: (val: number) => void;
  onSeek: (val: number) => void;
  className?: string;
  isMobile?: boolean;
}) {
  const livePlayback = useAtomValue(playbackAtom);
  const currentVal = sliderValue !== undefined ? sliderValue : livePlayback;
  const [seekValue, setSeekValue] = useState<number | null>(null);
  const isSeeking = seekValue !== null;
  const activeValue = seekValue !== null ? seekValue : currentVal;
  const progressPercent = maxLength > 0 ? Math.min(100, Math.max(0, (activeValue / maxLength) * 100)) : 0;

  const startTouchRef = useRef<{ x: number; y: number; initialVal: number } | null>(null);
  const isVerticalSwipeRef = useRef<boolean>(false);

  const handleTouchStart = useCallback(
    (e: React.TouchEvent<HTMLInputElement>) => {
      const touch = e.touches[0];
      if (touch) {
        startTouchRef.current = {
          x: touch.clientX,
          y: touch.clientY,
          initialVal: activeValue,
        };
        isVerticalSwipeRef.current = false;
      }
    },
    [activeValue]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent<HTMLInputElement>) => {
      if (!startTouchRef.current) return;
      const touch = e.touches[0];
      if (!touch) return;

      const dx = Math.abs(touch.clientX - startTouchRef.current.x);
      const dy = Math.abs(touch.clientY - startTouchRef.current.y);

      if (!isSeeking && !isVerticalSwipeRef.current) {
        if (dy > 8 && dy > dx) {
          isVerticalSwipeRef.current = true;
          setSeekValue(null);
          setSliderValue?.(startTouchRef.current.initialVal);
          return;
        }
        if (dx > 5 && dx >= dy) {
          setSeekValue(startTouchRef.current.initialVal);
        }
      }

      if (isVerticalSwipeRef.current) {
        setSeekValue(null);
        setSliderValue?.(startTouchRef.current.initialVal);
      }
    },
    [isSeeking, setSliderValue]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (isVerticalSwipeRef.current) return;
      const val = Number(e.target.value);
      setSeekValue(val);
      setSliderValue?.(val);
    },
    [setSliderValue]
  );

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLInputElement>) => {
    setSeekValue(Number((e.target as HTMLInputElement).value));
  }, []);

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent<HTMLInputElement>) => {
      if (isVerticalSwipeRef.current) {
        if (startTouchRef.current) {
          setSliderValue?.(startTouchRef.current.initialVal);
        }
        startTouchRef.current = null;
        isVerticalSwipeRef.current = false;
        setSeekValue(null);
        return;
      }

      const finalVal = Number((e.target as HTMLInputElement).value);
      startTouchRef.current = null;
      setSeekValue(null);
      onSeek(finalVal);
    },
    [onSeek, setSliderValue]
  );

  const handleMouseUp = useCallback(
    (e: React.MouseEvent<HTMLInputElement>) => {
      const finalVal = Number((e.target as HTMLInputElement).value);
      setSeekValue(null);
      onSeek(finalVal);
    },
    [onSeek]
  );

  return (
    <div className={cn(
      'absolute -top-3 left-2 z-20 w-[calc(100%-1rem)] h-2 cursor-pointer group/seek', className
    )}>
      <input
        type='range'
        min={0}
        max={maxLength}
        value={activeValue}
        onChange={handleChange}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseUp={handleMouseUp}
        aria-label='PlayerSeekBar'
        className='absolute top-0 bottom-0 left-0 right-0 w-full h-2 opacity-0 cursor-pointer z-30 touch-pan-x'
      />
      <div
        className={cn(
          'w-full apply-soft-transition rounded-full overflow-hidden relative flex flex-row items-center',
          isSeeking ? 'h-2' : 'h-1'
        )}
      >
        <div
          className={cn(
            'h-full transform-gpu rounded-full',
            isSeeking ? 'duration-0' : 'duration-1000 ease-linear',
            isMobile
              ? 'bg-default-foreground'
              : 'bg-[hsl(var(--pona-app-music-accent-color-800))] dark:bg-[hsl(var(--pona-app-music-accent-color-500))]'
          )}
          style={{ width: `${progressPercent}%` }}
        />
        <div
          className={cn(
            'h-full transform-gpu min-w-0 flex-1 ml-0.5 rounded-full',
            isSeeking ? 'duration-0' : 'duration-1000 ease-linear',
            isMobile
              ? 'bg-default-foreground/15'
              : 'bg-[hsl(var(--pona-app-music-accent-color-800))]/30 dark:bg-[hsl(var(--pona-app-music-accent-color-500))]/30'
          )}
        />
      </div>
    </div>
  );
});

