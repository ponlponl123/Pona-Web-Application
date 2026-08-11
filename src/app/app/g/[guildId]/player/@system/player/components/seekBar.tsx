'use client';

import React, { memo, useCallback } from 'react';

export const PlayerSeekBar = memo(function PlayerSeekBar({
  sliderValue,
  maxLength,
  setSliderValue,
  onSeek,
  className,
}: {
  sliderValue: number;
  maxLength: number;
  setSliderValue: (val: number) => void;
  onSeek: (val: number) => void;
  className?: string;
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
      <div className='w-full h-1 bg-[hsl(var(--pona-app-music-accent-color-500))]/20 rounded-full overflow-hidden relative'>
        <div
          className='h-full bg-[hsl(var(--pona-app-music-accent-color-500))] transition-all duration-1000 ease-linear transform-gpu'
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </div>
  );
});

