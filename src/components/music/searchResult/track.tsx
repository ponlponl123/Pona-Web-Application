'use client';
import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import clsx from 'clsx';

import {
  ArtistBasic,
  SearchResult as HTTP_SearchResult,
  TrackResultItem,
} from '@/types/youtube/ytmusic-api';
import { msToTime } from '@/lib/utils';
import { combineArtistName, CombineArtistNameOptions } from '@/lib/artist';
import { useDiscordGuildInfo } from '@/contexts/discordGuildInfo';
import { useAppStore } from '@/store/coreStore';
import PlayButton, { PlayButtonClassNames } from '../button/play';

export type { CombineArtistNameOptions };
export { combineArtistName };

export interface TrackClassNames {
  title?: string;
  subtitle?: string;
  wrapper?: string;
  playButton?: PlayButtonClassNames;
  image?: string;
  imageWrapper?: string;
}


export function TrackSearchResult({
  result,
  classNames,
  index,
}: {
  result: HTTP_SearchResult;
  classNames?: TrackClassNames;
  index?: number;
}) {
  const router = useRouter();
  const language = useAppStore((state) => state.language);
  const { guild } = useDiscordGuildInfo();

  if (result.resultType === 'artist') return null;

  const item = result as unknown as TrackResultItem;
  const title = item.title || item.name || '';
  const videoId = item.videoId || item.browseId || '';
  const artists = item.artists || (item.artist ? [item.artist] : []);
  const thumbnails = item.thumbnails || [];
  const thumbnailUrl = thumbnails?.length ? thumbnails[thumbnails.length - 1].url : null;
  const duration = item.duration || (item.duration_seconds ? msToTime(item.duration_seconds * 1000) : '');

  return (
    <div
      className={clsx(
        'w-full max-w-full flex gap-4 items-center justify-start group hover:bg-muted/40 p-2 rounded-2xl transition-colors',
        classNames?.wrapper
      )}
    >
      {index !== undefined && (
        <span className='text-sm text-muted-foreground w-6 text-center font-medium'>
          {index}
        </span>
      )}
      <div
        className={clsx(
          'overflow-hidden aspect-square h-12 w-12 group rounded-xl relative shrink-0 bg-muted',
          classNames?.imageWrapper
        )}
      >
        {thumbnailUrl ? (
          <img
            className={clsx('object-cover w-full h-full group-hover:scale-105 transition-transform duration-300', classNames?.image)}
            src={`/api/proxy/image?r=${encodeURIComponent(thumbnailUrl)}`}
            alt={title}
          />
        ) : (
          <div className='w-full h-full bg-muted flex items-center justify-center text-muted-foreground' />
        )}
        <PlayButton
          classNames={classNames?.playButton}
          iconSize={16}
          detail={{
            author: combineArtistName(artists),
            identifier: videoId,
            sourceName: 'youtube music',
            resultType: result.resultType,
            title: title,
            uri:
              result.resultType === 'video'
                ? `https://youtu.be/${videoId}`
                : `https://music.youtube.com/watch?v=${videoId}`,
          }}
        />
      </div>

      <div className='flex flex-col justify-center items-start flex-1 min-w-0'>
        <h1
          className={clsx(
            'text-base font-medium whitespace-nowrap overflow-hidden text-ellipsis w-full text-start',
            classNames?.title
          )}
        >
          {title}
        </h1>
        <div
          className={clsx(
            'text-xs text-muted-foreground whitespace-nowrap overflow-hidden text-ellipsis w-full text-start flex gap-1 items-center',
            classNames?.subtitle
          )}
        >
          {combineArtistName(artists, true, router)}
          {item.album && (
            <>
              <span>•</span>
              <Link
                href={`/app/g/${guild?.id}/player/playlist?list=${item.album.id || item.album.browseId}`}
                className='hover:underline text-muted-foreground truncate'
              >
                {item.album.name || item.album.title}
              </Link>
            </>
          )}
        </div>
      </div>

      {duration && (
        <span className='text-xs text-muted-foreground shrink-0 font-mono'>
          {duration}
        </span>
      )}
    </div>
  );
}

export default TrackSearchResult;
