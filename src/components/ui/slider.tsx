'use client';

import * as React from 'react';

export interface SliderProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'defaultValue'> {
  value?: number[];
  defaultValue?: number[];
  onValueChange?: (value: number[]) => void;
  onValueChangeEnd?: (value: number[]) => void;
  max?: number;
  min?: number;
  step?: number;
}

export const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
  (
    {
      className,
      value,
      defaultValue,
      onValueChange,
      onValueChangeEnd,
      max = 100,
      min = 0,
      step = 1,
      ...props
    },
    ref
  ) => {
    const val = value ? value[0] : defaultValue ? defaultValue[0] : min;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const num = Number(e.target.value);
      if (onValueChange) onValueChange([num]);
    };

    const handleMouseUp = (e: React.MouseEvent<HTMLInputElement>) => {
      const num = Number((e.target as HTMLInputElement).value);
      if (onValueChangeEnd) onValueChangeEnd([num]);
    };

    return (
      <input
        type='range'
        ref={ref}
        min={min}
        max={max}
        step={step}
        value={val}
        onChange={handleChange}
        onMouseUp={handleMouseUp}
        className={`w-full accent-primary bg-secondary rounded-lg h-2 cursor-pointer ${className || ''}`}
        {...props}
      />
    );
  }
);

Slider.displayName = 'Slider';
