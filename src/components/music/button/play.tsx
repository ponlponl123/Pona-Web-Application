'use client';
import { useSocket } from '@/contexts/ponaMusicContext';
import { getSong } from '@/lib/server-side-api/internal/search';
import { Play } from '@phosphor-icons/react/dist/ssr';
import { getCookie } from 'cookies-next';
import React, { useState } from 'react';
import { toast } from 'sonner';
import { twMerge } from 'tailwind-merge';
import { useAppStore } from '@/store/coreStore';
import { useAtomValue } from 'jotai';
import { ponaCommonStateAtom } from '@/store/musicAtoms';
import { isSameVCAtom } from '@/store/uiAtoms';
import { Button } from '@/components/ui/button';

export interface PlayDetail {
  title: string;
  author: string;
  uri: string;
  resultType?: string;
  sourceName: string;
  identifier: string;
}

export interface PlaylistDetail {
  title: string;
  author: string;
  thumbnails: string[];
  tracks: PlayDetail[];
}

export interface PlayButtonClassNames {
  playpause?: string;
}

export interface PlayButtonProps {
  s?: number;
  type?: 'song' | 'playlist';
  iconSize?: number;
  className?: string;
  classNames?: PlayButtonClassNames;
  data?: any;
  detail?: any;
  children?: React.ReactNode;
  style?: React.CSSProperties;
  playPause?: boolean;
}

function PlayButton({
  s,
  type = 'song',
  iconSize = 32,
  className,
  classNames,
  data,
  detail: detailProp,
  children,
  style,
  playPause,
}: PlayButtonProps) {
  const detail = data || detailProp;
  const { socket } = useSocket();
  const language = useAppStore((state) => state.language);
  const isSameVC = useAtomValue(isSameVCAtom);
  const ponaCommonState = useAtomValue(ponaCommonStateAtom);
  const [loading, setLoading] = useState<boolean>(false);

  const addToQueue = () => {
    if (socket && socket.connected && isSameVC && detail) {
      setLoading(true);
      toast.promise(
        new Promise<void>(async (resolve, reject) => {
          const oauth_type = getCookie('LOGIN_TYPE_');
          const oauth_token = getCookie('LOGIN_');
          if (type === 'playlist') {
            const playlistDetail = detail as PlaylistDetail;
            socket.emit(
              'add-playlist',
              playlistDetail.tracks?.map((track) => track.uri) || [],
              {
                title: playlistDetail.title,
                author: playlistDetail.author,
                thumbnails: playlistDetail.thumbnails,
              },
              (error: unknown) => {
                setLoading(false);
                if (error && (error as { status?: string }).status !== 'ok') {
                  reject(error);
                } else {
                  resolve();
                }
              }
            );
          } else {
            const playDetail = detail as PlayDetail;
            let uri = playDetail.uri;
            if (!uri && playDetail.identifier) {
              uri = `https://music.youtube.com/watch?v=${playDetail.identifier}`;
            }
            socket.emit('add', uri, (error: unknown) => {
              setLoading(false);
              if (error && (error as { status?: string }).status !== 'ok') {
                reject(error);
              } else {
                resolve();
              }
            });
          }
        }),
        {
          loading: language.data.app.guilds.player.toast.add_track.loading,
          success: language.data.app.guilds.player.toast.add_track.success,
          error: language.data.app.guilds.player.toast.add_track.error,
          position: 'top-center',
        }
      );
    }
  };

  return (
    <Button
      variant='default'
      size='icon'
      className={twMerge('rounded-full shadow-lg', className)}
      style={style}
      disabled={loading || !isSameVC}
      onClick={addToQueue}
    >
      {children || <Play size={iconSize / 1.5} weight='fill' />}
    </Button>
  );
}

export default PlayButton;
