"use client"
import React from 'react'
import { Image, ScrollShadow, Spinner } from '@nextui-org/react';
import { useLanguageContext } from '@/contexts/languageContext';
import { useDiscordGuildInfo } from '@/contexts/discordGuildInfo';
import { useDiscordUserInfo } from '@/contexts/discordUserInfo';
import fetchHistory, { History } from '@/server-side-api/internal/history';
import { getCookie } from 'cookies-next';
import MusicCard from '@/components/music/card';

function Page() {
  const { userInfo } = useDiscordUserInfo();
  const { guild } = useDiscordGuildInfo();
  const { language } = useLanguageContext();
  const fetched = React.useRef(false);
  const [ tracksHistory, setTracksHistory ] = React.useState<History[] | null>(null);

  const fetchHistoryTracks = async () => {
    const accessTokenType = getCookie('LOGIN_TYPE_');
    const accessToken = getCookie('LOGIN_');
    if ( !accessTokenType || !accessToken ) return false;
    const tracks = await fetchHistory(accessTokenType, accessToken);
    if ( tracks ) setTracksHistory(tracks.tracks);
    fetched.current = true;
  }

  React.useEffect(() => {
    if ( !fetched.current )
    fetchHistoryTracks();
  }, [fetched])

  React.useEffect(() => {
    console.log('tracksHistory', tracksHistory)
  }, [tracksHistory])
  
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
          <ScrollShadow orientation='vertical' className='w-full' hideScrollBar>
            <div className='w-max my-6 flex flex-row items-start justify-start gap-5'>
              {
                tracksHistory && tracksHistory.map((track, index) => (
                  <MusicCard track={track.track} key={index} />
                )) || <h1 className='text-4xl'>{'language.data.app.guilds.player.home.no_history'}</h1>
              }
            </div>
          </ScrollShadow>
        </div>
      </>
    ) : (
      <>
        <Spinner />
      </>
    )
  )
}

export default Page