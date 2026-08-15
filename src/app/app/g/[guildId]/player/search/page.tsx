'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { useSearchParams, useRouter, useParams } from 'next/navigation';
import { getCookie } from 'cookies-next';
import { motion } from 'framer-motion';
import {
  FlyingSaucer,
  MagnifyingGlass,
  PlayIcon,
} from '@phosphor-icons/react/dist/ssr';

import PlayButton from '@/components/music/button/play';
import Track, { combineArtistName, extractArtistsFromItem } from '@/components/music/searchResult/track';
import SubscribeButton from '@/components/music/subscribe';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/store/coreStore';
import { SearchResult as HTTP_SearchResult, TrackResultItem } from '@/types/youtube/ytmusic-api';
import fetchSearchResult from '@/lib/server-side-api/internal/search';
import { SearchResultSkeleton } from '@/components/music/skeleton';
import { cn } from '@/lib/utils';

const ORDERED_KEYS = [
  'Top result',
  'More from YouTube',
  'Songs',
  'Videos',
  'Albums',
  'Community playlists',
  'Artists',
  'Podcasts',
  'Episodes',
  'Profiles',
];

interface TopResultCardProps {
  track: TrackResultItem;
}

function TopResultCard({ track }: TopResultCardProps) {
  const router = useRouter();
  const params = useParams();
  const guildId = typeof params?.guildId === 'string' ? params.guildId : '';
  const trackTitle = track.title || track.name || '';
  const type = track.resultType?.toLowerCase();
  const isArtist = type === 'artist';
  const trackRecord = track as unknown as Record<string, unknown>;
  const finalArtists = extractArtistsFromItem(trackRecord);
  const browseId = [track.browseId, trackRecord.playlistId, trackRecord.albumId, trackRecord.id]
    .find((id): id is string => typeof id === 'string');
  const targetUrl = isArtist && track.artists?.[0]?.id
    ? `/app/g/${guildId}/player/c?c=${track.artists[0].id}`
    : (type === 'album' || type === 'single') && browseId
      ? `/app/g/${guildId}/player/playlist?list=${browseId.endsWith('abm') ? browseId : `${browseId}abm`}`
      : type === 'playlist' && browseId
        ? `/app/g/${guildId}/player/playlist?list=${browseId}`
        : null;

  function handleClick(event: React.MouseEvent<HTMLDivElement>) {
    if (targetUrl && !(event.target as HTMLElement).closest('a, button')) {
      router.push(targetUrl);
    }
  }

  return (
    <div
      onClick={handleClick}
      className={cn(
        'relative group/result-card w-full rounded-3xl p-4 backdrop-blur-lg bg-card/10 overflow-hidden text-card-foreground flex flex-col gap-4 items-start z-10',
        targetUrl && 'cursor-pointer',
      )}
    >
      <div className='flex gap-4 items-center w-full'>
        <div className={cn(
          "relative size-24 object-cover pointer-events-none select-none overflow-hidden",
          isArtist
            ? 'rounded-full'
            : 'rounded-2xl'
        )}>
          {track.thumbnails?.[0]?.url && (
            <Image
              src={`/api/proxy/image?r=${encodeURIComponent(track.thumbnails[0].url)}`}
              alt={trackTitle}
              width={256}
              height={256}
              unoptimized
              className={"size-full"}
            />
          )}
          {!isArtist && track.videoId && (
            <div className='group-hover/result-card:opacity-100 opacity-0 size-full rounded-2xl absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[2px] duration-200 cursor-pointer z-10'>
              <PlayIcon weight='fill' className='text-default-foreground' size={32} />
            </div>
          )}
        </div>
        <div className='flex gap-8 items-center flex-1 min-w-0'>
          <div className='flex flex-col items-start flex-1 min-w-0'>
            <h3 className='text-3xl font-bold truncate w-full text-start'>
              {trackTitle || combineArtistName(finalArtists)}
            </h3>
            <div className='text-sm text-muted-foreground flex gap-1 items-center z-20'>
              {!isArtist && finalArtists.length > 0 ? (
                <>
                  {combineArtistName(finalArtists, true, router)}
                  <span>•</span>
                </>
              ) : null}
              <span className='capitalize'>{track.resultType || 'Result'}</span>
            </div>
            <div className='flex gap-3 items-center justify-end w-full mt-2'>
              {!isArtist && track.videoId && (
                <PlayButton
                  detail={{
                    author: combineArtistName(finalArtists),
                    identifier: track.videoId,
                    sourceName: 'youtube music',
                    resultType: track.resultType || 'song',
                    title: trackTitle,
                    uri: `https://music.youtube.com/watch?v=${track.videoId}`,
                  }}
                />
              )}
            </div>
          </div>
          <div className='ml-auto z-10'>
            {isArtist && (track.artists?.[0]?.id) && (
              <SubscribeButton
                channelId={track.artists[0].id}
                artistName={track.artists[0].name}
                className='text-sm'
                triggerClassName='bg-secondary/10! rounded-full font-bold py-2 px-4'
                preset='minimal'
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const getTrackKey = (item: HTTP_SearchResult, idx: number): string => {
  const itemObj = item as unknown as Record<string, unknown>;
  if (typeof itemObj.videoId === 'string') return itemObj.videoId;
  if (typeof itemObj.id === 'string') return itemObj.id;
  if (typeof itemObj.browseId === 'string') return itemObj.browseId;
  if (typeof itemObj.title === 'string') return `${itemObj.title}-${idx}`;
  if (typeof itemObj.name === 'string') return `${itemObj.name}-${idx}`;
  return `search-item-${idx}`;
};

export function Page() {
  const language = useAppStore((state) => state.language);
  const searchParams = useSearchParams();
  const search = searchParams ? searchParams.get('q') : '';

  const [searchResult, setSearchResult] = useState<{
    [key: string]: HTTP_SearchResult[];
  } | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [filter, setFilter] = useState<string>('all');

  const [prevSearch, setPrevSearch] = useState<string | null>(null);
  const [prevFilter, setPrevFilter] = useState<string>('all');

  if (search !== prevSearch || filter !== prevFilter) {
    setPrevSearch(search);
    setPrevFilter(filter);
    setLoading(true);
    setSearchResult(null);
  }

  const filterNormalize = useMemo(() => {
    if (filter === 'playlists') return 'Community playlists';
    if (filter !== 'all') return filter[0].toUpperCase() + filter.slice(1);
    return filter;
  }, [filter]);

  useEffect(() => {
    let active = true;

    const letSearch = async () => {
      const accessTokenType = String(getCookie('LOGIN_TYPE_'));
      const accessToken = String(getCookie('LOGIN_'));
      if (
        !search ||
        typeof search !== 'string' ||
        !accessTokenType ||
        accessTokenType === 'undefined' ||
        !accessToken ||
        accessToken === 'undefined'
      ) {
        if (active) setLoading(false);
        return;
      }

      setLoading(true);
      const res = await fetchSearchResult(
        accessTokenType,
        accessToken,
        search,
        filter === 'all' ? undefined : filter
      );

      if (!active) return;

      if (!res || !res.result) {
        setSearchResult(null);
        setLoading(false);
        return;
      }

      const categoryMap: { [key: string]: string } = {
        top_result: 'Top result',
        'top result': 'Top result',
        songs: 'Songs',
        song: 'Songs',
        videos: 'Videos',
        video: 'Videos',
        albums: 'Albums',
        album: 'Albums',
        playlists: 'Community playlists',
        playlist: 'Community playlists',
        community_playlists: 'Community playlists',
        artists: 'Artists',
        artist: 'Artists',
        podcasts: 'Podcasts',
        podcast: 'Podcasts',
        episodes: 'Episodes',
        episode: 'Episodes',
        profiles: 'Profiles',
        profile: 'Profiles',
      };

      const sortedResult = res.result.reduce(
        (acc: { [key: string]: HTTP_SearchResult[] }, item: HTTP_SearchResult) => {
          const itemAny = item as unknown as Record<string, unknown>;
          const rawCategory = (typeof item.category === 'string' ? item.category : undefined) || (itemAny.resultType ? categoryMap[String(itemAny.resultType).toLowerCase()] : null) || 'Other';
          const type = categoryMap[rawCategory.toLowerCase()] || rawCategory;
          if (!acc[type]) acc[type] = [];
          acc[type].push(item);
          return acc;
        },
        {}
      );

      const orderedResult: { [key: string]: HTTP_SearchResult[] } = {};
      ORDERED_KEYS.forEach((key) => {
        if (sortedResult[key] && sortedResult[key].length > 0) {
          orderedResult[key] = sortedResult[key];
        }
      });

      Object.keys(sortedResult).forEach((key) => {
        if (!orderedResult[key] && sortedResult[key] && sortedResult[key].length > 0) {
          orderedResult[key] = sortedResult[key];
        }
      });

      setSearchResult(orderedResult);
      setLoading(false);
    };

    letSearch();

    return () => {
      active = false;
    };
  }, [filter, search]);

  const categories = useMemo(
    () => [
      { key: 'all', label: language.data.app.guilds.player.search.category.All },
      { key: 'songs', label: language.data.app.guilds.player.search.category.Songs },
      { key: 'videos', label: language.data.app.guilds.player.search.category.Videos },
      { key: 'albums', label: language.data.app.guilds.player.search.category.Albums },
      { key: 'playlists', label: language.data.app.guilds.player.search.category['Community playlists'] },
      { key: 'artists', label: language.data.app.guilds.player.search.category.Artists },
      { key: 'profiles', label: language.data.app.guilds.player.search.category.Profiles },
    ],
    [language.data.app.guilds.player.search.category]
  );

  return (
    <div className='w-full max-w-3xl mx-auto mt-24 gap-4 flex flex-col items-center justify-center text-center pb-[16vh]'>
      <div className='w-full flex gap-5'>
        <div className='flex flex-col items-start justify-center w-full'>
          <h1 className='text-5xl flex gap-4 items-center font-bold'>
            <MagnifyingGlass size={32} weight='bold' />{' '}
            {language.data.app.guilds.player.search.result}
          </h1>
          <h2 className='text-2xl text-start mt-1 text-muted-foreground font-normal'>{search}</h2>

          <div className='w-full flex gap-2 my-4 overflow-x-auto pb-2 no-scrollbar' role='tablist'>
            {categories.map((cat) => (
              <Button
                key={cat.key}
                variant={filter === cat.key ? 'default' : 'outline'}
                size='sm'
                className='rounded-full whitespace-nowrap'
                onClick={() => setFilter(cat.key)}
              >
                {cat.label}
              </Button>
            ))}
          </div>

          {loading && (
            <div className='w-full py-4'>
              <SearchResultSkeleton />
            </div>
          )}
        </div>
      </div>

      <div className='w-full gap-4 flex flex-col items-center justify-center text-center'>
        {!loading &&
          searchResult &&
          (!filter || filter === 'all') &&
          Object.keys(searchResult).length > 0 ? (
          Object.keys(searchResult).map(
            (category) =>
              searchResult[category] &&
              searchResult[category].length > 0 && (
                <div
                  key={category}
                  className='w-full flex flex-col gap-4 items-start justify-center my-2'
                >
                  <h2 className='text-xl text-start font-bold'>
                    {language.data.app.guilds.player.search.category[
                      category as keyof typeof language.data.app.guilds.player.search.category
                    ] || category}
                  </h2>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className='w-full flex flex-col gap-2 items-center justify-start'
                  >
                    {category === 'Top result' ? (
                      <>
                        <TopResultCard track={searchResult[category][0] as TrackResultItem} />
                        {searchResult[category].slice(1).map((result, idx) => (
                          <Track key={getTrackKey(result, idx + 1)} result={result} />
                        ))}
                      </>
                    ) : (
                      searchResult[category].map((result, idx) => (
                        <Track key={getTrackKey(result, idx)} result={result} />
                      ))
                    )}
                  </motion.div>
                </div>
              )
          )
        ) : !loading &&
          filter !== 'all' &&
          searchResult &&
          searchResult[filterNormalize] &&
          searchResult[filterNormalize].length > 0 ? (
          <div className='w-full flex flex-col gap-2 items-center justify-start'>
            {searchResult[filterNormalize].map((result, idx) => (
              <Track key={getTrackKey(result, idx)} result={result} />
            ))}
          </div>
        ) : (
          !loading && (
            <div className='w-full min-h-[36vh] flex flex-col gap-4 items-center justify-center'>
              <FlyingSaucer weight='fill' size={74} />
              <h2 className='text-lg tracking-wider font-semibold'>
                {language.data.app.guilds.player.search.notfound}
              </h2>
              <p className='text-sm tracking-wider text-muted-foreground'>＼（〇_〇）／</p>
            </div>
          )
        )}
      </div>
    </div>
  );
}

export default Page;
