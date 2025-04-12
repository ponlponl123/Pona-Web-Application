"use client"
import React from 'react'
import { Button, Image, Spinner, Link } from '@nextui-org/react';
import { useLanguageContext } from '@/contexts/languageContext';
import { useDiscordGuildInfo } from '@/contexts/discordGuildInfo';
import { useDiscordUserInfo } from '@/contexts/discordUserInfo';
import { usePonaMusicCacheContext } from '@/contexts/ponaMusicCacheContext';
import fetchHistory, { History } from '@/server-side-api/internal/history';
import { motion } from 'framer-motion';
import { getCookie } from 'cookies-next';
import { useRouter } from 'next/navigation';
import MusicCard, { ArtistCard } from '@/components/music/card';
import { CaretLeft, CaretRight, CraneTower, Heart, MagnifyingGlass, MicrophoneStage } from '@phosphor-icons/react/dist/ssr';
import useEmblaCarousel from 'embla-carousel-react';
import { usePrevNextButtons } from '@/utils/Embla/CarouselArrowButtons';
import { fetchSubscribedChannels, SubscribedChannelsResult } from '@/server-side-api/internal/channel';

function Page() {
  const router = useRouter();
  const { userInfo } = useDiscordUserInfo();
  const { guild } = useDiscordGuildInfo();
  const { language } = useLanguageContext();
  const { SetSubscribeStateCache } = usePonaMusicCacheContext();
  const fetched = React.useRef(false);
  const [tracksHistory, setTracksHistory] = React.useState<History[] | null>(null);
  const [subscribedArtists, setSubscribedArtists] = React.useState<SubscribedChannelsResult[] | null>(null);
  const [emblaRef, emblaApi] = useEmblaCarousel({ skipSnaps: true });
  const [subscribedChannelsEmblaRef, subscribedChannelsEmblaApi] = useEmblaCarousel({ skipSnaps: true });
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
      const accessTokenType = getCookie('LOGIN_TYPE_');
      const accessToken = getCookie('LOGIN_');
      if (!accessTokenType || !accessToken) return false;
      const tracks = await fetchHistory(accessTokenType, accessToken);
      const fetchSubscribedArtists = await fetchSubscribedChannels(accessTokenType, accessToken);
      if (tracks) setTracksHistory(tracks.tracks);
      if ( fetchSubscribedArtists ) {
        setSubscribedArtists(fetchSubscribedArtists);
        fetchSubscribedArtists.forEach(channel=>{
          SetSubscribeStateCache((value)=>{
            return value.filter((item) => item.channelId !== channel.artistId).concat({ channelId: channel.artistId, state: true });
          })
        })
      }
      fetched.current = true;
    }
    if (!fetched.current) fetchHistoryTracks();
  }, [SetSubscribeStateCache, fetched]);

  return (
    guild ? (
      <>
        <div className='w-full mt-16 gap-4 flex flex-col items-center justify-center text-center'>
          <div className='w-full flex gap-5'>
            <Image src={userInfo ? `https://cdn.discordapp.com/avatars/${userInfo.id}/${userInfo.avatar}?size=64` : ''} alt={userInfo ? userInfo.global_name : 'User'} height={64}
              className='rounded-full' />
            <div className='flex flex-col items-start justify-center'>
              <h3 className='text-lg leading-none'>{userInfo?.global_name}</h3>
              <h1 className='text-5xl'>{language.data.app.guilds.player.home.listen_again}</h1>
            </div>
          </div>
          <div className="embla w-full max-w-none mx-0 mt-6 z-10 relative">
            {
              tracksHistory && tracksHistory.length > 0 &&
              <div className="embla__controls max-sm:hidden w-full top-0 translate-y-[calc(-100%_-_1rem)] m-0 h-8 absolute justify-end items-center flex">
                <div className="embla__buttons gap-3 flex items-center justify-center">
                  <Button
                    onPress={onPrevButtonClick} disabled={prevBtnDisabled}
                    title='previous'
                    className="embla__button embla__button--prev border-2 border-foreground/10 bg-foreground/10 disabled:opacity-30 disabled:bg-transparent disabled:border-foreground/5"
                    type="button"
                    size='sm'
                    radius='full'
                    isIconOnly
                  ><CaretLeft/></Button>
                  <Button
                    onPress={onNextButtonClick} disabled={nextBtnDisabled}
                    title='next'
                    className="embla__button embla__button--next border-2 border-foreground/10 bg-foreground/10 disabled:opacity-30 disabled:bg-transparent disabled:border-foreground/5"
                    type="button"
                    size='sm'
                    radius='full'
                    isIconOnly
                  ><CaretRight/></Button>
                </div>
                <div className="embla__dots"></div>
              </div>
            }
            <div className="embla__viewport" ref={emblaRef}>
              <div className="embla__container gap-5">
                {
                  fetched.current ? (tracksHistory && tracksHistory.map((track, index) => (
                    <motion.div
                      initial={{ opacity: 0, x: -100 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{
                        delay: 0.08 * index,
                        ease: 'easeInOut',
                        x: { type: "spring", damping: 15, stiffness: 150 },
                      }}
                      className='embla__slide w-max flex-none select-none' key={index}>
                      <MusicCard track={track.track} />
                    </motion.div>
                  )) ||
                  <>
                    <div className='h-52'></div>
                    <div className='absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center gap-2 rounded-3xl bg-foreground/10 border-2 border-foreground/10'>
                      <MicrophoneStage size={32} />
                      <h1 className='text-3xl'>{language.data.app.guilds.player.home.no_history.title}</h1>
                      <p className='text-lg'>{language.data.app.guilds.player.home.no_history.description}</p>
                      <Button color='primary' radius='lg' onPress={()=>{router.push(`/app/g/${guild.id}/player/search`)}}>
                        <MagnifyingGlass /> {language.data.app.guilds.player.home.no_history.get_started}
                      </Button>
                    </div>
                  </>) : <div className='w-full h-52 flex items-center justify-center'><Spinner className='m-auto' /></div>
                }
              </div>
            </div>
          </div>
          {
            subscribedArtists && subscribedArtists.length > 0 &&
            <div className="embla w-full max-w-none mx-0 mt-24 z-10 relative">
              <div className="embla__controls max-sm:hidden w-full justify-between items-center flex mb-6">
                <h1 className='text-5xl'>{language.data.app.guilds.player.home.subscribed_channels}</h1>
                <div className="embla__buttons gap-3 flex items-center justify-center">
                  <Button
                    onPress={subscribedChannelsOnPrevButtonClick} disabled={subscribedChannelsPrevBtnDisabled}
                    title='previous'
                    className="embla__button embla__button--prev border-2 border-foreground/10 bg-foreground/10 disabled:opacity-30 disabled:bg-transparent disabled:border-foreground/5"
                    type="button"
                    size='sm'
                    radius='full'
                    isIconOnly
                  ><CaretLeft/></Button>
                  <Button
                    onPress={subscribedChannelsOnNextButtonClick} disabled={subscribedChannelsNextBtnDisabled}
                    title='next'
                    className="embla__button embla__button--next border-2 border-foreground/10 bg-foreground/10 disabled:opacity-30 disabled:bg-transparent disabled:border-foreground/5"
                    type="button"
                    size='sm'
                    radius='full'
                    isIconOnly
                  ><CaretRight/></Button>
                </div>
              </div>
              <div className="embla__viewport" ref={subscribedChannelsEmblaRef}>
                <div className="embla__container gap-5">
                  {
                    subscribedArtists.map((channel, index) => (
                      <motion.div
                        initial={{ opacity: 0, x: -100 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{
                          delay: 0.08 * index,
                          ease: 'easeInOut',
                          x: { type: "spring", damping: 15, stiffness: 150 },
                        }}
                      className='embla__slide w-max flex-none select-none' key={`home-subscribed-channels-${index}`}>
                        <ArtistCard artist={{
                          artistId: channel.artistId,
                          name: channel.info.v1?.name || channel.info.v2?.name || channel.info.user?.name || '',
                          thumbnails: channel.info.v1?.thumbnails || channel.info.v2?.thumbnails || [],
                          type: 'ARTIST'
                        }} />
                      </motion.div>
                    ))
                  }
                </div>
              </div>
            </div>
          }
          <div className='w-full min-h-max h-96 flex flex-col items-center justify-center gap-4'>
            <CraneTower size={48} weight='fill' />
            <h1 className='text-xl max-w-screen-md text-center mt-2'>{language.data.app.guilds.player.dev}</h1>
            <Link href='/app/updates' rel='noopener' onPress={()=>{router.push('/app/updates')}}>
              <Button color='secondary' className='mt-2' radius='full'><Heart weight='fill' /> {language.data.app.updates.follow}</Button>
            </Link>
          </div>
        </div>
      </>
    ) : (
      <>
        <Spinner />
      </>
    )
  );
}

export default Page;