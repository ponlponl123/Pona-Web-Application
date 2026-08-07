import React from 'react';
import Link from 'next/link';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import clsx from 'clsx';

import {
  ArtistDetailed,
  ThumbnailFull,
  ArtistFull as ArtistFullv1,
  PlaylistDetailed,
  SongDetailed,
  VideoDetailed,
  AlbumDetailed,
} from '@/types/youtube/ytmusic';
import { SubscribedChannelsResult } from '@/lib/server-side-api/internal/channel';

export interface CombineArtistNameOptions {
  className?: string;
}

export type CombineArtistItem = {
  name: string;
  id?: string | null;
  artistId?: string | null;
};

export function combineArtistName(artists: CombineArtistItem[]): string;
export function combineArtistName(
  artists: CombineArtistItem[],
  isElement?: boolean
): React.ReactNode;
export function combineArtistName(
  artists: CombineArtistItem[],
  isElement?: boolean,
  router?: AppRouterInstance
): React.ReactNode;
export function combineArtistName(
  artists: CombineArtistItem[],
  isElement?: boolean,
  router?: AppRouterInstance,
  options?: CombineArtistNameOptions
): React.ReactNode;
export function combineArtistName(
  artists: CombineArtistItem[],
  isElement?: boolean,
  router?: AppRouterInstance,
  options?: CombineArtistNameOptions
): string | React.ReactNode {
  let artist = '';
  if (!artists) return artist;
  if (isElement) {
    return (
      <>
        {artists.map((artist, index) => {
          const id = artist.id || artist.artistId;
          if (!id)
            return index === 0 ? (
              <React.Fragment key={index}>{artist.name}</React.Fragment>
            ) : (
              <React.Fragment key={index}> & {artist.name}</React.Fragment>
            );
          const href =
            typeof window !== 'undefined'
              ? window.location.pathname.split('/player')[0] + '/player/c?c=' + id
              : '#';

          const Linked = () => (
            <Link
              href={href}
              onClick={(e) => {
                if (router) {
                  e.preventDefault();
                  router.push(href);
                }
              }}
              className={clsx('cursor-pointer hover:underline text-foreground', options?.className)}
            >
              {artist.name}
            </Link>
          );
          return index === 0 ? (
            <Linked key={index} />
          ) : (
            <React.Fragment key={index}>
              {' '}
              & <Linked />
            </React.Fragment>
          );
        })}
      </>
    );
  }
  artists.forEach((a, index) => {
    artist += index === 0 ? a.name : ` & ${a.name}`;
  });
  return artist;
}

export function extractArtistInfo(channel: SubscribedChannelsResult): ArtistDetailed {
  let rawInfo: unknown = channel?.info || channel;
  if (typeof rawInfo === 'string') {
    try {
      rawInfo = JSON.parse(rawInfo);
    } catch {
      rawInfo = {};
    }
  }

  const recordInfo = (rawInfo || {}) as Record<string, unknown>;

  let v2 = recordInfo.v2 || recordInfo;
  if (typeof v2 === 'string') {
    try { v2 = JSON.parse(v2); } catch { v2 = {}; }
  }
  const v2Rec = (v2 || {}) as Record<string, unknown>;

  let v1 = recordInfo.v1 || recordInfo;
  if (typeof v1 === 'string') {
    try { v1 = JSON.parse(v1); } catch { v1 = {}; }
  }
  const v1Rec = (v1 || {}) as Record<string, unknown>;

  let user = recordInfo.user || recordInfo;
  if (typeof user === 'string') {
    try { user = JSON.parse(user); } catch { user = {}; }
  }
  const userRec = (user || {}) as Record<string, unknown>;

  const v2Artist = (v2Rec?.artist || {}) as Record<string, unknown>;
  const v1Header = (v1Rec?.header || {}) as Record<string, unknown>;
  const v1HeaderTitle = (v1Header?.title || {}) as Record<string, unknown>;
  const channelObj = (channel || {}) as unknown as Record<string, unknown>;

  const name =
    (v2Rec?.name as string) ||
    (v2Rec?.title as string) ||
    (v2Artist?.name as string) ||
    (v2Artist?.title as string) ||
    (v1Rec?.name as string) ||
    (v1Rec?.title as string) ||
    (v1HeaderTitle?.text as string) ||
    (v1Header?.title as string) ||
    (v1Header?.name as string) ||
    (userRec?.name as string) ||
    (userRec?.title as string) ||
    (userRec?.username as string) ||
    (userRec?.global_name as string) ||
    (recordInfo?.name as string) ||
    (recordInfo?.title as string) ||
    (recordInfo?.artistName as string) ||
    (recordInfo?.username as string) ||
    (channelObj?.name as string) ||
    (channelObj?.title as string) ||
    'Artist';

  const extractedUrls: string[] = [];

  function collectUrls(item: unknown) {
    if (!item) return;
    if (typeof item === 'string' && item.trim().length > 0) {
      extractedUrls.push(item.trim());
      return;
    }
    if (Array.isArray(item)) {
      item.forEach(collectUrls);
      return;
    }
    if (typeof item === 'object') {
      const obj = item as Record<string, unknown>;
      const u = obj.url || obj.src || obj.link || obj.avatar || obj.avatarUrl;
      if (typeof u === 'string' && u.trim().length > 0) {
        extractedUrls.push(u.trim());
      }
      if (obj.thumbnails) collectUrls(obj.thumbnails);
      if (obj.avatar) collectUrls(obj.avatar);
      if (obj.thumbnail) collectUrls(obj.thumbnail);
      if (obj.contents) collectUrls(obj.contents);
    }
  }

  const candidates = [
    v2Rec?.thumbnails,
    v2Artist?.thumbnails,
    v2Rec?.header,
    v2Rec?.avatarUrl,
    v2Rec?.avatar,
    v2Rec?.thumbnail,
    v2Artist?.avatar,
    v1Rec?.thumbnails,
    v1Rec?.header,
    v1Rec?.avatarUrl,
    v1Rec?.avatar,
    v1Rec?.thumbnail,
    userRec?.thumbnails,
    userRec?.avatarUrl,
    userRec?.avatar,
    userRec?.thumbnail,
    recordInfo?.thumbnails,
    recordInfo?.avatarUrl,
    recordInfo?.avatar,
    recordInfo?.thumbnail,
    recordInfo?.header,
    channelObj?.thumbnails,
    channelObj?.avatarUrl,
    channelObj?.avatar,
    channelObj?.thumbnail,
    channelObj?.avatar_url,
  ];

  candidates.forEach(collectUrls);

  const thumbnails: ThumbnailFull[] = Array.from(new Set(extractedUrls)).map((url) => ({
    url: url.startsWith('//') ? `https:${url}` : url,
    width: 0,
    height: 0,
  }));

  const artistId =
    channel?.artistId ||
    (channelObj?.target as string) ||
    (channelObj?.id as string) ||
    (v2Rec?.artistId as string) ||
    (v2Rec?.id as string) ||
    (v2Rec?.channelId as string) ||
    (v1Rec?.id as string) ||
    (v1Rec?.artistId as string) ||
    (userRec?.id as string) ||
    (recordInfo?.artistId as string) ||
    (recordInfo?.id as string) ||
    '';

  return {
    artistId,
    name,
    thumbnails,
    type: 'ARTIST',
  };
}

export function parseV1ChannelData(v1Data: unknown): ArtistFullv1 | null {
  if (!v1Data || typeof v1Data !== 'object') return null;
  const v1 = v1Data as Record<string, unknown>;

  // If v1 already has topSongs/topAlbums populated as arrays, return it as ArtistFullv1
  if (Array.isArray(v1.topSongs) || Array.isArray(v1.topAlbums)) {
    return v1 as unknown as ArtistFullv1;
  }

  const header = (v1.header || {}) as Record<string, unknown>;
  const headerTitle = header.title as Record<string, unknown> | string | undefined;
  const name =
    (typeof headerTitle === 'object' && headerTitle !== null
      ? (headerTitle.text as string)
      : (headerTitle as string)) ||
    (v1.name as string) ||
    'Artist';

  const subBtn = header.subscription_button as Record<string, unknown> | undefined;
  const subscriptionChannelId = subBtn?.channel_id as string | undefined;

  const headerThumb = header.thumbnail as Record<string, unknown> | undefined;
  const rawContents = Array.isArray(headerThumb?.contents)
    ? (headerThumb.contents as ThumbnailFull[])
    : Array.isArray(v1.thumbnails)
    ? (v1.thumbnails as ThumbnailFull[])
    : [];

  const thumbnails: ThumbnailFull[] = rawContents.map((t) => ({
    url: t.url?.startsWith('//') ? `https:${t.url}` : t.url || '',
    width: t.width || 0,
    height: t.height || 0,
  }));

  const topSongs: SongDetailed[] = [];
  const topVideos: VideoDetailed[] = [];
  const topSingles: AlbumDetailed[] = [];
  const topAlbums: AlbumDetailed[] = [];
  const featuredOn: PlaylistDetailed[] = [];
  const similarArtists: ArtistDetailed[] = [];

  const sections = Array.isArray(v1.sections) ? v1.sections : [];

  sections.forEach((section: Record<string, unknown>) => {
    const sTitleObj = section.title as Record<string, unknown> | string | undefined;
    const sTitle = (
      typeof sTitleObj === 'object' && sTitleObj !== null
        ? (sTitleObj.text as string)
        : (sTitleObj as string) || ''
    ).toLowerCase();

    const contents = Array.isArray(section.contents) ? section.contents : [];

    contents.forEach((item: Record<string, unknown>) => {
      const itemTitle =
        (item.title as string) ||
        (Array.isArray(item.flex_columns)
          ? ((item.flex_columns as Record<string, unknown>[])[0]?.title as Record<string, unknown>)?.text
          : '') ||
        '';

      const itemThumb = (item.thumbnail as Record<string, unknown>)?.contents as ThumbnailFull[] || item.thumbnails || [];
      const itemVideoId = (item.id as string) || (item.videoId as string) || '';

      const itemArtistsRaw = Array.isArray(item.artists) ? item.artists : [];
      const itemArtists = itemArtistsRaw.map((a: Record<string, unknown>) => ({
        id: (a.channel_id as string) || (a.id as string) || (a.artistId as string) || '',
        name: (a.name as string) || name,
      }));

      if (sTitle.includes('top song') || sTitle.includes('song')) {
        topSongs.push({
          type: 'SONG',
          videoId: itemVideoId,
          name: typeof itemTitle === 'string' ? itemTitle : 'Track',
          artist: itemArtists[0] ? { artistId: itemArtists[0].id, name: itemArtists[0].name } : { artistId: '', name },
          album: null,
          duration: null,
          thumbnails: itemThumb,
        });
      } else if (sTitle.includes('video')) {
        topVideos.push({
          type: 'VIDEO',
          videoId: itemVideoId,
          name: typeof itemTitle === 'string' ? itemTitle : 'Video',
          artist: itemArtists[0] ? { artistId: itemArtists[0].id, name: itemArtists[0].name } : { artistId: '', name },
          duration: null,
          thumbnails: itemThumb,
        });
      } else if (sTitle.includes('single')) {
        topSingles.push({
          type: 'ALBUM',
          albumId: (item.browseId as string) || (item.id as string) || '',
          playlistId: (item.browseId as string) || (item.id as string) || '',
          name: typeof itemTitle === 'string' ? itemTitle : 'Single',
          artist: itemArtists[0] ? { artistId: itemArtists[0].id, name: itemArtists[0].name } : { artistId: '', name },
          thumbnails: itemThumb,
          year: 0,
        });
      } else if (sTitle.includes('album')) {
        topAlbums.push({
          type: 'ALBUM',
          albumId: (item.browseId as string) || (item.id as string) || '',
          playlistId: (item.browseId as string) || (item.id as string) || '',
          name: typeof itemTitle === 'string' ? itemTitle : 'Album',
          artist: itemArtists[0] ? { artistId: itemArtists[0].id, name: itemArtists[0].name } : { artistId: '', name },
          thumbnails: itemThumb,
          year: 0,
        });
      } else if (sTitle.includes('featured')) {
        featuredOn.push({
          type: 'PLAYLIST',
          playlistId: (item.browseId as string) || (item.id as string) || '',
          name: typeof itemTitle === 'string' ? itemTitle : 'Playlist',
          artist: { name, artistId: '' },
          thumbnails: itemThumb,
        });
      } else if (sTitle.includes('fan') || sTitle.includes('similar') || sTitle.includes('related')) {
        similarArtists.push({
          artistId: (item.browseId as string) || (item.artistId as string) || (item.id as string) || '',
          name: typeof itemTitle === 'string' ? itemTitle : 'Artist',
          thumbnails: itemThumb,
          type: 'ARTIST',
        });
      }
    });
  });

  return {
    artistId: subscriptionChannelId || (v1.artistId as string) || '',
    name,
    header: {
      title: name,
      thumbnail: { contents: thumbnails },
    },
    thumbnails,
    topSongs,
    topAlbums,
    topSingles,
    topVideos,
    featuredOn,
    similarArtists,
    type: 'ARTIST',
  };
}
