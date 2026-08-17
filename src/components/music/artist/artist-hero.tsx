'use client';

import React from 'react';
import { motion } from 'framer-motion';
import SubscribeButton from '@/components/music/subscribe';
import { ThumbnailFull } from '@/types/youtube/ytmusic-api';
import ImageWithSkeleton from '@/components/ui/custom/image';
import { cn } from '@/lib/utils';

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
  const [isBannerLoaded, setIsBannerLoaded] = React.useState(false);
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
      className={`w-[calc(100%+6rem)] h-dvh ${artistDescription ? 'max-h-[82dvh]' : 'max-h-[64dvh]'
        } min-h-48 relative top-0 left-0 z-1 -translate-x-12 -translate-y-16 max-lg:-translate-y-24`}
    >
      {highResArtworkProxyURI ? (
        <ImageWithSkeleton
          src={highResArtworkProxyURI}
          alt={artistName || 'Artist hero image'}
          onLoad={() => setIsBannerLoaded(true)}
          priority
          unoptimized
          className={cn(
            'absolute mask-b-from-60% top-0 left-0 w-full h-full max-h-full object-cover rounded-none transition-all duration-1000',
            !isBannerLoaded && 'opacity-0'
          )}
        />
      ) : null}
      <div className='flex flex-col -translate-x-1/2 w-full h-full absolute top-0 left-1/2 items-start justify-end z-20 px-36 max-lg:px-12 py-8 gap-4'>
        <h1 className='font-bold text-8xl max-2xl:text-7xl max-xl:text-6xl max-lg:text-5xl max-md:text-4xl max-sm:text-3xl'>
          {artistName}
        </h1>
        {artistDescription && <p>{artistDescription}</p>}
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
