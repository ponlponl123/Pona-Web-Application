'use client';

import React from 'react';

import TrackSearchResult from '@/components/music/searchResult/track';
import { Track } from '@/types/ponaPlayer';
import { HomeFeedItem } from '@/lib/server-side-api/internal/browse';
import { SearchResult as HTTP_SearchResult } from '@/types/youtube/ytmusic-api';
import { cn } from '@/lib/utils';

export interface TrackStripCardProps {
  track: Partial<Track> & {
    title: string;
    browseId?: string;
    playlistId?: string;
    resultType?: string;
  };
  className?: string;
}

/**
 * Track strip card using the exact same strip design as the player related tab (TrackSearchResult).
 * Supports playlist items by detecting playlistId or browseId starting with VL/PL/RD.
 */
export function TrackStripCard({ track, className }: TrackStripCardProps) {
  const artworkUrl = track.proxyHighResArtworkUrl || track.proxyArtworkUrl || track.artworkUrl;

  const isPlaylist =
    Boolean(track.playlistId) ||
    Boolean(track.browseId?.startsWith('VL')) ||
    Boolean(track.browseId?.startsWith('PL')) ||
    Boolean(track.browseId?.startsWith('RD')) ||
    track.resultType === 'playlist';

  const playlistId = track.playlistId || (track.browseId ? track.browseId.replace(/^VL/, '') : undefined);

  const itemDetailed = {
    category: isPlaylist ? 'Playlists' : 'Songs',
    resultType: isPlaylist ? 'playlist' : 'song',
    videoId: track.identifier || '',
    videoType: 'MUSIC_VIDEO_TYPE_ATV',
    title: track.title || '',
    artists: track.artist && track.artist.length > 0
      ? track.artist
      : track.author
        ? [{ name: track.author.replace(/\s*-\s*Topic\s*$/i, '').trim(), id: null }]
        : [],
    album: null,
    duration: '',
    duration_seconds: null,
    isExplicit: false,
    thumbnails: artworkUrl ? [{ url: artworkUrl, width: 300, height: 300 }] : [],
    year: null,
    playlistId,
    browseId: track.browseId,
  };

  return (
    <div className={cn('w-80 sm:w-[400px] flex-none', className)}>
      <TrackSearchResult result={itemDetailed as unknown as HTTP_SearchResult} />
    </div>
  );
}

export interface VideoStripCardProps {
  item: HomeFeedItem;
  className?: string;
}

/**
 * Video strip card using the exact same strip design as the player related tab
 */
export function VideoStripCard({ item, className }: VideoStripCardProps) {
  const thumbnail = (item.thumbnails || []).sort(
    (a, b) => (b.width || 0) - (a.width || 0)
  )[0]?.url;

  const isPlaylist =
    Boolean(item.playlistId) ||
    Boolean(item.browseId?.startsWith('VL')) ||
    Boolean(item.browseId?.startsWith('PL')) ||
    Boolean(item.browseId?.startsWith('RD')) ||
    item.resultType === 'playlist';

  const playlistId = item.playlistId || (item.browseId ? item.browseId.replace(/^VL/, '') : undefined);

  const itemDetailed = {
    category: isPlaylist ? 'Playlists' : 'Songs',
    resultType: isPlaylist ? 'playlist' : 'song',
    videoId: item.videoId || '',
    videoType: 'MUSIC_VIDEO_TYPE_OMV',
    title: item.title || '',
    artists: (item.artists || []).map((a) => ({ name: a.name || '', id: a.id ?? null })),
    album: null,
    duration: '',
    duration_seconds: null,
    isExplicit: Boolean(item.isExplicit),
    thumbnails: thumbnail ? [{ url: thumbnail, width: 320, height: 180 }] : [],
    year: null,
    playlistId,
    browseId: item.browseId,
  };

  return (
    <div className={cn('w-80 sm:w-[400px] flex-none', className)}>
      <TrackSearchResult result={itemDetailed as unknown as HTTP_SearchResult} />
    </div>
  );
}
