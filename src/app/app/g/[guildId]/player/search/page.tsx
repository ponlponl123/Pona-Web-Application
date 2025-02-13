"use client"
import Track from '@/components/music/searchResult/track';
import { useLanguageContext } from '@/contexts/languageContext';
import fetchSearchResult from '@/server-side-api/internal/search';
import { SearchResult as HTTP_SearchResult } from '@/interfaces/ytmusic';
import { Progress } from '@nextui-org/react';
import { MagnifyingGlass } from '@phosphor-icons/react/dist/ssr';
import { getCookie } from 'cookies-next';
import { useSearchParams } from 'next/navigation';
import React from 'react'

function Page() {
  const [ searchResult, setSearchResult ] = React.useState<{ [key: string]: HTTP_SearchResult[] }>({});
  const [ loading, setLoading ] = React.useState<boolean>(true);
  const { language } = useLanguageContext()
  const searchParams = useSearchParams()
  const search = searchParams.get('q')

  React.useEffect(() => {
    setLoading(true);
    const letSearch = async () => {
      const accessTokenType = getCookie('LOGIN_TYPE_');
      const accessToken = getCookie('LOGIN_');
      if ( !search || typeof search !== 'string' || !accessTokenType || !accessToken ) return;
      const searchResult = await fetchSearchResult(accessTokenType, accessToken, search);
      if ( !searchResult ) return;
      const sortedResult = searchResult.result.reduce((acc: { [key: string]: HTTP_SearchResult[] }, item: HTTP_SearchResult) => {
        const type = item.type || 'OTHER';
        if (!acc[type]) acc[type] = [];
        acc[type].push(item);
        return acc;
      }, {});

      const orderedKeys = ["SONG", "ALBUM", "VIDEO", "PLAYLIST", "ARTIST"];
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
          <h3 className='text-2xl'>{search}</h3>
          {
            loading &&
            <Progress isIndeterminate aria-label="Loading..." className="w-full mt-2" size="sm" />
          }
        </div>
      </div>
      <div id='pona-search-result' className='w-full flex flex-col gap-12 mt-4'>
        {Object.keys(searchResult).map((category, index) => (
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
              {searchResult[category].map((result, idx) => (
                <Track key={idx} data={result} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Page