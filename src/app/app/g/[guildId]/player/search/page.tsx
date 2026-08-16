'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { useSearchParams, useRouter, useParams } from 'next/navigation';
import { getCookie } from 'cookies-next';
import { motion } from 'framer-motion';
import {
  FlyingSaucerIcon,
  MagnifyingGlassIcon,
  PlayIcon,
  SparkleIcon,
  ArrowClockwiseIcon,
  MusicNotesSimpleIcon,
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
import { useMediaQuery } from 'react-responsive';
import useEmblaCarousel from 'embla-carousel-react';
import HeaderSearch from '@/components/root/header-search';

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
  const router = useRouter();
  const params = useParams();
  const guildId = typeof params?.guildId === 'string' ? params.guildId : '';
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

  const isMobileStore = useAppStore((state) => state.isMobile);
  const isSmallScreen = useMediaQuery({ maxWidth: 768 });

  const [categoriesEmblaRef] = useEmblaCarousel({
    dragFree: true,
    containScroll: 'trimSnaps',
  });

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
      { key: 'podcasts', label: language.data.app.guilds.player.search.category.Podcasts },
      { key: 'episodes', label: language.data.app.guilds.player.search.category.Episodes },
      { key: 'profiles', label: language.data.app.guilds.player.search.category.Profiles },
    ],
    [language.data.app.guilds.player.search.category]
  );

  const moodItems = useMemo(() => {
    const searchObj = language.data.app.guilds.player.search as unknown as Record<string, unknown>;
    if (Array.isArray(searchObj.mood_items)) {
      return searchObj.mood_items as Array<{
        title: string;
        query: string;
        color?: string;
        accent?: string;
        emoji?: string;
      }>;
    }
    return [
      { title: 'Lo-Fi Beats', query: 'Lo-Fi Beats', color: 'from-purple-500/30 to-indigo-500/10', accent: 'bg-purple-500', emoji: '🎧' },
      { title: 'Chill & Relax', query: 'Chill Relaxing Music', color: 'from-blue-500/30 to-cyan-500/10', accent: 'bg-blue-500', emoji: '☕' },
      { title: 'Gaming Energy', query: 'Gaming EDM Music', color: 'from-emerald-500/30 to-teal-500/10', accent: 'bg-emerald-500', emoji: '🎮' },
      { title: 'Pop Hits', query: 'Top Pop Hits', color: 'from-pink-500/30 to-rose-500/10', accent: 'bg-pink-500', emoji: '✨' },
      { title: 'J-Pop & Anime', query: 'J-Pop Anime OST', color: 'from-amber-500/30 to-orange-500/10', accent: 'bg-amber-500', emoji: '🌸' },
      { title: 'K-Pop Trends', query: 'K-Pop Hits', color: 'from-violet-500/30 to-fuchsia-500/10', accent: 'bg-violet-500', emoji: '🌟' },
      { title: 'Rock & Metal', query: 'Rock Hits', color: 'from-red-500/30 to-rose-500/10', accent: 'bg-red-500', emoji: '🎸' },
      { title: 'Deep Focus', query: 'Deep Focus Study Music', color: 'from-teal-500/30 to-cyan-500/10', accent: 'bg-teal-500', emoji: '💡' },
    ];
  }, [language.data.app.guilds.player.search]);

  const handleGenreClick = (genre: string) => {
    router.push(`/app/g/${guildId}/player/search?q=${encodeURIComponent(genre)}`);
  };

  const handleClearSearch = () => {
    router.push(`/app/g/${guildId}/player/search`);
  };

  const searchObj = language.data.app.guilds.player.search as unknown as Record<string, unknown>;
  const notFoundTitle = typeof searchObj.notfound_title === 'string'
    ? searchObj.notfound_title.replace('[query]', search || '')
    : `${language.data.app.guilds.player.search.notfound || 'Not Found'}: "${search}"`;

  return (
    <div className='w-full max-w-4xl mx-auto md:mt-24 gap-6 flex flex-col items-center justify-center text-center pb-[16vh]'>
      <div className='w-full flex gap-5'>
        <div className='flex flex-col items-start justify-center w-full'>
          <h1 className='text-4xl md:text-5xl flex gap-3.5 items-center font-bold tracking-tight'>
            {search ? (
              <>
                <MagnifyingGlassIcon size={32} weight='bold' className='shrink-0' />{' '}
                {language.data.app.guilds.player.search.result}
              </>
            ) : (
              <>
                <MusicNotesSimpleIcon size={32} weight='bold' className='shrink-0' />{' '}
                {language.data.app.guilds.player.search.title}
              </>
            )}
          </h1>

          {(isSmallScreen || isMobileStore) && (
            <HeaderSearch
              className='w-full mt-2.5 z-50'
              containerClassName='max-md:w-full max-md:max-w-none md:hidden max-md:relative max-md:translate-0! max-md:translate-x-0! max-md:top-0! max-md:left-0!'
              navOpened={false}
            />
          )}

          {search ? (
            <h2 className='max-md:hidden text-2xl text-start mt-1 text-muted-foreground font-normal break-all'>
              {search}
            </h2>
          ) : null}

          {search ? (
            <div className='w-full overflow-hidden my-4' ref={categoriesEmblaRef}>
              <div className='flex gap-2 touch-pan-y select-none' role='tablist'>
                {categories.map((cat) => (
                  <div key={cat.key} className='shrink-0'>
                    <Button
                      variant={filter === cat.key ? 'default' : 'outline'}
                      size='sm'
                      className='rounded-full whitespace-nowrap'
                      onClick={() => setFilter(cat.key)}
                    >
                      {cat.label}
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {loading && search && (
            <div className='w-full py-4'>
              <SearchResultSkeleton />
            </div>
          )}
        </div>
      </div>

      <div className='w-full gap-4 flex flex-col items-center justify-center text-center'>
        {!search ? (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className='w-full flex flex-col items-start gap-8 my-2'
          >
            <div className='relative w-full flex flex-col md:flex-row items-start md:items-center justify-between gap-6'>
              <div className='flex items-center gap-4 z-10'>
                <motion.div
                  animate={{ y: [0, -4, 0], rotate: [0, 2, -2, 0] }}
                  transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
                  className='size-14 rounded-2xl flex items-center justify-center shrink-0'
                >
                  <FlyingSaucerIcon weight='fill' size={30} className='text-primary' />
                </motion.div>

                <div className='flex flex-col text-start gap-1'>
                  <div className='flex items-center gap-2'>
                    <span className='text-xs font-semibold px-2.5 py-0.5 rounded-md bg-primary/10 text-primary'>
                      {String(searchObj.empty_mascot_badge || 'Pona Radio 🛸')}
                    </span>
                    <span className='text-xs text-muted-foreground font-mono'>( ੭ ˙ᗜ˙ )੭</span>
                  </div>
                  <h2 className='text-xl md:text-2xl font-bold tracking-tight text-foreground'>
                    {String(searchObj.empty_hero_title || 'What are we vibing to today?')}
                  </h2>
                  <p className='text-xs md:text-sm text-muted-foreground'>
                    {String(searchObj.empty_hero_subtitle || 'Search any track, artist, album, or pick a mood to start listening.')}
                  </p>
                </div>
              </div>

              <div className='w-full md:w-80 max-md:hidden z-10'>
                <HeaderSearch
                  className='w-full'
                  containerClassName='w-full relative max-w-none top-0! left-0! translate-0! translate-x-0!'
                  navOpened={false}
                />
              </div>
            </div>

            <div className='w-full flex flex-col gap-4 text-start mt-6'>
              <div className='flex items-center justify-between w-full px-1'>
                <div className='flex items-center gap-2 text-sm font-semibold tracking-tight text-foreground'>
                  <SparkleIcon size={16} weight='fill' />
                  <span>{String(searchObj.moods_title || 'Explore Moods & Genres')}</span>
                </div>
              </div>

              <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 w-full'>
                {moodItems.map((mood, idx) => (
                  <motion.button
                    key={mood.query}
                    type='button'
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(idx * 0.03, 0.3), ease: 'easeOut' }}
                    onClick={() => handleGenreClick(mood.query)}
                    className={cn(
                      'group relative h-20 rounded-xl overflow-hidden cursor-pointer',
                      'flex items-center justify-between p-3.5 text-left bg-card/40 hover:bg-card/70 transition-all backdrop-blur-sm'
                    )}
                    data-smooth-interaction="true"
                  >
                    <div
                      className={cn(
                        'absolute w-1 m-1.75 h-[calc(100%-14px)] rounded-full blur-sm top-0 left-0 transition-all group-hover:w-2',
                        mood.accent || 'bg-primary'
                      )}
                    />
                    <div
                      className={cn(
                        'absolute inset-0 bg-linear-to-r opacity-20 group-hover:opacity-40 transition-opacity',
                        mood.color || 'from-primary/20 to-transparent'
                      )}
                    />

                    <div className='relative z-10 pl-2.5 flex flex-col gap-0.5 min-w-0 flex-1'>
                      <span className='font-semibold text-sm text-default-foreground/60 truncate group-hover:text-default-foreground transition-colors'>
                        {mood.title}
                      </span>
                      <span className='text-[10px] text-muted-foreground/60 font-mono truncate'>
                        {mood.query}
                      </span>
                    </div>

                    <span className='text-xl ml-2 shrink-0 group-hover:scale-110 transition-transform grayscale opacity-30'>
                      {mood.emoji || '🎵'}
                    </span>
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        ) : !loading &&
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
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
              className='w-full max-w-lg mx-auto my-8 p-8 flex flex-col items-center text-center gap-5'
            >
              <div className='relative flex flex-col items-center gap-2'>
                <motion.div
                  animate={{ y: [0, -6, 0], rotate: [0, 3, -3, 0] }}
                  transition={{ repeat: Infinity, duration: 3.5, ease: 'easeInOut' }}
                  className='size-16 flex items-center justify-center'
                >
                  <FlyingSaucerIcon weight='fill' size={36} className='text-muted-foreground' />
                </motion.div>
                <span className='text-xs font-mono text-muted-foreground'>
                  {String(searchObj.notfound_mascot_tag || 'Transmission Lost (º﹃º)')}
                </span>
              </div>

              <div className='flex flex-col gap-1.5'>
                <h2 className='text-lg md:text-xl font-bold tracking-tight text-foreground break-all'>
                  {notFoundTitle}
                </h2>
                <p className='text-xs md:text-sm text-muted-foreground max-w-md'>
                  {String(searchObj.notfound_subtitle || 'Alien radar detected zero audio signals. Try another keyword or browse moods below.')}
                </p>
              </div>

              <div className='flex flex-wrap items-center justify-center gap-2.5 mt-1'>
                <Button
                  onClick={handleClearSearch}
                  variant='default'
                  size='lg'
                  className='rounded-full px-4 gap-2 font-medium cursor-pointer shadow-sm'
                >
                  <ArrowClockwiseIcon size={16} weight='bold' />
                  <span>{String(searchObj.clear_search || 'Reset Search')}</span>
                </Button>

                <Button
                  onClick={() => handleGenreClick('Top Hits')}
                  variant='outline'
                  size='lg'
                  className='rounded-full px-4 gap-2 font-medium cursor-pointer'
                >
                  <SparkleIcon size={14} weight='fill' />
                  <span>{String(searchObj.try_popular || 'Explore Popular')}</span>
                </Button>
              </div>
            </motion.div>
          )
        )}
      </div>
    </div>
  );
}

export default Page;
