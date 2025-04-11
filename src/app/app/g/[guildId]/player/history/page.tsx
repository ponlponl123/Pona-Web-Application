"use client"
import Track from '@/components/music/searchResult/track';
import { useDiscordGuildInfo } from '@/contexts/discordGuildInfo';
import { useLanguageContext } from '@/contexts/languageContext';
import { ArtistBasic, VideoDetailed } from '@/interfaces/ytmusic-api';
import fetchHistory, { History } from '@/server-side-api/internal/history';
import { Button, Progress } from '@nextui-org/react';
import { MagnifyingGlass, MicrophoneStage, MusicNotesSimple } from '@phosphor-icons/react/dist/ssr';
import { getCookie } from 'cookies-next';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion'
import React from 'react'

function Page() {
  const [ searchResult, setSearchResult ] = React.useState<History[]>([])
  const [ loading, setLoading ] = React.useState<boolean>(true)
  const { language } = useLanguageContext()
  const { guild } = useDiscordGuildInfo()
  const router = useRouter();

  React.useEffect(() => {
    setLoading(true);
    const letSearch = async () => {
      const accessTokenType = getCookie('LOGIN_TYPE_');
      const accessToken = getCookie('LOGIN_');
      if ( !accessTokenType || !accessToken ) return;
      const trackHistory = await fetchHistory(accessTokenType, accessToken, 100);
      if ( !trackHistory || !trackHistory.tracks ) return;
      setSearchResult(trackHistory.tracks);
      setLoading(false);
    }

    letSearch();
  }, []);

  return (
    <div className='w-full max-w-screen-xl mx-auto mt-24 gap-4 flex flex-col items-center justify-center text-center pb-[16vh]'>
      <div className='w-full flex gap-5'>
        <div className='flex flex-col items-start justify-center w-full'>
          <h1 className='text-5xl flex gap-4 items-center'><MusicNotesSimple size={32} weight='bold' /> {language.data.app.guilds.player.history.title}</h1>
          {
            loading &&
            <Progress isIndeterminate aria-label="Loading..." className="w-full mt-2" size="sm" />
          }
        </div>
      </div>
      <div id='pona-search-result' className='w-full flex flex-col gap-12 mt-4'>
        <div className='flex flex-col gap-4 w-full'>
          {
            searchResult ? searchResult.map((result, idx) => (
              <motion.div key={idx}
                initial={{opacity:0,y:32}}
                animate={{opacity:1,y:0}}
                transition={{
                  delay: 0.012 * idx,
                  ease: 'easeInOut',
                  x: { type: "spring", damping: 15, stiffness: 150 },
                }}
              ><Track data={{
                artists: result.track.artist ?? [{
                  name: result.track.author,
                }] as ArtistBasic[],
                thumbnails: [
                  {
                    url: result.track.thumbnail || result.track.artworkUrl,
                    height: 64,
                    width: 64
                  }
                ],
                videoId: result.track.identifier,
                title: result.track.title,
                view: 0,
                year: null,
                isExplicit: false,
                category: "Videos",
                resultType: "video",
                duration: result.track.duration,
                duration_seconds: result.track.duration/1000
              } as unknown as VideoDetailed} /></motion.div>
            )) :
            <div className='absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center gap-4 rounded-3xl bg-foreground/10'>
              <MicrophoneStage size={48} />
              <h1 className='text-3xl'>{language.data.app.guilds.player.home.no_history.title}</h1>
              <p className='text-lg'>{language.data.app.guilds.player.home.no_history.description}</p>
              <Button color='secondary' radius='full' onPress={()=>{router.push(`/app/g/${guild?.id}/player/search`)}}><MagnifyingGlass /> {language.data.app.guilds.player.home.no_history.get_started}</Button>
            </div>
          }
        </div>
      </div>
    </div>
  )
}

export default Page