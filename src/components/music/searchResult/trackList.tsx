'use client';
import React from 'react';
import Image from 'next/image';
import { useAtomValue } from 'jotai';

import { ponaCommonStateAtom } from '@/store/musicAtoms';
import { AlbumTrack } from '@/types/youtube/ytmusic-api';
import { msToTime } from '@/lib/utils';
import PlayButton from '../button/play';
import { combineArtistName } from './track';

function TrackList({
  data,
  index,
  showThumbnail = false,
}: {
  data: AlbumTrack;
  index: number;
  showThumbnail?: boolean;
}) {
  const ponaCommonState = useAtomValue(ponaCommonStateAtom);
  const isCurrentPlaying = ponaCommonState?.current?.identifier === data.videoId;

  return (
    <div
      className={
        'w-full max-w-full flex gap-4 items-center justify-start group py-2 px-4 rounded-2xl overflow-hidden ' +
        ` ${isCurrentPlaying ? 'bg-foreground/10' : 'hover:bg-muted/40 transition-colors'}`
      }
    >
      <div className='flex flex-row gap-1 justify-center items-center w-12 h-12 min-w-12 max-w-12 max-h-12 relative shrink-0'>
        <PlayButton
          playPause={isCurrentPlaying}
          className={
            'rounded-xl absolute top-0 left-0 bg-transparent ' +
            ` ${isCurrentPlaying ? '' : 'group-hover:opacity-100 opacity-0'}`
          }
          iconSize={12}
          classNames={{
            playpause: 'text-sm',
          }}
          detail={{
            author: combineArtistName(data?.artists || []),
            identifier: data?.videoId,
            sourceName: 'youtube music',
            resultType: data?.resultType,
            title: data?.title,
            uri: `https://music.youtube.com/watch?v=${data?.videoId}`,
          }}
        />
        <span
          className={
            'text-sm w-full overflow-hidden text-ellipsis whitespace-nowrap text-center text-muted-foreground font-medium' +
            ` ${isCurrentPlaying ? '' : 'group-hover:opacity-0 opacity-100'}`
          }
        >
          {index}
        </span>
      </div>
      {showThumbnail && data.thumbnails && data.thumbnails.length > 0 && (
        <div className='flex flex-row gap-1 justify-center items-center w-12 h-12 min-w-12 max-w-12 max-h-12 relative shrink-0 rounded-lg overflow-hidden'>
          <Image
            src={`/api/proxy/image?r=${encodeURIComponent(data.thumbnails[0].url)}&s=96`}
            alt={data.title}
            fill
            unoptimized
            className='aspect-square h-full w-full object-cover'
          />
        </div>
      )}
      <div className='flex flex-col gap-1 justify-center items-start flex-1 w-0 min-w-0 opacity-80 group-hover:opacity-100 transition-opacity'>
        <h1 className='text-base font-medium max-w-full w-full overflow-hidden text-ellipsis whitespace-nowrap text-start'>
          {data?.title}
        </h1>
        <h3 className='text-xs max-w-full w-full overflow-hidden text-ellipsis whitespace-nowrap text-start text-muted-foreground'>
          {combineArtistName(data?.artists || [])}
        </h3>
      </div>
      <div className='flex flex-row gap-1 justify-center items-start relative shrink-0 min-w-max'>
        <h3 className='text-xs text-muted-foreground font-mono w-full overflow-hidden text-ellipsis whitespace-nowrap text-start'>
          {data.duration_seconds ? msToTime(data.duration_seconds * 1000) : ''}
        </h3>
      </div>
    </div>
  );
}

export default TrackList;
