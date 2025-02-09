import React from 'react'
import { Track } from '@/interfaces/ponaPlayer'
import { useGlobalContext } from '@/contexts/globalContext'
import { useLanguageContext } from '@/contexts/languageContext'
import { usePonaMusicContext } from '@/contexts/ponaMusicContext'
import { Button, Image, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, useDisclosure } from '@nextui-org/react'
import { Play } from '@phosphor-icons/react/dist/ssr'

function MusicCard({track}: {track: Track}) {
  const { socket } = usePonaMusicContext();
  const { language } = useLanguageContext();
  const { isSameVC, ponaCommonState } = useGlobalContext();
  const {isOpen, onOpen, onOpenChange} = useDisclosure();
  const {isOpen: isDuplicatedTrackOpen, onOpen: onDuplicatedTrackOpen, onOpenChange: onDuplicatedTrackOpenChange} = useDisclosure();
  return (
    <>
      <div className='music-card w-48' aria-label={track.title}>
        <div className='flex flex-col items-start justify-start gap-3'>
          <div className='overflow-hidden aspect-square w-full group rounded-3xl relative'>
            <Image
              className='object-cover w-full h-full group-hover:scale-110'
              classNames={{
                wrapper: 'w-full h-full'
              }}
              src={track.artworkUrl}
              alt={track.title}
            />
            <Button className='absolute top-0 left-0 w-full h-full z-10 rounded-3xl group-hover:opacity-100 opacity-0' isIconOnly variant='flat' onPress={()=>{
              if ( socket && socket.connected && isSameVC ) {
                const findDuplicatedTrack = ponaCommonState?.queue.filter(refTrack => refTrack.identifier === track.identifier);
                if (
                  ponaCommonState && ponaCommonState.current && 
                  (
                    ponaCommonState.current.identifier === track.identifier ||
                    (findDuplicatedTrack && findDuplicatedTrack.length > 0)
                  )
                ) onDuplicatedTrackOpen();
                else if ( ponaCommonState?.current ) onOpen();
                else socket.emit('add', track.identifier);
              }
            }}><Play weight='fill' size={32} /></Button>
          </div>
          <h1 className='w-full text-lg whitespace-nowrap overflow-hidden overflow-ellipsis text-start'>{track.title}</h1>
          <span className='w-full text-xs text-foreground/40 whitespace-nowrap overflow-hidden overflow-ellipsis text-start'>{track.author}</span>
        </div>
      </div>
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} size='xs' hideCloseButton>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">{language.data.app.guilds.player.music_card.action.add_to_queue.title}</ModalHeader>
              <ModalBody>
                <h1>{track.title}</h1>
                <span className='text-xs text-foreground/40'>{track.author}</span>
              </ModalBody>
              <ModalFooter>
                <Button color="default" variant="light" onPress={onClose}>{language.data.app.guilds.player.music_card.action.add_to_queue.close}</Button>
                <Button color="primary" onPress={()=>{
                  if ( socket && socket.connected && isSameVC ) {
                    socket.emit('add', track.identifier);
                  }
                  onClose();
                }}>{language.data.app.guilds.player.music_card.action.add_to_queue.add}</Button>
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
                <h1>{track.title}</h1>
                <span className='text-xs text-foreground/40'>{track.author}</span>
              </ModalBody>
              <ModalFooter>
                <Button color="default" variant="light" onPress={onClose}>{language.data.app.guilds.player.music_card.action.add_duplicated_track_to_queue.close}</Button>
                <Button color="danger" variant='light' onPress={()=>{
                  if ( socket && socket.connected && isSameVC ) {
                    socket.emit('add', track.identifier);
                  }
                  onClose();
                }}>{language.data.app.guilds.player.music_card.action.add_duplicated_track_to_queue.add}</Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  )
}

export default MusicCard