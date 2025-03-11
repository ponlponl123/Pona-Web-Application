import { msToTime } from '@/utils/time';
import React from 'react'
import PlayButton from '../play';
import { useGlobalContext } from '@/contexts/globalContext';
import { AlbumTrack } from '@/interfaces/ytmusic-api';
import { combineArtistName } from './track';
import { Image } from '@nextui-org/react';

function TrackList({data, index, showThumbnail = false}: {data: AlbumTrack, index: number, showThumbnail?: boolean}) {
  const { ponaCommonState } = useGlobalContext();
  return (
    <div className={
      'w-full max-w-full flex gap-4 items-center justify-start group py-2 px-4 rounded-2xl overflow-hidden'
      + ` ${ponaCommonState?.current?.identifier === data.videoId?'bg-foreground/10':''}`
    }>
      <div className='flex flex-row gap-1 justify-center items-center w-12 h-12 min-w-12 max-w-12 max-h-12 relative flex-[0 1 auto]'>
        <PlayButton playPause={ponaCommonState?.current?.identifier === data.videoId} className={
          'rounded-xl absolute top-0 left-0 bg-transparent ' + ` ${ponaCommonState?.current?.identifier === data.videoId?'':'group-hover:opacity-100 opacity-0'}`
        } iconSize={12} classNames={{
          playpause: 'text-sm'
        }} detail={{
          author: combineArtistName(data?.artists),
          identifier: data?.videoId,
          sourceName: 'youtube music',
          resultType: data?.resultType,
          title: data?.title,
          uri: `https://music.youtube.com/watch?v=${data?.videoId}`
        }} />
        <span className={
          'text-sm w-full overflow-hidden overflow-ellipsis whitespace-nowrap text-center'
          + ` ${ponaCommonState?.current?.identifier === data.videoId?'':'group-hover:opacity-0 opacity-100'}`
        }>{index}</span>
      </div>
      {
        (showThumbnail && data.thumbnails && data.thumbnails?.length > 0) &&
        <div className='flex flex-row gap-1 justify-center items-center w-12 h-12 min-w-12 max-w-12 max-h-12 relative flex-[0 1 auto]'>
          <Image src={`/api/proxy/image?r=`+data?.thumbnails[0].url} alt={data.title} className='aspect-square h-full object-cover' classNames={{
            img: 'scale-150',
            wrapper: 'overflow-hidden'
          }} />
        </div>
      }
      <div className='flex flex-col gap-1 justify-center items-start flex-1 w-0 min-w-0'>
        <h1 className='text-xl max-w-full w-full overflow-hidden overflow-ellipsis whitespace-nowrap text-start'>{data?.title}</h1>
        <h3 className='text-sm max-w-full w-full overflow-hidden overflow-ellipsis whitespace-nowrap text-start'>
          <>{combineArtistName(data?.artists)}</>
        </h3>
      </div>
      <div className='flex flex-row gap-1 justify-center items-start relative flex-[0 1 auto] min-w-max'>
        <h3 className='text-sm w-full overflow-hidden overflow-ellipsis whitespace-nowrap text-start'>
        <>{data.duration_seconds && msToTime(data?.duration_seconds*1000)}</>
        </h3>
        <div>
          
        </div>
      </div>
    </div>
  )
}

export default TrackList