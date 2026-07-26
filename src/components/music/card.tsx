'use client';
import { Track } from '@/types/ponaPlayer';
import { ArtistDetailed, PlaylistDetailed } from '@/types/youtube/ytmusic';
import { AlbumDetailed, VideoDetailed } from '@/types/youtube/ytmusic-api';
import { proxyArtwork } from '@/lib/track';
import NextLink from 'next/link';
import { useRouter } from 'next/navigation';
import PlayButton from './button/play';
import { combineArtistName } from './searchResult/track';
import React from 'react';
import { Button } from '@/components/ui/button';

function MusicCard({ data, track }: { data?: any; track?: any }) {
  const item = data || track;
  const router = useRouter();

  return (
    <div className='w-48 flex flex-col gap-3 group cursor-pointer' onClick={() => item?.uri && router.push(item.uri)}>
      <div className='aspect-square w-full rounded-2xl overflow-hidden relative shadow-md group-hover:shadow-xl transition-all'>
        <img
          className='object-cover w-full h-full group-hover:scale-105 transition-transform duration-300'
          src={item?.thumbnail || item?.proxyArtworkUrl || '/static/backdrop.png'}
          alt={item?.title || ''}
        />
        {item?.identifier && (
          <div className='absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity'>
            <PlayButton
              detail={{
                author: item?.author || '',
                identifier: item?.identifier,
                sourceName: item?.sourceName || 'youtube music',
                resultType: 'track',
                title: item?.title || '',
                uri: item?.uri || `https://music.youtube.com/watch?v=${item?.identifier}`,
              }}
            />
          </div>
        )}
      </div>
      <div className='flex flex-col text-left min-w-0'>
        <h4 className='font-semibold text-sm truncate'>{item?.title}</h4>
        <p className='text-xs text-muted-foreground truncate'>{item?.author}</p>
      </div>
    </div>
  );
}

export function VideoCard({ video }: { video: VideoDetailed }) {
  return (
    <div className='w-64 flex flex-col gap-3 group'>
      <div className='aspect-video w-full rounded-2xl overflow-hidden relative shadow-md group-hover:shadow-xl transition-all'>
        <img
          className='object-cover w-full h-full group-hover:scale-105 transition-transform duration-300'
          src={
            video?.thumbnails?.[video.thumbnails.length - 1]?.url
              ? `/api/proxy/image?r=${encodeURIComponent(video.thumbnails[video.thumbnails.length - 1].url)}`
              : '/static/backdrop.png'
          }
          alt={video?.title}
        />
        <div className='absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity'>
          <PlayButton
            detail={{
              author: combineArtistName(video.artists || []),
              identifier: video?.videoId,
              sourceName: 'youtube music',
              resultType: 'track',
              title: video?.title,
              uri: `https://youtu.be/${video.videoId}`,
            }}
          />
        </div>
      </div>
      <div className='flex flex-col text-left min-w-0'>
        <h4 className='font-semibold text-sm truncate'>{video?.title}</h4>
        <p className='text-xs text-muted-foreground truncate'>{combineArtistName(video.artists || [])}</p>
      </div>
    </div>
  );
}

export function AlbumCard({ album }: { album: AlbumDetailed }) {
  const router = useRouter();
  const href = `/app/g/player/playlist?list=${album.browseId}abm`;
  return (
    <div
      className='w-48 flex flex-col gap-3 group cursor-pointer'
      onClick={() => router.push(href)}
    >
      <div className='aspect-square w-full rounded-2xl overflow-hidden relative shadow-md group-hover:shadow-xl transition-all'>
        <img
          className='object-cover w-full h-full group-hover:scale-105 transition-transform duration-300'
          src={
            album?.thumbnails?.[album.thumbnails.length - 1]?.url
              ? `/api/proxy/image?r=${encodeURIComponent(album.thumbnails[album.thumbnails.length - 1].url)}`
              : '/static/backdrop.png'
          }
          alt={album?.title}
        />
      </div>
      <div className='flex flex-col text-left min-w-0'>
        <h4 className='font-semibold text-sm truncate'>{album?.title}</h4>
        <p className='text-xs text-muted-foreground truncate'>{combineArtistName(album?.artists || [])}</p>
      </div>
    </div>
  );
}

export function PlaylistCard({ playlist }: { playlist: PlaylistDetailed }) {
  const router = useRouter();
  const href = `/app/g/player/playlist?list=${playlist.playlistId}`;
  return (
    <div
      className='w-48 flex flex-col gap-3 group cursor-pointer'
      onClick={() => router.push(href)}
    >
      <div className='aspect-square w-full rounded-2xl overflow-hidden relative shadow-md group-hover:shadow-xl transition-all'>
        <img
          className='object-cover w-full h-full group-hover:scale-105 transition-transform duration-300'
          src={
            playlist?.thumbnails?.[playlist.thumbnails.length - 1]?.url
              ? `/api/proxy/image?r=${encodeURIComponent(playlist.thumbnails[playlist.thumbnails.length - 1].url)}`
              : '/static/backdrop.png'
          }
          alt={playlist?.name}
        />
      </div>
      <div className='flex flex-col text-left min-w-0'>
        <h4 className='font-semibold text-sm truncate'>{playlist?.name}</h4>
        <p className='text-xs text-muted-foreground truncate'>{playlist?.artist?.name}</p>
      </div>
    </div>
  );
}

export function ArtistCard({ artist, data }: { artist?: any; data?: any }) {
  const item = data || artist;
  const router = useRouter();
  const name = item?.name || item?.artistName;
  const id = item?.browseId || item?.channelId || item?.artistId;
  const href = `/app/g/player/c?c=${id}`;
  const thumbnail = item?.thumbnails?.[item.thumbnails.length - 1]?.url || item?.thumbnails?.[0]?.url;

  return (
    <div
      className='w-40 flex flex-col items-center gap-3 group cursor-pointer'
      onClick={() => id && router.push(href)}
    >
      <div className='aspect-square w-full rounded-full overflow-hidden relative shadow-md group-hover:shadow-xl transition-all'>
        <img
          className='object-cover w-full h-full group-hover:scale-105 transition-transform duration-300'
          src={thumbnail ? `/api/proxy/image?r=${encodeURIComponent(thumbnail)}` : '/static/backdrop.png'}
          alt={name || ''}
        />
      </div>
      <h4 className='font-semibold text-sm truncate text-center w-full'>{name}</h4>
    </div>
  );
}

export default MusicCard;
