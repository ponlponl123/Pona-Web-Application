'use client';

import { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { getCookie } from 'cookies-next';
import {
  MagnifyingGlassIcon,
  MicrophoneStageIcon,
} from '@phosphor-icons/react/dist/ssr';

import MusicCard, { ArtistCard, AlbumCard, PlaylistCard } from '@/components/music/card';
import { HomeFeedSection } from '@/components/music/section';
import { TrackStripCard, VideoStripCard } from '@/components/music/strip-card';
import {
  MusicCardSkeleton,
  AlbumCardSkeleton,
  VideoCardSkeleton,
} from '@/components/music/skeleton';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { useDiscordGuildInfo } from '@/contexts/discordGuildInfo';
import { useDiscordUserInfo } from '@/contexts/discordUserInfo';
import { useAppStore } from '@/store/coreStore';
import { useMusicCacheStore } from '@/store/musicCacheStore';
import { fetchSubscribedChannels } from '@/lib/server-side-api/internal/channel';
import fetchHistory, { History } from '@/lib/server-side-api/internal/history';
import { fetchHomeFeed, type HomeFeedSection as HomeFeedSectionData, type HomeFeedItem } from '@/lib/server-side-api/internal/browse';
import { extractArtistInfo } from '@/lib/artist';

const SECTION_KEY_MAP: { pattern: RegExp; key: string }[] = [
  { pattern: /mix/i, key: 'mixes_for_you' },
  { pattern: /curated|recommended|picks for you|คัดสรร/i, key: 'curated_for_you' },
  { pattern: /daily track|แทร็กใหม่|today.s track/i, key: 'new_daily_track' },
  { pattern: /music video|มิวสิกวิดีโอ/i, key: 'mv_for_you' },
  { pattern: /album.*you|อัลบั้ม/i, key: 'albums_for_you' },
  { pattern: /forgotten|ลืม/i, key: 'forgotten_favorites' },
  { pattern: /trending.*you|มาแรง.*คุณ/i, key: 'trending_for_you' },
  { pattern: /shorts/i, key: 'heard_in_shorts' },
  { pattern: /new release|fresh|มาใหม่|ใหม่/i, key: 'new_releases' },
  { pattern: /top song|เพลงยอดนิยม|popular/i, key: 'top_songs' },
  { pattern: /trending|มาแรง/i, key: 'trending' },
  { pattern: /album.*single|new album|อัลบั้มและซิงเกิล/i, key: 'new_albums_singles' },
];

function getSectionLabel(
  rawTitle: string,
  langHome: Record<string, string>
): string {
  for (const { pattern, key } of SECTION_KEY_MAP) {
    if (pattern.test(rawTitle)) {
      const translated = langHome[key];
      if (translated) return translated;
    }
  }
  return rawTitle;
}

type CardType = 'song' | 'album' | 'playlist' | 'video' | 'unknown';

function guessCardType(item: HomeFeedItem): CardType {
  const bId = item.browseId || '';
  const pId = item.playlistId || '';
  const itemType = (item.type as string)?.toLowerCase() || '';

  if (
    Boolean(pId) ||
    bId.startsWith('VL') ||
    bId.startsWith('PL') ||
    bId.startsWith('RD') ||
    bId.startsWith('VLRD') ||
    item.resultType === 'playlist' ||
    itemType === 'playlist'
  ) {
    return 'playlist';
  }
  if (
    bId.startsWith('OLAK') ||
    bId.startsWith('MPREb') ||
    item.resultType === 'album' ||
    itemType === 'album'
  ) {
    return 'album';
  }
  if (item.videoId && !bId) return 'song';
  if (item.videoId) return 'video';
  return 'unknown';
}

export default function Page() {
  const router = useRouter();
  const { userInfo } = useDiscordUserInfo();
  const { guild } = useDiscordGuildInfo();
  const language = useAppStore((state) => state.language);
  const langHome = language.data.app.guilds.player.home as unknown as Record<string, string>;

  const subscribedChannels = useMusicCacheStore((state) => state.subscribedChannels);
  const setSubscribedChannels = useMusicCacheStore((state) => state.setSubscribedChannels);
  const homeFeedCache = useMusicCacheStore((state) => state.homeFeed);
  const setHomeFeed = useMusicCacheStore((state) => state.setHomeFeed);
  const isHomeFeedStale = useMusicCacheStore((state) => state.isHomeFeedStale);
  const hydrateFromSession = useMusicCacheStore((state) => state.hydrateFromSession);

  const [tracksHistory, setTracksHistory] = useState<History[] | null>(null);
  const [homeSections, setHomeSections] = useState<HomeFeedSectionData[]>([]);
  const [homeFeedLoading, setHomeFeedLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(true);

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
      setHistoryLoading(false);
      setHomeFeedLoading(false);
      return;
    }

    const [tracks, fetchSubscribedArtists] = await Promise.all([
      fetchHistory(accessTokenType, accessToken),
      fetchSubscribedChannels(accessTokenType, accessToken, 14),
    ]);
    if (tracks) setTracksHistory(tracks.tracks);
    if (fetchSubscribedArtists) setSubscribedChannels(fetchSubscribedArtists);
    setHistoryLoading(false);

    const cachedFeed = homeFeedCache;
    if (cachedFeed && !isHomeFeedStale()) {
      setHomeSections(cachedFeed.data.result || []);
      setHomeFeedLoading(false);
      return;
    }

    const feed = await fetchHomeFeed(accessTokenType, accessToken);
    if (feed && feed.result) {
      setHomeFeed(feed);
      setHomeSections(feed.result);
    }
    setHomeFeedLoading(false);
  }, [homeFeedCache, isHomeFeedStale, setHomeFeed, setSubscribedChannels]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchData();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchData]);

  const renderItem = (item: HomeFeedItem, cardType: CardType) => {
    const thumbnail = (item.thumbnails || []).sort(
      (a, b) => (b.width || 0) - (a.width || 0)
    )[0]?.url;

    const mappedArtists = (item.artists || []).map((a) => ({
      name: a.name || '',
      id: a.id || (a as { browseId?: string }).browseId || (a as { artistId?: string }).artistId || '',
    }));

    if (cardType === 'album' && item.browseId) {
      return (
        <AlbumCard
          album={{
            category: 'Albums',
            resultType: 'album',
            browseId: item.browseId,
            playlistId: item.playlistId || '',
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

    if (cardType === 'playlist' && (item.browseId || item.playlistId)) {
      return (
        <PlaylistCard
          playlist={{
            type: 'PLAYLIST',
            playlistId: item.playlistId || item.browseId?.replace(/^VL/, '') || '',
            name: item.title || '',
            artist: {
              artistId: mappedArtists[0]?.id || '',
              name: mappedArtists[0]?.name || '',
            },
            thumbnails: (item.thumbnails || []).map((t) => ({ url: t.url || '', width: t.width ?? 0, height: t.height ?? 0 })),
          }}
        />
      );
    }

    if (cardType === 'video' && item.videoId) {
      return <VideoStripCard item={{ ...item, artists: mappedArtists }} />;
    }

    return (
      <TrackStripCard
        track={{
          title: item.title || '',
          author: mappedArtists.map((a) => a.name).join(', ') || '',
          artist: mappedArtists,
          identifier: item.videoId || '',
          uri: item.videoId ? `https://youtu.be/${item.videoId}` : '',
          sourceName: 'youtube music',
          artworkUrl: thumbnail || '',
          proxyArtworkUrl: thumbnail ? `/api/proxy/image?r=${encodeURIComponent(thumbnail)}&s=256` : '',
          proxyHighResArtworkUrl: thumbnail ? `/api/proxy/image?r=${encodeURIComponent(thumbnail)}&s=512` : '',
          browseId: item.browseId,
          playlistId: item.playlistId,
          resultType: item.resultType,
        }}
      />
    );
  };

  return guild ? (
    <div className='w-full max-w-6xl mx-auto mt-16 gap-4 flex flex-col items-center justify-center text-center pb-48'>
      <div className='w-full flex gap-5 z-10'>
        {userInfo?.avatar ? (
          <Image
            src={`https://cdn.discordapp.com/avatars/${userInfo.id}/${userInfo.avatar}?size=64`}
            alt={userInfo.global_name || 'User'}
            width={64}
            height={64}
            className='w-16 h-16 rounded-full object-cover pointer-events-none select-none'
          />
        ) : (
          <div className='w-16 h-16 rounded-full bg-muted flex items-center justify-center text-xl font-bold'>
            {userInfo?.global_name?.[0] || 'U'}
          </div>
        )}
        <div className='flex flex-col items-start justify-center'>
          <h3 className='text-lg leading-none -translate-y-3'>{userInfo?.global_name}</h3>
          <h1 className='text-5xl font-bold'>
            {language.data.app.guilds.player.home.listen_again}
          </h1>
        </div>
      </div>

      <HomeFeedSection
        title={language.data.app.guilds.player.home.listen_again}
        isLoading={historyLoading}
        items={tracksHistory || []}
        skeletonCount={6}
        SkeletonComponent={MusicCardSkeleton}
        className='mt-6'
        renderItem={(track) => <MusicCard track={track.track} />}
      />

      {!historyLoading && (!tracksHistory || tracksHistory.length === 0) && (
        <div className='w-full h-52 flex flex-col items-center justify-center gap-2 rounded-3xl bg-foreground/10 border-2 border-foreground/10'>
          <MicrophoneStageIcon size={32} />
          <h2 className='text-3xl font-bold'>
            {language.data.app.guilds.player.home.no_history.title}
          </h2>
          <p className='text-lg'>
            {language.data.app.guilds.player.home.no_history.description}
          </p>
          <Button
            variant='default'
            className='rounded-lg gap-2 mt-2'
            onClick={() => router.push(`/app/g/${guild.id}/player/search`)}
          >
            <MagnifyingGlassIcon />
            {language.data.app.guilds.player.home.no_history.get_started}
          </Button>
        </div>
      )}

      {subscribedChannels && subscribedChannels.length > 0 && (
        <HomeFeedSection
          title={language.data.app.guilds.player.home.subscribed_channels}
          isLoading={false}
          items={subscribedChannels}
          skeletonCount={6}
          className='mt-24'
          renderItem={(channel) => {
            const artistData = extractArtistInfo(channel);
            return <ArtistCard guildId={guild.id} artist={artistData} />;
          }}
        />
      )}

      {homeFeedLoading
        ? [1, 2, 3].map((i) => (
          <div key={i} className='embla w-full max-w-none mx-0 z-10 relative mt-24'>
            <div className='w-full justify-between items-center flex mb-6'>
              <div className='h-8 w-56 animate-pulse rounded-xl bg-foreground/8' />
            </div>
            <div className='flex gap-5 overflow-hidden'>
              {Array.from({ length: 6 }).map((_, j) => (
                <MusicCardSkeleton key={j} />
              ))}
            </div>
          </div>
        ))
        : homeSections.map((section, sectionIndex) => {
          if (!section.contents || section.contents.length === 0) return null;
          const label = getSectionLabel(section.title, langHome);

          let firstItemWithVideo: HomeFeedItem | undefined;
          let firstItemWithPlaylistOrAlbum: HomeFeedItem | undefined;
          for (const item of section.contents) {
            if (item.videoId && !firstItemWithVideo) firstItemWithVideo = item;
            if ((item.browseId || item.playlistId) && !firstItemWithPlaylistOrAlbum) firstItemWithPlaylistOrAlbum = item;
          }
          const sampleItem = firstItemWithVideo || firstItemWithPlaylistOrAlbum || section.contents[0];
          const cardType = guessCardType(sampleItem);
          const rowCount = cardType === 'song' ? 3 : cardType === 'video' ? 2 : 1;
          const SkeletonComp =
            cardType === 'album' ? AlbumCardSkeleton :
              cardType === 'video' ? VideoCardSkeleton :
                MusicCardSkeleton;

          return (
            <HomeFeedSection
              key={`home-section-${sectionIndex}`}
              title={label}
              isLoading={false}
              items={section.contents}
              rows={rowCount}
              skeletonCount={6}
              SkeletonComponent={SkeletonComp}
              className='mt-24'
              renderItem={(item) => renderItem(item, cardType)}
            />
          );
        })}
    </div>
  ) : (
    <div className='w-full h-96 flex items-center justify-center'>
      <Spinner className='size-8' />
    </div>
  );
}
