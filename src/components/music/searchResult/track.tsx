import { SearchResult as HTTP_SearchResult } from '@/interfaces/ytmusic';
import { msToTime } from '@/utils/time';
import { Button, Image } from '@nextui-org/react';
import React from 'react'
import PlayButton from '../play';
import { Play } from '@phosphor-icons/react/dist/ssr';
import { useRouter } from 'next/navigation';
import { useDiscordGuildInfo } from '@/contexts/discordGuildInfo';

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
        <h3 className='text-sm w-full overflow-hidden overflow-ellipsis whitespace-nowrap text-start'>
        {
          ( data.type === 'SONG' || data.type === 'VIDEO' ) ?
          <>{data?.artist?.name}{data.duration && ' ● '+msToTime(data?.duration*1000)}</> :
          ( data.type === 'ALBUM' ) ?
          <>{data?.artist?.name} ● {data?.year}</> :
          ( data.type === 'PLAYLIST' ) ?
          <>{data?.artist?.name}</> :
          <></>
        }
        </h3>
      </div>
    </div>
  )
}

function Track({data}: {data: HTTP_SearchResult}) {
  const router = useRouter();
  const { guild } = useDiscordGuildInfo();
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
      data?.type === 'ARTIST'
    ) ? <Button className='rounded-xl relative opacity-100 bg-transparent active:!scale-[0.98] h-14 p-0' onPress={()=>{router.push(`/app/g/${guild?.id}/player/artist?c=${data?.artistId}`)}}><TrackDetail data={data} /></Button> :
    (
      data?.type === 'ALBUM'
    ) ? <Button className='rounded-xl relative opacity-100 bg-transparent active:!scale-[0.98] h-14 p-0' onPress={()=>{router.push(`/app/g/${guild?.id}/player/playlist?list=${data?.albumId}abm`)}}><TrackDetail data={data} /></Button> :
    (
      data?.type === 'PLAYLIST'
    ) ? <Button className='rounded-xl relative opacity-100 bg-transparent active:!scale-[0.98] h-14 p-0' onPress={()=>{router.push(`/app/g/${guild?.id}/player/playlist?list=${data?.playlistId}`)}}><TrackDetail data={data} /></Button> :
    <TrackDetail data={data} />
  )
}

export default Track