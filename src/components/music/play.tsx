import { useGlobalContext } from '@/contexts/globalContext';
import { useLanguageContext } from '@/contexts/languageContext';
import { usePonaMusicContext } from '@/contexts/ponaMusicContext';
import { Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, useDisclosure } from '@nextui-org/react';
import { Play } from '@phosphor-icons/react/dist/ssr';
import React from 'react'
import toast from 'react-hot-toast';
import PlayPauseButton from './playPause';

export interface PlayDetail {
  title: string;
  author: string;
  uri: string;
  sourceName: string;
  identifier: string;
}

function PlayButton({ s, iconSize = 32, className, classNames, detail, children, style, playPause }: { s?: number, iconSize?: number, className?: string, classNames?: {
  playpause?: string
}, detail: PlayDetail, children?: React.ReactNode, style?: React.CSSProperties, playPause?: boolean }) {
  const { socket } = usePonaMusicContext();
  const { language } = useLanguageContext();
  const { isSameVC, ponaCommonState } = useGlobalContext();
  const [loading, setLoading] = React.useState<boolean>(false);
  const {isOpen, onOpen, onOpenChange} = useDisclosure();
  const {isOpen: isDuplicatedTrackOpen, onOpen: onDuplicatedTrackOpen, onOpenChange: onDuplicatedTrackOpenChange} = useDisclosure();
  const addToQueue = () => {
    if (socket && socket.connected && isSameVC) {
      setLoading(true);
      toast.promise(
        new Promise<void>((resolve, reject) => {
          socket.emit('add', detail.uri, detail.sourceName, (error: unknown) => {
            setLoading(false);
            if (error && (error as { status?: string }).status !== 'ok') {
              reject(error);
            } else {
              resolve();
            }
          });
        }),
        {
          loading: language.data.app.guilds.player.toast.add_track.loading.replace('[track_name]', detail.title.slice(0,32)).replace('[artist]', detail.author.slice(0,32)),
          success: language.data.app.guilds.player.toast.add_track.success.replace('[track_name]', detail.title.slice(0,32)).replace('[artist]', detail.author.slice(0,32)),
          error: language.data.app.guilds.player.toast.add_track.error,
        },
        {
          position: 'bottom-left',
          duration: 1280
        }
      );
    }
  }
  return (
    <>
    {
      playPause ? <PlayPauseButton className={classNames?.playpause} /> :
      <Button className={'absolute top-0 left-0 w-full h-full z-10 rounded-3xl group-hover:opacity-100 opacity-0 ' + className} isIconOnly variant='flat' isLoading={loading} isDisabled={loading} onPress={()=>{
        if ( socket && socket.connected && isSameVC ) {
          const findDuplicatedTrack = ponaCommonState?.queue.filter(refTrack => refTrack.identifier === detail.identifier);
          if (
            ponaCommonState && ponaCommonState.current && 
            (
              ponaCommonState.current.identifier === detail.identifier ||
              (findDuplicatedTrack && findDuplicatedTrack.length > 0)
            )
          ) onDuplicatedTrackOpen();
          else if ( ponaCommonState?.current ) onOpen();
          else addToQueue();
        }
      }} style={{ width: s, height: s, ...style }}>
        {
          children ? children : <Play weight='fill' size={iconSize || 32} />
        }
      </Button>
    }
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} size='xs' hideCloseButton>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">{language.data.app.guilds.player.music_card.action.add_to_queue.title}</ModalHeader>
            <ModalBody>
              <h1>{detail.title}</h1>
              <span className='text-xs text-foreground/40'>{detail.author}</span>
            </ModalBody>
            <ModalFooter>
              <Button color="default" variant="light" onPress={onClose}>{language.data.app.guilds.player.music_card.action.add_to_queue.close}</Button>
              <Button color="primary" onPress={()=>{addToQueue();onClose();}}>{language.data.app.guilds.player.music_card.action.add_to_queue.add}</Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
    <Modal isOpen={isDuplicatedTrackOpen} onOpenChange={onDuplicatedTrackOpenChange} size='xs' hideCloseButton>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">{language.data.app.guilds.player.music_card.action.add_duplicated_track_to_queue.title}</ModalHeader>
            <ModalBody>
              <h1>{detail.title}</h1>
              <span className='text-xs text-foreground/40'>{detail.author}</span>
            </ModalBody>
            <ModalFooter>
              <Button color="default" variant="light" onPress={onClose}>{language.data.app.guilds.player.music_card.action.add_duplicated_track_to_queue.close}</Button>
              <Button color="danger" variant='light' onPress={()=>{addToQueue();onClose();}}>{language.data.app.guilds.player.music_card.action.add_duplicated_track_to_queue.add}</Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
    </>
  )
}

export default PlayButton