'use client';
import Track from '@/components/music/searchResult/track';
import { useDiscordGuildInfo } from '@/contexts/discordGuildInfo';
import { ArtistBasic, VideoDetailed } from '@/types/youtube/ytmusic-api';
import fetchHistory, { History } from '@/lib/server-side-api/internal/history';
import {
  MagnifyingGlass,
  MicrophoneStage,
  MusicNotesSimple,
} from '@phosphor-icons/react/dist/ssr';
import { getCookie } from 'cookies-next';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import React from 'react';
import { useAppStore } from '@/store/coreStore';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';

function Page() {
  const [searchResult, setSearchResult] = React.useState<History[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);
  const language = useAppStore((state) => state.language);
  const { guild } = useDiscordGuildInfo();
  const router = useRouter();

  React.useEffect(() => {
    setLoading(true);
    const letSearch = async () => {
      const accessTokenType = String(getCookie('LOGIN_TYPE_'));
      const accessToken = String(getCookie('LOGIN_'));
      if (!accessTokenType || !accessToken) return setLoading(false);
      try {
        const trackHistory = await fetchHistory(
          accessTokenType,
          accessToken,
          100
        );
        if (!trackHistory || !trackHistory.tracks) return;
        setSearchResult(trackHistory.tracks);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    letSearch();
  }, []);

  return (
    <div className='w-full max-w-screen-xl mx-auto mt-24 gap-4 flex flex-col items-center justify-center text-center pb-[16vh]'>
      <div className='w-full flex gap-5'>
        <div className='flex flex-col items-start justify-center w-full'>
          <h1 className='text-4xl font-bold flex gap-4 items-center'>
            <MusicNotesSimple size={32} weight='bold' />{' '}
            {language.data.app.guilds.player.history.title}
          </h1>
          {loading && <Spinner className='mt-2' />}
        </div>
      </div>
      <div id='pona-search-result' className='w-full flex flex-col gap-12 mt-4'>
        <div className='flex flex-col gap-4 w-full'>
          {searchResult && searchResult.length > 0 ? (
            searchResult.map((result, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 32 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: 0.012 * idx,
                  ease: 'easeInOut',
                }}
              >
                <Track
                  data={
                    {
                      artists:
                        result.track.artist ??
                        ([
                          {
                            name: result.track.author,
                          },
                        ] as ArtistBasic[]),
                      thumbnails: [
                        {
                          url:
                            result.track.thumbnail || result.track.artworkUrl,
                          height: 64,
                          width: 64,
                        },
                      ],
                      videoId: result.track.identifier,
                      title: result.track.title,
                      view: 0,
                      year: null,
                      isExplicit: false,
                      category: 'Videos',
                      resultType: 'video',
                      duration: result.track.duration,
                      duration_seconds: result.track.duration / 1000,
                    } as unknown as VideoDetailed
                  }
                />
              </motion.div>
            ))
          ) : !loading ? (
            <div className='flex flex-col items-center justify-center gap-4 py-16 rounded-3xl bg-card border'>
              <MicrophoneStage size={48} className='text-muted-foreground' />
              <h2 className='text-2xl font-bold'>
                {language.data.app.guilds.player.home.no_history.title}
              </h2>
              <p className='text-muted-foreground'>
                {language.data.app.guilds.player.home.no_history.description}
              </p>
              <Button
                variant='secondary'
                className='rounded-full'
                onClick={() => {
                  router.push(`/app/g/${guild?.id}/player/search`);
                }}
              >
                <MagnifyingGlass className='mr-2' />{' '}
                {language.data.app.guilds.player.home.no_history.get_started}
              </Button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default Page;
