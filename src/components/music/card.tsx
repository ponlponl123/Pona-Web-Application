"use client";
import React from 'react'
import { Track } from '@/interfaces/ponaPlayer'
import { proxyArtwork } from '@/utils/track'
import PlayButton from './play'
import { Button, Image } from '@nextui-org/react';
import { ArtistDetailed, PlaylistDetailed } from '@/interfaces/ytmusic';
import { useRouter } from 'next/navigation';
import { AlbumDetailed, VideoDetailed } from '@/interfaces/ytmusic-api';
import { combineArtistName } from './searchResult/track';

function MusicCard({track}: {track: Track}) {
  if (!track?.proxyArtworkUrl) {
    const resolvedTrack = proxyArtwork(track);
    if (resolvedTrack?.proxyArtworkUrl) {
      track = resolvedTrack as Track;
    }
  }
  return (
    <>
      <div className='music-card w-48' aria-label={track?.title}>
        <div className='flex flex-col items-start justify-start gap-3 w-full'>
          <div className='overflow-hidden aspect-square w-full group rounded-3xl relative'>
            <Image
              className='object-cover w-full h-full group-hover:scale-110'
              classNames={{
                wrapper: 'w-full h-full'
              }}
              src={track?.proxyArtworkUrl}
              alt={track?.title}
            />
            <PlayButton detail={{
              author: track?.author,
              identifier: track?.identifier,
              sourceName: track?.sourceName,
              resultType: 'track',
              title: track?.title,
              uri: track?.uri
            }} />
          </div>
          <h1 className='w-full text-lg whitespace-nowrap overflow-hidden overflow-ellipsis text-start'>{track?.title}</h1>
          <span className='w-full text-xs text-foreground/40 whitespace-nowrap overflow-hidden overflow-ellipsis text-start'>{track?.author}</span>
        </div>
      </div>
    </>
  )
}

export function VideoCard({video}: {video: VideoDetailed}) {
  return (
    <>
    <div className='music-card w-64 min-w-64' aria-label={video?.title}>
      <div className='flex flex-col items-start justify-start gap-3 w-full'>
        <div className='overflow-hidden aspect-video w-full group rounded-3xl relative'>
          <Image
            className='object-cover w-full h-full group-hover:scale-110'
            classNames={{
              wrapper: 'w-full h-full min-w-full'
            }}
            src={'/api/proxy/image?r='+video?.thumbnails[video?.thumbnails.length-1].url}
            alt={video?.title}
          />
          <PlayButton detail={{
            author: combineArtistName(video.artists),
            identifier: video?.videoId,
            sourceName: 'youtube music',
            resultType: 'track',
            title: video?.title,
            uri: `https://youtu.be/${video.videoId}`
          }} />
        </div>
        <h1 className='w-full text-lg whitespace-nowrap overflow-hidden overflow-ellipsis text-start'>{video?.title}</h1>
        <span className='w-full text-xs text-foreground/40 whitespace-nowrap overflow-hidden overflow-ellipsis text-start'>{combineArtistName(video.artists)}</span>
      </div>
    </div>
    </>
  )
}

export function AlbumCard({album}: {album: AlbumDetailed}) {
  const router = useRouter();
  const href = window.location.pathname.split('/player')[0] + '/player/playlist?list='+album.browseId+'abm';
  return (
    <>
      <Button className='min-h-max min-w-max w-max h-max p-4 rounded-[2rem] bg-transparent' href={href} onPress={()=>{router.push(href)}}>
        <div className='music-card w-48' aria-label={album?.title}>
          <div className='flex flex-col items-start justify-start gap-3 w-full'>
            <div className='overflow-hidden aspect-square w-full group rounded-3xl relative'>
              <Image
                className='object-cover w-full h-full group-hover:scale-110'
                classNames={{
                  wrapper: 'w-full h-full'
                }}
                src={'/api/proxy/image?r='+album?.thumbnails[album?.thumbnails.length-1].url}
                alt={album?.title}
              />
            </div>
            <div className='flex flex-col p-2'>
              <h1 className='w-full text-lg whitespace-nowrap overflow-hidden overflow-ellipsis text-start'>{album?.title}</h1>
              <span className='w-full text-xs text-foreground/40 whitespace-nowrap overflow-hidden overflow-ellipsis text-start'>{combineArtistName(album?.artists)}</span>
            </div>
          </div>
        </div>
      </Button>
    </>
  )
}

export function PlaylistCard({playlist}: {playlist: PlaylistDetailed}) {
  const router = useRouter();
  const href = window.location.pathname.split('/player')[0] + '/player/playlist?list='+playlist.playlistId;
  return (
    <>
      <Button className='min-h-max min-w-max w-max h-max p-4 rounded-[2rem] bg-transparent' href={href} onPress={()=>{router.push(href)}}>
        <div className='music-card w-48' aria-label={playlist?.name}>
          <div className='flex flex-col items-start justify-start gap-3 w-full'>
            <div className='overflow-hidden aspect-square w-full group rounded-3xl relative'>
              <Image
                className='object-cover w-full h-full group-hover:scale-110'
                classNames={{
                  wrapper: 'w-full h-full'
                }}
                src={'/api/proxy/image?r='+playlist?.thumbnails[playlist?.thumbnails.length-1].url}
                alt={playlist?.name}
              />
            </div>
            <div className='flex flex-col p-2'>
              <h1 className='w-full text-lg whitespace-nowrap overflow-hidden overflow-ellipsis text-start'>{playlist?.name}</h1>
              <span className='w-full text-xs text-foreground/40 whitespace-nowrap overflow-hidden overflow-ellipsis text-start'>{playlist?.artist.name}</span>
            </div>
          </div>
        </div>
      </Button>
    </>
  )
}

export function ArtistCard({artist}: {artist: ArtistDetailed}) {
  const router = useRouter();
  const href = window.location.pathname.split('/player')[0] + '/player/c?c='+artist.artistId;
  return (
    <>
      <Button className='min-h-max min-w-max w-max h-max p-4 rounded-[2rem] bg-transparent' href={href} onPress={()=>{router.push(href)}}>
        <div className='music-card w-48' aria-label={artist?.name}>
          <div className='flex flex-col items-start justify-start gap-3 w-full'>
            <div className='overflow-hidden aspect-square w-full group rounded-full relative'>
              <Image
                className='object-cover w-full h-full group-hover:scale-110 opacity-100'
                classNames={{
                  wrapper: 'w-full h-full'
                }}
                src={'/api/proxy/image?r='+artist?.thumbnails[artist?.thumbnails.length-1].url}
                alt={artist?.name}
              />
            </div>
            <div className='flex flex-col w-full justify-center p-2'>
              <h1 className='w-full text-lg whitespace-nowrap overflow-hidden overflow-ellipsis text-center'>{artist?.name}</h1>
            </div>
          </div>
        </div>
      </Button>
    </>
  )
}

export default MusicCard