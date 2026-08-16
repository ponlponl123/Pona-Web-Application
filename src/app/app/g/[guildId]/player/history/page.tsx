'use client';

import React, { useState, useEffect, useCallback, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { getCookie } from 'cookies-next';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from 'react-smooth-input';
import {
  MagnifyingGlassIcon,
  FlameIcon,
  ClockIcon,
  MicrophoneStageIcon,
  CaretRightIcon,
  CaretLeftIcon,
} from '@phosphor-icons/react/dist/ssr';

import Track from '@/components/music/searchResult/track';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useDiscordGuildInfo } from '@/contexts/discordGuildInfo';
import { useAppStore } from '@/store/coreStore';
import { ArtistBasic, VideoDetailed } from '@/types/youtube/ytmusic-api';
import fetchHistory, {
  fetchHistoryStats,
  History,
  HistoryStats,
  Pagination,
} from '@/lib/server-side-api/internal/history';
import { MusicIcon } from '@animateicons/react/lucide';
import { AnimateIcon } from '@/components/animate-ui/icons/icon';
import { Search } from '@/components/animate-ui/icons/search';
import { cn } from '@/lib/utils';

function cleanArtistName(name?: string): string {
  if (!name) return 'Unknown Artist';
  return name.replace(/\s*-\s*Topic$/i, '').trim();
}

function Page() {
  const [historyList, setHistoryList] = useState<History[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [stats, setStats] = useState<HistoryStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [statsLoading, setStatsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [, startTransition] = useTransition();

  const language = useAppStore((state) => state.language);
  const { guild } = useDiscordGuildInfo();
  const router = useRouter();

  useEffect(() => {
    const loadStats = async () => {
      const accessTokenType = String(getCookie('LOGIN_TYPE_'));
      const accessToken = String(getCookie('LOGIN_'));
      if (!accessTokenType || !accessToken) {
        setStatsLoading(false);
        return;
      }
      const res = await fetchHistoryStats(accessTokenType, accessToken);
      if (res && res.stats) {
        setStats({
          ...res.stats,
          topArtist: cleanArtistName(res.stats.topArtist),
        });
      }
      setStatsLoading(false);
    };

    loadStats();
  }, []);

  const loadHistoryData = useCallback(async (page: number, query: string) => {
    setLoading(true);
    const accessTokenType = String(getCookie('LOGIN_TYPE_'));
    const accessToken = String(getCookie('LOGIN_'));
    if (!accessTokenType || !accessToken) {
      setLoading(false);
      return;
    }
    const res = await fetchHistory(accessTokenType, accessToken, page, 15, query);
    if (res && typeof res === 'object' && 'tracks' in res) {
      setHistoryList(res.tracks || []);
      if (res.pagination) {
        setPagination(res.pagination);
      }
    } else {
      setHistoryList([]);
      setPagination(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      startTransition(() => {
        setCurrentPage(1);
        loadHistoryData(1, searchQuery);
      });
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, loadHistoryData]);

  const handlePageChange = (newPage: number) => {
    if (!pagination || newPage < 1 || newPage > pagination.totalPages) return;
    setCurrentPage(newPage);
    loadHistoryData(newPage, searchQuery);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const formattedDuration = useCallback((ms: number) => {
    const totalMinutes = Math.floor(ms / 60000);
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  }, []);

  return (
    <div className='w-full max-w-6xl mx-auto mt-10 md:mt-16 px-4 md:px-6 flex flex-col gap-8 pb-[16vh] antialiased text-foreground'>

      <div className='flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border/40 pb-6'>
        <motion.div
          initial={{ opacity: 0, filter: 'blur(2px)' }}
          animate={{ opacity: 1, filter: 'blur(0px)' }}
          transition={{ duration: 0.44, delay: 0, ease: 'easeOut' }}
          className='flex items-center gap-3'
        >
          <MusicIcon size={32} duration={1} />
          <h1 className='text-3xl md:text-4xl font-semibold tracking-tight text-foreground'>
            {language.data.app.guilds.player.history.title}
          </h1>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, filter: 'blur(2px)' }}
          animate={{ opacity: 1, filter: 'blur(0px)' }}
          transition={{ duration: 0.44, delay: 0.08, ease: 'easeOut' }}
          className='w-full md:max-w-xs'
        >
          <AnimateIcon className='w-full' animateOnHover>
            <Input
              name="search-history"
              type="text"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
              startContent={<Search className="mr-1 size-4" />}
              placeholder={language.data.app.guilds.player.search.search_box}
              fontStyle={{
                fontFamily:
                  "var(--font-ponlponl123-article), var(--font-sn-sanafon-maru-j30), sans-serif",
                fontWeight: "bold",
                fontSize: "14px",
                letterSpacing: "1px",
              }}
              value={searchQuery}
              maxLength={512}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
              className={cn("pona-music-searchbox backdrop-blur-xl rounded-xl w-full")}
            />
          </AnimateIcon>
        </motion.div>
      </div>

      <div className='grid grid-cols-1 sm:grid-cols-3 border border-border/40 divide-y sm:divide-y-0 sm:divide-x divide-border/40 rounded-xl bg-background/40 backdrop-blur-sm overflow-hidden'>
        <motion.div
          initial={{ opacity: 0, filter: 'blur(2px)' }}
          animate={{ opacity: 1, filter: 'blur(0px)' }}
          transition={{ duration: 0.44, delay: 0.16, ease: 'easeOut' }}
          className='p-5 flex flex-col justify-between gap-3'
        >
          <div className='flex items-center justify-between text-muted-foreground'>
            <span className='text-lg uppercase tracking-wider'>
              {language.data.app.guilds.player.history.stats?.total_listened || 'Total Listened'}
            </span>
            <FlameIcon size={18} />
          </div>
          {statsLoading ? (
            <Skeleton className='h-8 w-24 rounded bg-muted/40' />
          ) : (
            <div className='flex items-baseline gap-1.5'>
              <span className='text-lg md:text-3xl font-semibold tracking-tight'>
                {stats?.totalTracks || 0}
              </span>
              <span className='text-sm text-muted-foreground'>
                {language.data.app.guilds.player.history.stats?.tracks_unit || 'tracks'}
              </span>
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, filter: 'blur(2px)' }}
          animate={{ opacity: 1, filter: 'blur(0px)' }}
          transition={{ duration: 0.44, delay: 0.24, ease: 'easeOut' }}
          className='p-5 flex flex-col justify-between gap-3'
        >
          <div className='flex items-center justify-between text-muted-foreground'>
            <span className='text-lg uppercase tracking-wider'>
              {language.data.app.guilds.player.history.stats?.listen_time || 'Listen Time'}
            </span>
            <ClockIcon size={18} />
          </div>
          {statsLoading ? (
            <Skeleton className='h-8 w-24 rounded bg-muted/40' />
          ) : (
            <div className='flex items-baseline gap-1.5'>
              <span className='text-lg md:text-3xl font-semibold tracking-tight'>
                {formattedDuration(stats?.totalDurationMs || 0)}
              </span>
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, filter: 'blur(2px)' }}
          animate={{ opacity: 1, filter: 'blur(0px)' }}
          transition={{ duration: 0.44, delay: 0.32, ease: 'easeOut' }}
          className='p-5 flex flex-col justify-between gap-3'
        >
          <div className='flex items-center justify-between text-muted-foreground'>
            <span className='text-lg uppercase tracking-wider'>
              {language.data.app.guilds.player.history.stats?.top_artist_7d || 'Top Artist (7D)'}
            </span>
            <MicrophoneStageIcon size={18} />
          </div>
          {statsLoading ? (
            <Skeleton className='h-8 w-32 rounded bg-muted/40' />
          ) : (
            <div className='flex items-baseline gap-1.5 overflow-hidden'>
              <span className='text-lg md:text-3xl font-medium tracking-tight truncate'>
                {stats?.topArtist || '-'}
              </span>
            </div>
          )}
        </motion.div>
      </div>

      <div id='pona-search-result' className='w-full flex flex-col gap-4'>
        {loading ? (
          <div className='flex flex-col border border-border/40 divide-y divide-border/40 rounded-xl overflow-hidden'>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className='p-3 flex items-center gap-4 bg-background/20'>
                <Skeleton className='size-10 rounded-md bg-muted/40' />
                <div className='flex flex-col gap-1.5 flex-1'>
                  <Skeleton className='h-3.5 w-1/3 rounded bg-muted/40' />
                  <Skeleton className='h-3 w-1/4 rounded bg-muted/40' />
                </div>
                <Skeleton className='h-3 w-12 rounded bg-muted/40' />
              </div>
            ))}
          </div>
        ) : historyList.length > 0 ? (
          <div className='flex flex-col gap-3'>
            <AnimatePresence mode='popLayout'>
              {historyList.map((result, idx) => {
                const cleanedArtist = cleanArtistName(
                  result.track.artist?.[0]?.name || result.track.author || 'Artist'
                );

                const videoData: VideoDetailed = {
                  artists: [
                    {
                      id: result.track.artist?.[0]?.id || null,
                      name: cleanedArtist,
                    },
                  ] as ArtistBasic[],
                  thumbnails: [
                    {
                      url: result.track.thumbnail || result.track.artworkUrl || '',
                      height: 64,
                      width: 64,
                    },
                  ],
                  videoId: result.track.identifier || '',
                  title: result.track.title || '',
                  view: '0',
                  videoType: 'MUSIC_VIDEO_TYPE_ATV',
                  category: 'Videos',
                  resultType: 'video',
                  duration: result.track.duration ? `${Math.floor(result.track.duration / 1000)}s` : '',
                  duration_seconds: result.track.duration ? result.track.duration / 1000 : 0,
                  year: null,
                  isExplicit: false,
                };

                const delay = 0.40 + idx * 0.08;

                return (
                  <motion.div
                    key={result.id || result.uniqueid || idx}
                    initial={{ opacity: 0, filter: 'blur(2px)' }}
                    animate={{ opacity: 1, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, filter: 'blur(2px)' }}
                    transition={{
                      duration: 0.44,
                      delay,
                      ease: 'easeOut',
                    }}
                  >
                    <Track result={videoData} classNames={{
                      image: "scale-125"
                    }} />
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {pagination && pagination.totalPages > 1 && (
              <div className='flex items-center justify-between border-t border-border/40 pt-4 mt-2'>
                <motion.span
                  initial={{ opacity: 0, filter: 'blur(2px)' }}
                  animate={{ opacity: 1, filter: 'blur(0px)' }}
                  transition={{
                    duration: 0.44,
                    delay: 0.40 + historyList.length * 0.08 + 0.08,
                    ease: 'easeOut',
                  }}
                  className='text-sm tracking-wider text-muted-foreground'
                >
                  {(language.data.app.guilds.player.history.pagination?.tracks_summary || '[page] / [totalPages] ([total] tracks)')
                    .replace('[page]', String(pagination.page))
                    .replace('[totalPages]', String(pagination.totalPages))
                    .replace('[total]', String(pagination.total))}
                </motion.span>
                <div className='flex items-center gap-1.5'>
                  <motion.div
                    initial={{ opacity: 0, filter: 'blur(2px)' }}
                    animate={{ opacity: 1, filter: 'blur(0px)' }}
                    transition={{
                      duration: 0.44,
                      delay: 0.40 + historyList.length * 0.08 + 0.16,
                      ease: 'easeOut',
                    }}
                  >
                    <Button
                      variant='ghost'
                      size='sm'
                      className='h-8 text-xs rounded-lg gap-1'
                      disabled={currentPage <= 1}
                      data-smooth-interaction="true"
                      onClick={() => handlePageChange(currentPage - 1)}
                    >
                      <CaretLeftIcon size={14} />
                      {language.data.app.guilds.player.history.pagination?.prev || 'Prev'}
                    </Button>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, filter: 'blur(2px)' }}
                    animate={{ opacity: 1, filter: 'blur(0px)' }}
                    transition={{
                      duration: 0.44,
                      delay: 0.40 + historyList.length * 0.08 + 0.24,
                      ease: 'easeOut',
                    }}
                  >
                    <Button
                      variant='ghost'
                      size='sm'
                      className='h-8 text-xs rounded-lg gap-1'
                      disabled={currentPage >= pagination.totalPages}
                      data-smooth-interaction="true"
                      onClick={() => handlePageChange(currentPage + 1)}
                    >
                      {language.data.app.guilds.player.history.pagination?.next || 'Next'}
                      <CaretRightIcon size={14} />
                    </Button>
                  </motion.div>
                </div>
              </div>
            )}
          </div>
        ) : searchQuery ? (
          <motion.div
            initial={{ opacity: 0, filter: 'blur(2px)' }}
            animate={{ opacity: 1, filter: 'blur(0px)' }}
            transition={{ duration: 0.25, delay: 0.25, ease: 'easeOut' }}
            className='w-full py-16 flex flex-col items-center justify-center gap-3 border border-border/40 rounded-xl bg-muted/10 text-center px-4'
          >
            <MagnifyingGlassIcon size={28} className='text-muted-foreground' />
            <h2 className='text-base font-semibold'>
              {language.data.app.guilds.player.history.no_results?.title || 'No matching tracks found'}
            </h2>
            <p className='text-xs text-muted-foreground max-w-sm'>
              {(language.data.app.guilds.player.history.no_results?.description || 'No results found for "[query]".')
                .replace('[query]', searchQuery)}
            </p>
            <Button
              variant='outline'
              size='sm'
              className='rounded-md border-border/60 text-xs mt-1'
              data-smooth-interaction="true"
              onClick={() => setSearchQuery('')}
            >
              {language.data.app.guilds.player.history.no_results?.clear_search || 'Clear Search'}
            </Button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, filter: 'blur(2px)' }}
            animate={{ opacity: 1, filter: 'blur(0px)' }}
            transition={{ duration: 0.25, delay: 0.25, ease: 'easeOut' }}
            className='w-full py-16 flex flex-col items-center justify-center gap-3 border border-border/40 rounded-xl bg-muted/10 text-center px-4'
          >
            <MicrophoneStageIcon size={32} className='text-muted-foreground' />
            <h2 className='text-xl font-semibold'>
              {language.data.app.guilds.player.home.no_history.title}
            </h2>
            <p className='text-xs text-muted-foreground max-w-sm'>
              {language.data.app.guilds.player.home.no_history.description}
            </p>
            <Button
              variant='outline'
              size='sm'
              className='rounded-md border-border/60 text-xs mt-2'
              data-smooth-interaction="true"
              onClick={() => {
                if (guild?.id) router.push(`/app/g/${guild.id}/player/search`);
              }}
            >
              <MagnifyingGlassIcon size={14} className='mr-1.5' />
              {language.data.app.guilds.player.home.no_history.get_started}
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default Page;
