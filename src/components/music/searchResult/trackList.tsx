'use client';
import { AlbumTrack } from '@/types/youtube/ytmusic-api';
import { msToTime } from '@/utils/time';
import PlayButton from '../button/play';
import { combineArtistName } from './track';
import { useAtomValue } from 'jotai';
import { ponaCommonStateAtom } from '@/store/musicAtoms';
import React from 'react';

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
  const isCurrent = ponaCommonState?.current?.identifier === data.videoId;

  return (
    <div
      className={
        'w-full max-w-full flex gap-4 items-center justify-start group py-2 px-4 rounded-2xl overflow-hidden group hover:bg-card/50 transition-colors ' +
        (isCurrent ? 'bg-primary/10' : '')
      }
    >
      <div className='flex flex-row gap-1 justify-center items-center w-12 h-12 relative flex-shrink-0'>
        <PlayButton
          className={
            'absolute top-0 left-0 rounded-xl bg-transparent shadow-none hover:bg-primary/20 ' +
            (isCurrent ? 'opacity-100' : 'group-hover:opacity-100 opacity-0')
          }
          iconSize={14}
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
            'text-sm text-muted-foreground w-full text-center ' +
            (isCurrent ? 'opacity-0' : 'group-hover:opacity-0 opacity-100')
          }
        >
          {index}
        </span>
      </div>

      {showThumbnail && data.thumbnails && data.thumbnails.length > 0 && (
        <div className='w-12 h-12 rounded-lg overflow-hidden flex-shrink-0'>
          <img
            src={`/api/proxy/image?r=` + data.thumbnails[0].url}
            alt={data.title}
            className='w-full h-full object-cover'
          />
        </div>
      )}

      <div className='flex flex-col gap-1 justify-center items-start flex-1 min-w-0'>
        <h4 className='text-base font-medium truncate w-full text-left'>
          {data?.title}
        </h4>
        <p className='text-xs text-muted-foreground truncate w-full text-left'>
          {combineArtistName(data?.artists || [])}
        </p>
      </div>

      <div className='flex flex-row gap-1 justify-center items-center flex-shrink-0 text-xs text-muted-foreground'>
        {data.duration_seconds ? msToTime(data.duration_seconds * 1000) : ''}
      </div>
    </div>
  );
}

export default TrackList;
