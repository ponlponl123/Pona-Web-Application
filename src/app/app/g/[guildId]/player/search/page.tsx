"use client"
import React from 'react'
import Track, { combineArtistName } from '@/components/music/searchResult/track';
import { useLanguageContext } from '@/contexts/languageContext';
import { useDiscordGuildInfo } from '@/contexts/discordGuildInfo';
import { useGlobalContext } from '@/contexts/globalContext';
import fetchSearchResult from '@/server-side-api/internal/search';
import { SearchResult as HTTP_SearchResult, TopResults } from '@/interfaces/ytmusic-api';
import { Button, Image, Link, Progress, Tooltip } from '@nextui-org/react';
import { FlyingSaucer, Heart, MagnifyingGlass, ShareFat } from '@phosphor-icons/react/dist/ssr';
import { useRouter, useSearchParams } from 'next/navigation';
import { getCookie } from 'cookies-next';
import PlayButton from '@/components/music/play';

function Page() {
  const router = useRouter();
  const { guild } = useDiscordGuildInfo();
  const [ searchResult, setSearchResult ] = React.useState<{ [key: string]: HTTP_SearchResult[] } | null>(null);
  const [ loading, setLoading ] = React.useState<boolean>(true);
  const { ponaCommonState } = useGlobalContext()
  const { language } = useLanguageContext()
  const searchParams = useSearchParams()
  const search = searchParams ? searchParams.get('q') : ""

  React.useEffect(() => {
    setLoading(true);
    const letSearch = async () => {
      const accessTokenType = getCookie('LOGIN_TYPE_');
      const accessToken = getCookie('LOGIN_');
      if ( !search || typeof search !== 'string' || !accessTokenType || !accessToken ) return;
      const searchResult = await fetchSearchResult(accessTokenType, accessToken, search);
      if ( !searchResult ) {
        setSearchResult(null);
        setLoading(false);
        return;
      }
      const sortedResult = searchResult.result.reduce((acc: { [key: string]: HTTP_SearchResult[] }, item: HTTP_SearchResult) => {
        const type = item.category || 'OTHER';
        if (!acc[type]) acc[type] = [];
        acc[type].push(item);
        return acc;
      }, {});

      const orderedKeys = ["Top result", "Songs", "Videos", "Albums", "Community playlists", "Artists", "Podcasts", "Episodes", "Profiles"];
      const orderedResult = orderedKeys.reduce((acc: { [key: string]: HTTP_SearchResult[] }, key) => {
        if (sortedResult[key]) {
          acc[key] = sortedResult[key];
        }
        return acc;
      }, {});

      setSearchResult(orderedResult);
      setLoading(false);
    }

    letSearch();
  }, [search]);

  return (
    <div className='w-full max-w-screen-md mx-auto mt-24 gap-4 flex flex-col items-center justify-center text-center pb-[16vh]'>
      <div className='w-full flex gap-5'>
        <div className='flex flex-col items-start justify-center w-full'>
          <h1 className='text-5xl flex gap-4 items-center'><MagnifyingGlass size={32} weight='bold' /> {language.data.app.guilds.player.search.result}</h1>
          <h3 className='text-2xl text-start'>{search}</h3>
          {
            loading &&
            <Progress isIndeterminate aria-label="Loading..." className="w-full mt-2" size="sm" />
          }
        </div>
      </div>
      <div id='pona-search-result' className='w-full flex flex-col gap-12 mt-4'>
        {
          (!loading && searchResult) ? Object.keys(searchResult).map((category, index) => 
            !(
              category === 'Top result' &&
              (searchResult['Top result'][0] as unknown as TopResults).resultType === 'episode' as TopResults['resultType']
            ) &&
          (
          <div key={index} className='w-full'>
            <h2 className='text-3xl text-start flex flex-row gap-4 items-center my-4'>
              <span className='min-w-max'>
              {
                language.data.app.guilds.player.search.category[category as keyof typeof language.data.app.guilds.player.search.category] ? 
                language.data.app.guilds.player.search.category[category as keyof typeof language.data.app.guilds.player.search.category] :
                category
              }
              </span>
              <div className='w-full h-[2px] bg-foreground/10'></div>
            </h2>
            <div className='flex flex-col gap-4 w-full'>
              {
                (category === 'Top result') ? (() => {
                  const track = searchResult['Top result'][0] as unknown as TopResults;
                  const trackTitle = (
                    track.resultType === 'song' ||
                    track.resultType === 'video' ||
                    track.resultType === 'album'
                  ) ? track.title :
                  (
                    track.resultType === 'artist'
                  ) ? track.artists[0].name : '';
                  return (
                    <>
                      <div className='flex gap-6 p-6 max-md:p-4 bg-foreground/5 rounded-3xl relative overflow-hidden'>
                        <Image src={`/api/proxy/image?r=${track.thumbnails[0].url}`} alt='backdrop' classNames={{
                          wrapper: 'w-full h-full absolute !max-w-none top-0 left-0 blur-3xl scale-125 saturate-150 brightness-75'
                        }} className='w-full h-full object-cover' />
                        <div className='w-28 h-28 md:min-w-28 md:min-h-28 max-md:h-16 max-md:w-16 max-md:min-w-16 max-md:min-h-16 relative overflow-hidden flex-[0 1 auto]'>
                          <Image src={`/api/proxy/image?r=${track.thumbnails[track.thumbnails.length-1].url}`} alt={trackTitle} classNames={{
                            wrapper: 'max-w-none'
                          }} className='w-28 h-28 max-md:w-16 max-md:h-16 object-cover select-none' />
                          {
                            (
                              (track.resultType === 'song' ||
                              track.resultType === 'video') && track?.videoId
                            ) ?
                              <PlayButton playPause={ponaCommonState?.current?.identifier === track.videoId} className={
                                'rounded-xl absolute top-0 left-0 w-full h-full z-10 ' + ` ${ponaCommonState?.current?.identifier === track.videoId?'':'group-hover:opacity-100 opacity-0'}`
                              } iconSize={12} classNames={{
                                playpause: 'rounded-xl text-sm absolute top-0 left-0 w-full h-full z-10 bg-black/32'
                              }} detail={{
                                author: combineArtistName(track?.artists),
                                identifier: track?.videoId,
                                sourceName: 'youtube music',
                                resultType: track?.resultType,
                                title: trackTitle,
                                uri: `https://music.youtube.com/watch?v=${track?.videoId}`
                              }} />
                            : ( track.resultType === 'album' && track?.browseId ) ?
                              <Link className='cursor-pointer absolute top-0 left-0 w-full h-full z-10' onPress={()=>{router.push(`/app/g/${guild?.id}/player/playlist?list=${track?.browseId}abm`)}} />
                            : ( track.resultType === 'artist' && track?.artists[0].id ) &&
                            <Link className='cursor-pointer absolute top-0 left-0 w-full h-full z-10' onPress={()=>{router.push(`/app/g/${guild?.id}/player/artist?c=${track?.artists[0].id}`)}} />
                          }
                        </div>
                        <div className='flex flex-col gap-1 items-start justify-center z-10 w-0 min-w-0 flex-1'>
                          {
                            track.resultType === 'song' ||
                            track.resultType === 'video' ?
                            <Tooltip content='More info'>
                              <h1 className='max-w-full cursor-pointer text-start text-foreground text-2xl overflow-hidden overflow-ellipsis whitespace-nowrap'>{trackTitle}</h1>
                            </Tooltip> :
                            <h1 className='max-w-full cursor-pointer text-start text-foreground text-2xl overflow-hidden overflow-ellipsis whitespace-nowrap'>{trackTitle}</h1>
                          }
                          <div className='flex flex-row w-[calc(100%_-_2rem)] gap-1 items-center justify-start z-10 min-w-0'>
                            <span className='flex-initial'>
                            {
                              language.data.app.guilds.player.search.category[(track.resultType[0].toUpperCase()+track.resultType.slice(1,track.resultType.length))+'s' as keyof typeof language.data.app.guilds.player.search.category] ? 
                              language.data.app.guilds.player.search.category[(track.resultType[0].toUpperCase()+track.resultType.slice(1,track.resultType.length))+'s' as keyof typeof language.data.app.guilds.player.search.category] :
                              track.resultType.toLocaleUpperCase()
                            }
                            </span>
                            {
                              track.resultType !== 'artist' && <> · <span className='max-w-full text-start text-foreground overflow-hidden overflow-ellipsis whitespace-nowrap flex-initial'>{combineArtistName(track.artists, true, router)}</span></>
                            }
                            {
                              (track.resultType === 'song' || track.resultType === 'video') && <> · <span className='flex-initial'>{track.duration}</span></>
                            }
                            {
                              track.resultType === 'artist' && <> · <span className='flex-initial'>{track.subscribers}</span></>
                            }
                          </div>
                          <div className='flex flex-row gap-3 items-center justify-start w-full mt-1'>
                            {
                              (
                                (track.resultType === 'song' ||
                                track.resultType === 'video') && track?.videoId
                              ) &&
                              <>
                                <PlayButton playPause={ponaCommonState?.current?.identifier === track.videoId} className={
                                  'rounded-full relative !opacity-100 p-2 w-max'
                                } iconSize={12} classNames={{
                                  playpause: 'relative !opacity-100 p-2 w-max bg-default/40 !h-10'
                                }} detail={{
                                  author: combineArtistName(track?.artists),
                                  identifier: track?.videoId,
                                  sourceName: 'youtube music',
                                  resultType: track?.resultType,
                                  title: trackTitle,
                                  uri: `https://music.youtube.com/watch?v=${track?.videoId}`
                                }} />
                                <Button color='default' className='bg-opacity-40' radius='full' isIconOnly><Heart weight='bold' /></Button>
                                <Button color='default' className='bg-opacity-40' radius='full' isIconOnly><ShareFat weight='fill' /></Button>
                              </>
                            }
                          </div>
                        </div>
                      </div>
                    </>
                  )
                 })() : searchResult[category].map((result, idx) => (
                  <Track key={idx} data={result} />
                ))
              }
            </div>
          </div>
          )) : ( !loading && !searchResult ) &&
          <div className='w-full min-h-[36vh] flex flex-col gap-4 items-center justify-center'>
            <FlyingSaucer weight='fill' size={74} />
            <h1 className='text-lg tracking-wider'>{language.data.app.guilds.player.search.notfound}</h1>
            <h4 className='text-sm tracking-wider'>＼（〇_ｏ）／</h4>
          </div>
        }
      </div>
    </div>
  )
}

export default Page