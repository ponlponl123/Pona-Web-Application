'use client';
import React, { useCallback, useEffect, useRef, useState } from 'react';
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
}

const LyricsDisplay: React.FC<LyricsDisplayProps> = ({
  currentTrack,
  playerPosition,
  lyricsProvider,
}) => {
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [autoScrollEnabled, setAutoScrollEnabled] = useState<boolean>(true);
  const isProgrammaticScrollRef = useRef<boolean>(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lyricsContainerRef = useRef<HTMLElement>(lyricsProvider);

  const language = useAppStore((state) => state.language);
  const { socket } = useSocket();

  useEffect(() => {
    lyricsContainerRef.current = lyricsProvider;
  }, [lyricsProvider]);

  // Listen to manual user scroll/touch/wheel events to pause auto-scrolling
  useEffect(() => {
    const container = lyricsContainerRef.current;
    if (!container) return;

    const handleUserInteraction = () => {
      if (!isProgrammaticScrollRef.current) {
        setAutoScrollEnabled(false);
      }
    };

    container.addEventListener('wheel', handleUserInteraction, { passive: true });
    container.addEventListener('touchmove', handleUserInteraction, { passive: true });

    return () => {
      container.removeEventListener('wheel', handleUserInteraction);
      container.removeEventListener('touchmove', handleUserInteraction);
    };
  }, [lyricsProvider]);

  // Update current active lyric line index based on playback position
  useEffect(() => {
    if (!currentTrack?.lyrics || !currentTrack?.lyrics?.isTimestamp) return;

    const lyricsArray = currentTrack.lyrics.lyrics as TimestampLyrics[];
    const newIndex = lyricsArray.findIndex((lyrics, index) => {
      const nextLyrics = lyricsArray[index + 1];
      return (
        playerPosition >= lyrics.seconds * 1000 &&
        (!nextLyrics || playerPosition < nextLyrics.seconds * 1000)
      );
    });

    if (newIndex !== -1 && newIndex !== activeIndex) {
      queueMicrotask(() => setActiveIndex(newIndex));
    }
  }, [playerPosition, currentTrack, activeIndex]);

  // Smooth scroll container to active lyric line
  const scrollToActiveLine = useCallback((smooth = true) => {
    const container = lyricsContainerRef.current;
    if (!container) return;

    const activeLyric = document.getElementById(`lyrics-index-${activeIndex}`);
    if (activeLyric) {
      isProgrammaticScrollRef.current = true;
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);

      container.scrollTo({
        top: activeLyric.offsetTop - container.clientHeight / 2 + activeLyric.clientHeight / 2,
        behavior: smooth ? 'smooth' : 'auto',
      });

      scrollTimeoutRef.current = setTimeout(() => {
        isProgrammaticScrollRef.current = false;
      }, 500);
    }
  }, [activeIndex]);

  // Execute auto-scroll when activeIndex changes and auto-scroll is enabled
  useEffect(() => {
    if (autoScrollEnabled) {
      scrollToActiveLine(true);
    }
  }, [activeIndex, autoScrollEnabled, scrollToActiveLine]);

  // Resume auto-scroll button handler
  const handleResumeAutoScroll = () => {
    setAutoScrollEnabled(true);
    scrollToActiveLine(true);
  };

  // Click on any line to seek track position and sync auto-scroll
  const handleLineClick = (seconds: number) => {
    socket?.emit('seek', Math.floor(seconds * 1000));
    setAutoScrollEnabled(true);
  };

  if (!currentTrack?.lyrics || !currentTrack?.lyrics.isTimestamp || currentTrack.lyrics.error || !currentTrack.lyrics.lyrics || currentTrack.lyrics.lyrics.length === 0) {
    return (
      <div className='text-center py-8'>
        <p className='text-[hsl(var(--pona-app-music-accent-color-800))] dark:text-[hsl(var(--pona-app-music-accent-color-500))]'>
          {language.data.app.guilds.player.tabs.no_lyrics_available || 'No lyrics available'}
        </p>
      </div>
    );
  }

  const getLyricsClassName = (index: number): string => {
    const baseClasses =
      'w-full h-max flex items-center text-start justify-between px-2.5 my-8 cursor-pointer disable-default-transition transition-all ease-out duration-400 tracking-wide select-none hover:opacity-90';

    const conditions = {
      'text-3xl text-[hsl(var(--pona-app-music-accent-color-800))]! dark:text-[hsl(var(--pona-app-music-accent-color-500))]! font-bold [html.dark_&]:brightness-150 [html.light_&]:brightness-50':
        index === activeIndex,
      'text-xl text-[hsl(var(--pona-app-music-accent-color-800))]! dark:text-[hsl(var(--pona-app-music-accent-color-500)/0.4)]! [html.light_&]:brightness-90 [html.dark_&]:brightness-125':
        index === activeIndex + 1 || index === activeIndex - 1,
      'text-base text-[hsl(var(--pona-app-music-accent-color-800))]! dark:text-[hsl(var(--pona-app-music-accent-color-500)/0.48)]!':
        index < activeIndex,
      'text-base text-[hsl(var(--pona-app-music-accent-color-800))]! dark:text-[hsl(var(--pona-app-music-accent-color-500)/0.16)]!':
        index > activeIndex && index !== activeIndex + 1,
    };

    return clsx(baseClasses, conditions);
  };

  const lyricsProvidedText = (
    language.data.app.guilds.player.tabs.lyrics_provided_by || 'Lyrics provided by [provider]'
  ).replace('[provider]', currentTrack.lyrics.source || '');

  const tabs = language.data.app.guilds.player.tabs as Record<string, string>;
  const syncLyricsText = tabs.sync_lyrics || 'Sync lyrics';

  return (
    <div className='w-full text-center pb-[12vh] relative'>
      {(currentTrack.lyrics.lyrics as TimestampLyrics[]).map(
        (lyrics, index) => (
          <div
            key={index}
            id={`lyrics-index-${index}`}
            onClick={() => handleLineClick(lyrics.seconds)}
            className={getLyricsClassName(index)}
          >
            {lyrics.lyrics}
          </div>
        )
      )}

      {currentTrack.lyrics.source && (
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
