"use client"
import Track from '@/components/music/searchResult/track';
import { useLanguageContext } from '@/contexts/languageContext';
import { SearchResult } from '@/interfaces/ytmusic';
import fetchHistory, { History } from '@/server-side-api/internal/history';
import { Progress } from '@nextui-org/react';
import { MusicNotesSimple } from '@phosphor-icons/react/dist/ssr';
import { getCookie } from 'cookies-next';
import React from 'react'

function Page() {
  const [ searchResult, setSearchResult ] = React.useState<History[]>([]);
  const [ loading, setLoading ] = React.useState<boolean>(true);
  const { language } = useLanguageContext()

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
        <div className='flex flex-col gap-8 w-full'>
          {searchResult.map((result, idx) => (
            <Track key={idx} data={{
              artist: {
                name: result.track.author,
                artistId: result.track.author
              },
              name: result.track.title,
              thumbnails: [
                {
                  url: result.track.proxyThumbnail || result.track.thumbnail,
                  height: 64,
                  width: 64
                }
              ],
              type: "SONG",
              videoId: result.track.identifier,
              duration: result.track.duration,
            } as SearchResult} />
          ))}
        </div>
      </div>
    </div>
  )
}

export default Page