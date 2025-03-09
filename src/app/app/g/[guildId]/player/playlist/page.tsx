"use client"
import { combineArtistName } from '@/components/music/searchResult/track';
import TrackList from '@/components/music/searchResult/trackList';
import { useDiscordGuildInfo } from '@/contexts/discordGuildInfo';
import { AlbumFull, AlbumTrack, PlaylistFull } from '@/interfaces/ytmusic-api';
import { getAlbum, getPlaylist } from '@/server-side-api/internal/search';
import { Button, Image, Link, Progress, Spinner } from '@nextui-org/react';
import { ShareFat } from '@phosphor-icons/react/dist/ssr';
import { getCookie } from 'cookies-next';
import { motion } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import React from 'react'

function Page() {
  const { guild } = useDiscordGuildInfo();
  const [ loading, setLoading ] = React.useState<boolean>(true);
  const [ playlist, setPlaylist ] = React.useState<AlbumFull | PlaylistFull | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams()
  const playlist_id = searchParams && searchParams.get('list')

  React.useEffect(() => {
    const letSearch = async () => {
      const accessTokenType = getCookie('LOGIN_TYPE_');
      const accessToken = getCookie('LOGIN_');
      if (typeof playlist_id !== 'string' || !accessTokenType || !accessToken) return setLoading(false);
      if (playlist_id.endsWith('abm')) {
        const albumResult = await getAlbum(accessTokenType, accessToken, playlist_id.slice(0, playlist_id.length-3));
        if (!albumResult) return setLoading(false);
        setPlaylist(albumResult);
        setLoading(false);
      } else {
        const playlistResult = await getPlaylist(accessTokenType, accessToken, playlist_id);
        if (!playlistResult) return setLoading(false);
        setPlaylist(playlistResult);
        setLoading(false);
      }
    }

    letSearch();
  }, [playlist_id, router, guild]);

  const title = (playlist as AlbumFull)?.title || (playlist as PlaylistFull)?.name;
  
  return (
    <div className='flex flex-col gap-4 items-center justify-center w-full'>
      {
        loading && <Progress isIndeterminate size='sm' className='absolute top-0 left-0 w-full' />
      }
      {
        (loading || playlist) ?
        <>
          <motion.div
            initial={{opacity: 0}}
            animate={{opacity: 1}}
            exit={{opacity: 0}}
            key={'playlist-backdrop'}
            className='absolute w-full h-screen top-0 left-0 z-[1] bg-playground-background pointer-events-none'
          >
            <Image isLoading={loading || !playlist_id} src={`/api/proxy/image?r=`+playlist?.thumbnails[0].url} alt='backdrop'
              className='w-full h-1/2 max-h-96 min-h-48 object-cover saturate-200 brightness-125 [.light_&]:brightness-200 opacity-1'
              classNames={{
                wrapper: 'opacity-40 !max-w-full blur-3xl scale-150'
              }}
            />
          </motion.div>
          <div className='w-full z-[4] p-8 flex max-lg:flex-col max-lg:gap-12 lg:gap-24 max-lg:items-center items-start lg:justify-center pb-[24vh]'>
            <div className='w-full max-w-xs lg:sticky lg:top-24 flex flex-col gap-4 justify-center items-start'>
              <h3 className='text-center w-full'>{
                (playlist as AlbumFull)?.artists ? <Link color='foreground' underline='hover' className='cursor-pointer'>{combineArtistName((playlist as AlbumFull)?.artists)}</Link>
                : (playlist as PlaylistFull)?.author
              }</h3>
              <Image isLoading={loading || !playlist_id} src={`/api/proxy/image?r=`+playlist?.thumbnails[playlist.thumbnails.length-1].url} alt={title}
                className='object-cover w-full aspect-square opacity-1'
                classNames={{
                  wrapper: 'w-full aspect-square'
                }}
              />
              <h1 className='text-center text-3xl w-full'>{title}</h1>
              {
                playlist?.type === 'ALBUM' ? <>
                  <span className='text-center text-foreground/40 w-full'>{playlist.year}</span>
                </> : <>
                </>
              }
              <div className='flex flex-row items-center justify-center gap-6 w-full'>
                <Button radius='full' isIconOnly><ShareFat weight='fill' /></Button>
              </div>
            </div>
            <div className='w-full max-w-lg flex flex-col gap-4 justify-start items-center'>
              {
                ((playlist as AlbumFull)?.tracks && (playlist as AlbumFull).tracks.length > 0) &&
                (playlist?.type === 'Album' || playlist?.type === 'Single') ?
                  (playlist as AlbumFull)?.tracks?.map((song, index) => (
                    <TrackList index={index+1} key={index} data={{
                      ...song,
                      resultType: 'need-to-fetch' as 'song'
                    }} />
                  ))
                : (playlist as PlaylistFull)?.videos?.map((video, index) => (
                    <TrackList index={index+1} key={index} data={{
                      title: video?.name,
                      artists: (video?.artist && video?.artist.length > 0) ? video?.artist.map(artist => ({name: artist.name, id: artist.artistId})) : [],
                      resultType: 'video' as 'song',
                      thumbnails: video?.thumbnails,
                      videoId: video?.videoId,
                      duration_seconds: video?.duration
                    } as AlbumTrack} />
                  ))
              }
            </div>
          </div>
        </> : <Spinner />
      }
    </div>
  )
}

export default Page