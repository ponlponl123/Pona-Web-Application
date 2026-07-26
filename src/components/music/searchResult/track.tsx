'use client';
import {
  ArtistBasic,
  SearchResult as HTTP_SearchResult,
} from '@/types/youtube/ytmusic-api';
import { Button } from '@/components/ui/button';
import { Play } from '@phosphor-icons/react/dist/ssr';
import clsx from 'clsx';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { useRouter } from 'next/navigation';
import React from 'react';
import PlayButton, { PlayButtonClassNames } from '../button/play';
import { useAppStore } from '@/store/coreStore';

export interface TrackClassNames {
  title?: string;
  subtitle?: string;
  wrapper?: string;
  playButton?: PlayButtonClassNames;
  image?: string;
  imageWrapper?: string;
}

export interface CombineArtistNameOptions {
  className?: string;
}

export function combineArtistName(artists: ArtistBasic[]): string;
export function combineArtistName(
  artists: ArtistBasic[],
  isElement?: boolean
): React.ReactNode;
export function combineArtistName(
  artists: ArtistBasic[],
  isElement?: boolean,
  router?: AppRouterInstance
): React.ReactNode;
export function combineArtistName(
  artists: ArtistBasic[],
  isElement?: boolean,
  router?: AppRouterInstance,
  options?: CombineArtistNameOptions
): React.ReactNode;
export function combineArtistName(
  artists: ArtistBasic[],
  isElement?: boolean,
  router?: AppRouterInstance,
  options?: CombineArtistNameOptions
): string | React.ReactNode {
  let artist: string = '';
  if (!artists) return artist;
  if (isElement) {
    return (
      <>
        {artists.map((artist, index) => {
          if (!artist.id)
            return index === 0 ? (
              <React.Fragment key={index}>{artist.name}</React.Fragment>
            ) : (
              <React.Fragment key={index}> & {artist.name}</React.Fragment>
            );
          const href = `/app/g/player/c?c=${artist.id}`;
          return index === 0 ? (
            <span
              key={index}
              className={clsx('cursor-pointer hover:underline', options?.className)}
              onClick={() => router && router.push(href)}
            >
              {artist.name}
            </span>
          ) : (
            <React.Fragment key={index}>
              {' & '}
              <span
                className={clsx('cursor-pointer hover:underline', options?.className)}
                onClick={() => router && router.push(href)}
              >
                {artist.name}
              </span>
            </React.Fragment>
          );
        })}
      </>
    );
  }
  for (let i = 0; i < artists.length; i++) {
    if (artists[i].name) {
      if (i > 0) artist = artist + ' & ' + artists[i].name;
      else artist = artists[i].name;
    }
  }
  return artist;
}

export function TrackDetail({
  data,
  isHasPlay = true,
  classNames,
}: {
  data: any;
  classNames?: TrackClassNames;
  isHasPlay?: boolean;
}) {
  const router = useRouter();
  const language = useAppStore((state) => state.language);
  const title =
    'title' in data
      ? data?.title
      : 'name' in data
        ? data?.name
        : 'artist' in data
          ? data?.artist
          : '';
  const thumbnail = data?.thumbnails && data?.thumbnails.length > 0
    ? data?.thumbnails[data?.thumbnails.length - 1]?.url
    : '/static/backdrop.png';

  return (
    <div className='w-full flex gap-4 items-center justify-start group hover:bg-card/50 p-2 rounded-2xl border border-transparent hover:border-border transition-all'>
      <div className='relative w-14 h-14 rounded-xl overflow-hidden flex-shrink-0'>
        <img
          src={thumbnail}
          alt={title}
          className='object-cover w-14 h-14 rounded-xl'
        />
        {isHasPlay && (data?.category === 'Songs' || data?.category === 'Videos' || data?.videoId) && (
          <div className='absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity'>
            <PlayButton
              iconSize={16}
              detail={{
                author:
                  'artists' in data && data.artists ? combineArtistName(data.artists) : '',
                identifier: data?.videoId,
                sourceName: 'youtube music',
                resultType: data?.resultType,
                title: data?.title,
                uri: `https://music.youtube.com/watch?v=${data?.videoId}`,
              }}
            />
          </div>
        )}
      </div>
      <div className='flex flex-col justify-center items-start min-w-0 flex-1'>
        <h3
          className={clsx(
            'text-base font-semibold w-full truncate text-left',
            classNames?.title
          )}
        >
          {title}
        </h3>
        <p className={clsx('text-xs text-muted-foreground w-full truncate text-left', classNames?.subtitle)}>
          {'artists' in data && data.artists
            ? combineArtistName(data.artists, true, router)
            : data.author || ''}
        </p>
      </div>
    </div>
  );
}

export default TrackDetail;
