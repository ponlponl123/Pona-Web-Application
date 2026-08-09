'use client';
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import clsx from 'clsx';

import { getCookie } from 'cookies-next';
import {
  SearchResult as HTTP_SearchResult,
  TrackResultItem,
} from '@/types/youtube/ytmusic-api';
import { cn, msToTime } from '@/lib/utils';
import { combineArtistName, CombineArtistNameOptions, CombineArtistItem } from '@/lib/artist';
import { useDiscordGuildInfo } from '@/contexts/discordGuildInfo';
import { getSong } from '@/lib/server-side-api/internal/search';
import PlayButton, { PlayButtonClassNames } from '../button/play';

export type { CombineArtistNameOptions };
export { combineArtistName };

export interface TrackClassNames {
  title?: string;
  subtitle?: string;
  artistLink?: string;
  wrapper?: string;
  playButton?: PlayButtonClassNames;
  image?: string;
  imageWrapper?: string;
  duration?: string;
}

const DUMMY_KEYWORDS = new Set([
  'song',
  'video',
  'album',
  'playlist',
  'podcast',
  'episode',
  'artist',
  'single',
  'music',
  'result',
  'track',
]);

/**
 * Parses artist names from title patterns like "Artist - Title" or "Title (feat. Artist)"
 */
function extractArtistsFromTitle(title: string): CombineArtistItem[] {
  if (!title) return [];
  const results: CombineArtistItem[] = [];

  const add = (name: string) => {
    const clean = name.replace(/[@()\[\]]/g, '').replace(/\s*-\s*Topic\s*$/i, '').trim();
    if (!clean) return;
    const lower = clean.toLowerCase();
    if (DUMMY_KEYWORDS.has(lower)) return;
    if (/^\d{1,2}:\d{2}(?::\d{2})?$/.test(clean)) return;
    if (!results.some((r) => r.name.toLowerCase() === lower)) {
      results.push({ name: clean, id: null });
    }
  };

  // Match feat. / ft. / featuring
  const featMatch = title.match(/(?:feat\.|ft\.|featuring)\s*@?([^\)\],|]+)/i);
  if (featMatch?.[1]) {
    featMatch[1].split(/&|,/).forEach((part) => add(part));
  }

  // Match Artist - Title
  const dashMatch = title.match(/^([^-]+)\s*-\s*/);
  if (dashMatch?.[1]) {
    const potentialArtist = dashMatch[1].trim();
    if (potentialArtist.length > 1 && !/^\d+$/.test(potentialArtist)) {
      add(potentialArtist);
    }
  }

  return results;
}

/**
 * Extracts and cleans valid artist entries from all potential item fields
 */
export function extractArtistsFromItem(item: Record<string, unknown>): CombineArtistItem[] {
  const candidates: CombineArtistItem[] = [];

  const addCandidate = (name: unknown, id?: unknown) => {
    if (typeof name !== 'string') return;
    const clean = name.replace(/\s*-\s*Topic\s*$/i, '').trim();
    if (!clean) return;
    const lower = clean.toLowerCase();
    if (DUMMY_KEYWORDS.has(lower)) return;
    if (/^\d{1,2}:\d{2}(?::\d{2})?$/.test(clean)) return;

    if (!candidates.some((c) => c.name.toLowerCase() === lower)) {
      candidates.push({
        name: clean,
        id: typeof id === 'string' && id.trim() ? id.trim() : null,
      });
    }
  };

  // 1. Array item.artists
  if (Array.isArray(item.artists)) {
    item.artists.forEach((a) => {
      if (typeof a === 'string') addCandidate(a);
      else if (a && typeof a === 'object') {
        const obj = a as Record<string, unknown>;
        addCandidate(obj.name || obj.title, obj.id || obj.browseId || obj.channelId || obj.artistId);
      }
    });
  }

  // 2. Property item.artist
  if (candidates.length === 0 && item.artist) {
    if (typeof item.artist === 'string') {
      addCandidate(item.artist, item.artistId);
    } else if (Array.isArray(item.artist)) {
      item.artist.forEach((a) => {
        if (typeof a === 'string') addCandidate(a);
        else if (a && typeof a === 'object') {
          const obj = a as Record<string, unknown>;
          addCandidate(obj.name || obj.title, obj.id || obj.browseId || obj.artistId);
        }
      });
    } else if (typeof item.artist === 'object') {
      const obj = item.artist as Record<string, unknown>;
      addCandidate(obj.name || obj.title, obj.id || obj.browseId || obj.artistId);
    }
  }

  // 3. Fallbacks: author / uploader / channel
  if (candidates.length === 0) {
    if (item.author) {
      if (typeof item.author === 'string') addCandidate(item.author, item.artistId);
      else if (typeof item.author === 'object') {
        const obj = item.author as Record<string, unknown>;
        addCandidate(obj.name || obj.title, obj.id || obj.browseId);
      }
    }
    if (item.uploader) {
      if (typeof item.uploader === 'string') addCandidate(item.uploader);
      else if (typeof item.uploader === 'object') {
        const obj = item.uploader as Record<string, unknown>;
        addCandidate(obj.name || obj.title, obj.id);
      }
    }
    if (item.channel) {
      if (typeof item.channel === 'string') addCandidate(item.channel);
      else if (typeof item.channel === 'object') {
        const obj = item.channel as Record<string, unknown>;
        addCandidate(obj.name || obj.title, obj.id);
      }
    }
  }

  // 4. Fallback text sources: subtitle / byline / runs
  if (candidates.length === 0) {
    const textSources: string[] = [];
    if (typeof item.subtitle === 'string') textSources.push(item.subtitle);
    if (typeof item.byline === 'string') textSources.push(item.byline);
    if (Array.isArray(item.runs)) {
      item.runs.forEach((r) => {
        if (r && typeof r === 'object' && typeof (r as Record<string, unknown>).text === 'string') {
          textSources.push((r as Record<string, unknown>).text as string);
        }
      });
    }

    textSources.forEach((src) => {
      src.split(/[•·|-]/).forEach((part) => addCandidate(part));
    });
  }

  // 5. Fallback title pattern extraction (e.g. "Title (feat. Artist)" or "Artist - Title")
  if (candidates.length === 0 && typeof item.title === 'string') {
    const titleArtists = extractArtistsFromTitle(item.title);
    titleArtists.forEach((a) => candidates.push(a));
  }

  return candidates;
}

/**
 * Extracts and formats duration timestamp from all potential item fields
 */
export function extractDurationFromItem(item: Record<string, unknown>): string {
  if (typeof item.duration === 'string' && item.duration.trim()) {
    const trimmed = item.duration.trim();
    if (/^\d{1,2}:\d{2}(?::\d{2})?$/.test(trimmed)) return trimmed;
  }

  const numericSeconds =
    item.duration_seconds ??
    item.durationSeconds ??
    item.length_seconds ??
    item.lengthSeconds ??
    (typeof item.length === 'number' ? item.length : undefined);

  if (typeof numericSeconds === 'number' && numericSeconds > 0) {
    return msToTime(numericSeconds * 1000);
  }

  const candidates: unknown[] = [
    item.duration,
    item.lengthText,
    item.length,
    item.time,
    item.subtitle,
    item.byline,
    item.description,
  ];

  if (Array.isArray(item.runs)) {
    item.runs.forEach((r) => {
      if (r && typeof r === 'object' && typeof (r as Record<string, unknown>).text === 'string') {
        candidates.push((r as Record<string, unknown>).text);
      }
    });
  }

  const timestampRegex = /\b\d{1,2}:\d{2}(?::\d{2})?\b/;
  for (const cand of candidates) {
    if (typeof cand === 'string') {
      const match = cand.match(timestampRegex);
      if (match) return match[0];
    }
  }

  return '';
}

export function TrackSearchResult({
  result,
  classNames,
  index,
}: {
  result: HTTP_SearchResult;
  classNames?: TrackClassNames;
  index?: number;
}) {
  const router = useRouter();
  const { guild } = useDiscordGuildInfo();

  const itemRec = (result || {}) as unknown as Record<string, unknown>;
  const item = result as unknown as TrackResultItem & {
    browseId?: string;
    playlistId?: string;
    albumId?: string;
    artistId?: string;
    id?: string;
    album?: { name?: string; title?: string; id?: string; browseId?: string };
  };

  const type = (result.resultType || 'song').toLowerCase();

  const rawArtistName =
    typeof itemRec.artist === 'string'
      ? itemRec.artist
      : Array.isArray(itemRec.artist)
        ? (itemRec.artist[0] as Record<string, unknown>)?.name || (itemRec.artist[0] as Record<string, unknown>)?.title
        : typeof itemRec.artist === 'object' && itemRec.artist !== null
          ? (itemRec.artist as Record<string, unknown>)?.name || (itemRec.artist as Record<string, unknown>)?.title
          : undefined;

  const title =
    (typeof itemRec.title === 'string' ? itemRec.title : undefined) ||
    (typeof itemRec.name === 'string' ? itemRec.name : undefined) ||
    (typeof rawArtistName === 'string' ? rawArtistName : undefined) ||
    (typeof itemRec.author === 'string' ? itemRec.author : undefined) ||
    (typeof itemRec.channel === 'string' ? itemRec.channel : undefined) ||
    '';

  const videoId = item.videoId || '';
  const browseId = item.browseId || item.playlistId || item.albumId || item.artistId || item.id || '';

  const initialArtists = extractArtistsFromItem(itemRec);
  const initialDuration = extractDurationFromItem(itemRec);

  const [fetchedMeta, setFetchedMeta] = useState<{ artists?: CombineArtistItem[]; duration?: string }>({});

  const isPlayableTrack = type === 'song' || type === 'video' || type === 'episode';

  // Asynchronously resolve missing metadata (artists or duration) for playable tracks
  useEffect(() => {
    if (isPlayableTrack && videoId && (initialArtists.length === 0 || !initialDuration)) {
      let isMounted = true;
      const token = (getCookie('LOGIN_') || getCookie('token')) as string;
      const tokenType = (getCookie('LOGIN_TYPE_') || getCookie('tokenType') || 'Bearer') as string;

      if (token && token !== 'undefined') {
        getSong(tokenType, token, title, '', videoId)
          .then((res) => {
            if (!isMounted || !res) return;
            const updates: { artists?: CombineArtistItem[]; duration?: string } = {};
            if (initialArtists.length === 0 && Array.isArray(res.artists) && res.artists.length > 0) {
              const valid = res.artists
                .map((a) => ({ name: a.name, id: a.id || null }))
                .filter((a) => a.name && !DUMMY_KEYWORDS.has(a.name.toLowerCase()));
              if (valid.length > 0) updates.artists = valid;
            }
            if (!initialDuration && res.duration) {
              updates.duration = res.duration;
            }
            if (Object.keys(updates).length > 0) {
              setFetchedMeta(updates);
            }
          })
          .catch(() => null);
      }

      return () => {
        isMounted = false;
      };
    }
  }, [isPlayableTrack, videoId, initialArtists.length, initialDuration, title]);

  const finalArtists = initialArtists.length > 0 ? initialArtists : fetchedMeta.artists || [];
  const duration = initialDuration || fetchedMeta.duration || '';

  const thumbnails = item.thumbnails || [];
  const thumbnailUrl = thumbnails?.length ? thumbnails[thumbnails.length - 1].url : null;

  // Target URL navigation for non-playable or linkable items
  let targetUrl = '#';
  if ((type === 'artist' || type === 'profile' || type === 'user') && browseId) {
    targetUrl = `/app/g/${guild?.id}/player/c?c=${browseId}`;
  } else if (type === 'album' && browseId) {
    const cleanId = browseId.endsWith('abm') ? browseId : `${browseId}abm`;
    targetUrl = `/app/g/${guild?.id}/player/playlist?list=${cleanId}`;
  } else if ((type === 'playlist' || type === 'podcast' || type === 'episode') && browseId) {
    if (browseId.startsWith('UC')) {
      targetUrl = `/app/g/${guild?.id}/player/c?c=${browseId}`;
    } else {
      targetUrl = `/app/g/${guild?.id}/player/playlist?list=${browseId}`;
    }
  }

  const handleRowClick = (e: React.MouseEvent) => {
    if (!isPlayableTrack && targetUrl !== '#') {
      const target = e.target as HTMLElement;
      if (!target.closest('a') && !target.closest('button')) {
        e.preventDefault();
        router.push(targetUrl);
      }
    }
  };

  return (
    <div
      onClick={handleRowClick}
      className={clsx(
        'w-full max-w-full flex gap-4 items-center justify-start group hover:bg-muted/40 p-2 rounded-2xl transition-colors',
        !isPlayableTrack && targetUrl !== '#' && 'cursor-pointer',
        classNames?.wrapper
      )}
    >
      {index !== undefined && (
        <span className='text-sm text-muted-foreground w-6 text-center font-medium'>
          {index}
        </span>
      )}
      <div
        className={cn(
          'overflow-hidden aspect-square h-12 w-12 group rounded-xl relative shrink-0 bg-muted',
          (type === 'artist' || type === 'profile' || type === 'user') && 'rounded-full',
          classNames?.imageWrapper
        )}
      >
        {thumbnailUrl ? (
          <Image
            className={clsx(
              'object-cover w-full h-full group-hover:scale-105 transition-transform duration-300',
              (type === 'artist' || type === 'profile' || type === 'user') && 'rounded-full',
              classNames?.image
            )}
            src={`/api/proxy/image?r=${encodeURIComponent(thumbnailUrl)}`}
            alt={title}
            fill
            unoptimized
          />
        ) : (
          <div className='w-full h-full bg-muted flex items-center justify-center text-muted-foreground' />
        )}
        {isPlayableTrack && videoId && (
          <PlayButton
            classNames={classNames?.playButton}
            iconSize={16}
            detail={{
              author: combineArtistName(finalArtists),
              identifier: videoId,
              sourceName: 'youtube music',
              resultType: type,
              title: title,
              uri:
                type === 'video'
                  ? `https://youtu.be/${videoId}`
                  : `https://music.youtube.com/watch?v=${videoId}`,
            }}
          />
        )}
      </div>

      <div className='flex flex-col justify-center items-start flex-1 min-w-0'>
        {isPlayableTrack || targetUrl === '#' ? (
          <h1
            className={clsx(
              'text-base font-medium whitespace-nowrap overflow-hidden text-ellipsis w-full text-start',
              classNames?.title
            )}
          >
            {title}
          </h1>
        ) : (
          <Link
            href={targetUrl}
            onClick={(e) => {
              if (router && targetUrl !== '#') {
                e.preventDefault();
                router.push(targetUrl);
              }
            }}
            className={clsx(
              'text-base font-medium whitespace-nowrap overflow-hidden text-ellipsis w-full text-start text-foreground',
              classNames?.title
            )}
          >
            {title}
          </Link>
        )}

        <div
          className={clsx(
            'text-xs text-muted-foreground whitespace-nowrap overflow-hidden text-ellipsis w-full text-start flex gap-1 items-center',
            classNames?.subtitle
          )}
        >
          {isPlayableTrack ? (
            <>
              {finalArtists.length > 0 ? (
                combineArtistName(finalArtists, true, router, {
                  className: classNames?.artistLink
                })
              ) : item.album?.name || item.album?.title ? (
                <Link
                  href={`/app/g/${guild?.id}/player/playlist?list=${item.album.id || item.album.browseId}`}
                  className={cn('text-muted-foreground truncate', classNames?.artistLink)}
                >
                  {item.album.name || item.album.title}
                </Link>
              ) : null}
              {finalArtists.length > 0 && item.album && (
                <>
                  <span>•</span>
                  <Link
                    href={`/app/g/${guild?.id}/player/playlist?list=${item.album.id || item.album.browseId}`}
                    className={cn('text-muted-foreground truncate', classNames?.artistLink)}
                  >
                    {item.album.name || item.album.title}
                  </Link>
                </>
              )}
            </>
          ) : type === 'artist' || type === 'profile' || type === 'user' ? (
            targetUrl !== '#' ? (
              <Link
                href={targetUrl}
                onClick={(e) => {
                  if (router && targetUrl !== '#') {
                    e.preventDefault();
                    router.push(targetUrl);
                  }
                }}
                className={cn('text-muted-foreground capitalize', classNames?.artistLink)}
              >
                {type}
              </Link>
            ) : (
              <span className={cn('capitalize', classNames?.artistLink)}>{type}</span>
            )
          ) : (
            <>
              {finalArtists.length > 0 && (
                <>
                  {combineArtistName(finalArtists, true, router)}
                  <span>•</span>
                </>
              )}
              {targetUrl !== '#' ? (
                <Link
                  href={targetUrl}
                  onClick={(e) => {
                    if (router && targetUrl !== '#') {
                      e.preventDefault();
                      router.push(targetUrl);
                    }
                  }}
                  className={cn('text-muted-foreground capitalize', classNames?.artistLink)}
                >
                  {type}
                </Link>
              ) : (
                <span className={cn('capitalize', classNames?.artistLink)}>{type}</span>
              )}
            </>
          )}
        </div>
      </div>

      {duration ? (
        <span className={cn('text-xs text-muted-foreground shrink-0 font-mono', classNames?.duration)}>
          {duration}
        </span>
      ) : null}
    </div>
  );
}

export default TrackSearchResult;
