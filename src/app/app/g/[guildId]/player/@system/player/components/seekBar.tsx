'use client';

import { cn } from '@/lib/utils';
import React, { memo, useCallback } from 'react';

export const PlayerSeekBar = memo(function PlayerSeekBar({
  sliderValue,
  maxLength,
  setSliderValue,
  onSeek,
  className,
  isMobile = false,
}: {
  sliderValue: number;
  maxLength: number;
  setSliderValue: (val: number) => void;
  onSeek: (val: number) => void;
  className?: string;
  isMobile?: boolean;
}) {
  const progressPercent = maxLength > 0 ? Math.min(100, Math.max(0, (sliderValue / maxLength) * 100)) : 0;

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSliderValue(Number(e.target.value));
    },
    [setSliderValue]
  );

  const handleSeekEvent = useCallback(
    (e: React.MouseEvent<HTMLInputElement> | React.TouchEvent<HTMLInputElement>) => {
      onSeek(Number((e.target as HTMLInputElement).value));
    },
    [onSeek]
  );

  return (
    <div className={className || 'absolute -top-3 left-2 z-20 w-[calc(100%-1rem)] h-1 cursor-pointer group'}>
      <input
        type='range'
        min={0}
        max={maxLength}
        value={sliderValue}
        onChange={handleChange}
        onMouseUp={handleSeekEvent}
        onTouchEnd={handleSeekEvent}
        aria-label='PlayerSeekBar'
        className='absolute inset-0 w-full h-full opacity-0 cursor-pointer z-30'
      />
      <div className='w-full h-1 rounded-full overflow-hidden relative flex flex-row'>
        <div
          className={
            cn(
              'h-full transition-all duration-1000 ease-linear transform-gpu rounded-full',
              isMobile ? 'bg-default-foreground' : 'bg-[hsl(var(--pona-app-music-accent-color-800))] dark:bg-[hsl(var(--pona-app-music-accent-color-500))]'
            )
          }
          style={{ width: `${progressPercent}%` }}
        />
        <div
          className={cn(
            'h-full transition-all duration-1000 ease-linear transform-gpu min-w-0 flex-1 ml-0.5 rounded-full',
            isMobile ? 'bg-default-foreground/10' : 'bg-[hsl(var(--pona-app-music-accent-color-800))]/30 dark:bg-[hsl(var(--pona-app-music-accent-color-500))]/30'
          )}
        />
      </div>
    </div>
  );
});

