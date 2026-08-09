'use client';
import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { Track } from '@/types/ponaPlayer';
import { ArtistDetailed, PlaylistDetailed } from '@/types/youtube/ytmusic';
import { AlbumDetailed, VideoDetailed } from '@/types/youtube/ytmusic-api';
import { proxyArtwork } from '@/lib/track';
import { resolveThumbnailUrl } from '@/lib/image';
import { combineArtistName } from '@/lib/artist';
import { Button } from '@/components/ui/button';
import { useDiscordGuildInfo } from '@/contexts/discordGuildInfo';
import { cn } from '@/lib/utils';
import PlayButton from './button/play';

export interface MusicCardProps {
  track: Track;
  className?: string;
}

function MusicCard({ track, className }: MusicCardProps) {
  const router = useRouter();
  if (!track?.proxyHighResArtworkUrl) {
    const resolvedTrack = proxyArtwork(track);
    if (resolvedTrack?.proxyHighResArtworkUrl) {
      track = resolvedTrack as Track;
    }
  }
  const artworkUrl = track?.proxyHighResArtworkUrl || track?.proxyArtworkUrl || track?.artworkUrl;

  return (
    <div className={cn('music-card w-48', className)} aria-label={track?.title}>
      <div className='flex flex-col items-start justify-start gap-3 w-full'>
        <div className='overflow-hidden aspect-square w-full group rounded-3xl relative bg-muted'>
          {artworkUrl ? (
            <Image
              className='object-cover w-full h-full group-hover:scale-110 transition-transform duration-300'
              src={artworkUrl}
              alt={track?.title || 'Track artwork'}
              fill
              unoptimized
            />
          ) : (
            <div className='w-full h-full bg-muted flex items-center justify-center text-muted-foreground' />
          )}
          <PlayButton
            detail={{
              author: track?.author || '',
              identifier: track?.identifier || '',
              sourceName: track?.sourceName || '',
              resultType: 'track',
              title: track?.title || '',
              uri: track?.uri || '',
            }}
          />
        </div>
        <h1 className='w-full text-lg whitespace-nowrap overflow-hidden text-ellipsis text-start font-medium'>
          {track?.title}
        </h1>
        {track?.artist && track?.artist.length > 0 ? (
          combineArtistName(track?.artist, true, router, {
            className:
              'opacity-60 hover:opacity-100 text-start min-w-0 w-full max-w-full block flex-1 whitespace-nowrap overflow-hidden text-ellipsis !no-underline transition-opacity',
          })
        ) : (
          <span className='w-full text-xs text-muted-foreground whitespace-nowrap overflow-hidden text-ellipsis text-start'>
            {track?.author ? track.author.replace(/\s*-\s*Topic\s*$/i, '').trim() : ''}
          </span>
        )}
      </div>
    </div>
  );
}

export interface VideoCardProps {
  video: VideoDetailed;
  className?: string;
}

export function VideoCard({ video, className }: VideoCardProps) {
  const thumbnail = resolveThumbnailUrl(video);
  return (
    <div className={cn('music-card w-64 min-w-64', className)} aria-label={video?.title}>
      <div className='flex flex-col items-start justify-start gap-3 w-full'>
        <div className='overflow-hidden aspect-video w-full group rounded-3xl relative bg-muted'>
          {thumbnail ? (
            <Image
              className='object-cover w-full h-full group-hover:scale-110 transition-transform duration-300'
              src={thumbnail}
              alt={video?.title || 'Video thumbnail'}
              fill
              unoptimized
            />
          ) : (
            <div className='w-full h-full bg-muted flex items-center justify-center text-muted-foreground' />
          )}
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
        <h1 className='w-full text-lg whitespace-nowrap overflow-hidden text-ellipsis text-start font-medium'>
          {video?.title}
        </h1>
        <span className='w-full text-xs text-muted-foreground whitespace-nowrap overflow-hidden text-ellipsis text-start'>
          {combineArtistName(video.artists || [])}
        </span>
      </div>
    </div>
  );
}

export interface AlbumCardProps {
  album: AlbumDetailed;
  className?: string;
}

export function AlbumCard({ album, className }: AlbumCardProps) {
  const router = useRouter();
  const { guild } = useDiscordGuildInfo();
  const href = guild?.id ? `/app/g/${guild.id}/player/playlist?list=${album.browseId}abm` : '#';
  const thumbnail = resolveThumbnailUrl(album);

  return (
    <Button
      variant='ghost'
      className={cn('min-h-max min-w-max w-max h-max p-4 rounded-[2rem] hover:bg-muted/50 cursor-pointer', className)}
      onClick={() => {
        if (href && href !== '#') router.push(href);
      }}
    >
      <div className='music-card w-48' aria-label={album?.title}>
        <div className='flex flex-col items-start justify-start gap-3 w-full'>
          <div className='overflow-hidden aspect-square w-full group rounded-3xl relative bg-muted'>
            {thumbnail ? (
              <Image
                className='object-cover w-full h-full group-hover:scale-110 transition-transform duration-300'
                src={thumbnail}
                alt={album?.title || 'Album artwork'}
                fill
                unoptimized
              />
            ) : (
              <div className='w-full h-full bg-muted flex items-center justify-center text-muted-foreground' />
            )}
          </div>
          <div className='flex flex-col p-2 max-w-full text-left'>
            <h1 className='w-full text-lg whitespace-nowrap overflow-hidden text-ellipsis text-start font-medium'>
              {album?.title}
            </h1>
            <span className='w-full text-xs text-muted-foreground whitespace-nowrap overflow-hidden text-ellipsis text-start'>
              {combineArtistName(album?.artists || [])}
            </span>
          </div>
        </div>
      </div>
    </Button>
  );
}

export interface PlaylistCardProps {
  playlist: PlaylistDetailed;
  className?: string;
}

export function PlaylistCard({ playlist, className }: PlaylistCardProps) {
  const router = useRouter();
  const { guild } = useDiscordGuildInfo();
  const href = guild?.id ? `/app/g/${guild.id}/player/playlist?list=${playlist.playlistId}` : '#';
  const thumbnail = resolveThumbnailUrl(playlist);

  return (
    <Button
      variant='ghost'
      className={cn('min-h-max min-w-max w-max h-max p-4 rounded-[2rem] hover:bg-muted/50 cursor-pointer', className)}
      onClick={() => {
        if (href && href !== '#') router.push(href);
      }}
    >
      <div className='music-card w-48' aria-label={playlist?.name}>
        <div className='flex flex-col items-start justify-start gap-3 w-full'>
          <div className='overflow-hidden aspect-square w-full group rounded-3xl relative bg-muted'>
            {thumbnail ? (
              <Image
                className='object-cover w-full h-full group-hover:scale-110 transition-transform duration-300'
                src={thumbnail}
                alt={playlist?.name || 'Playlist artwork'}
                fill
                unoptimized
              />
            ) : (
              <div className='w-full h-full bg-muted flex items-center justify-center text-muted-foreground' />
            )}
          </div>
          <div className='flex flex-col p-2 max-w-full text-left'>
            <h1 className='w-full text-lg whitespace-nowrap overflow-hidden text-ellipsis text-start font-medium'>
              {playlist?.name}
            </h1>
            <span className='w-full text-xs text-muted-foreground whitespace-nowrap overflow-hidden text-ellipsis text-start'>
              {playlist?.artist?.name}
            </span>
          </div>
        </div>
      </div>
    </Button>
  );
}

export interface ArtistCardProps {
  artist: ArtistDetailed;
  guildId?: string;
  className?: string;
}

export function ArtistCard({ artist, guildId, className }: ArtistCardProps) {
  const { guild } = useDiscordGuildInfo();
  const targetGuildId = guildId || guild?.id;
  const href = targetGuildId ? `/app/g/${targetGuildId}/player/c?c=${artist.artistId}` : '#';

  const thumbnail = resolveThumbnailUrl(artist);

  return (
    <Link href={href} className='no-underline block group'>
      <Button
        variant='ghost'
        className={cn('min-h-max min-w-max w-max h-max p-4 rounded-[2rem] hover:bg-muted/50 cursor-pointer group-hover:scale-[1.02] transition-transform duration-200', className)}
      >
        <div className='music-card w-48' aria-label={artist?.name}>
          <div className='flex flex-col items-center justify-center gap-3 w-full'>
            <div className='overflow-hidden aspect-square w-full rounded-full relative bg-muted/60 border-2 border-transparent group-hover:border-primary/40 transition-colors shadow-sm'>
              {thumbnail ? (
                <Image
                  className='object-cover w-full h-full group-hover:scale-110 transition-transform duration-300'
                  src={thumbnail}
                  alt={artist?.name || 'Artist avatar'}
                  fill
                  unoptimized
                />
              ) : (
                <div className='w-full h-full flex items-center justify-center bg-primary/10 text-primary text-3xl font-bold'>
                  {artist?.name?.[0]?.toUpperCase() || '?'}
                </div>
              )}
            </div>
            <div className='flex flex-col w-full justify-center p-2'>
              <h1 className='w-full text-lg whitespace-nowrap overflow-hidden text-ellipsis text-center font-medium text-foreground group-hover:text-primary transition-colors'>
                {artist?.name || 'Artist'}
              </h1>
            </div>
          </div>
        </div>
      </Button>
    </Link>
  );
}

export default MusicCard;
