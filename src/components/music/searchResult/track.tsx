"use client";
import { ArtistBasic, SearchResult as HTTP_SearchResult } from '@/interfaces/ytmusic-api';
import { msToTime } from '@/utils/time';
import { Button, Image, Link } from '@nextui-org/react';
import React from 'react'
import PlayButton from '../play';
import { Play } from '@phosphor-icons/react/dist/ssr';
import { useRouter } from 'next/navigation';
import { useDiscordGuildInfo } from '@/contexts/discordGuildInfo';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';

export function combineArtistName(artists: ArtistBasic[]): string;
export function combineArtistName(artists: ArtistBasic[], isElement: true): React.ReactNode;
export function combineArtistName(artists: ArtistBasic[], isElement: true, router: AppRouterInstance): React.ReactNode;
export function combineArtistName(artists: ArtistBasic[], isElement?: boolean, router?: AppRouterInstance): string | React.ReactNode {
  let artist: string = '';
  if ( !artists ) return artist;
  if ( isElement ) {
    return <>
      {
        artists.map((artist, index) => {
          if ( !artist.id ) return index === 0 ?
            <React.Fragment key={index}>{artist.name}</React.Fragment> :
            <React.Fragment key={index}> & {artist.name}</React.Fragment>
          const href = window.location.pathname.split('/player')[0] + '/player/c?c='+artist.id
          const Linked = () => router ?
            <Link onPress={()=>{if(router) router.push(href)}} className='cursor-pointer' underline='hover' color='foreground'>{artist.name}</Link> :
            <Link href={href} underline='hover' color='foreground'>{artist.name}</Link>;
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

export function TrackDetail({data, isHasPlay = true}: {data: HTTP_SearchResult, isHasPlay?: boolean}) {
  const router = useRouter();
  const title =
  (
    data.category === 'Songs' ||
    data.category === 'Albums' ||
    data.category === 'Videos' ||
    data.category === 'Episodes' ||
    data.category === 'Podcasts'
  ) ?
  data?.title :
  (
    data.category === 'Community playlists'
  ) ?
  data?.name :
  (
    data.category === 'Artists' ||
    data.category === 'Profiles'
  ) ?
  data?.artist : ''
  return (
    <div className='w-full flex gap-4 items-center justify-start group hover:bg-foreground/5 p-2 rounded-2xl border-2 border-foreground/0 hover:border-foreground/5'>
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
            resultType: data?.resultType,
            title: data?.title,
            uri: `https://music.youtube.com/watch?v=${data?.videoId}`
          }} />
        }
      </div>
      <div className='flex flex-col justify-center items-start w-[calc(100%_-_6rem)]'>
        <h1 className='text-xl w-full overflow-hidden overflow-ellipsis whitespace-nowrap text-start'>{title}</h1>
        <h3 className='text-sm w-full overflow-hidden overflow-ellipsis whitespace-nowrap text-start'>
        {
          (
            data.category === 'Songs' || data.category === 'Videos'
          ) ?
          <>{combineArtistName(data?.artists, true, router)}{data.duration_seconds && ' • '+msToTime(data?.duration_seconds*1000)}</> :
          (
            data.category === 'Albums'
          ) ?
          <>{combineArtistName(data?.artists, true, router)} • {data?.year}</> :
          (
            data.category === 'Episodes'
          ) ?
          <>{combineArtistName(data?.artists, true, router)}</> :
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
    ) ? <PlayButton className='rounded-xl h-max relative opacity-100 bg-transparent active:!scale-[0.98]' detail={{
      author: combineArtistName(data?.artists),
      identifier: data?.videoId,
      resultType: data?.resultType,
      sourceName: 'youtube',
      title: data?.title,
      uri: `https://www.youtube.com/watch?v=${data?.videoId}`
    }}><TrackDetail data={data} isHasPlay={false} /></PlayButton> :
    (
      data?.category === 'Artists'
    ) ? <Button className='w-full rounded-xl relative opacity-100 bg-transparent active:!scale-[0.98] h-max p-0' onPress={()=>{router.push(`/app/g/${guild?.id}/player/c?c=${data?.browseId}`)}}><TrackDetail data={data} /></Button> :
    (
      data?.category === 'Albums'
    ) ? <Button className='w-full rounded-xl relative opacity-100 bg-transparent active:!scale-[0.98] h-max p-0' onPress={()=>{router.push(`/app/g/${guild?.id}/player/playlist?list=${data?.browseId}abm`)}}><TrackDetail data={data} /></Button> :
    (
      data?.category === 'Community playlists'
    ) ? <Button className='w-full rounded-xl relative opacity-100 bg-transparent active:!scale-[0.98] h-max p-0' onPress={()=>{router.push(`/app/g/${guild?.id}/player/playlist?list=${data?.browseId}`)}}><TrackDetail data={data} /></Button> :
    <TrackDetail data={data} />
  )
}

export default Track