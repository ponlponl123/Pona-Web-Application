import React from 'react'
import { Track } from '@/interfaces/ponaPlayer'
import { proxyArtwork } from '@/utils/track'
import PlayButton from './play'
import { Image } from '@nextui-org/react';

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

export default MusicCard