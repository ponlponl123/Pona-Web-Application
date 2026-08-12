'use client';
import React, { useCallback, useEffect, useRef, useState, useMemo, useDeferredValue } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowsDownUpIcon } from '@phosphor-icons/react/dist/ssr';
import { Lyric, TimestampLyrics } from '@/types/ponaPlayer';
import { useAppStore } from '@/store/coreStore';
import { useSocket } from '@/contexts/ponaMusicContext';
import { Button } from '@/components/ui/button';
import { clsx } from 'clsx';

interface Track {
  lyrics?: Lyric;
}

interface LyricsDisplayProps {
  currentTrack?: Track;
  playerPosition: number;
  lyricsProvider: HTMLElement;
  isPlaying?: boolean;
  playbackLatencyMs?: number;
}

// Memoized lyric item component for performance
const LyricItem = React.memo(({
  lyrics,
  index,
  onClick,
  className,
}: {
  lyrics: TimestampLyrics;
  index: number;
  onClick: () => void;
  className: string;
}) => (
  <div
    key={index}
    id={`lyrics-index-${index}`}
    onClick={onClick}
    className={className}
    style={{ contentVisibility: 'auto' }}
  >
    {lyrics.lyrics}
  </div>
));

LyricItem.displayName = 'LyricItem';

const LyricsDisplay: React.FC<LyricsDisplayProps> = ({
  currentTrack,
  playerPosition,
  lyricsProvider,
  isPlaying = true,
  playbackLatencyMs = 1110,
}) => {
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [autoScrollEnabled, setAutoScrollEnabled] = useState<boolean>(true);
  const [accuratePosition, setAccuratePosition] = useState<number>(playerPosition);
  const deferredActiveIndex = useDeferredValue(activeIndex);

  const isProgrammaticScrollRef = useRef<boolean>(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lyricsContainerRef = useRef<HTMLElement>(lyricsProvider);
  const millisecondCounterRef = useRef<NodeJS.Timeout | null>(null);
  const lastServerPositionRef = useRef<number>(playerPosition);
  const lastCounterTimeRef = useRef<number | null>(null);
  const activeLyricElementRef = useRef<HTMLElement | null>(null);
  const lastEmittedIndexRef = useRef<number>(-1);
  const HYSTERESIS_MS = 100; // 100ms buffer to prevent bouncing at boundaries

  const language = useAppStore((state) => state.language);
  const { socket } = useSocket();

  // Memoize language strings
  const noLyricsText = useMemo(
    () => language.data.app.guilds.player.tabs.no_lyrics_available || 'No lyrics available',
    [language.data.app.guilds.player.tabs.no_lyrics_available]
  );

  const syncLyricsText = useMemo(
    () => language.data.app.guilds.player.tabs.sync_lyrics || 'Sync lyrics',
    [language.data.app.guilds.player.tabs.sync_lyrics]
  );

  // Memoize lyrics array
  const lyricsArray = useMemo(
    () => (currentTrack?.lyrics?.lyrics as TimestampLyrics[]) || [],
    [currentTrack?.lyrics?.lyrics]
  );

  // Binary search for efficient lyric index lookup - O(log n) instead of O(n)
  const findActiveLyricIndex = useCallback((position: number): number => {
    if (lyricsArray.length === 0) return -1;

    let left = 0;
    let right = lyricsArray.length - 1;

    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      const currentSecMs = lyricsArray[mid].seconds * 1000 + playbackLatencyMs;
      const nextSecMs = lyricsArray[mid + 1]?.seconds * 1000 + playbackLatencyMs;

      // Apply hysteresis: if we're at the currently active line, require moving significantly past the next line to switch
      if (position >= currentSecMs && (!nextSecMs || position < nextSecMs + (mid === lastEmittedIndexRef.current ? HYSTERESIS_MS : 0))) {
        return mid;
      }

      if (position < currentSecMs) {
        right = mid - 1;
      } else {
        left = mid + 1;
      }
    }

    return -1;
  }, [lyricsArray, playbackLatencyMs]);

  useEffect(() => {
    lyricsContainerRef.current = lyricsProvider;
  }, [lyricsProvider]);

  // Millisecond counter for accurate position tracking between server updates
  useEffect(() => {
    const now = Date.now();

    lastServerPositionRef.current = playerPosition;
    // This sync intentionally updates the live clock state from the prop-driven playback position.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAccuratePosition(playerPosition);
    lastCounterTimeRef.current = now;

    // Destroy existing counter
    if (millisecondCounterRef.current) {
      clearInterval(millisecondCounterRef.current);
      millisecondCounterRef.current = null;
    }

    // Start counter only if playing
    if (!isPlaying) return;

    millisecondCounterRef.current = setInterval(() => {
      const previousTime = lastCounterTimeRef.current ?? Date.now();
      const now = Date.now();
      const elapsedMs = now - previousTime;

      lastCounterTimeRef.current = now;
      const newPosition = lastServerPositionRef.current + elapsedMs;
      setAccuratePosition(newPosition);
    }, 100); // Update every 100ms for smooth tracking

    return () => {
      if (millisecondCounterRef.current) {
        clearInterval(millisecondCounterRef.current);
        millisecondCounterRef.current = null;
      }
    };
  }, [playerPosition, isPlaying, playbackLatencyMs]);

  // Listen to manual user scroll/touch/wheel events to pause auto-scrolling
  useEffect(() => {
    const container = lyricsContainerRef.current;
    if (!container) return;

    const handleUserInteraction = () => {
      if (!isProgrammaticScrollRef.current) {
        setAutoScrollEnabled(false);
      }
    };

    // Use passive listeners for better scroll performance
    container.addEventListener('wheel', handleUserInteraction, { passive: true });
    container.addEventListener('touchmove', handleUserInteraction, { passive: true });
    container.addEventListener('scroll', handleUserInteraction, { passive: true });

    return () => {
      container.removeEventListener('wheel', handleUserInteraction);
      container.removeEventListener('touchmove', handleUserInteraction);
      container.removeEventListener('scroll', handleUserInteraction);
    };
  }, []);

  // Update current active lyric line index based on accurate playback position
  useEffect(() => {
    if (lyricsArray.length === 0) return;

    const newIndex = findActiveLyricIndex(accuratePosition);

    // Only update if there's a genuine change (not just noise)
    if (newIndex !== -1 && newIndex !== activeIndex) {
      // The lyric index is derived from the live playback clock, so this sync is intentional.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setActiveIndex(newIndex);
      lastEmittedIndexRef.current = newIndex;
    }
  }, [accuratePosition, lyricsArray.length, activeIndex, findActiveLyricIndex]);

  // Smooth scroll container to active lyric line
  const scrollToActiveLine = useCallback((smooth = true) => {
    const container = lyricsContainerRef.current;
    if (!container) return;

    // Use cached element reference or get new one
    if (!activeLyricElementRef.current || activeLyricElementRef.current.id !== `lyrics-index-${deferredActiveIndex}`) {
      activeLyricElementRef.current = document.getElementById(`lyrics-index-${deferredActiveIndex}`);
    }

    const activeLyric = activeLyricElementRef.current;
    if (activeLyric) {
      isProgrammaticScrollRef.current = true;
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);

      const scrollTop = activeLyric.offsetTop - container.clientHeight / 2 + activeLyric.clientHeight / 2;

      container.scrollTo({
        top: scrollTop,
        behavior: smooth ? 'smooth' : 'auto',
      });

      scrollTimeoutRef.current = setTimeout(() => {
        isProgrammaticScrollRef.current = false;
      }, 500);
    }
  }, [deferredActiveIndex]);

  // Execute auto-scroll when activeIndex changes and auto-scroll is enabled
  useEffect(() => {
    if (autoScrollEnabled) {
      scrollToActiveLine(true);
    }
  }, [activeIndex, autoScrollEnabled, scrollToActiveLine]);

  // Resume auto-scroll button handler
  const handleResumeAutoScroll = useCallback(() => {
    setAutoScrollEnabled(true);
    scrollToActiveLine(true);
  }, [scrollToActiveLine]);

  // Click on any line to seek track position and sync auto-scroll
  const handleLineClick = useCallback((seconds: number) => {
    socket?.emit('seek', Math.floor(seconds * 1000));
    setAutoScrollEnabled(true);
  }, [socket]);

  const lyricsProvidedText = (
    language.data.app.guilds.player.tabs.lyrics_provided_by || 'Lyrics provided by [provider]'
  ).replace('[provider]', currentTrack?.lyrics?.source || '');

  if (!currentTrack?.lyrics || !currentTrack?.lyrics.isTimestamp || currentTrack.lyrics.error || !lyricsArray.length) {
    return (
      <div className='text-center py-8'>
        <p className='text-[hsl(var(--pona-app-music-accent-color-800))] dark:text-[hsl(var(--pona-app-music-accent-color-500))]'>
          {noLyricsText}
        </p>
      </div>
    );
  }

  // Memoize className generation
  const getLyricsClassName = (index: number): string => {
    const baseClasses =
      'w-full h-max flex items-center text-start justify-between px-2.5 my-8 cursor-pointer disable-default-transition transition-all ease-out duration-400 tracking-wide select-none hover:opacity-90';

    const isActive = index === deferredActiveIndex;
    const isNearActive = index === deferredActiveIndex + 1 || index === deferredActiveIndex - 1;
    const isPast = index < deferredActiveIndex;

    const conditions = {
      'text-3xl text-[hsl(var(--pona-app-music-accent-color-800))]! dark:text-[hsl(var(--pona-app-music-accent-color-500))]! font-bold [html.dark_&]:brightness-150 [html.light_&]:brightness-50':
        isActive,
      'text-xl text-[hsl(var(--pona-app-music-accent-color-800))]! dark:text-[hsl(var(--pona-app-music-accent-color-800))]! dark:text-[hsl(var(--pona-app-music-accent-color-500)/0.4)]! [html.light_&]:brightness-90 [html.dark_&]:brightness-125':
        isNearActive,
      'text-base text-[hsl(var(--pona-app-music-accent-color-800))]! dark:text-[hsl(var(--pona-app-music-accent-color-500)/0.48)]!':
        isPast,
      'text-base text-[hsl(var(--pona-app-music-accent-color-800))]! dark:text-[hsl(var(--pona-app-music-accent-color-500)/0.16)]!':
        !isActive && !isNearActive && !isPast,
    };

    return clsx(baseClasses, conditions);
  };
  return (
    <div className='w-full text-center pb-[12vh] relative'>
      {lyricsArray.map((lyrics, index) => (
        <LyricItem
          key={index}
          lyrics={lyrics}
          index={index}
          onClick={() => handleLineClick(lyrics.seconds)}
          className={getLyricsClassName(index)}
        />
      ))}

      {currentTrack?.lyrics?.source && (
        <div className='mt-12 mb-4 text-xs text-[hsl(var(--pona-app-music-accent-color-500)/0.5)] font-semibold tracking-wider uppercase text-center'>
          {lyricsProvidedText}
        </div>
      )}

      {/* Floating Auto-Scroll Resume Button */}
      <AnimatePresence>
        {!autoScrollEnabled && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className='sticky left-1/2 -translate-x-1/2 bottom-6 w-max mx-auto pointer-events-auto'
          >
            <Button
              onClick={handleResumeAutoScroll}
              size='sm'
              className='rounded-full shadow-xl bg-[hsl(var(--pona-app-music-accent-color-200)/0.64)] dark:bg-[hsl(var(--pona-app-music-accent-color-800)/0.64)] text-[hsl(var(--pona-app-music-accent-color-800))] dark:text-[hsl(var(--pona-app-music-accent-color-500))] p-4 flex items-center gap-2 border-2 border-[hsl(var(--pona-app-music-accent-color-500)/0.24)]'
            >
              <ArrowsDownUpIcon className='size-4 animate-pulse' />
              <span className='text-sm font-bold tracking-wide'>
                {syncLyricsText}
              </span>
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LyricsDisplay;
