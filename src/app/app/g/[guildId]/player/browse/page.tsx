'use client';

import { useCallback, useEffect, useState } from 'react';
import { getCookie } from 'cookies-next';
import { motion } from 'framer-motion';

import { AlbumCard, PlaylistCard } from '@/components/music/card';
import { HomeFeedSection } from '@/components/music/section';
import { TrackStripCard } from '@/components/music/strip-card';
import {
  AlbumCardSkeleton,
  MoodTileSkeleton,
} from '@/components/music/skeleton';
import { Spinner } from '@/components/ui/spinner';
import { useDiscordGuildInfo } from '@/contexts/discordGuildInfo';
import { useAppStore } from '@/store/coreStore';
import { useMusicCacheStore } from '@/store/musicCacheStore';
import {
  fetchCharts,
  fetchExplore,
  type ChartsEntry,
  type MoodCategory,
} from '@/lib/server-side-api/internal/browse';
import { cn } from '@/lib/utils';
import { AutoHeight } from '@/components/animate-ui/primitives/effects/auto-height';
import { AnimateIcon } from '@/components/animate-ui/icons/icon';
import { BotMessageSquareIcon } from '@/components/animate-ui/icons/bot-message-square';

function stringToHsl(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
    hash |= 0;
  }
  const h = Math.abs(hash) % 360;
  return `hsl(${h}, 60%, 30%)`;
}

function stringToHslLight(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
    hash |= 0;
  }
  const h = Math.abs(hash) % 360;
  return `hsl(${h}, 60%, 55%)`;
}

interface MoodTileProps {
  mood: MoodCategory;
  index: number;
}

function MoodTile({ mood, index }: MoodTileProps) {
  const bgDark = stringToHsl(mood.title);
  const bgLight = stringToHslLight(mood.title);

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: Math.min(0.03 * index, 0.5), ease: 'easeOut' }}
      className='w-full'
    >
      <div
        data-smooth-interaction="true"
        className={cn(
          'relative w-full h-12 rounded-lg overflow-hidden cursor-pointer',
          'flex items-end justify-start p-3 text-left bg-muted',
        )}
      >
        <div
          className='absolute w-1 h-full top-0 left-0'
          style={{ background: `linear-gradient(135deg, ${bgDark}, ${bgLight})` }} />
        <div
          className='absolute inset-0 opacity-40 pointer-events-none'
          style={{ background: `radial-gradient(circle at 70% 50%, ${bgLight} 0%, ${bgDark} 40%, transparent 75%)` }} />
        <div className='absolute inset-0 bg-black/10' />
        <div className='relative z-10 pl-3'>
          <span className='font-semibold text-base text-foreground drop-shadow-sm line-clamp-2'>
            {mood.title}
          </span>
        </div>
      </div>
    </motion.button>
  );
}

function extractMoods(result: unknown): MoodCategory[] {
  if (!result) return [];
  const list: MoodCategory[] = [];
  const seen = new Set<string>();

  const pushItem = (item: unknown) => {
    if (item && typeof item === 'object') {
      const obj = item as Record<string, unknown>;
      const title = typeof obj.title === 'string' ? obj.title : null;
      const params = (typeof obj.params === 'string' ? obj.params : typeof obj.browseId === 'string' ? obj.browseId : null);
      if (title && params) {
        const key = `${title}-${params}`;
        if (!seen.has(key)) {
          seen.add(key);
          list.push({ title, params });
        }
      }
    }
  };

  const processSec = (sec: unknown) => {
    if (!sec) return;
    if (Array.isArray(sec)) {
      sec.forEach((s) => processSec(s));
    } else if (typeof sec === 'object') {
      const obj = sec as Record<string, unknown>;
      if (Array.isArray(obj.moods)) obj.moods.forEach(pushItem);
      if (Array.isArray(obj.categories)) obj.categories.forEach(pushItem);
      if (Array.isArray(obj.items)) obj.items.forEach(pushItem);
      pushItem(sec);
    }
  };

  if (Array.isArray(result)) {
    result.forEach(processSec);
  } else if (typeof result === 'object' && result !== null) {
    const res = result as Record<string, unknown>;
    if (res.moods) processSec(res.moods);
    if (res.categories) processSec(res.categories);
    if (res.moods_and_genres) processSec(res.moods_and_genres);
    if (res.for_you) processSec(res.for_you);
  }
  return list;
}

function extractChartsData(result: unknown): { songs: ChartsEntry[]; albums: ChartsEntry[] } {
  if (!result || typeof result !== 'object') return { songs: [], albums: [] };
  const res = result as Record<string, unknown>;
  const songsObj = res.songs as Record<string, unknown> | undefined;
  const videosObj = res.videos as Record<string, unknown> | undefined;
  const trendingObj = res.trending as Record<string, unknown> | undefined;
  const genresObj = res.genres as Record<string, unknown> | undefined;
  const artistsObj = res.artists as Record<string, unknown> | undefined;
  const albumsObj = res.albums as Record<string, unknown> | undefined;

  const songs = songsObj?.items || res.songs || videosObj?.items || trendingObj?.items || [];
  const albums = genresObj?.items || trendingObj?.items || artistsObj?.items || albumsObj?.items || [];

  return {
    songs: Array.isArray(songs) ? (songs as ChartsEntry[]) : [],
    albums: Array.isArray(albums) ? (albums as ChartsEntry[]) : [],
  };
}

export default function BrowsePage() {
  const { guild } = useDiscordGuildInfo();
  const language = useAppStore((state) => state.language);
  const langBrowse = language.data.app.guilds.player.browse;

  const exploreCache = useMusicCacheStore((state) => state.explore);
  const chartsCache = useMusicCacheStore((state) => state.charts);
  const setExplore = useMusicCacheStore((state) => state.setExplore);
  const setCharts = useMusicCacheStore((state) => state.setCharts);
  const isExploreStale = useMusicCacheStore((state) => state.isExploreStale);
  const isChartsStale = useMusicCacheStore((state) => state.isChartsStale);
  const hydrateFromSession = useMusicCacheStore((state) => state.hydrateFromSession);

  const [moods, setMoods] = useState<MoodCategory[]>([]);
  const [moodsLoading, setMoodsLoading] = useState(true);
  const [topSongs, setTopSongs] = useState<ChartsEntry[]>([]);
  const [newAlbums, setNewAlbums] = useState<ChartsEntry[]>([]);
  const [chartsLoading, setChartsLoading] = useState(true);

  useEffect(() => {
    hydrateFromSession();
  }, [hydrateFromSession]);

  const fetchData = useCallback(async () => {
    const accessTokenType = String(getCookie('LOGIN_TYPE_'));
    const accessToken = String(getCookie('LOGIN_'));
    if (
      !accessTokenType ||
      accessTokenType === 'undefined' ||
      !accessToken ||
      accessToken === 'undefined'
    ) {
      setMoodsLoading(false);
      setChartsLoading(false);
      return;
    }

    const cachedExplore = exploreCache;
    if (cachedExplore && !isExploreStale()) {
      setMoods(extractMoods(cachedExplore.data.result));
      setMoodsLoading(false);
    } else {
      const explore = await fetchExplore(accessTokenType, accessToken);
      if (explore && explore.result) {
        setExplore(explore);
        setMoods(extractMoods(explore.result));
      }
      setMoodsLoading(false);
    }

    const cachedCharts = chartsCache;
    if (cachedCharts && !isChartsStale()) {
      const { songs, albums } = extractChartsData(cachedCharts.data.result);
      setTopSongs(songs.slice(0, 20));
      setNewAlbums(albums.slice(0, 12));
      setChartsLoading(false);
    } else {
      const charts = await fetchCharts(accessTokenType, accessToken);
      if (charts && charts.result) {
        setCharts(charts);
        const { songs, albums } = extractChartsData(charts.result);
        setTopSongs(songs.slice(0, 20));
        setNewAlbums(albums.slice(0, 12));
      }
      setChartsLoading(false);
    }
  }, [
    exploreCache, chartsCache,
    isExploreStale, isChartsStale,
    setExplore, setCharts,
  ]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchData();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchData]);

  if (!guild) {
    return (
      <div className='w-full h-96 flex items-center justify-center'>
        <Spinner className='size-8' />
      </div>
    );
  }

  return (
    <>
      <div className='w-full max-w-6xl mx-auto mt-24 flex flex-col gap-16 items-center justify-center'>
        <div className='gap-4 flex justify-center bg-default/30 backdrop-blur-xl rounded-2xl shadow-lg p-4'>
          <AnimateIcon animate loop loopDelay={1000}>
            <BotMessageSquareIcon className='size-10' />
          </AnimateIcon>
          <div className='flex flex-col gap-1.5'>
            <h1 className='text-xl font-bold'>
              {langBrowse.coming_soon || 'This feature is coming soon.'}
            </h1>
            <p className='text-sm text-muted-foreground'>
              {langBrowse.coming_soon_desc || 'We are working hard to bring it to you as soon as possible.'}
            </p>
          </div>
        </div>
      </div>
      <div className='w-full max-w-6xl mx-auto mt-16 flex flex-col gap-16 pb-48 opacity-30 pointer-events-none'>
        <section className='z-10'>
          <h2 className='text-3xl font-bold tracking-tight mb-6 text-left'>{langBrowse.mood_genre}</h2>
          <AutoHeight>
            {moodsLoading ? (
              <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3'>
                {Array.from({ length: 15 }).map((_, i) => (
                  <MoodTileSkeleton key={i} />
                ))}
              </div>
            ) : moods.length > 0 ? (
              <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 hover:*:opacity-60'>
                {moods.map((mood, i) => (
                  <div className='hover:opacity-100!' key={i}><MoodTile mood={mood} index={i} /></div>
                ))}
              </div>
            ) : null}
          </AutoHeight>
        </section>

        {topSongs.length > 0 && (
          <HomeFeedSection
            title={langBrowse.top_songs}
            isLoading={chartsLoading}
            items={topSongs}
            rows={3}
            skeletonCount={6}
            className='z-10'
            renderItem={(entry: ChartsEntry) => {
              const thumbnail = (entry.thumbnails || []).sort(
                (a, b) => (b.width || 0) - (a.width || 0)
              )[0]?.url;

              const mappedArtists = (entry.artists || []).map((a) => ({
                name: a.name || '',
                id: a.id || (a as { browseId?: string }).browseId || (a as { artistId?: string }).artistId || '',
              }));

              return (
                <TrackStripCard
                  track={{
                    title: entry.title || '',
                    author: mappedArtists.map((a) => a.name).join(', ') || '',
                    artist: mappedArtists,
                    identifier: entry.videoId || '',
                    uri: entry.videoId ? `https://youtu.be/${entry.videoId}` : '',
                    sourceName: 'youtube music',
                    artworkUrl: thumbnail || '',
                    proxyArtworkUrl: thumbnail ? `/api/proxy/image?r=${encodeURIComponent(thumbnail)}&s=256` : '',
                    proxyHighResArtworkUrl: thumbnail ? `/api/proxy/image?r=${encodeURIComponent(thumbnail)}&s=512` : '',
                  }}
                />
              );
            }}
          />
        )}

        {newAlbums.length > 0 && (
          <HomeFeedSection
            title={langBrowse.new_releases}
            isLoading={false}
            items={newAlbums}
            rows={1}
            skeletonCount={6}
            SkeletonComponent={AlbumCardSkeleton}
            className='z-10'
            renderItem={(item: ChartsEntry) => {
              const mappedArtists = (item.artists || []).map((a) => ({
                name: a.name || '',
                id: a.id || (a as { browseId?: string }).browseId || (a as { artistId?: string }).artistId || '',
              }));

              if (item.browseId?.startsWith('OLAK') || item.browseId?.startsWith('MPREb')) {
                return (
                  <AlbumCard
                    album={{
                      category: 'Albums',
                      resultType: 'album',
                      browseId: item.browseId,
                      playlistId: item.playlistId ? String(item.playlistId) : '',
                      title: item.title || '',
                      type: (item.type as string) || 'Album',
                      artists: mappedArtists,
                      year: item.year ? Number(item.year) : null,
                      isExplicit: Boolean(item.isExplicit),
                      duration: null,
                      thumbnails: (item.thumbnails || []).map((t) => ({ url: t.url || '', width: t.width ?? 0, height: t.height ?? 0 })),
                    }}
                  />
                );
              }
              return (
                <PlaylistCard
                  playlist={{
                    type: 'PLAYLIST',
                    playlistId: item.playlistId ? String(item.playlistId) : item.browseId?.replace(/^VL/, '') || '',
                    name: item.title || item.name || '',
                    artist: {
                      artistId: mappedArtists[0]?.id || '',
                      name: mappedArtists[0]?.name || '',
                    },
                    thumbnails: (item.thumbnails || []).map((t) => ({ url: t.url || '', width: t.width ?? 0, height: t.height ?? 0 })),
                  }}
                />
              );
            }}
          />
        )}
      </div>
    </>
  );
}
