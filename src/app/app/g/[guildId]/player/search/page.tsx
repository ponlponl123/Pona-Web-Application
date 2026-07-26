'use client';
import PlayButton from '@/components/music/button/play';
import Track, {
  combineArtistName,
} from '@/components/music/searchResult/track';
import { useDiscordGuildInfo } from '@/contexts/discordGuildInfo';
import fetchSearchResult from '@/lib/server-side-api/internal/search';
import { getAccentHEXColorFromUrl } from '@/lib/colorUtils';
import {
  CaretRight,
  Cloud,
  FlyingSaucer,
  Heart,
  MagnifyingGlass,
  ShareFat,
} from '@phosphor-icons/react/dist/ssr';
import { getCookie } from 'cookies-next';
import { motion } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { Key } from 'react';
import { useAppStore } from '@/store/coreStore';
import { useAtomValue } from 'jotai';
import { ponaCommonStateAtom } from '@/store/musicAtoms';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';

interface SearchResultSortable {
  Category: string;
  Result: any[];
}

function SearchPage() {
  const router = useRouter();
  const { guild } = useDiscordGuildInfo();
  const language = useAppStore((state) => state.language);
  const ponaCommonState = useAtomValue(ponaCommonStateAtom);
  const searchParams = useSearchParams();
  const search = searchParams ? searchParams.get('q') : '';

  const [loading, setLoading] = React.useState<boolean>(true);
  const [filter, setFilter] = React.useState<Key>('all');
  const [searchResult, setSearchResult] = React.useState<{
    topResult: any;
    categorizedResult: SearchResultSortable[];
  } | null>(null);

  React.useEffect(() => {
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
      try {
        const resultData: any = await fetchSearchResult(
          accessTokenType,
          accessToken,
          search,
          filter === 'all' || !filter ? undefined : filter.toString()
        );
        if (!resultData) {
          setSearchResult(null);
          setLoading(false);
          return;
        }
        const sortedResult = (resultData.result || []).reduce(
          (acc: SearchResultSortable[], item: any) => {
            const categoryName = item.category || 'Other';
            let category = acc.find((c: SearchResultSortable) => c.Category === categoryName);
            if (!category) {
              category = { Category: categoryName, Result: [] };
              acc.push(category);
            }
            category.Result.push(item);
            return acc;
          },
          []
        );

        setSearchResult({
          topResult: resultData.topResults ? resultData.topResults[0] : null,
          categorizedResult: sortedResult,
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    letSearch();
  }, [search, filter]);

  const categoriesList = [
    { key: 'all', label: language.data.app.guilds.player.search.category.All },
    { key: 'songs', label: language.data.app.guilds.player.search.category.Songs },
    { key: 'videos', label: language.data.app.guilds.player.search.category.Videos },
    { key: 'albums', label: language.data.app.guilds.player.search.category.Albums },
    { key: 'playlists', label: language.data.app.guilds.player.search.category['Community playlists'] },
    { key: 'artists', label: language.data.app.guilds.player.search.category.Artists },
    { key: 'profiles', label: language.data.app.guilds.player.search.category.Profiles },
  ];

  const top = searchResult?.topResult;
  const topTitle = top ? (top.title || top.name || '') : '';
  const topAuthor = top ? (top.artist || top.author || (top.artists ? combineArtistName(top.artists) : '')) : '';
  const topThumbnail = top?.thumbnails?.[0]?.url || '/static/backdrop.png';

  return (
    <div className='flex flex-col gap-6 py-6 px-4 max-w-7xl mx-auto w-full'>
      {/* Category Filter Buttons */}
      <div className='flex flex-wrap gap-2 items-center'>
        {categoriesList.map((cat) => (
          <Button
            key={cat.key}
            variant={filter === cat.key ? 'default' : 'secondary'}
            size='sm'
            disabled={loading}
            className='rounded-full'
            onClick={() => setFilter(cat.key)}
          >
            {cat.label}
          </Button>
        ))}
      </div>

      {loading && (
        <div className='flex justify-center py-4'>
          <Spinner size='md' />
        </div>
      )}

      {/* Top Results */}
      {top && (
        <div className='flex flex-col gap-4'>
          <h2 className='text-2xl font-bold'>
            {language.data.app.guilds.player.search.category['Top result']}
          </h2>
          <div className='p-6 rounded-2xl bg-card border flex items-center justify-between gap-6 shadow-md'>
            <div className='flex items-center gap-4 min-w-0'>
              <img
                src={topThumbnail}
                alt={topTitle}
                className='w-24 h-24 rounded-xl object-cover'
              />
              <div className='flex flex-col min-w-0'>
                <h3 className='text-xl font-bold truncate'>{topTitle}</h3>
                <p className='text-sm text-muted-foreground truncate'>{topAuthor}</p>
              </div>
            </div>

            {top.videoId && (
              <PlayButton
                data={{
                  videoId: top.videoId,
                  title: topTitle,
                  artist: topAuthor,
                  thumbnails: top.thumbnails || [],
                }}
              />
            )}
          </div>
        </div>
      )}

      {/* Categorized Results */}
      {searchResult?.categorizedResult.map((catGroup) => (
        <div key={catGroup.Category} className='flex flex-col gap-4'>
          <h3 className='text-xl font-semibold border-b pb-2'>{catGroup.Category}</h3>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
            {catGroup.Result.map((track: any, idx: number) => (
              <Track
                key={track.videoId || track.title || idx}
                data={{
                  album: track.album || null,
                  artists: track.artists,
                  category: catGroup.Category,
                  duration: track.duration || '',
                  duration_seconds: track.duration_seconds || null,
                  isExplicit: track.isExplicit || false,
                  resultType: track.resultType || 'song',
                  thumbnails: track.thumbnails,
                  title: track.title || track.name,
                  videoId: track.videoId,
                  videoType: track.videoType || '',
                }}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default SearchPage;
