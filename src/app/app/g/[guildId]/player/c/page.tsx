'use client';

import React from 'react';
import { useSearchParams } from 'next/navigation';
import { getCookie } from 'cookies-next';
import { motion, type Variants, useReducedMotion } from 'framer-motion';
import { FlyingSaucerIcon } from '@phosphor-icons/react/dist/ssr';

import { ArtistHero } from '@/components/music/artist/artist-hero';
import { ArtistTopSongs } from '@/components/music/artist/artist-top-songs';
import { ArtistVideosCarousel } from '@/components/music/artist/artist-videos-carousel';
import { ArtistSinglesCarousel } from '@/components/music/artist/artist-singles-carousel';
import { ArtistAlbumsCarousel } from '@/components/music/artist/artist-albums-carousel';
import { ArtistSimilarCarousel } from '@/components/music/artist/artist-similar-carousel';

import { ChannelSkeleton } from '@/components/music/skeleton';
import { parseV1ChannelData } from '@/lib/artist';
import { resolveThumbnailUrl } from '@/lib/image';
import { getChannel } from '@/lib/server-side-api/internal/search';
import { useAppStore } from '@/store/coreStore';
import { ArtistFull as ArtistFullv1 } from '@/types/youtube/ytmusic';
import { ArtistFull, ProfileFull, ThumbnailFull } from '@/types/youtube/ytmusic-api';

const pageContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.06 } },
};

const pageItem: Variants = {
  hidden: { opacity: 0, filter: 'blur(2px)' },
  visible: {
    opacity: 1,
    filter: 'blur(0px)',
    transition: { duration: 0.36, ease: 'easeOut' },
  },
};

function Page() {
  const language = useAppStore((state) => state.language);
  const prefersReducedMotion = useReducedMotion();
  const searchParams = useSearchParams();
  const [loading, setLoading] = React.useState<boolean>(true);
  const [ready, setReady] = React.useState<boolean>(false);
  const [channelDetailv1, setChannelDetailv1] = React.useState<
    ArtistFullv1 | null | false
  >(null);
  const [channelDetail, setChannelDetail] = React.useState<
    ArtistFull | null | false
  >(null);
  const [profileDetail, setProfileDetail] = React.useState<
    ProfileFull | null | false
  >(null);
  const [highResArtworkProxyURI, setHighResArtworkProxyURI] =
    React.useState<string>('');

  const channelId = searchParams ? searchParams.get('c') : '';

  const [prevChannelId, setPrevChannelId] = React.useState(channelId);
  if (channelId !== prevChannelId) {
    setPrevChannelId(channelId);
    setLoading(true);
    setReady(false);
    setChannelDetail(null);
    setChannelDetailv1(null);
    setProfileDetail(null);
    setHighResArtworkProxyURI('');
  }

  React.useEffect(() => {
    const exit = (provider: ArtistFull | null | false) => {
      setChannelDetail(provider);
      setLoading(false);
    };
    const letSearch = async () => {
      const accessTokenType = String(getCookie('LOGIN_TYPE_'));
      const accessToken = String(getCookie('LOGIN_'));
      if (
        typeof channelId !== 'string' ||
        !accessTokenType ||
        accessTokenType === 'undefined' ||
        !accessToken ||
        accessToken === 'undefined' ||
        !channelId
      )
        return exit(false);
      setLoading(true);
      setReady(false);
      setProfileDetail(null);
      setChannelDetail(null);
      setChannelDetailv1(null);

      try {
        const channel = await getChannel(
          accessTokenType,
          accessToken,
          channelId
        );
        if (channel) {
          const parsedV1 = parseV1ChannelData(channel.v1);
          setChannelDetail(channel.v2 || null);
          setChannelDetailv1(parsedV1 || (channel.v1 as unknown as ArtistFullv1) || null);
          setProfileDetail(channel.user || null);
          if (!channel.v1 && !channel.v2 && !channel.user) return exit(false);

          const artworkUrl =
            resolveThumbnailUrl(channel.v2) ||
            resolveThumbnailUrl(parsedV1) ||
            resolveThumbnailUrl(channel.v1) ||
            resolveThumbnailUrl(channel.user) ||
            resolveThumbnailUrl({ info: channel });

          const targetURI = artworkUrl || '';
          setHighResArtworkProxyURI(targetURI);
          if (targetURI) {
            const image = new Image();
            image.onload = () => setReady(true);
            image.onerror = () => setReady(true);
            image.src = targetURI;
            setTimeout(() => setReady(true), 1200);
          } else {
            setReady(true);
          }

          exit(channel.v2 || null);
        } else {
          exit(false);
        }
      } catch {
        exit(false);
      }
    };

    letSearch();
  }, [channelId]);

  const v2Channel =
    typeof channelDetail === 'object' && channelDetail !== null
      ? channelDetail
      : null;
  const v1Channel =
    typeof channelDetailv1 === 'object' && channelDetailv1 !== null
      ? channelDetailv1
      : null;
  const userChannel =
    typeof profileDetail === 'object' && profileDetail !== null
      ? profileDetail
      : null;

  const artistName =
    v2Channel?.name ||
    v1Channel?.name ||
    (typeof v1Channel?.header?.title === 'object'
      ? v1Channel.header.title.text
      : v1Channel?.header?.title) ||
    userChannel?.name ||
    'Artist';

  const artistDescription =
    v2Channel?.description ||
    (typeof v1Channel?.description === 'string'
      ? v1Channel.description
      : v1Channel?.description?.text) ||
    (typeof v1Channel?.header?.description === 'string'
      ? v1Channel.header.description
      : v1Channel?.header?.description?.text) ||
    '';

  const artistThumbnails =
    v2Channel?.thumbnails ||
    v1Channel?.thumbnails ||
    (v1Channel?.header?.thumbnail?.contents as unknown as ThumbnailFull[]) ||
    userChannel?.thumbnails ||
    [];

  const hasContent = Boolean(channelDetailv1 || channelDetail || profileDetail);

  return (
    <div className='flex flex-col gap-4 items-start justify-start w-full'>
      {loading || !ready ? (
        <ChannelSkeleton />
      ) : !hasContent ? (
        <div className='w-full min-h-[36vh] flex flex-col gap-4 items-center justify-center'>
          <FlyingSaucerIcon weight='fill' size={74} />
          <h1 className='text-lg tracking-wider'>
            {language.data.app.guilds.player.search.notfound}
          </h1>
          <h4 className='text-sm tracking-wider'>＼（〇_ｏ）／</h4>
        </div>
      ) : (
        <motion.div variants={prefersReducedMotion ? undefined : pageContainer} initial={prefersReducedMotion ? false : 'hidden'} animate='visible' className='w-full'>
          <div className='absolute z-1 bg-playground-background w-[calc(100%+6rem)] h-full top-0 left-0 -translate-x-12 -translate-y-16 max-lg:-translate-y-24 pointer-events-none'></div>

          <motion.div variants={prefersReducedMotion ? undefined : pageItem}>
            <ArtistHero
              highResArtworkProxyURI={highResArtworkProxyURI}
              artistName={artistName}
              artistDescription={artistDescription}
              channelId={channelId || ''}
              artistThumbnails={artistThumbnails}
            />
          </motion.div>

          <motion.div variants={prefersReducedMotion ? undefined : pageContainer} className='w-full z-4 p-8 max-lg:p-0 flex flex-col max-lg:gap-12 lg:gap-24 items-center justify-start pb-[24vh] -mt-12 mb-32'>
            <motion.div variants={prefersReducedMotion ? undefined : pageItem} className='w-full'>
              <ArtistTopSongs
                channelDetail={channelDetail}
                channelDetailv1={channelDetailv1}
                channelId={channelId || ''}
                artistName={artistName}
              />
            </motion.div>

            <motion.div variants={prefersReducedMotion ? undefined : pageItem} className='w-full'>
              <ArtistVideosCarousel
                channelDetail={channelDetail}
                channelDetailv1={channelDetailv1}
                profileDetail={profileDetail}
                channelId={channelId || ''}
                artistName={artistName}
              />
            </motion.div>

            <motion.div variants={prefersReducedMotion ? undefined : pageItem} className='w-full'>
              <ArtistSinglesCarousel
                channelDetail={channelDetail}
                channelDetailv1={channelDetailv1}
                channelId={channelId || ''}
                artistName={artistName}
              />
            </motion.div>

            <motion.div variants={prefersReducedMotion ? undefined : pageItem} className='w-full'>
              <ArtistAlbumsCarousel
                channelDetail={channelDetail}
                channelDetailv1={channelDetailv1}
                profileDetail={profileDetail}
                channelId={channelId || ''}
                artistName={artistName}
              />
            </motion.div>

            <motion.div variants={prefersReducedMotion ? undefined : pageItem} className='w-full'>
              <ArtistSimilarCarousel
                channelDetail={channelDetail}
                channelDetailv1={channelDetailv1}
                artistName={artistName}
              />
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}

export default Page;
