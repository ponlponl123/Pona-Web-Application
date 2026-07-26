'use client';
import MusicCard, { ArtistCard } from '@/components/music/card';
import { useDiscordGuildInfo } from '@/contexts/discordGuildInfo';
import { useDiscordUserInfo } from '@/contexts/discordUserInfo';
import {
  fetchSubscribedChannels,
  SubscribedChannelsResult,
} from '@/lib/server-side-api/internal/channel';
import fetchHistory, { History } from '@/lib/server-side-api/internal/history';
import { usePrevNextButtons } from '@/lib/Embla/CarouselArrowButtons';
import {
  CaretLeft,
  CaretRight,
  CraneTower,
  Heart,
  MagnifyingGlass,
  MicrophoneStage,
} from '@phosphor-icons/react/dist/ssr';
import { getCookie } from 'cookies-next';
import useEmblaCarousel from 'embla-carousel-react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import React from 'react';
import { useAppStore } from '@/store/coreStore';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';

function Page() {
  const router = useRouter();
  const { userInfo } = useDiscordUserInfo();
  const { guild } = useDiscordGuildInfo();
  const language = useAppStore((state) => state.language);
  const fetched = React.useRef(false);
  const [tracksHistory, setTracksHistory] = React.useState<any[] | null>(
    null
  );
  const [subscribedArtists, setSubscribedArtists] = React.useState<
    any[] | null
  >(null);

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

  React.useEffect(() => {
    const fetchHistoryTracks = async () => {
      const accessTokenType = String(getCookie('LOGIN_TYPE_'));
      const accessToken = String(getCookie('LOGIN_'));
      if (!accessTokenType || !accessToken || fetched.current) return;
      fetched.current = true;
      try {
        const historyData = await fetchHistory(accessTokenType, accessToken, 20);
        if (historyData && typeof historyData === 'object' && 'tracks' in historyData && (historyData as any).tracks) {
          setTracksHistory((historyData as any).tracks);
        }

        const subChannels = await fetchSubscribedChannels(
          accessTokenType,
          accessToken
        );
        if (subChannels) setSubscribedArtists(subChannels);
      } catch (err) {
        console.error(err);
      }
    };

    fetchHistoryTracks();
  }, []);

  return (
    <div className='w-full max-w-screen-xl mx-auto mt-12 flex flex-col gap-12 pb-24 px-4'>
      {/* Subscribed Artists Section */}
      {subscribedArtists && subscribedArtists.length > 0 && (
        <div className='flex flex-col gap-4'>
          <div className='flex items-center justify-between'>
            <h2 className='text-2xl font-bold'>
              {language.data.app.guilds.player.home.subscribed_channels}
            </h2>
            <div className='flex items-center gap-2'>
              <Button
                variant='ghost'
                size='icon'
                onClick={subscribedChannelsOnPrevButtonClick}
                disabled={subscribedChannelsPrevBtnDisabled}
                className='rounded-full'
              >
                <CaretLeft />
              </Button>
              <Button
                variant='ghost'
                size='icon'
                onClick={subscribedChannelsOnNextButtonClick}
                disabled={subscribedChannelsNextBtnDisabled}
                className='rounded-full'
              >
                <CaretRight />
              </Button>
            </div>
          </div>
          <div className='overflow-hidden' ref={subscribedChannelsEmblaRef}>
            <div className='flex gap-4'>
              {subscribedArtists.map((artist, idx) => (
                <div key={idx} className='flex-[0_0_auto] w-40'>
                  <ArtistCard
                    data={{
                      artistName: artist.artistName || artist.name || '',
                      browseId: artist.channelId || artist.artistId || '',
                      thumbnails: artist.thumbnails || [],
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Listening History Section */}
      <div className='flex flex-col gap-4'>
        <div className='flex items-center justify-between'>
          <h2 className='text-2xl font-bold'>
            {language.data.app.guilds.player.home.listen_again}
          </h2>
          {tracksHistory && tracksHistory.length > 0 && (
            <div className='flex items-center gap-2'>
              <Button
                variant='ghost'
                size='icon'
                onClick={onPrevButtonClick}
                disabled={prevBtnDisabled}
                className='rounded-full'
              >
                <CaretLeft />
              </Button>
              <Button
                variant='ghost'
                size='icon'
                onClick={onNextButtonClick}
                disabled={nextBtnDisabled}
                className='rounded-full'
              >
                <CaretRight />
              </Button>
            </div>
          )}
        </div>

        {tracksHistory ? (
          tracksHistory.length > 0 ? (
            <div className='overflow-hidden' ref={emblaRef}>
              <div className='flex gap-4'>
                {tracksHistory.map((item, idx) => (
                  <div key={idx} className='flex-[0_0_auto] w-48'>
                    <MusicCard
                      data={{
                        title: item.track.title,
                        author: item.track.author,
                        thumbnail:
                          item.track.thumbnail || item.track.artworkUrl,
                        identifier: item.track.identifier,
                        uri: `https://music.youtube.com/watch?v=${item.track.identifier}`,
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className='flex flex-col items-center justify-center gap-4 py-12 bg-card border rounded-3xl text-center'>
              <MicrophoneStage size={48} className='text-muted-foreground' />
              <h3 className='text-xl font-bold'>
                {language.data.app.guilds.player.home.no_history.title}
              </h3>
              <p className='text-muted-foreground'>
                {language.data.app.guilds.player.home.no_history.description}
              </p>
              <Button
                variant='secondary'
                className='rounded-full'
                onClick={() => router.push(`/app/g/${guild?.id}/player/search`)}
              >
                <MagnifyingGlass className='mr-2' />
                {language.data.app.guilds.player.home.no_history.get_started}
              </Button>
            </div>
          )
        ) : (
          <div className='flex items-center justify-center py-12'>
            <Spinner size='md' />
          </div>
        )}
      </div>
    </div>
  );
}

export default Page;
