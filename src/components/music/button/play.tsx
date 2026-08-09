'use client';
import { useState } from 'react';
import { PlayIcon, SpinnerIcon } from '@phosphor-icons/react/dist/ssr';
import { getCookie } from 'cookies-next';
import { toast } from 'sonner';
import { twMerge } from 'tailwind-merge';
import { useAtomValue } from 'jotai';

import { useSocket } from '@/contexts/ponaMusicContext';
import { ponaCommonStateAtom } from '@/store/musicAtoms';
import { isSameVCAtom } from '@/store/uiAtoms';
import { useAppStore } from '@/store/coreStore';
import { getSong } from '@/lib/server-side-api/internal/search';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import PlayPauseButton from './playPause';

import {
  PlayButtonClassNames,
  PlayButtonProps,
  PlayDetail,
  PlaylistDetail,
} from '@/types/ponaPlayer';
export type { PlayButtonClassNames, PlayButtonProps, PlayDetail, PlaylistDetail };



function PlayButton<T extends 'song' | 'playlist' = 'song'>({
  s,
  type = 'song' as T,
  iconSize = 32,
  className,
  classNames,
  detail,
  children,
  style,
  playPause,
}: PlayButtonProps<T>) {
  const { socket } = useSocket();
  const language = useAppStore((state) => state.language);
  const isSameVC = useAtomValue(isSameVCAtom);
  const ponaCommonState = useAtomValue(ponaCommonStateAtom);

  const [loading, setLoading] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isDuplicateModalOpen, setIsDuplicateModalOpen] = useState<boolean>(false);

  const addToQueue = () => {
    if (socket && socket.connected && isSameVC) {
      setLoading(true);
      toast.promise(
        new Promise<void>(async (resolve, reject) => {
          const oauth_type = getCookie('LOGIN_TYPE_');
          const oauth_token = getCookie('LOGIN_');
          if (type === 'playlist') {
            const playlistDetail = detail as PlaylistDetail;
            socket.emit(
              'add-playlist',
              playlistDetail.tracks.map((track) => track.uri),
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
            if (playDetail.resultType === 'need-to-fetch') {
              if (oauth_type && oauth_token) {
                const result = await getSong(
                  oauth_type.toString(),
                  oauth_token.toString(),
                  playDetail.title,
                  playDetail.author,
                  playDetail.identifier
                );
                if (result) {
                  uri = `https://music.youtube.com/watch?v=${result.videoId}`;
                }
              }
            }
            socket.emit('add', uri, playDetail.sourceName, (error: unknown) => {
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
          loading: language.data.app.guilds.player.toast.add_track.loading
            .replace('[track_name]', detail.title.slice(0, 32))
            .replace('[artist]', detail.author.slice(0, 32)),
          success: language.data.app.guilds.player.toast.add_track.success
            .replace('[track_name]', detail.title.slice(0, 32))
            .replace('[artist]', detail.author.slice(0, 32)),
          error: language.data.app.guilds.player.toast.add_track.error,
        }
      );
    }
  };

  return (
    <>
      {playPause ? (
        <PlayPauseButton
          className={classNames?.playpause}
          iconSize={iconSize || 32}
        />
      ) : (
        <Button
          variant='ghost'
          size='icon'
          disabled={loading}
          className={twMerge(
            'absolute top-0 left-0 w-full h-full z-10 rounded-xl group-hover:opacity-100 opacity-0 transition-opacity bg-black/40 text-white hover:bg-black/60 cursor-pointer ' +
            className,
            classNames?.playpause
          )}
          onClick={() => {
            if (socket && socket.connected && isSameVC) {
              const isPlaylist =
                'tracks' in detail &&
                Array.isArray((detail as PlaylistDetail).tracks);

              let hasDuplicates = false;

              if (isPlaylist) {
                const playlistDetail = detail as PlaylistDetail;
                hasDuplicates = playlistDetail.tracks.some((track) => {
                  if (ponaCommonState?.current?.identifier === track.identifier) {
                    return true;
                  }
                  const findDuplicatedTrack = ponaCommonState?.queue.filter(
                    (refTrack) => refTrack.identifier === track.identifier
                  );
                  return Boolean(findDuplicatedTrack && findDuplicatedTrack.length > 0);
                });
              } else {
                const singleDetail = detail as PlayDetail;
                const findDuplicatedTrack = ponaCommonState?.queue.filter(
                  (refTrack) => refTrack.identifier === singleDetail.identifier
                );
                hasDuplicates = Boolean(
                  ponaCommonState &&
                  ponaCommonState.current &&
                  (ponaCommonState.current.identifier === singleDetail.identifier ||
                    (findDuplicatedTrack && findDuplicatedTrack.length > 0))
                );
              }

              if (hasDuplicates) setIsDuplicateModalOpen(true);
              else if (ponaCommonState?.current) setIsModalOpen(true);
              else addToQueue();
            }
          }}
          style={{ width: s, height: s, ...style }}
        >
          {loading ? (
            <SpinnerIcon className='animate-spin' size={iconSize || 32} />
          ) : children ? (
            children
          ) : (
            <PlayIcon weight='fill' size={iconSize || 32} />
          )}
        </Button>
      )}

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle>
              {language.data.app.guilds.player.music_card.action.add_to_queue.title}
            </DialogTitle>
          </DialogHeader>
          <div className='flex flex-col gap-1 py-2'>
            <h1 className='font-medium text-foreground'>{detail.title}</h1>
            <span className='text-xs text-muted-foreground'>{detail.author}</span>
          </div>
          <DialogFooter className='gap-2 sm:gap-0'>
            <Button
              variant='outline'
              onClick={() => setIsModalOpen(false)}
            >
              {language.data.app.guilds.player.music_card.action.add_to_queue.close}
            </Button>
            <Button
              onClick={() => {
                addToQueue();
                setIsModalOpen(false);
              }}
            >
              {language.data.app.guilds.player.music_card.action.add_to_queue.add}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDuplicateModalOpen} onOpenChange={setIsDuplicateModalOpen}>
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle>
              {language.data.app.guilds.player.music_card.action.add_duplicated_track_to_queue.title}
            </DialogTitle>
          </DialogHeader>
          <div className='flex flex-col gap-1 py-2'>
            <h1 className='font-medium text-foreground'>{detail.title}</h1>
            <span className='text-xs text-muted-foreground'>{detail.author}</span>
          </div>
          <DialogFooter className='gap-2 sm:gap-0'>
            <Button
              variant='outline'
              onClick={() => setIsDuplicateModalOpen(false)}
            >
              {language.data.app.guilds.player.music_card.action.add_duplicated_track_to_queue.close}
            </Button>
            <Button
              variant='destructive'
              onClick={() => {
                addToQueue();
                setIsDuplicateModalOpen(false);
              }}
            >
              {language.data.app.guilds.player.music_card.action.add_duplicated_track_to_queue.add}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default PlayButton;
