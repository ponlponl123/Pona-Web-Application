'use client';

import React from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { getCookie } from 'cookies-next';
import { motion, type Variants, useReducedMotion } from 'framer-motion';
import {
  FlyingSaucerIcon,
  MusicNoteSimpleIcon,
  PlayIcon,
} from '@phosphor-icons/react/dist/ssr';

import PlayButton from '@/components/music/button/play';
import { combineArtistName } from '@/components/music/searchResult/track';
import TrackList from '@/components/music/searchResult/trackList';
import { useDiscordGuildInfo } from '@/contexts/discordGuildInfo';
import { useAppStore } from '@/store/coreStore';
import { PlaylistFull as PlaylistFullv1 } from '@/types/youtube/ytmusic';
import { AlbumFull, AlbumTrack, PlaylistFull } from '@/types/youtube/ytmusic-api';
import { PlaylistSkeleton } from '@/components/music/skeleton';
import {
  getAlbum,
  getChannel,
  getPlaylist,
  getPlaylistv1,
} from '@/lib/server-side-api/internal/search';

const pageContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.06 } },
};

const pageItem: Variants = {
  hidden: { opacity: 0, filter: 'blur(2px)' },
  visible: {
    opacity: 1,
    filter: 'blur(0px)',
    transition: { duration: 0.36, ease: 'easeOut' },
  },
};

function Page() {
  const language = useAppStore((state) => state.language);
  const prefersReducedMotion = useReducedMotion();
  const { guild } = useDiscordGuildInfo();
  const [loading, setLoading] = React.useState<boolean>(true);
  const [playlist, setPlaylist] = React.useState<
    AlbumFull | PlaylistFull | PlaylistFullv1 | null
  >(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const playlist_id = searchParams && searchParams.get('list');

  const [prevPlaylistId, setPrevPlaylistId] = React.useState(playlist_id);
  if (playlist_id !== prevPlaylistId) {
    setPrevPlaylistId(playlist_id);
    setLoading(true);
    setPlaylist(null);
  }

  const trackCount =
    (playlist &&
      (typeof playlist === 'object' &&
        'tracks' in playlist &&
        Array.isArray(playlist.tracks)
        ? playlist.tracks.length
        : 0)) ||
    0;

  // const durationHumanReadable =
  //   playlist && 'duration' in playlist && playlist.duration
  //     ? playlist.duration
  //     : null;

  const year = playlist && 'year' in playlist ? playlist.year : null;

  const tracks =
    playlist && 'tracks' in playlist && Array.isArray(playlist.tracks)
      ? playlist.tracks
      : playlist && 'videos' in playlist && Array.isArray(playlist.videos)
        ? playlist.videos
        : [];

  React.useEffect(() => {
    const fetchPlaylist = async (
      accessTokenType: string,
      accessToken: string,
      playlistId: string
    ) => {
      const playlistResult = await getPlaylist(
        accessTokenType,
        accessToken,
        playlistId
      );
      console.log('playlistResult', playlistResult);
      if (playlistResult) return playlistResult;
      const playlistV1Result = await getPlaylistv1(
        accessTokenType,
        accessToken,
        playlistId
      );
      if (playlistV1Result) return playlistV1Result;
      return null;
    };
    const letSearch = async () => {
      const accessTokenType = String(getCookie('LOGIN_TYPE_'));
      const accessToken = String(getCookie('LOGIN_'));
      if (
        typeof playlist_id !== 'string' ||
        !accessTokenType ||
        accessTokenType === 'undefined' ||
        !accessToken ||
        accessToken === 'undefined'
      )
        return setLoading(false);
      setLoading(true);
      setPlaylist(null);
      const pl_query = playlist_id.endsWith('abm')
        ? playlist_id.slice(0, playlist_id.length - 3)
        : playlist_id;
      let pl_result = null;
      if (playlist_id.endsWith('abm')) {
        const albumResult = await getAlbum(
          accessTokenType,
          accessToken,
          pl_query
        );
        if (albumResult) pl_result = albumResult;
      }
      if (!pl_result) {
        const playlistResult = await fetchPlaylist(
          accessTokenType,
          accessToken,
          pl_query
        );
        if (playlistResult) pl_result = playlistResult;
      }
      if (!pl_result) {
        const albumFallback = await getAlbum(
          accessTokenType,
          accessToken,
          pl_query
        );
        if (albumFallback) pl_result = albumFallback;
      }
      if (!pl_result) {
        const channel = await getChannel(
          accessTokenType,
          accessToken,
          pl_query
        );
        if (channel && (channel.user || channel.v1 || channel.v2))
          return router.replace(
            window.location.pathname.split('/player')[0] +
            '/player/c?c=' +
            pl_query
          );
      }
      setPlaylist(pl_result);
      setLoading(false);
    };

    letSearch();
  }, [playlist_id, router, guild]);

  const title =
    (playlist as AlbumFull)?.title || (playlist as PlaylistFull)?.name;

  const authorDisplay = React.useMemo(() => {
    const p = playlist as Record<string, unknown> | null;
    if (!p) return '';
    // Album case handled elsewhere
    if (typeof p.author === 'string') return p.author;
    if (p.author && typeof p.author === 'object') return (p.author as Record<string, unknown>).name as string ?? '';
    if (p.artist && typeof p.artist === 'object') return (p.artist as Record<string, unknown>).name as string ?? '';
    return '';
  }, [playlist]);

  return (
    <div className='flex flex-col gap-4 items-center justify-center w-full'>
      {loading ? (
        <PlaylistSkeleton />
      ) : playlist ? (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ delay: 1 }}
            key={'playlist-backdrop'}
            className='absolute w-full h-[64vh] top-0 left-0 z-1 bg-playground-background pointer-events-none overflow-hidden'
          >
            <div className='absolute top-0 left-0 w-full h-full bg-[hsl(var(--pona-app-background))] -z-10 scale-200' />
            {playlist?.thumbnails && playlist.thumbnails.length > 0 && (
              <Image
                src={
                  `/api/proxy/image?r=` +
                  encodeURIComponent(playlist.thumbnails[playlist.thumbnails.length - 1].url) + "&s=512&blur=16&saturation=96&contrast=12"
                }
                alt='backdrop'
                fill
                unoptimized
                priority
                sizes='100vw'
                className='w-full h-[64vh] object-cover saturate-200 brightness-125 in-[.light]:brightness-200 opacity-40 max-w-full! mask-b-from-0% pointer-events-none select-none'
              />
            )}
            <div className='absolute top-0 left-0 w-full h-full bg-linear-to-b from-transparent to-[hsl(var(--pona-app-background))] z-10' />
          </motion.div>
          <motion.div
            variants={prefersReducedMotion ? undefined : pageContainer}
            initial={prefersReducedMotion ? false : 'hidden'}
            animate='visible'
            className='w-full z-4 p-8 flex max-lg:flex-col max-lg:gap-12 lg:gap-24 max-lg:items-center items-start lg:justify-center pb-[24vh]'
          >
            {playlist?.thumbnails && playlist.thumbnails.length > 0 && (
              <motion.div variants={prefersReducedMotion ? undefined : pageItem} className='w-full max-w-xs lg:sticky lg:top-24 flex flex-col gap-2 justify-center items-start'>
                <h3 className='text-center w-full'>
                  {(playlist as AlbumFull)?.artists ? (
                    <span className='cursor-pointer text-foreground hover:underline font-medium'>
                      {combineArtistName((playlist as AlbumFull)?.artists)}
                    </span>
                  ) : (
                    <span className='text-foreground/40'>
                      {language.data.app.guilds.player.playlist.by}{' '}
                      {authorDisplay}
                    </span>
                  )}
                </h3>
                <Image
                  src={
                    `/api/proxy/image?r=` +
                    encodeURIComponent(playlist.thumbnails[playlist.thumbnails.length - 1].url)
                  }
                  alt={title || ''}
                  width={320}
                  height={320}
                  unoptimized
                  className='object-cover w-full aspect-square rounded-3xl shadow-lg pointer-events-none select-none'
                />
                <h1 className='max-lg:text-center text-3xl w-full mt-3 font-bold'>{title}</h1>
                {year && (
                  <div className='flex items-center max-lg:justify-center max-lg:mx-auto gap-1 -mt-2 mb-2'>
                    <span className='text-foreground/40 whitespace-nowrap'>
                      {language.data.app.guilds.player.playlist.created}
                    </span>
                    <span className='text-center text-foreground/40 w-full'>
                      {year}
                    </span>
                  </div>
                )}
                {trackCount > 0 && (
                  <div className='flex items-center max-lg:justify-center max-lg:mx-auto gap-1 px-3 py-1 bg-foreground/10 rounded-full '>
                    <MusicNoteSimpleIcon weight='bold' />
                    <span className='text-center text-foreground/40 w-full'>
                      {language.data.app.guilds.player.playlist.track_count.replace(
                        '[count]',
                        trackCount.toString()
                      )}
                    </span>
                  </div>
                )}
                <div className='flex flex-row items-center max-lg:justify-center gap-6 mt-1.5 w-full h-max'>
                  <PlayButton
                    type='playlist'
                    detail={{
                      title: title || '',
                      author: authorDisplay,
                      thumbnails:
                        playlist?.thumbnails.map((t) => t.url) || [],
                      tracks: tracks.map((track) => ({
                        title: track && 'title' in track ? track.title : '',
                        author:
                          track && 'artists' in track
                            ? combineArtistName(track.artists)
                            : authorDisplay,
                        resultType:
                          track && 'resultType' in track
                            ? track.resultType
                            : 'video',
                        uri:
                          track && 'videoId' in track
                            ? `https://music.youtube.com/watch?v=${track.videoId}`
                            : '',
                        identifier: track.videoId,
                        sourceName: 'youtube music',
                      })),
                    }}
                    className='relative top-[unset] left-[unset] opacity-100 rounded-full bg-primary w-max h-max p-5'

                  >
                    <PlayIcon weight='fill' size={20} />
                  </PlayButton>
                </div>
              </motion.div>
            )}

            <motion.div
              variants={prefersReducedMotion ? undefined : pageContainer}
              className={`w-full ${playlist?.thumbnails && playlist.thumbnails.length > 0 ? 'max-w-lg' : 'max-w-7xl'} flex flex-col gap-4 justify-start items-center`}
            >
              {playlist &&
                (playlist as PlaylistFull)?.tracks &&
                (playlist as PlaylistFull).tracks.length > 0
                ? (playlist as PlaylistFull)?.tracks?.map((video, index: number) => (
                  <motion.div variants={!prefersReducedMotion && index < 12 ? pageItem : undefined} key={index} className='w-full'>
                    <TrackList
                      showThumbnail={true}
                      index={index + 1}
                      data={
                      {
                        title: video?.title,
                        artists: video.artists,
                        resultType: 'video' as 'song',
                        thumbnails: video?.thumbnails,
                        videoId: video?.videoId,
                        duration_seconds: video?.duration_seconds,
                      } as unknown as AlbumTrack
                      }
                    />
                  </motion.div>
                ))
                : playlist &&
                  (playlist as AlbumFull)?.tracks &&
                  (playlist as AlbumFull).tracks.length > 0 &&
                  (playlist?.type === 'Album' ||
                    playlist?.type === 'Single' ||
                    playlist?.type === 'EP')
                  ? (playlist as AlbumFull)?.tracks?.map((song, index: number) => (
                    <motion.div variants={!prefersReducedMotion && index < 12 ? pageItem : undefined} key={index} className='w-full'>
                      <TrackList
                        index={index + 1}
                        data={{
                        ...song,
                        resultType: 'need-to-fetch' as 'song',
                        }}
                      />
                    </motion.div>
                  ))
                  : (playlist as PlaylistFullv1)?.videos?.map(
                    (video, index: number) => (
                      <motion.div variants={!prefersReducedMotion && index < 12 ? pageItem : undefined} key={index} className='w-full'>
                        <TrackList
                          index={index + 1}
                          data={
                          {
                            title: video?.name,
                            artists: [
                              {
                                id: video.artist.artistId,
                                name: video.artist.name,
                              },
                            ],
                            resultType: 'video' as 'song',
                            thumbnails: video?.thumbnails,
                            videoId: video?.videoId,
                            duration_seconds: video?.duration,
                          } as AlbumTrack
                          }
                        />
                      </motion.div>
                    )
                  )}
            </motion.div>
          </motion.div>
        </>
      ) : (
        !loading &&
        !playlist && (
          <div className='w-full min-h-[36vh] flex flex-col gap-4 items-center justify-center'>
            <FlyingSaucerIcon weight='fill' size={74} />
            <h1 className='text-lg tracking-wider'>
              {language.data.app.guilds.player.search.notfound}
            </h1>
            <h4 className='text-sm tracking-wider'>＼（〇_ｏ）／</h4>
          </div>
        )
      )}
    </div>
  );
}

export default Page;
