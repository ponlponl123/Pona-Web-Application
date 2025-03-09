"use client"
import { useDiscordGuildInfo } from '@/contexts/discordGuildInfo';
import { useLanguageContext } from '@/contexts/languageContext';
import { getArtist } from '@/server-side-api/internal/search';
import { Button, Image as NextImage, Progress, ScrollShadow } from '@nextui-org/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArtistFull } from '@/interfaces/ytmusic';
import { getCookie } from 'cookies-next';
import { motion } from 'framer-motion';
import React from 'react'
import { ArtistCard, PlaylistCard } from '@/components/music/card';
import Track from '@/components/music/searchResult/track';
import { AlbumDetailed, SongDetailed, VideoDetailed } from '@/interfaces/ytmusic-api';

function Page() {
  const { language } = useLanguageContext();
  const { guild } = useDiscordGuildInfo();
  const router = useRouter();
  const searchParams = useSearchParams()
  const [ loading, setLoading ] = React.useState<boolean>(true);
  const [ ready, setReady ] = React.useState<boolean>(true);
  const [ channelDetail, setChannelDetail ] = React.useState<ArtistFull | null | false>(null);
  const channelId = searchParams ? searchParams.get('c') : ""
  const highResArtworkProxyURI = React.useRef<string>("");

  React.useEffect(() => {
    const exit = (provider: ArtistFull | null | false) => {
      setChannelDetail(provider);
      setLoading(false);
    };
    const letSearch = async () => {
      const accessTokenType = getCookie('LOGIN_TYPE_');
      const accessToken = getCookie('LOGIN_');
      if (typeof channelId !== 'string' || !accessTokenType || !accessToken || !channelId) return exit(false);
      const result = await getArtist(accessTokenType, accessToken, channelId);
      if (!result) return exit(false);
      exit(result);
      highResArtworkProxyURI.current = `/api/proxy/image?r=`+result?.thumbnails[result?.thumbnails.length-1].url;
      const image = new Image();
      image.src = highResArtworkProxyURI.current;
      if (image.onloadeddata) image.onloadeddata = () => {
        setReady(true);
      }
      return;
    }

    letSearch();
  }, [channelId]);

  return (
    <div className='flex flex-col gap-4 items-start justify-start w-full relative'>
      {
        loading && <Progress isIndeterminate size='sm' className='absolute top-0 left-0 w-full' />
      }
      {
        (ready && channelDetail) &&
        <>
          <div className='absolute z-[1] bg-playground-background w-[calc(100%_+_6rem)] h-full top-0 left-0 -translate-x-12 -translate-y-16 max-lg:-translate-y-24'></div>
          <motion.div
            initial={{opacity: 0}}
            animate={{opacity: 1}}
            exit={{opacity: 0}}
            transition={{
              delay: 0.32,
              duration: 1
            }}
            key={'artist-backdrop'}
            className='w-[calc(100%_+_6rem)] h-screen max-h-[64vh] min-h-48 relative top-0 left-0 z-[1] -translate-x-12 -translate-y-16 max-lg:-translate-y-24'
          >
            <NextImage loading={'eager'} src={String(highResArtworkProxyURI.current)} alt='hero-image'
              className='absolute top-0 left-0 w-full h-full max-h-full object-cover rounded-none opacity-100'
              classNames={{
                wrapper: '!max-w-full h-full'
              }}
            />
            <div className='flex flex-col -translate-x-1/2 w-full max-w-screen-xl h-full absolute top-0 left-1/2 items-start justify-end z-20 px-16 py-8 gap-4'>
              <h1 className='font-bold text-8xl max-2xl:text-7xl max-xl:text-6xl max-lg:text-5xl max-md:text-4xl max-sm:text-3xl'>{channelDetail?.name}</h1>
              <Button radius='full' size='lg' color='primary' className='font-bold max-md:text-sm max-md:min-h-0 max-md:min-w-0 max-md:py-3 max-md:px-4 max-md:h-max'>Subscribe</Button>
            </div>
            <div className='absolute z-[10] bg-gradient-to-t from-playground-background to-transparent w-full h-full top-0 left-0'></div>
          </motion.div>
          <div className='w-full z-[4] p-8 flex flex-col max-lg:gap-12 lg:gap-24 items-center justify-start pb-[24vh] -mt-12'>
            <div className='w-full max-w-screen-xl flex flex-row flex-wrap gap-8'>
            {
              (channelDetail.topSongs && channelDetail.topSongs.length > 0) && <>
                <section className='w-full xl:px-16 max-xl:max-md:px-12 xl:max-w-[calc(50%_-_2rem)] flex flex-col gap-4 items-center justify-start'>
                  <h1 className='w-full text-start text-4xl'>{language.data.app.guilds.player.artist.category.topSongs}</h1>
                  {
                    channelDetail.topSongs.map((songDetail, index) => (
                      <React.Fragment key={index}>
                        <Track data={{
                          album: songDetail.album,
                          artists: [
                            {
                              id: songDetail.artist.artistId,
                              name: songDetail.artist.name
                            }
                          ],
                          category: "Songs",
                          duration: songDetail.duration,
                          duration_seconds: songDetail.duration ? songDetail.duration / 1000 : 0,
                          isExplicit: false,
                          resultType: "song",
                          thumbnails: songDetail.thumbnails,
                          title: songDetail.name,
                          videoId: songDetail.videoId,
                          videoType: songDetail.type,
                          year: null
                        } as unknown as SongDetailed} />
                      </React.Fragment>
                    ))
                  }
                </section>
              </>
            }
            {
              (channelDetail.topVideos && channelDetail.topVideos.length > 0) && <>
                <section className='w-full xl:px-16 max-xl:max-md:px-12 xl:max-w-[calc(50%_-_2rem)] flex flex-col gap-4 items-center justify-start'>
                  <h1 className='w-full text-start text-4xl'>{language.data.app.guilds.player.artist.category.topVideos}</h1>
                  {
                    channelDetail.topVideos.map((songDetail, index) => (
                      <React.Fragment key={index}>
                        <Track data={{
                          artists: [
                            {
                              id: songDetail.artist.artistId,
                              name: songDetail.artist.name
                            }
                          ],
                          category: "Songs",
                          duration: songDetail.duration,
                          duration_seconds: songDetail.duration ? songDetail.duration / 1000 : 0,
                          isExplicit: false,
                          resultType: "song",
                          thumbnails: songDetail.thumbnails,
                          title: songDetail.name,
                          videoId: songDetail.videoId,
                          videoType: songDetail.type,
                          year: null
                        } as unknown as VideoDetailed} />
                      </React.Fragment>
                    ))
                  }
                </section>
              </>
            }
            </div>
            {
              (channelDetail.featuredOn && channelDetail.featuredOn.length > 0) && <>
                <section className='w-full px-16 max-w-screen-xl flex flex-col gap-4 items-center justify-start'>
                  <h1 className='w-full text-start text-4xl'>{language.data.app.guilds.player.artist.category.featuredOn} {channelDetail.name}</h1>
                  <ScrollShadow orientation='vertical' className='w-full relative' hideScrollBar>
                    <div className='w-max my-6 flex flex-row items-start justify-start gap-5'>
                    {
                      channelDetail.featuredOn.map((playlistDetailed, index) => (
                        <React.Fragment key={index}>
                          <PlaylistCard playlist={playlistDetailed} />
                        </React.Fragment>
                      ))
                    }
                    </div>
                  </ScrollShadow>
                </section>
              </>
            }
            {
              (channelDetail.topSingles && channelDetail.topSingles.length > 0) && <>
                <section className='w-full px-16 max-w-screen-xl flex flex-col gap-4 items-center justify-start'>
                  <h1 className='w-full text-start text-4xl'>{language.data.app.guilds.player.artist.category.topSingles}</h1>
                  {
                    channelDetail.topSingles.map((songDetail, index) => (
                      <React.Fragment key={index}>
                        <Track data={{
                          artists: [
                            {
                              id: songDetail.artist.artistId,
                              name: songDetail.artist.name
                            }
                          ],
                          browseId: songDetail.playlistId,
                          category: 'Albums',
                          duration: null,
                          isExplicit: false,
                          playlistId: songDetail.playlistId,
                          resultType: 'album',
                          thumbnails: songDetail.thumbnails,
                          title: songDetail.name,
                          year: songDetail.year
                        } as AlbumDetailed} />
                      </React.Fragment>
                    ))
                  }
                </section>
              </>
            }
            {
              (channelDetail.topAlbums && channelDetail.topAlbums.length > 0) && <>
                <section className='w-full px-16 max-w-screen-xl flex flex-col gap-4 items-center justify-start'>
                  <h1 className='w-full text-start text-4xl'>{language.data.app.guilds.player.artist.category.topAlbums}</h1>
                  {
                    channelDetail.topAlbums.map((songDetail, index) => (
                      <React.Fragment key={index}>
                        <Track data={{
                          artists: [
                            {
                              id: songDetail.artist.artistId,
                              name: songDetail.artist.name
                            }
                          ],
                          browseId: songDetail.playlistId,
                          category: 'Albums',
                          duration: null,
                          isExplicit: false,
                          playlistId: songDetail.playlistId,
                          resultType: 'album',
                          thumbnails: songDetail.thumbnails,
                          title: songDetail.name,
                          year: songDetail.year
                        } as AlbumDetailed} />
                      </React.Fragment>
                    ))
                  }
                </section>
              </>
            }
            {
              (channelDetail.similarArtists && channelDetail.similarArtists.length > 0) && <>
                <section className='w-full px-16 max-w-screen-xl flex flex-col gap-4 items-center justify-start'>
                  <h1 className='w-full text-start text-4xl'>{language.data.app.guilds.player.artist.category.similarArtists} {channelDetail.name}</h1>
                  <ScrollShadow orientation='vertical' className='w-full relative' hideScrollBar>
                    <div className='w-max my-6 flex flex-row items-start justify-start gap-5'>
                    {
                      channelDetail.similarArtists.map((artistDetail, index) => (
                        <React.Fragment key={index}>
                          <ArtistCard artist={artistDetail} />
                        </React.Fragment>
                      ))
                    }
                    </div>
                  </ScrollShadow>
                </section>
              </>
            }
          </div>
        </>
      }
    </div>
  )
}

export default Page