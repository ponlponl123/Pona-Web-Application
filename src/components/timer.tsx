"use client";
import { useEffect, useState } from 'react';

export type format = "default" | "h:m:s" | "h:m" | "m:s" | "h" | "m" | "s";

export default function CountdownTimer({timeLeft, format, onEnd}: {timeLeft: number, format?: format, onEnd?: () => void}) {
  const [S_timeLeft, S_setTimeLeft] = useState(timeLeft); // Countdown starting at 1 hour (in seconds)

  useEffect(() => {
    const timer = setInterval(() => {
      S_setTimeLeft(prevTime => {
        if (prevTime <= 1) {
          clearInterval(timer);
          if (onEnd) onEnd();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onEnd]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    switch ( format ) {
      case "s":
        return s.toString();
      case "m":
        return m.toString();
      case "h":
        return h.toString();
      case "m:s":
        return `${m}:${s}`;
      case "h:m":
        return `${h}:${m}`;

      case "h:m:s":
      default: 
        return `${h}:${m}:${s}`;
    }
  };

  return <span>{formatTime(S_timeLeft)}</span>
}