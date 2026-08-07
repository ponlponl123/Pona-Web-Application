'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { getCookie } from 'cookies-next';
import { motion } from 'framer-motion';
import {
  CaretRight,
  Cloud,
  FlyingSaucer,
  Heart,
  MagnifyingGlass,
  ShareFat,
} from '@phosphor-icons/react/dist/ssr';

import PlayButton from '@/components/music/button/play';
import Track, { combineArtistName } from '@/components/music/searchResult/track';
import SubscribeButton from '@/components/music/subscribe';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { useDiscordGuildInfo } from '@/contexts/discordGuildInfo';
import { useAppStore } from '@/store/coreStore';
import { SearchResult as HTTP_SearchResult, TopResults, TrackResultItem } from '@/types/youtube/ytmusic-api';
import fetchSearchResult from '@/lib/server-side-api/internal/search';

export function Page() {
  const router = useRouter();
  const { guild } = useDiscordGuildInfo();
  const language = useAppStore((state) => state.language);
  const searchParams = useSearchParams();
  const search = searchParams ? searchParams.get('q') : '';

  const [searchResult, setSearchResult] = useState<{
    [key: string]: HTTP_SearchResult[];
  } | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [filter, setFilter] = useState<string>('all');

  const filterNormallize =
    filter === 'playlists'
      ? 'Community playlists'
      : filter !== 'all'
      ? filter[0].toUpperCase() + filter.slice(1)
      : filter;

  useEffect(() => {
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
      )
        return setLoading(false);

      setLoading(true);
      const res = await fetchSearchResult(
        accessTokenType,
        accessToken,
        search,
        filter === 'all' ? undefined : filter
      );

      if (!res || !res.result) {
        setSearchResult(null);
        setLoading(false);
        return;
      }

      const sortedResult = res.result.reduce(
        (acc: { [key: string]: HTTP_SearchResult[] }, item: HTTP_SearchResult) => {
          const type = item.category || 'OTHER';
          if (!acc[type]) acc[type] = [];
          acc[type].push(item);
          return acc;
        },
        {}
      );

      const orderedKeys = [
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

      const orderedResult = orderedKeys.reduce(
        (
          acc: { [key: string]: HTTP_SearchResult[] },
          key
        ) => {
          if (sortedResult[key]) {
            acc[key] = sortedResult[key];
          }
          return acc;
        },
        {}
      );

      setSearchResult(orderedResult);
      setLoading(false);
    };

    letSearch();
  }, [filter, search]);

  const categories = [
    { key: 'all', label: language.data.app.guilds.player.search.category.All },
    { key: 'songs', label: language.data.app.guilds.player.search.category.Songs },
    { key: 'videos', label: language.data.app.guilds.player.search.category.Videos },
    { key: 'albums', label: language.data.app.guilds.player.search.category.Albums },
    { key: 'playlists', label: language.data.app.guilds.player.search.category['Community playlists'] },
    { key: 'artists', label: language.data.app.guilds.player.search.category.Artists },
    { key: 'profiles', label: language.data.app.guilds.player.search.category.Profiles },
  ];

  return (
    <div className='w-full max-w-screen-md mx-auto mt-24 gap-4 flex flex-col items-center justify-center text-center pb-[16vh]'>
      <div className='w-full flex gap-5'>
        <div className='flex flex-col items-start justify-center w-full'>
          <h1 className='text-5xl flex gap-4 items-center font-bold'>
            <MagnifyingGlass size={32} weight='bold' />{' '}
            {language.data.app.guilds.player.search.result}
          </h1>
          <h3 className='text-2xl text-start mt-1 text-muted-foreground'>{search}</h3>

          <div className='w-full flex gap-2 my-4 overflow-x-auto pb-2 no-scrollbar'>
            {categories.map((cat) => (
              <Button
                key={cat.key}
                disabled={loading}
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
            <div className='w-full py-12 flex justify-center items-center'>
              <Spinner className='size-8' />
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
                  <h1 className='text-xl text-start font-bold'>
                    {language.data.app.guilds.player.search.category[
                      category as keyof typeof language.data.app.guilds.player.search.category
                    ] || category}
                  </h1>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className='w-full flex flex-col gap-2 items-center justify-start'
                  >
                    {category === 'Top result'
                      ? (() => {
                          const track = searchResult[category][0] as TrackResultItem;
                          const trackTitle = track.title || track.name || '';
                          const isArtist = track.resultType === 'artist';

                          return (
                            <div className='relative w-full rounded-3xl p-6 bg-card border border-border shadow-md overflow-hidden text-card-foreground flex flex-col gap-4 items-start'>
                              <div className='flex gap-4 items-center w-full'>
                                {track.thumbnails?.[0]?.url && (
                                  <img
                                    src={`/api/proxy/image?r=${encodeURIComponent(track.thumbnails[0].url)}`}
                                    alt={trackTitle}
                                    className={isArtist ? 'w-24 h-24 rounded-full object-cover' : 'w-24 h-24 rounded-2xl object-cover'}
                                  />
                                )}
                                <div className='flex flex-col items-start flex-1 min-w-0'>
                                  <h1 className='text-2xl font-bold truncate w-full text-start'>
                                    {trackTitle}
                                  </h1>
                                  <p className='text-sm text-muted-foreground capitalize'>
                                    {track.resultType || 'Result'}
                                  </p>
                                </div>
                              </div>
                              <div className='flex gap-3 items-center justify-end w-full mt-2'>
                                {!isArtist && track.videoId && (
                                  <PlayButton
                                    detail={{
                                      author: combineArtistName(track.artists || []),
                                      identifier: track.videoId,
                                      sourceName: 'youtube music',
                                      resultType: track.resultType || 'song',
                                      title: trackTitle,
                                      uri: `https://music.youtube.com/watch?v=${track.videoId}`,
                                    }}
                                  />
                                )}
                                {isArtist && track.artists?.[0]?.id && (
                                  <SubscribeButton
                                    channelId={track.artists[0].id}
                                    artistName={track.artists[0].name}
                                    preset='minimal'
                                  />
                                )}
                              </div>
                            </div>
                          );
                        })()
                      : searchResult[category].map((result, idx) => (
                          <Track key={idx} result={result} />
                        ))}
                  </motion.div>
                </div>
              )
          )
        ) : !loading &&
          filter !== 'all' &&
          searchResult &&
          searchResult[filterNormallize] &&
          searchResult[filterNormallize].length > 0 ? (
          <div className='w-full flex flex-col gap-2 items-center justify-start'>
            {searchResult[filterNormallize].map((result, idx) => (
              <Track key={idx} result={result} />
            ))}
          </div>
        ) : (
          !loading && (
            <div className='w-full min-h-[36vh] flex flex-col gap-4 items-center justify-center'>
              <FlyingSaucer weight='fill' size={74} />
              <h1 className='text-lg tracking-wider font-semibold'>
                {language.data.app.guilds.player.search.notfound}
              </h1>
              <h4 className='text-sm tracking-wider text-muted-foreground'>＼（〇_〇）／</h4>
            </div>
          )
        )}
      </div>
    </div>
  );
}

export default Page;
