"use client"
import { useLanguageContext } from '@/contexts/languageContext';
import { getArtist, getArtistv1, getUser } from '@/server-side-api/internal/search';
import { Button, Image as NextImage, Progress, ScrollShadow } from '@nextui-org/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getCookie } from 'cookies-next';
import { motion } from 'framer-motion';
import React from 'react'
import { AlbumCard, ArtistCard, PlaylistCard, VideoCard } from '@/components/music/card';
import Track from '@/components/music/searchResult/track';
import { ArtistFull as ArtistFullv1 } from '@/interfaces/ytmusic';
import { ArtistFull, ProfileFull, SongDetailed, VideoDetailed } from '@/interfaces/ytmusic-api';
import { FlyingSaucer } from '@phosphor-icons/react/dist/ssr';

function Page() {
  const router = useRouter();
  const { language } = useLanguageContext();
  const searchParams = useSearchParams()
  const [ loading, setLoading ] = React.useState<boolean>(true);
  const [ ready, setReady ] = React.useState<boolean>(true);
  const [ channelDetailv1, setChannelDetailv1 ] = React.useState<ArtistFullv1 | null | false>(null);
  const [ channelDetail, setChannelDetail ] = React.useState<ArtistFull | null | false>(null);
  const [ profileDetail, setProfileDetail ] = React.useState<ProfileFull | null | false>(null);
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
      setLoading(true);
      setProfileDetail(null);
      setChannelDetail(null);
      setChannelDetailv1(null);

      try {
        const [resultv1, result, profile] = await Promise.all([
          getArtistv1(accessTokenType, accessToken, channelId),
          getArtist(accessTokenType, accessToken, channelId),
          getUser(accessTokenType, accessToken, channelId)
        ]);

        if (resultv1) setChannelDetailv1(resultv1);
        if (profile) setProfileDetail(profile);
        if (!result && !resultv1) return exit(false);
        exit(result);

        highResArtworkProxyURI.current = (result && result?.thumbnails) ? `/api/proxy/image?r=` + result?.thumbnails[result?.thumbnails.length - 1].url : (resultv1 && resultv1?.thumbnails) ? `/api/proxy/image?r=` + resultv1?.thumbnails[resultv1?.thumbnails.length - 1].url : "";
        const image = new Image();
        image.src = highResArtworkProxyURI.current;
        if (image.onloadeddata) image.onloadeddata = () => {
          setReady(true);
        }
      } catch {
        exit(false);
      }
    }

    letSearch();
  }, [channelId]);

  return (
    <div className='flex flex-col gap-4 items-start justify-start w-full relative'>
      {
        loading && <Progress isIndeterminate size='sm' className='absolute top-0 left-0 w-full' />
      }
      {
        !loading && !channelDetail && !channelDetailv1 && <div className='w-full min-h-[36vh] flex flex-col gap-4 items-center justify-center'>
          <FlyingSaucer weight='fill' size={74} />
          <h1 className='text-lg tracking-wider'>{language.data.app.guilds.player.search.notfound}</h1>
          <h4 className='text-sm tracking-wider'>＼（〇_ｏ）／</h4>
        </div>
      }
      {
        (ready && (channelDetailv1 || channelDetail)) &&
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
            className={`w-[calc(100%_+_6rem)] h-screen ${channelDetail && channelDetail.description ? 'max-h-[82vh]' : 'max-h-[64vh]'} min-h-48 relative top-0 left-0 z-[1] -translate-x-12 -translate-y-16 max-lg:-translate-y-24`}
          >
            <NextImage loading={'eager'} src={String(highResArtworkProxyURI.current)} alt='hero-image'
              className='absolute top-0 left-0 w-full h-full max-h-full object-cover rounded-none opacity-100'
              classNames={{
                wrapper: '!max-w-full h-full'
              }}
            />
            <div className='flex flex-col -translate-x-1/2 w-full max-w-screen-xl h-full absolute top-0 left-1/2 items-start justify-end z-20 px-16 py-8 gap-4'>
              <h1 className='font-bold text-8xl max-2xl:text-7xl max-xl:text-6xl max-lg:text-5xl max-md:text-4xl max-sm:text-3xl'>{channelDetail && channelDetail?.name || channelDetailv1 && channelDetailv1.name}</h1>
              {
                channelDetail && channelDetail.description && <p>
                  {channelDetail.description}
                </p>
              }
              <div className='flex gap-4 items-center'>
                <Button radius='full' size='lg' color='primary' className='font-bold max-md:text-sm max-md:min-h-0 max-md:min-w-0 max-md:py-3 max-md:px-4 max-md:h-max'>
                  <span>{language.data.app.guilds.player.artist.subscribe}</span>
                  {
                    channelDetail && channelDetail.subscribers && <><span>{channelDetail.subscribers}</span><span>{language.data.app.guilds.player.artist.people}</span></>
                  }
                </Button>
              </div>
            </div>
            <div className='absolute z-[10] bg-gradient-to-t from-playground-background to-transparent w-full h-full top-0 left-0'></div>
          </motion.div>
          <div className='w-full z-[4] p-8 max-lg:p-0 flex flex-col max-lg:gap-12 lg:gap-24 items-center justify-start pb-[24vh] -mt-12'>
            <div className='w-full max-w-screen-xl flex flex-row flex-wrap gap-8'>
            {
              (
                (channelDetailv1 && channelDetailv1.topSongs && channelDetailv1.topSongs.length > 0) ||
                (channelDetail && channelDetail.songs && channelDetail.songs.results && channelDetail.songs.results.length > 0)
              ) && <>
                <section className='c section'>
                {/* <section className='w-full xl:px-16 max-xl:max-md:px-12 xl:max-w-[calc(50%_-_2rem)] flex flex-col gap-4 items-center justify-start'> */}
                  <h1 className='w-full text-start text-4xl'>{language.data.app.guilds.player.artist.category.topSongs}</h1>
                  {
                    (channelDetail && channelDetail.songs && channelDetail.songs.results && channelDetail.songs.results.length > 0) ? channelDetail.songs.results.map((songDetail, index) => (
                      <React.Fragment key={index}>
                        <Track data={{
                          album: songDetail.album,
                          artists: songDetail.artists,
                          category: "Songs",
                          duration: null,
                          duration_seconds: null,
                          isExplicit: songDetail.isExplicit,
                          resultType: "song",
                          thumbnails: songDetail.thumbnails,
                          title: songDetail.title,
                          videoId: songDetail.videoId,
                          videoType: songDetail.videoType,
                          year: null
                        } as unknown as SongDetailed} />
                      </React.Fragment>
                    )) : (channelDetailv1 && channelDetailv1.topSongs && channelDetailv1.topSongs.length > 0) && channelDetailv1.topSongs.map((songDetail, index) => (
                      <React.Fragment key={index}>
                        <Track data={{
                          album: songDetail.album,
                          artists: [{ id: songDetail.artist.artistId, name: songDetail.artist.name }],
                          category: "Songs",
                          duration_seconds: null,
                          isExplicit: false,
                          resultType: "song",
                          thumbnails: songDetail.thumbnails,
                          title: songDetail.name,
                          videoId: songDetail.videoId,
                          videoType: songDetail.type,
                          year: null
                        } as SongDetailed} />
                      </React.Fragment>
                    ))
                  }
                  <div className='flex gap-4 flex-wrap items-center justify-start w-full p-1 -mt-2'>
                    {
                      channelDetail && channelDetail.songs && channelDetail.songs.browseId &&
                      (() => {
                        const href = window.location.pathname.split('/player')[0] + '/player/playlist?list='+channelDetail.songs.browseId;
                        return <Button href={href} onClick={()=>{router.push(href)}} radius='full' variant='bordered' size='sm' color='primary' className='font-bold max-md:text-sm max-md:min-h-0 max-md:min-w-0 max-md:py-3 max-md:px-4 max-md:h-max'>{language.data.app.guilds.player.artist.showmore}</Button>
                      })()
                    }
                  </div>
                </section>
              </>
            }
            </div>
            {
              (
                (channelDetailv1 && channelDetailv1.topVideos && channelDetailv1.topVideos.length > 0) ||
                (channelDetail && channelDetail.videos && channelDetail.videos.results && channelDetail.videos.results.length > 0)
              ) ? <>
                <section className='c section'>
                {/* <section className='w-full xl:px-16 max-xl:max-md:px-12 xl:max-w-[calc(50%_-_2rem)] flex flex-col gap-4 items-center justify-start'> */}
                  <div className='flex gap-4 flex-wrap items-center justify-between w-full p-1 -mt-2'>
                    <h1 className='text-start text-4xl'>{language.data.app.guilds.player.artist.category.topVideos}</h1>
                  </div>
                  <ScrollShadow orientation='vertical' className='w-full relative' hideScrollBar>
                  <div className='w-max my-6 flex flex-row items-start justify-start gap-5'>
                  {
                    (channelDetail && channelDetail.videos && channelDetail.videos.results && channelDetail.videos.results.length > 0) ? channelDetail.videos.results.map((videoDetail, index) => (
                      <React.Fragment key={index}>
                        <VideoCard video={{
                          artists: videoDetail.artists,
                          category: "Videos",
                          duration_seconds: null,
                          isExplicit: false,
                          resultType: "viceo",
                          thumbnails: videoDetail.thumbnails,
                          title: videoDetail.title,
                          videoId: videoDetail.videoId,
                          view: videoDetail.views,
                          videoType: null,
                          year: null
                        } as unknown as VideoDetailed} />
                      </React.Fragment>
                    )) : (channelDetailv1 && channelDetailv1.topVideos && channelDetailv1.topVideos.length > 0) && channelDetailv1.topVideos.map((videoDetail, index) => (
                      <React.Fragment key={index}>
                        <VideoCard video={{
                          artists: [{ id: videoDetail.artist.artistId, name: videoDetail.artist.name }],
                          category: "Videos",
                          duration: videoDetail.duration,
                          duration_seconds: videoDetail.duration && videoDetail.duration/1000,
                          isExplicit: false,
                          resultType: "viceo",
                          thumbnails: videoDetail.thumbnails,
                          title: videoDetail.name,
                          videoId: videoDetail.videoId,
                          view: null,
                          videoType: null,
                          year: null
                        } as unknown as VideoDetailed} />
                      </React.Fragment>
                    ))
                  }
                  </div>
                  </ScrollShadow>
                </section>
              </> : profileDetail && profileDetail.videos && profileDetail.videos.results.length > 0 && <>
                <section className='c section'>
                {/* <section className='w-full xl:px-16 max-xl:max-md:px-12 xl:max-w-[calc(50%_-_2rem)] flex flex-col gap-4 items-center justify-start'> */}
                  <h1 className='w-full text-start text-4xl'>{language.data.app.guilds.player.artist.category.topVideos}</h1>
                  <ScrollShadow orientation='vertical' className='w-full relative' hideScrollBar>
                  <div className='w-max my-6 flex flex-row items-start justify-start gap-5'>
                  {
                    profileDetail.videos.results.map((videoDetail, index) => (
                      <React.Fragment key={index}>
                        <VideoCard video={{
                          artists: videoDetail.artists,
                          category: "Videos",
                          duration: null,
                          duration_seconds: null,
                          isExplicit: false,
                          resultType: "video",
                          thumbnails: videoDetail.thumbnails,
                          title: videoDetail.title,
                          videoId: videoDetail.videoId,
                          view: null,
                          videoType: null,
                          year: null
                        } as unknown as VideoDetailed} />
                      </React.Fragment>
                    ))
                  }
                  </div>
                  </ScrollShadow>
                </section>
              </>
            }
            {
              (channelDetailv1 && channelDetailv1.featuredOn && channelDetailv1.featuredOn.length > 0) && <>
                <section className='c section'>
                  <h1 className='w-full text-start text-4xl'>{language.data.app.guilds.player.artist.category.featuredOn} {channelDetail && channelDetail?.name || channelDetailv1 && channelDetailv1.name}</h1>
                  <ScrollShadow orientation='vertical' className='w-full relative' hideScrollBar>
                    <div className='w-max my-6 flex flex-row items-start justify-start gap-5'>
                    {
                      channelDetailv1.featuredOn.map((playlistDetailed, index) => (
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
              (
                (channelDetailv1 && channelDetailv1.topSingles && channelDetailv1.topSingles.length > 0) ||
                (channelDetail && channelDetail.singles && channelDetail.singles.results && channelDetail.singles.results.length > 0)
              ) && <>
                <section className='c section'>
                  <div className='flex gap-4 flex-wrap items-center justify-between w-full p-1 -mt-2'>
                    <h1 className='text-start text-4xl'>{language.data.app.guilds.player.artist.category.topSingles}</h1>
                    <Button radius='full' variant='bordered' size='sm' color='primary' className='font-bold max-md:text-sm max-md:min-h-0 max-md:min-w-0 max-md:py-3 max-md:px-4 max-md:h-max'>{language.data.app.guilds.player.artist.showmore}</Button>
                  </div>
                  <ScrollShadow orientation='vertical' className='w-full relative' hideScrollBar>
                    <div className='w-max my-6 flex flex-row items-start justify-start gap-5'>
                    {
                      (channelDetail && channelDetail.singles && channelDetail.singles.results && channelDetail.singles.results.length > 0) ? channelDetail.singles.results.map((singleDetail, index) => (
                        <React.Fragment key={index}>
                          <AlbumCard album={{
                            artists: [{
                              id: channelId,
                              name: channelDetail.name
                            }],
                            browseId: singleDetail.browseId,
                            category: 'Albums',
                            duration: null,
                            isExplicit: false,
                            playlistId: singleDetail.browseId,
                            resultType: 'single',
                            thumbnails: singleDetail.thumbnails,
                            title: singleDetail.title,
                            year: Number(singleDetail.year),
                            type: ''
                          }} />
                        </React.Fragment>
                      )) : (channelDetailv1 && channelDetailv1.topSingles && channelDetailv1.topSingles.length > 0) && channelDetailv1.topSingles.map((singleDetail, index) => (
                        <React.Fragment key={index}>
                          <AlbumCard album={{
                            artists: [{
                              id: singleDetail.artist.artistId,
                              name: singleDetail.artist.name
                            }],
                            browseId: singleDetail.albumId,
                            category: 'Albums',
                            duration: null,
                            isExplicit: false,
                            playlistId: singleDetail.albumId,
                            resultType: 'single',
                            thumbnails: singleDetail.thumbnails,
                            title: singleDetail.name,
                            year: singleDetail.year,
                            type: singleDetail.type
                          }} />
                        </React.Fragment>
                      ))
                    }
                    </div>
                  </ScrollShadow>
                </section>
              </>
            }
            {
              !profileDetail && (
                (channelDetailv1 && channelDetailv1.topAlbums && channelDetailv1.topAlbums.length > 0) ||
                (channelDetail && channelDetail.albums && channelDetail.albums.results && channelDetail.albums.results.length > 0)
              ) && <>
                <section className='c section'>
                  <div className='flex gap-4 flex-wrap items-center justify-between w-full p-1 -mt-2'>
                    <h1 className='text-start text-4xl'>{language.data.app.guilds.player.artist.category.topAlbums}</h1>
                    <Button radius='full' variant='bordered' size='sm' color='primary' className='font-bold max-md:text-sm max-md:min-h-0 max-md:min-w-0 max-md:py-3 max-md:px-4 max-md:h-max'>{language.data.app.guilds.player.artist.showmore}</Button>
                  </div>
                  <ScrollShadow orientation='vertical' className='w-full relative' hideScrollBar>
                    <div className='w-max my-6 flex flex-row items-start justify-start gap-5'>
                    {
                      (channelDetail && channelDetail.albums && channelDetail.albums.results && channelDetail.albums.results.length > 0) ? channelDetail.albums.results.map((albumDetail, index) => (
                        <React.Fragment key={index}>
                          <AlbumCard album={{
                            artists: [{
                              id: channelId,
                              name: channelDetail.name
                            }],
                            browseId: albumDetail.browseId,
                            category: 'Albums',
                            duration: null,
                            isExplicit: false,
                            playlistId: albumDetail.browseId,
                            resultType: 'album',
                            thumbnails: albumDetail.thumbnails,
                            title: albumDetail.title,
                            year: Number(albumDetail.year),
                            type: ''
                          }} />
                        </React.Fragment>
                      )) : (channelDetailv1 && channelDetailv1.topAlbums && channelDetailv1.topAlbums.length > 0) && channelDetailv1.topAlbums.map((albumDetail, index) => (
                        <React.Fragment key={index}>
                          <AlbumCard album={{
                            artists: [{
                              id: albumDetail.artist.artistId,
                              name: albumDetail.artist.name
                            }],
                            browseId: albumDetail.albumId,
                            category: 'Albums',
                            duration: null,
                            isExplicit: false,
                            playlistId: albumDetail.albumId,
                            resultType: 'album',
                            thumbnails: albumDetail.thumbnails,
                            title: albumDetail.name,
                            year: albumDetail.year,
                            type: albumDetail.type
                          }} />
                        </React.Fragment>
                      ))
                    }
                    </div>
                  </ScrollShadow>
                </section>
              </>
            }
            {
              (
                (channelDetailv1 && channelDetailv1.similarArtists && channelDetailv1.similarArtists.length > 0) ||
                (channelDetail && channelDetail.related && channelDetail.related.results && channelDetail.related.results.length > 0)
              ) && <>
                <section className='c section'>
                  <h1 className='w-full text-start text-4xl'>{language.data.app.guilds.player.artist.category.similarArtists} {channelDetail && channelDetail?.name || channelDetailv1 && channelDetailv1.name}</h1>
                  <ScrollShadow orientation='vertical' className='w-full relative' hideScrollBar>
                    <div className='w-max my-6 flex flex-row items-start justify-start gap-5'>
                    {
                      (channelDetail && channelDetail.related && channelDetail.related.results && channelDetail.related.results.length > 0) ? channelDetail.related.results.map((artistDetail, index) => (
                        <React.Fragment key={index}>
                          <ArtistCard artist={{
                            name: artistDetail.title,
                            artistId: artistDetail.browseId,
                            thumbnails: artistDetail.thumbnails,
                            type: 'ARTIST'
                          }} />
                        </React.Fragment>
                      )) : (channelDetailv1 && channelDetailv1.similarArtists && channelDetailv1.similarArtists.length > 0) && channelDetailv1.similarArtists.map((artistDetail, index) => (
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