"use client"
import React from 'react'
import { Button, Image, ScrollShadow, Spinner, Link } from '@nextui-org/react';
import { useLanguageContext } from '@/contexts/languageContext';
import { useDiscordGuildInfo } from '@/contexts/discordGuildInfo';
import { useDiscordUserInfo } from '@/contexts/discordUserInfo';
import fetchHistory, { History } from '@/server-side-api/internal/history';
import { getCookie } from 'cookies-next';
import { useRouter } from 'next/navigation';
import MusicCard from '@/components/music/card';
import { CraneTower, Heart, MagnifyingGlass, MicrophoneStage } from '@phosphor-icons/react/dist/ssr';

function Page() {
  const router = useRouter();
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
          <ScrollShadow orientation='vertical' className='w-full relative' hideScrollBar>
            {
              fetched.current ? (
                <div className='w-max my-6 flex flex-row items-start justify-start gap-5'>
                  {
                    tracksHistory && tracksHistory.map((track, index) => (
                      <MusicCard track={track.track} key={index} />
                    )) || <>
                      <div className='h-52'></div>
                      <div className='absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center gap-4 rounded-3xl bg-foreground/10'>
                        <MicrophoneStage size={48} />
                        <h1 className='text-3xl'>{language.data.app.guilds.player.home.no_history.title}</h1>
                        <p className='text-lg'>{language.data.app.guilds.player.home.no_history.description}</p>
                        <Button color='secondary' radius='full' onPress={()=>{router.push(`/app/g/${guild.id}/player/search`)}}><MagnifyingGlass /> {language.data.app.guilds.player.home.no_history.get_started}</Button>
                      </div>
                    </>
                  }
                </div>
              ) : <div className='w-full h-52 flex items-center justify-center'><Spinner className='m-auto' /></div>
            }
          </ScrollShadow>
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
  )
}

export default Page