'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getCookie } from 'cookies-next';
import useEmblaCarousel from 'embla-carousel-react';
import { motion } from 'framer-motion';
import {
  CaretLeftIcon,
  CaretRightIcon,
  CraneTowerIcon,
  HeartIcon,
  MagnifyingGlassIcon,
  MicrophoneStageIcon,
} from '@phosphor-icons/react/dist/ssr';

import MusicCard, { ArtistCard } from '@/components/music/card';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { useDiscordGuildInfo } from '@/contexts/discordGuildInfo';
import { useDiscordUserInfo } from '@/contexts/discordUserInfo';
import { useAppStore } from '@/store/coreStore';
import { useMusicCacheStore } from '@/store/musicCacheStore';
import {
  fetchSubscribedChannels,
} from '@/lib/server-side-api/internal/channel';
import fetchHistory, { History } from '@/lib/server-side-api/internal/history';
import { usePrevNextButtons } from '@/lib/Embla/CarouselArrowButtons';
import { extractArtistInfo } from '@/lib/artist';

export default function Page() {
  const router = useRouter();
  const { userInfo } = useDiscordUserInfo();
  const { guild } = useDiscordGuildInfo();
  const language = useAppStore((state) => state.language);

  const subscribedChannels = useMusicCacheStore((state) => state.subscribedChannels);
  const setSubscribedChannels = useMusicCacheStore((state) => state.setSubscribedChannels);

  const [fetched, setFetched] = useState(false);
  const [tracksHistory, setTracksHistory] = useState<History[] | null>(null);

  const [emblaRef, emblaApi] = useEmblaCarousel({ skipSnaps: true });
  const [subscribedChannelsEmblaRef, subscribedChannelsEmblaApi] =
    useEmblaCarousel({ skipSnaps: true });

  const {
    prevBtnDisabled,
    nextBtnDisabled,
    onPrevButtonClick,
    onNextButtonClick,
  } = usePrevNextButtons(emblaApi);

  const {
    prevBtnDisabled: subscribedChannelsPrevBtnDisabled,
    nextBtnDisabled: subscribedChannelsNextBtnDisabled,
    onPrevButtonClick: subscribedChannelsOnPrevButtonClick,
    onNextButtonClick: subscribedChannelsOnNextButtonClick,
  } = usePrevNextButtons(subscribedChannelsEmblaApi);

  useEffect(() => {
    const fetchHistoryTracks = async () => {
      const accessTokenType = String(getCookie('LOGIN_TYPE_'));
      const accessToken = String(getCookie('LOGIN_'));
      if (
        !accessTokenType ||
        accessTokenType === 'undefined' ||
        !accessToken ||
        accessToken === 'undefined'
      )
        return false;

      const tracks = await fetchHistory(accessTokenType, accessToken);
      const fetchSubscribedArtists = await fetchSubscribedChannels(
        accessTokenType,
        accessToken
      );

      if (tracks) setTracksHistory(tracks.tracks);
      if (fetchSubscribedArtists) {
        setSubscribedChannels(fetchSubscribedArtists);
      }
      setFetched(true);
    };

    if (!fetched) fetchHistoryTracks();
  }, [setSubscribedChannels, fetched]);

  return guild ? (
    <div className='w-full max-w-6xl mx-auto mt-16 gap-4 flex flex-col items-center justify-center text-center'>
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
      <div className='embla w-full max-w-none mx-0 mt-6 z-10 relative'>
        {tracksHistory && tracksHistory.length > 0 && (
          <div className='embla__controls max-sm:hidden w-full top-0 translate-y-[calc(-100%-1rem)] m-0 h-8 absolute justify-end items-center flex'>
            <div className='embla__buttons gap-3 flex items-center justify-center'>
              <Button
                onClick={onPrevButtonClick}
                disabled={prevBtnDisabled}
                title='previous'
                className='embla__button embla__button--prev border-2 border-foreground/10 bg-foreground/10 disabled:opacity-30 disabled:bg-transparent disabled:border-foreground/5 rounded-full p-0'
                type='button'
                variant='ghost'
                size='icon'
              >
                <CaretLeftIcon />
              </Button>
              <Button
                onClick={onNextButtonClick}
                disabled={nextBtnDisabled}
                title='next'
                className='embla__button embla__button--next border-2 border-foreground/10 bg-foreground/10 disabled:opacity-30 disabled:bg-transparent disabled:border-foreground/5 rounded-full p-0'
                type='button'
                variant='ghost'
                size='icon'
              >
                <CaretRightIcon />
              </Button>
            </div>
            <div className='embla__dots'></div>
          </div>
        )}
        <div className='embla__viewport' ref={emblaRef}>
          <div className='embla__container gap-5'>
            {fetched ? (
              (tracksHistory &&
                tracksHistory.map((track, index) => (
                  <motion.div
                    initial={{ opacity: 0, x: -100 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      delay: 0.08 * index,
                      ease: 'easeInOut',
                      x: { type: 'spring', damping: 15, stiffness: 150 },
                    }}
                    className='embla__slide w-max flex-none select-none'
                    key={index}
                  >
                    <MusicCard track={track.track} />
                  </motion.div>
                ))) || (
                <>
                  <div className='h-52'></div>
                  <div className='absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center gap-2 rounded-3xl bg-foreground/10 border-2 border-foreground/10'>
                    <MicrophoneStageIcon size={32} />
                    <h1 className='text-3xl font-bold'>
                      {language.data.app.guilds.player.home.no_history.title}
                    </h1>
                    <p className='text-lg'>
                      {
                        language.data.app.guilds.player.home.no_history
                          .description
                      }
                    </p>
                    <Button
                      variant='default'
                      className='rounded-lg gap-2 mt-2'
                      onClick={() => {
                        router.push(`/app/g/${guild.id}/player/search`);
                      }}
                    >
                      <MagnifyingGlassIcon />{' '}
                      {
                        language.data.app.guilds.player.home.no_history
                          .get_started
                      }
                    </Button>
                  </div>
                </>
              )
            ) : (
              <div className='w-full h-52 flex items-center justify-center'>
                <Spinner className='m-auto size-8' />
              </div>
            )}
          </div>
        </div>
      </div>
      {subscribedChannels && subscribedChannels.length > 0 && (
        <div className='embla w-full max-w-none mx-0 mt-24 z-10 relative'>
          <div className='embla__controls max-sm:hidden w-full justify-between items-center flex mb-6'>
            <h1 className='text-5xl font-bold'>
              {language.data.app.guilds.player.home.subscribed_channels}
            </h1>
            <div className='embla__buttons gap-3 flex items-center justify-center'>
              <Button
                onClick={subscribedChannelsOnPrevButtonClick}
                disabled={subscribedChannelsPrevBtnDisabled}
                title='previous'
                className='embla__button embla__button--prev border-2 border-foreground/10 bg-foreground/10 disabled:opacity-30 disabled:bg-transparent disabled:border-foreground/5 rounded-full p-0'
                type='button'
                variant='ghost'
                size='icon'
              >
                <CaretLeftIcon />
              </Button>
              <Button
                onClick={subscribedChannelsOnNextButtonClick}
                disabled={subscribedChannelsNextBtnDisabled}
                title='next'
                className='embla__button embla__button--next border-2 border-foreground/10 bg-foreground/10 disabled:opacity-30 disabled:bg-transparent disabled:border-foreground/5 rounded-full p-0'
                type='button'
                variant='ghost'
                size='icon'
              >
                <CaretRightIcon />
              </Button>
            </div>
          </div>
          <div className='embla__viewport' ref={subscribedChannelsEmblaRef}>
            <div className='embla__container gap-5'>
              {subscribedChannels.map((channel, index) => {
                const artistData = extractArtistInfo(channel);
                return (
                  <motion.div
                    initial={{ opacity: 0, x: -100 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      delay: 0.05 * index,
                      ease: 'easeInOut',
                      x: { type: 'spring', damping: 15, stiffness: 150 },
                    }}
                    className='embla__slide w-max flex-none select-none'
                    key={`home-subscribed-channels-${artistData.artistId || index}`}
                  >
                    <ArtistCard
                      guildId={guild.id}
                      artist={artistData}
                    />
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      )}
      <div className='w-full min-h-max h-96 flex flex-col items-center justify-center gap-4'>
        <CraneTowerIcon size={48} weight='fill' />
        <h1 className='text-xl max-w-3xl text-center mt-2'>
          {language.data.app.guilds.player.dev}
        </h1>
        <Link href='/app/updates'>
          <Button variant='secondary' className='mt-2 rounded-full gap-2'>
            <HeartIcon weight='fill' /> {language.data.app.updates.follow}
          </Button>
        </Link>
      </div>
    </div>
  ) : (
    <div className='w-full h-96 flex items-center justify-center'>
      <Spinner className='size-8' />
    </div>
  );
}


