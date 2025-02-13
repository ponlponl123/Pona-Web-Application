"use client"
import { useDiscordGuildInfo } from '@/contexts/discordGuildInfo';
import { AlbumFull, PlaylistFull } from '@/interfaces/ytmusic';
import { getAlbum, getPlaylist } from '@/server-side-api/internal/search';
 import { Image, Spinner } from '@nextui-org/react';
import { getCookie } from 'cookies-next';
import { useRouter, useSearchParams } from 'next/navigation';
import React from 'react'

function Page() {
  const { guild } = useDiscordGuildInfo();
  const [ loading, setLoading ] = React.useState<boolean>(true);
  const [ playlist, setPlaylist ] = React.useState<AlbumFull | PlaylistFull | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams()
  const playlist_id = searchParams.get('list')

  React.useEffect(() => {
    if (!playlist_id) {
      router.push(`/app/g/${guild?.id}/player`);
      return;
    }

    setLoading(true);
    const letSearch = async () => {
      const accessTokenType = getCookie('LOGIN_TYPE_');
      const accessToken = getCookie('LOGIN_');
      if (typeof playlist_id !== 'string' || !accessTokenType || !accessToken) return setLoading(false);
      const playlistResult = await getPlaylist(accessTokenType, accessToken, playlist_id);
      let result;
      if (!playlistResult) {
        const albumResult = await getAlbum(accessTokenType, accessToken, playlist_id);
        if (!albumResult) return setLoading(false);
        result = albumResult;
      } else {
        result = playlistResult;
      }

      setPlaylist(result);
      setLoading(false);
    }

    letSearch();
  }, [playlist_id, router, guild]);

  React.useEffect(() => {
    if (!playlist && !loading) {
      router.push(`/app/g/${guild?.id}/player`);
    }
  }, [playlist, loading, router, guild]);

  return (
    <div className='flex flex-col gap-4 items-center justify-center w-full'>
      {
        loading ?
        <>
          <div>
            <Image src={playlist?.thumbnails[0].url} alt='backdrop' />
          </div>
        </> : <Spinner />
      }
    </div>
  )
}

export default Page