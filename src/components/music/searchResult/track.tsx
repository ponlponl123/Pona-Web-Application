import { HTTP_SearchResult } from '@/server-side-api/internal/search';
import { msToTime } from '@/utils/time';
import { Button, Image } from '@nextui-org/react';
import React from 'react'
import PlayButton from '../play';
import { Play } from '@phosphor-icons/react/dist/ssr';

function TrackDetail({data, isHasPlay = true}: {data: HTTP_SearchResult, isHasPlay?: boolean}) {
  return (
    <div className='w-full flex gap-4 items-center justify-start group'>
      <div className='relative w-14 h-14'>
        <Image src={`/api/proxy/image?r=${data?.thumbnails[0]?.url}`} alt={data?.name} height={56} width={56} className='object-cover rounded-xl w-14 h-14' classNames={{
          img: 'w-14 h-14',
          wrapper: 'w-full h-full'
        }} />
        {
          !isHasPlay && <div className='absolute w-full h-full opacity-0 group-hover:opacity-100 bg-black/40 top-0 left-0 z-10 rounded-xl flex items-center justify-center'><Play weight='fill' size={16} /></div>
        }
        {
          (
            isHasPlay &&
            (data?.type === 'SONG' ||
            data?.type === 'VIDEO')
          ) && <PlayButton className='rounded-xl' iconSize={16} detail={{
            author: data?.artist?.name,
            identifier: data?.videoId,
            sourceName: 'youtube',
            title: data?.name,
            uri: `https://www.youtube.com/watch?v=${data?.videoId}`
          }} />
        }
      </div>
      <div className='flex flex-col gap-1 justify-center items-start w-[calc(100%_-_6rem)]'>
        <h1 className='text-xl w-full overflow-hidden overflow-ellipsis whitespace-nowrap text-start'>{data?.name}</h1>
        <h3 className='text-sm w-full overflow-hidden overflow-ellipsis whitespace-nowrap text-start'>{data?.artist?.name}{data.duration && ' ● '+msToTime(data.duration*1000)}</h3>
      </div>
    </div>
  )
}

function Track({data}: {data: HTTP_SearchResult}) {
  return (
    (
      data?.type === 'SONG' ||
      data?.type === 'VIDEO'
    ) ? <PlayButton className='rounded-xl relative opacity-100 bg-transparent active:!scale-[0.98]' detail={{
      author: data?.artist?.name,
      identifier: data?.videoId,
      sourceName: 'youtube',
      title: data?.name,
      uri: `https://www.youtube.com/watch?v=${data?.videoId}`
    }}><TrackDetail data={data} isHasPlay={false} /></PlayButton> :
    (
      data?.type === 'ALBUM' ||
      data?.type === 'PLAYLIST' ||
      data?.type === 'ARTIST'
    ) ? <Button className='rounded-xl relative opacity-100 bg-transparent active:!scale-[0.98] h-14 p-0'><TrackDetail data={data} /></Button> :
    <TrackDetail data={data} />
  )
}

export default Track