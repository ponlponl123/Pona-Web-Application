import { Lyric, TimestampLyrics } from '@/interfaces/ponaPlayer';
import { useState, useEffect, useRef } from 'react';

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
  const lyricsContainerRef = useRef<HTMLElement>(lyricsProvider);

  useEffect(() => {
    if (!currentTrack?.lyrics || !currentTrack?.lyrics?.isTimestamp) return;

    const newIndex = (
      currentTrack?.lyrics.lyrics as TimestampLyrics[]
    ).findIndex((lyrics, index) => {
      const nextLyrics = currentTrack?.lyrics?.lyrics?.[
        index + 1
      ] as TimestampLyrics;
      return (
        playerPosition >= lyrics.seconds * 1000 &&
        (!nextLyrics || playerPosition < nextLyrics.seconds * 1000)
      );
    });

    if (newIndex !== -1) setActiveIndex(newIndex);
  }, [playerPosition, currentTrack]);

  // Auto-scroll to active lyrics
  useEffect(() => {
    if (!lyricsContainerRef.current) return;

    const activeLyric = document.getElementById(`lyrics-index-${activeIndex}`);
    if (activeLyric) {
      lyricsContainerRef.current.scrollTo({
        top:
          activeLyric.offsetTop - lyricsContainerRef.current.clientHeight / 2,
        behavior: 'smooth',
      });
    }
  }, [activeIndex]);

  if (!currentTrack?.lyrics || !currentTrack?.lyrics.isTimestamp) {
    return (
      <div className='text-center text-foreground/40'>No lyrics available</div>
    );
  }

  return (
    <div className='w-full text-center pb-[24vh]'>
      {(currentTrack?.lyrics.lyrics as TimestampLyrics[]).map(
        (lyrics, index) => (
          <div
            key={index}
            id={`lyrics-index-${index}`}
            className={`w-full h-max flex items-center text-start justify-between px-2.5 my-8 disable-default-transition transition-all ease-out duration-400 tracking-wide ${
              index === activeIndex
                ? 'text-3xl text-[hsl(var(--pona-app-music-accent-color-500))] font-bold [html.dark_&]:brightness-150 [html.light_&]:brightness-50'
                : index === activeIndex + 1 || index === activeIndex - 1
                  ? 'text-xl text-[hsl(var(--pona-app-music-accent-color-500)/0.4)] [html.light_&]:brightness-90 [html.dark_&]:brightness-125'
                  : index < activeIndex
                    ? 'text-base text-[hsl(var(--pona-app-music-accent-color-500)/0.48)]'
                    : 'text-base text-[hsl(var(--pona-app-music-accent-color-500)/0.16)]'
            }`}
          >
            {lyrics.lyrics}
          </div>
        )
      )}
    </div>
  );
};

export default LyricsDisplay;
