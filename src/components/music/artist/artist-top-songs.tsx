'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Track from '@/components/music/searchResult/track';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/store/coreStore';
import { ArtistFull as ArtistFullv1 } from '@/types/youtube/ytmusic';
import { ArtistFull, SongDetailed } from '@/types/youtube/ytmusic-api';

export interface ArtistTopSongsProps {
  channelDetail: ArtistFull | null | false;
  channelDetailv1: ArtistFullv1 | null | false;
  channelId: string;
  artistName: string;
}

export function ArtistTopSongs({
  channelDetail,
  channelDetailv1,
  channelId,
  artistName,
}: ArtistTopSongsProps) {
  const router = useRouter();
  const language = useAppStore((state) => state.language);

  const hasTopSongs =
    (channelDetailv1 &&
      channelDetailv1.topSongs &&
      channelDetailv1.topSongs.length > 0) ||
    (channelDetail &&
      channelDetail.songs &&
      channelDetail.songs.results &&
      channelDetail.songs.results.length > 0);

  if (!hasTopSongs) return null;

  return (
    <div className='w-full flex flex-row flex-wrap gap-8'>
      <section className='c section'>
        <h1 className='w-full text-start text-4xl font-bold'>
          {language.data.app.guilds.player.artist.category.topSongs}
        </h1>
        {channelDetail &&
          channelDetail.songs &&
          channelDetail.songs.results &&
          channelDetail.songs.results.length > 0
          ? channelDetail.songs.results.map((songDetail, index) => (
            <React.Fragment key={index}>
              <Track
                result={
                  {
                    album: songDetail.album,
                    artists: songDetail.artists,
                    category: 'Songs',
                    duration: null,
                    duration_seconds: null,
                    isExplicit: songDetail.isExplicit,
                    resultType: 'song',
                    thumbnails: songDetail.thumbnails,
                    title: songDetail.title,
                    videoId: songDetail.videoId,
                    videoType: songDetail.videoType,
                    year: null,
                  } as unknown as SongDetailed
                }
              />
            </React.Fragment>
          ))
          : channelDetailv1 &&
          channelDetailv1.topSongs &&
          channelDetailv1.topSongs.length > 0 &&
          channelDetailv1.topSongs.map((songDetail, index) => (
            <React.Fragment key={index}>
              <Track
                result={
                  {
                    album: songDetail.album,
                    artists: [
                      {
                        id: songDetail.artist?.artistId || channelId,
                        name: songDetail.artist?.name || artistName,
                      },
                    ],
                    category: 'Songs',
                    duration_seconds: null,
                    isExplicit: false,
                    resultType: 'song',
                    thumbnails: songDetail.thumbnails,
                    title: songDetail.name || 'Track',
                    videoId: songDetail.videoId,
                    videoType: songDetail.type,
                    year: null,
                  } as unknown as SongDetailed
                }
              />
            </React.Fragment>
          ))}
        <div className='flex gap-4 flex-wrap items-center justify-start w-full p-1 -mt-2'>
          {channelDetail &&
            channelDetail.songs &&
            channelDetail.songs.browseId &&
            (() => {
              const href =
                window.location.pathname.split('/player')[0] +
                '/player/playlist?list=' +
                channelDetail.songs.browseId;
              return (
                <Button
                  onClick={() => {
                    router.push(href);
                  }}
                  variant='outline'
                  size='sm'
                  className='font-bold rounded-full'
                >
                  {language.data.app.guilds.player.artist.showmore}
                </Button>
              );
            })()}
        </div>
      </section>
    </div>
  );
}

export default ArtistTopSongs;
