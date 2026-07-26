'use client';
import PlayButton from '@/components/music/button/play';
import { combineArtistName } from '@/components/music/searchResult/track';
import TrackList from '@/components/music/searchResult/trackList';
import { useDiscordGuildInfo } from '@/contexts/discordGuildInfo';
import { PlaylistFull as PlaylistFullv1 } from '@/types/youtube/ytmusic';
import { AlbumFull, AlbumTrack, PlaylistFull } from '@/types/youtube/ytmusic-api';
import {
  getAlbum,
  getChannel,
  getPlaylist,
  getPlaylistv1,
} from '@/lib/server-side-api/internal/search';
import {
  FlyingSaucer,
  HeartIcon,
  MusicNoteSimpleIcon,
  PlayIcon,
  ShareFat,
} from '@phosphor-icons/react/dist/ssr';
import { getCookie } from 'cookies-next';
import { motion } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import React from 'react';
import { useAppStore } from '@/store/coreStore';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';

function Page() {
  const language = useAppStore((state) => state.language);
  const { guild } = useDiscordGuildInfo();
  const [loading, setLoading] = React.useState<boolean>(true);
  const [playlist, setPlaylist] = React.useState<any>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const playlist_id = searchParams && searchParams.get('list');

  const tracks = React.useMemo(() => {
    if (!playlist) return [];
    if ('tracks' in playlist && Array.isArray(playlist.tracks)) {
      return playlist.tracks;
    }
    if ('videos' in playlist && Array.isArray(playlist.videos)) {
      return playlist.videos;
    }
    return [];
  }, [playlist]);

  const trackCount = tracks.length;

  React.useEffect(() => {
    const fetchPlaylist = async () => {
      const accessTokenType = String(getCookie('LOGIN_TYPE_'));
      const accessToken = String(getCookie('LOGIN_'));
      if (!playlist_id || !accessTokenType || !accessToken) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        let res: any = await getPlaylist(accessTokenType, accessToken, playlist_id);
        if (!res) {
          res = await getAlbum(accessTokenType, accessToken, playlist_id);
        }
        if (!res) {
          res = await getPlaylistv1(accessTokenType, accessToken, playlist_id);
        }
        setPlaylist(res || null);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPlaylist();
  }, [playlist_id]);

  if (loading) {
    return (
      <div className='flex flex-col gap-4 items-center justify-center h-full py-12'>
        <Spinner size='md' />
      </div>
    );
  }

  if (!playlist) {
    return (
      <div className='flex flex-col items-center justify-center h-full py-12 gap-4'>
        <FlyingSaucer size={48} className='text-muted-foreground' />
        <h2 className='text-xl font-bold'>
          {language.data.app.guilds.player.playlist.title}
        </h2>
      </div>
    );
  }

  const title = playlist.title || playlist.name || '';
  const authorDisplay =
    'artists' in playlist && Array.isArray(playlist.artists)
      ? combineArtistName(playlist.artists)
      : 'author' in playlist && playlist.author
        ? typeof playlist.author === 'string'
          ? playlist.author
          : playlist.author.name
        : '';

  const thumbnail =
    playlist.thumbnails && playlist.thumbnails.length > 0
      ? playlist.thumbnails[playlist.thumbnails.length - 1].url
      : '/static/backdrop.png';

  return (
    <div className='flex flex-col lg:flex-row gap-8 p-6 max-w-7xl mx-auto w-full'>
      {/* Cover / Info Header */}
      <div className='flex flex-col items-center lg:items-start gap-4 lg:w-80 flex-shrink-0'>
        <img
          src={thumbnail}
          alt={title}
          className='w-64 h-64 lg:w-80 lg:h-80 object-cover rounded-2xl shadow-xl'
        />
        <div className='flex flex-col items-center lg:items-start text-center lg:text-left gap-1 w-full'>
          <h1 className='text-2xl font-bold line-clamp-2'>{title}</h1>
          {authorDisplay && (
            <p className='text-sm text-muted-foreground'>{authorDisplay}</p>
          )}
          <p className='text-xs text-muted-foreground mt-1'>
            {trackCount} {language.data.app.guilds.player.playlist.track_count}
          </p>
        </div>

        {/* Play Action */}
        <div className='flex items-center gap-4 mt-2'>
          <PlayButton
            data={{
              title: title,
              author: authorDisplay,
              thumbnails: playlist.thumbnails?.map((t: { url: string }) => t.url) || [],
              tracks: tracks.map((track: any) => ({
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
                identifier: track.videoId || '',
                sourceName: 'youtube music',
              })),
            }}
          />
          <Button variant='outline' size='icon' className='rounded-full' disabled>
            <ShareFat weight='fill' />
          </Button>
        </div>
      </div>

      {/* Track List */}
      <div className='flex-1 flex flex-col gap-2 min-w-0'>
        {tracks.map((track: any, index: number) => (
          <TrackList
            showThumbnail={true}
            index={index + 1}
            key={track.videoId || index}
            data={
              {
                title: track?.title,
                artists: track?.artists,
                resultType: 'video' as 'song',
                thumbnails: track?.thumbnails,
                videoId: track?.videoId,
                duration_seconds: track?.duration_seconds,
              } as unknown as AlbumTrack
            }
          />
        ))}
      </div>
    </div>
  );
}

export default Page;
