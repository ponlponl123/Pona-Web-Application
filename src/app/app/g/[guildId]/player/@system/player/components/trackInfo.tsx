'use client';

import React, { memo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { motion } from 'framer-motion';
import { InfoIcon } from '@phosphor-icons/react/dist/ssr';

import { combineArtistName } from '@/components/music/searchResult/track';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Track, UnresolvedTrack } from '@/types/ponaPlayer';
import { Language } from '@/lib/i18n';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/store/coreStore';

export const PlayerTrackInfo = memo(function PlayerTrackInfo({
  currentTrack,
  router,
  language,
  isMobile = false,
  onTogglePanel,
}: {
  currentTrack: Track | UnresolvedTrack | null | undefined;
  router: AppRouterInstance;
  language: Language;
  isMobile?: boolean;
  onTogglePanel?: (e: React.MouseEvent) => void;
}) {
  const userSetting = useAppStore((state) => state.userSetting);
  const handleClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (onTogglePanel && !target.closest('a') && !target.closest('button')) {
      onTogglePanel(e);
    }
  };

  return (
    <motion.div
      onClick={handleClick}
      className={cn(`flex items-center justify-start gap-4 w-full transform-gpu`, isMobile
        ? 'max-w-[calc(100%-5rem)]'
        : 'w-1/3 z-10')}
    >
      <Image
        src={
          currentTrack
            ? currentTrack?.proxyArtworkUrl || '/static/Ponlponl123 (1459).png'
            : '/static/Ponlponl123 (1459).png'
        }
        alt={currentTrack ? currentTrack.title : 'Thumbnail'}
        width={58}
        height={58}
        unoptimized
        className={cn(
          isMobile ? 'object-cover size-12 rounded-lg shadow-lg transform-gpu' :
            userSetting.dev_pona_player_style === 'modern' ?
              'size-15 object-cover max-lg:size-14 rounded-md shadow-lg transform-gpu' :
              'size-18 object-cover max-lg:size-14 rounded-md shadow-lg transform-gpu lg:-translate-y-1 max-lg:-translate-y-1.25'
        )}
        id='pona-music-thumbnail'
      />
      <div
        className={cn(
          'flex flex-col justify-center items-start',
          userSetting.dev_pona_player_style === 'modern' ? '' : ''
        )}
        style={{ width: 'calc(100% - 5.4rem)' }}
      >
        <div className='text-xl max-w-full flex gap-2 items-center'>
          <h1 className={`${isMobile ? 'text-base' : 'text-xl max-lg:text-base'} font-medium text-[hsl(var(--pona-app-music-accent-color-800))] dark:text-[hsl(var(--pona-app-music-accent-color-500))] w-full whitespace-nowrap overflow-hidden text-ellipsis`}>
            {currentTrack ? currentTrack.title : 'Music Name'}
          </h1>
          {currentTrack?.uri && (
            <Link
              href={currentTrack.uri}
              className='text-xs text-[hsl(var(--pona-app-music-accent-color-800))] dark:text-[hsl(var(--pona-app-music-accent-color-500))] hover:underline'
              target='_blank'
            >
              ↗
            </Link>
          )}
        </div>
        <div className='w-full flex flex-row gap-1 items-center justify-start'>
          {currentTrack?.artist ? (
            <div className='text-sm max-lg:text-xs text-[hsl(var(--pona-app-music-accent-color-800))]/60! dark:text-[hsl(var(--pona-app-music-accent-color-500))]/60 max-w-[calc(100%-1rem)] whitespace-nowrap overflow-hidden text-ellipsis'>
              {combineArtistName(currentTrack?.artist, true, router, {
                className:
                  'text-sm max-lg:text-xs text-[hsl(var(--pona-app-music-accent-color-800))]/60! dark:text-[hsl(var(--pona-app-music-accent-color-500))]/60!',
              })}
            </div>
          ) : (
            <span className='text-sm max-lg:text-xs text-[hsl(var(--pona-app-music-accent-color-800))]/60! dark:text-[hsl(var(--pona-app-music-accent-color-500))]/60 max-w-[calc(100%-1rem)] whitespace-nowrap overflow-hidden text-ellipsis'>
              {currentTrack?.author}
            </span>
          )}
          {!isMobile && currentTrack && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger
                  render={
                    <div className='relative group w-3 opacity-60 cursor-pointer'>
                      <InfoIcon
                        size={12}
                        className='text-[hsl(var(--pona-app-music-accent-color-800))] dark:text-[hsl(var(--pona-app-music-accent-color-500))]'
                      />
                    </div>
                  }
                />
                <TooltipContent>
                  {`${language.data.app.guilds.player.request_by} ${currentTrack?.requester?.displayName ||
                    '@' + currentTrack?.requester?.username
                    }`}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </div>
    </motion.div>
  );
});
