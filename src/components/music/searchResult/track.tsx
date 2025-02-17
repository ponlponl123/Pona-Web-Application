import { ArtistBasic, SearchResult as HTTP_SearchResult } from '@/interfaces/ytmusic-api';
import { msToTime } from '@/utils/time';
import { Button, Image, Link } from '@nextui-org/react';
import React from 'react'
import PlayButton from '../play';
import { Play } from '@phosphor-icons/react/dist/ssr';
import { useRouter } from 'next/navigation';
import { useDiscordGuildInfo } from '@/contexts/discordGuildInfo';

export function combineArtistName(artists: ArtistBasic[]): string;
export function combineArtistName(artists: ArtistBasic[], isElement: true): React.ReactNode;
export function combineArtistName(artists: ArtistBasic[], isElement?: boolean): string | React.ReactNode {
  let artist: string = '';
  if ( !artists ) return artist;
  if ( isElement ) {
    return <>
      {
        artists.map((artist, index) => {
          if ( !artist.id ) return index === 0 ? <React.Fragment key={index}>{artist.name}</React.Fragment> :
          <React.Fragment key={index}> & {artist.name}</React.Fragment>
          const href = window.location.pathname.split('/player')[0] + '/player/artist?id='+artist.id
          const Linked = () => <Link href={href} underline='hover' color='foreground'>{artist.name}</Link>;
          return index === 0 ? <Linked key={index} /> :
          <React.Fragment key={index}> & <Linked /></React.Fragment>
        })
      }
    </>
  }
  for (let i = 0; i < artists.length; i++) {
    if (artists[i].name) {
      if ( i > 0 )
        artist = artist + ' & ' + artists[i].name;
      else artist = artists[i].name;
    }
  }
  return artist;
}

function TrackDetail({data, isHasPlay = true}: {data: HTTP_SearchResult, isHasPlay?: boolean}) {
  const title =
  (
    data.category === 'Songs' ||
    data.category === 'Albums' ||
    data.category === 'Videos' ||
    data.category === 'Episodes' ||
    data.category === 'Podcasts' ||
    data.category === 'Community playlists'
  ) ?
  data?.title :
  (
    data.category === 'Artists' ||
    data.category === 'Profiles'
  ) ?
  data?.artist : ''
  return (
    <div className='w-full flex gap-4 items-center justify-start group'>
      <div className='relative w-14 h-14'>
        <Image src={`/api/proxy/image?r=${data?.thumbnails && data?.thumbnails[0]?.url}`} alt={title} height={56} width={56} className='object-cover rounded-xl w-14 h-14' classNames={{
          img: 'w-14 h-14',
          wrapper: 'w-full h-full'
        }} />
        {
          !isHasPlay && <div className='absolute w-full h-full opacity-0 group-hover:opacity-100 bg-black/40 top-0 left-0 z-10 rounded-xl flex items-center justify-center'><Play weight='fill' size={16} /></div>
        }
        {
          (
            isHasPlay &&
            (data?.category === 'Songs' ||
            data?.category === 'Videos')
          ) && <PlayButton className='rounded-xl' iconSize={16} detail={{
            author: combineArtistName(data?.artists),
            identifier: data?.videoId,
            sourceName: 'youtube music',
            title: data?.title,
            uri: `https://music.youtube.com/watch?v=${data?.videoId}`
          }} />
        }
      </div>
      <div className='flex flex-col gap-1 justify-center items-start w-[calc(100%_-_6rem)]'>
        <h1 className='text-xl w-full overflow-hidden overflow-ellipsis whitespace-nowrap text-start'>{title}</h1>
        <h3 className='text-sm w-full overflow-hidden overflow-ellipsis whitespace-nowrap text-start'>
        {
          (
            data.category === 'Songs' || data.category === 'Videos'
          ) ?
          <>{combineArtistName(data?.artists, true)}{data.duration_seconds && ' • '+msToTime(data?.duration_seconds*1000)}</> :
          (
            data.category === 'Albums'
          ) ?
          <>{combineArtistName(data?.artists, true)} • {data?.year}</> :
          (
            data.category === 'Episodes'
          ) ?
          <>{combineArtistName(data?.artists, true)}</> :
          ( data.category === 'Community playlists' ) ?
          <>{data?.author}</> :
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
      data?.category === 'Songs' ||
      data?.category === 'Videos'
    ) ? <PlayButton className='rounded-xl relative opacity-100 bg-transparent active:!scale-[0.98]' detail={{
      author: combineArtistName(data?.artists),
      identifier: data?.videoId,
      sourceName: 'youtube',
      title: data?.title,
      uri: `https://www.youtube.com/watch?v=${data?.videoId}`
    }}><TrackDetail data={data} isHasPlay={false} /></PlayButton> :
    (
      data?.category === 'Artists'
    ) ? <Button className='rounded-xl relative opacity-100 bg-transparent active:!scale-[0.98] h-14 p-0' onPress={()=>{router.push(`/app/g/${guild?.id}/player/artist?c=${data?.browseId}`)}}><TrackDetail data={data} /></Button> :
    (
      data?.category === 'Albums'
    ) ? <Button className='rounded-xl relative opacity-100 bg-transparent active:!scale-[0.98] h-14 p-0' onPress={()=>{router.push(`/app/g/${guild?.id}/player/playlist?list=${data?.browseId}abm`)}}><TrackDetail data={data} /></Button> :
    (
      data?.category === 'Community playlists'
    ) ? <Button className='rounded-xl relative opacity-100 bg-transparent active:!scale-[0.98] h-14 p-0' onPress={()=>{router.push(`/app/g/${guild?.id}/player/playlist?list=${data?.browseId}`)}}><TrackDetail data={data} /></Button> :
    <TrackDetail data={data} />
  )
}

export default Track