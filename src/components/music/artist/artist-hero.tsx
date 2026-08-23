'use client';

import React from 'react';
import { motion } from 'framer-motion';
import SubscribeButton from '@/components/music/subscribe';
import { ThumbnailFull } from '@/types/youtube/ytmusic-api';
import ImageWithSkeleton from '@/components/ui/custom/image';
import { cn } from '@/lib/utils';

import { useAppStore } from '@/store/coreStore';
import { CaretDownIcon } from '@phosphor-icons/react';

export interface ArtistHeroProps {
  highResArtworkProxyURI: string;
  artistName: string;
  artistDescription: string;
  channelId: string;
  artistThumbnails: ThumbnailFull[];
}

export function ArtistHero({
  highResArtworkProxyURI,
  artistName,
  artistDescription,
  channelId,
  artistThumbnails,
}: ArtistHeroProps) {
  const language = useAppStore((state) => state.language);
  const [isBannerLoaded, setIsBannerLoaded] = React.useState(false);
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [isClamped, setIsClamped] = React.useState(false);
  const [collapsedHeight, setCollapsedHeight] = React.useState<number | null>(null);
  const [fullHeight, setFullHeight] = React.useState<number | null>(null);
  const textRef = React.useRef<HTMLParagraphElement>(null);

  React.useEffect(() => {
    const el = textRef.current;
    if (!el) return;

    const measure = () => {
      const cs = window.getComputedStyle(el);
      const lineHeight = parseFloat(cs.lineHeight) || 24;
      const threeLinesHeight = Math.ceil(lineHeight * 3);
      const scrollH = el.scrollHeight;

      if (scrollH > threeLinesHeight + 8) {
        setIsClamped(true);
        setCollapsedHeight(threeLinesHeight);
        setFullHeight(scrollH);
      } else {
        setIsClamped(false);
        setCollapsedHeight(null);
        setFullHeight(null);
      }
    };

    measure();

    const ro = new ResizeObserver(() => measure());
    ro.observe(el);

    return () => ro.disconnect();
  }, [artistDescription]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{
        delay: 0.32,
        duration: 1,
      }}
      key={'artist-backdrop'}
      className={cn(
        'w-[calc(100%+6rem)] min-h-48 relative top-0 left-0 z-1 -translate-x-12 -translate-y-16 max-lg:-translate-y-24 transition-all duration-500',
        'min-h-[82dvh] h-auto pb-12'
      )}
    >
      <div
        className={cn(
          'inset-0 absolute z-10 mask-b-from-60% w-full h-full max-h-full duration-1000'
        )}
      >
        {highResArtworkProxyURI ? (
          <ImageWithSkeleton
            src={highResArtworkProxyURI}
            alt={artistName || 'Artist hero image'}
            onLoad={() => setIsBannerLoaded(true)}
            priority
            unoptimized
            className={cn(
              'w-full h-full max-h-full object-cover rounded-none transition-all duration-1000',
              !isBannerLoaded && 'opacity-0',
              isExpanded && 'blur-[1px] scale-105'
            )}
          />
        ) : null}
      </div>
      <div
        className={cn(
          'inset-0 absolute z-20 mask-t-from-0% mask-b-from-60% transition-colors duration-700 pointer-events-none',
          isExpanded ? 'bg-black' : 'bg-transparent',
          !isBannerLoaded && 'opacity-0'
        )}
      />
      <div className='flex flex-col -translate-x-1/2 w-full h-full absolute top-0 left-1/2 items-start justify-end z-20 px-36 max-lg:px-12 py-8 gap-4'>
        <h1 className='font-bold text-8xl max-2xl:text-7xl max-xl:text-6xl max-lg:text-5xl max-md:text-4xl max-sm:text-3xl'>
          {artistName}
        </h1>
        {artistDescription && (
          <div className='max-w-4xl text-sm md:text-base text-foreground/80 leading-relaxed'>
            <motion.div
              initial={false}
              animate={{
                height: isClamped
                  ? isExpanded
                    ? (fullHeight ?? 'auto')
                    : (collapsedHeight ?? '4.5rem')
                  : 'auto',
              }}
              transition={{
                type: 'spring',
                stiffness: 280,
                damping: 30,
                mass: 0.8,
              }}
              className={cn(
                'overflow-hidden relative transition-[mask-image] duration-500 ease-out',
                isClamped && !isExpanded && 'mask-b-from-60%'
              )}
            >
              <p
                ref={textRef}
                className={cn(
                  'whitespace-pre-line text-sm md:text-base text-foreground/80 leading-relaxed transition-all duration-500',
                  isExpanded && 'text-shadow-lg'
                )}
              >
                {artistDescription}
              </p>
            </motion.div>
            {isClamped && (
              <button
                type='button'
                onClick={() => setIsExpanded((prev) => !prev)}
                className='mt-2 inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary/80 transition-colors cursor-pointer select-none'
              >
                <span>
                  {isExpanded
                    ? language.data.common.show_less
                    : language.data.common.read_more}
                </span>
                <motion.div
                  animate={{ rotate: isExpanded ? 180 : 0 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  className='inline-flex items-center justify-center'
                >
                  <CaretDownIcon size={12} weight='bold' />
                </motion.div>
              </button>
            )}
          </div>
        )}
        <div className='flex gap-4 items-center'>
          {channelId && (
            <SubscribeButton
              channelId={channelId}
              artistName={artistName}
              artistThumbnails={artistThumbnails}
              preset='full'
            />
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default ArtistHero;
