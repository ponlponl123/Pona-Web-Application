'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCookie } from 'cookies-next';
import { motion } from 'framer-motion';
import {
  MagnifyingGlass,
  MicrophoneStage,
  MusicNotesSimple,
} from '@phosphor-icons/react/dist/ssr';

import Track from '@/components/music/searchResult/track';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { useDiscordGuildInfo } from '@/contexts/discordGuildInfo';
import { useAppStore } from '@/store/coreStore';
import { ArtistBasic, VideoDetailed } from '@/types/youtube/ytmusic-api';
import fetchHistory, { History } from '@/lib/server-side-api/internal/history';

function Page() {
  const [searchResult, setSearchResult] = useState<History[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const language = useAppStore((state) => state.language);
  const { guild } = useDiscordGuildInfo();
  const router = useRouter();

  useEffect(() => {
    queueMicrotask(() => setLoading(true));
    const letSearch = async () => {
      const accessTokenType = String(getCookie('LOGIN_TYPE_'));
      const accessToken = String(getCookie('LOGIN_'));
      if (!accessTokenType || !accessToken) {
        setLoading(false);
        return;
      }
      const trackHistory = await fetchHistory(
        accessTokenType,
        accessToken,
        100
      );
      if (trackHistory && typeof trackHistory === 'object' && 'tracks' in trackHistory) {
        setSearchResult(trackHistory.tracks);
      }
      setLoading(false);
    };

    letSearch();
  }, []);

  return (
    <div className='w-full max-w-7xl mx-auto mt-24 gap-4 flex flex-col items-center justify-center text-center pb-[16vh]'>
      <div className='w-full flex gap-5'>
        <div className='flex flex-col items-start justify-center w-full'>
          <h1 className='text-5xl flex gap-4 items-center font-bold'>
            <MusicNotesSimple size={32} weight='bold' />{' '}
            {language.data.app.guilds.player.history.title}
          </h1>
          {loading && (
            <div className='w-full py-4 flex justify-center'>
              <Spinner className='size-8' />
            </div>
          )}
        </div>
      </div>
      <div id='pona-search-result' className='w-full flex flex-col gap-12 mt-4'>
        <div className='flex flex-col gap-4 w-full'>
          {searchResult && searchResult.length > 0 ? (
            searchResult.map((result, idx) => {
              const videoData: VideoDetailed = {
                artists:
                  result.track.artist ??
                  ([
                    {
                      id: null,
                      name: result.track.author || 'Artist',
                    },
                  ] as ArtistBasic[]),
                thumbnails: [
                  {
                    url: result.track.thumbnail || result.track.artworkUrl || '',
                    height: 64,
                    width: 64,
                  },
                ],
                videoId: result.track.identifier || '',
                title: result.track.title || '',
                view: '0',
                videoType: 'MUSIC_VIDEO_TYPE_ATV',
                category: 'Videos',
                resultType: 'video',
                duration: result.track.duration ? `${Math.floor(result.track.duration / 1000)}s` : '',
                duration_seconds: result.track.duration ? result.track.duration / 1000 : 0,
                year: null,
                isExplicit: false,
              };

              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 32 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: 0.012 * idx,
                    ease: 'easeInOut',
                    x: { type: 'spring', damping: 15, stiffness: 150 },
                  }}
                >
                  <Track result={videoData} />
                </motion.div>
              );
            })
          ) : (
            !loading && (
              <div className='w-full py-16 flex flex-col items-center justify-center gap-4 rounded-3xl bg-muted/40 border border-border'>
                <MicrophoneStage size={48} />
                <h1 className='text-3xl font-bold'>
                  {language.data.app.guilds.player.home.no_history.title}
                </h1>
                <p className='text-lg text-muted-foreground'>
                  {language.data.app.guilds.player.home.no_history.description}
                </p>
                <Button
                  variant='secondary'
                  className='rounded-full gap-2 mt-2'
                  onClick={() => {
                    if (guild?.id) router.push(`/app/g/${guild.id}/player/search`);
                  }}
                >
                  <MagnifyingGlass />{' '}
                  {language.data.app.guilds.player.home.no_history.get_started}
                </Button>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}

export default Page;
