import { useGlobalContext } from '@/contexts/globalContext';
import { useLanguageContext } from '@/contexts/languageContext';
import { usePonaMusicContext } from '@/contexts/ponaMusicContext';
import { getSong } from '@/server-side-api/internal/search';
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
} from '@heroui/react';
import { Play } from '@phosphor-icons/react/dist/ssr';
import { getCookie } from 'cookies-next';
import React from 'react';
import toast from 'react-hot-toast';
import { twMerge } from 'tailwind-merge';
import PlayPauseButton from './playPause';

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

export interface PlayButtonProps<T extends 'song' | 'playlist' = 'song'> {
  s?: number;
  type?: T;
  iconSize?: number;
  className?: string;
  classNames?: PlayButtonClassNames;
  detail: T extends 'playlist' ? PlaylistDetail : PlayDetail;
  children?: React.ReactNode;
  style?: React.CSSProperties;
  playPause?: boolean;
}

export interface PlayButtonClassNames {
  playpause?: string;
}

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
  const { socket } = usePonaMusicContext();
  const { language } = useLanguageContext();
  const { isSameVC, ponaCommonState } = useGlobalContext();
  const [loading, setLoading] = React.useState<boolean>(false);
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const {
    isOpen: isDuplicatedTrackOpen,
    onOpen: onDuplicatedTrackOpen,
    onOpenChange: onDuplicatedTrackOpenChange,
  } = useDisclosure();
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
              playlistDetail.tracks.map(track => {
                return track.uri;
              }),
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
        },
        {
          position: 'bottom-left',
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
          className={twMerge(
            'absolute top-0 left-0 w-full h-full z-10 rounded-3xl group-hover:opacity-100 opacity-0 ' +
              className,
            classNames?.playpause
          )}
          isIconOnly
          variant='flat'
          isLoading={loading}
          isDisabled={loading}
          onPress={() => {
            if (socket && socket.connected && isSameVC) {
              // Check if detail is a playlist (has tracks array)
              const isPlaylist =
                'tracks' in detail &&
                Array.isArray((detail as PlaylistDetail).tracks);

              let hasDuplicates = false;

              if (isPlaylist) {
                // Check if any track in the playlist is duplicated in the queue
                const playlistDetail = detail as PlaylistDetail;
                hasDuplicates = playlistDetail.tracks.some(track => {
                  // Check if track is currently playing
                  if (
                    ponaCommonState?.current?.identifier === track.identifier
                  ) {
                    return true;
                  }
                  // Check if track is in the queue
                  const findDuplicatedTrack = ponaCommonState?.queue.filter(
                    refTrack => refTrack.identifier === track.identifier
                  );
                  return findDuplicatedTrack && findDuplicatedTrack.length > 0;
                });
              } else {
                // Single track check (existing logic)
                const singleDetail = detail as PlayDetail;
                const findDuplicatedTrack = ponaCommonState?.queue.filter(
                  refTrack => refTrack.identifier === singleDetail.identifier
                );
                hasDuplicates = !!(
                  ponaCommonState &&
                  ponaCommonState.current &&
                  (ponaCommonState.current.identifier ===
                    singleDetail.identifier ||
                    (findDuplicatedTrack && findDuplicatedTrack.length > 0))
                );
              }

              if (hasDuplicates) onDuplicatedTrackOpen();
              else if (ponaCommonState?.current) onOpen();
              else addToQueue();
            }
          }}
          style={{ width: s, height: s, ...style }}
        >
          {children ? children : <Play weight='fill' size={iconSize || 32} />}
        </Button>
      )}
      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        size='xs'
        hideCloseButton
      >
        <ModalContent>
          {onClose => (
            <>
              <ModalHeader className='flex flex-col gap-1'>
                {
                  language.data.app.guilds.player.music_card.action.add_to_queue
                    .title
                }
              </ModalHeader>
              <ModalBody>
                <h1>{detail.title}</h1>
                <span className='text-xs text-foreground/40'>
                  {detail.author}
                </span>
              </ModalBody>
              <ModalFooter>
                <Button color='default' variant='light' onPress={onClose}>
                  {
                    language.data.app.guilds.player.music_card.action
                      .add_to_queue.close
                  }
                </Button>
                <Button
                  color='primary'
                  onPress={() => {
                    addToQueue();
                    onClose();
                  }}
                >
                  {
                    language.data.app.guilds.player.music_card.action
                      .add_to_queue.add
                  }
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
      <Modal
        isOpen={isDuplicatedTrackOpen}
        onOpenChange={onDuplicatedTrackOpenChange}
        size='xs'
        hideCloseButton
      >
        <ModalContent>
          {onClose => (
            <>
              <ModalHeader className='flex flex-col gap-1'>
                {
                  language.data.app.guilds.player.music_card.action
                    .add_duplicated_track_to_queue.title
                }
              </ModalHeader>
              <ModalBody>
                <h1>{detail.title}</h1>
                <span className='text-xs text-foreground/40'>
                  {detail.author}
                </span>
              </ModalBody>
              <ModalFooter>
                <Button color='default' variant='light' onPress={onClose}>
                  {
                    language.data.app.guilds.player.music_card.action
                      .add_duplicated_track_to_queue.close
                  }
                </Button>
                <Button
                  color='danger'
                  variant='light'
                  onPress={() => {
                    addToQueue();
                    onClose();
                  }}
                >
                  {
                    language.data.app.guilds.player.music_card.action
                      .add_duplicated_track_to_queue.add
                  }
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}

export default PlayButton;
