"use client";
import React from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useGlobalContext } from '@/contexts/globalContext'
import { useLanguageContext } from '@/contexts/languageContext'
import { usePonaMusicContext } from '@/contexts/ponaMusicContext'
import { useUserSettingContext } from '@/contexts/userSettingContext'

import { msToTime } from '@/utils/time'
import { useRouter } from 'next/navigation'

import { CaretLineLeft, CaretLineRight, Coffee, Equalizer, Heart, MusicNotes, Pause, Play, Repeat, RepeatOnce, SpeakerSimpleHigh } from '@phosphor-icons/react/dist/ssr'
import { Button, Image, Link, Modal, ModalBody, ModalContent, ModalHeader, ScrollShadow, Slider, Tab, Tabs, useDisclosure } from '@nextui-org/react'

import { MobilePonaPlayerPanelAnimationState } from '../mobile';
import LyricsDisplay from '@/components/music/lyricsDisplay';
import { Track } from '@/interfaces/ponaPlayer';

function MobilePonaPlayerPanel({
  trackFocus,
  setTrackFocus,
  beforeState, setBeforeState,
  afterState, setAfterState,
}: {
  trackFocus: boolean;
  setTrackFocus: React.Dispatch<React.SetStateAction<boolean>>;
  beforeState: MobilePonaPlayerPanelAnimationState;
  setBeforeState: React.Dispatch<React.SetStateAction<MobilePonaPlayerPanelAnimationState>>;
  afterState: MobilePonaPlayerPanelAnimationState;
  setAfterState: React.Dispatch<React.SetStateAction<MobilePonaPlayerPanelAnimationState>>;
}) {
    const router = useRouter();
    const { language } = useLanguageContext();
    const { userSetting } = useUserSettingContext();
    const { ponaCommonState } = useGlobalContext();
    const { socket, playerPopup, setPlayerPopup } = usePonaMusicContext();
    const currentTrack = ponaCommonState?.current;
    const lyricsContainerRef = React.useRef<HTMLElement>(null);
    const playerPos = ponaCommonState ? ponaCommonState.pona.position : 0;
        
    const {isOpen: isRepeatModalOpen, onOpen: onRepeatModalOpen, onOpenChange: onRepeatModalOpenChange} = useDisclosure();
    const {isOpen: isEqualizerModalOpen, onOpen: onEqualizerModalOpen, onOpenChange: onEqualizerModalOpenChange} = useDisclosure();
    const [sliderValue, setSliderValue] = React.useState<number | number[]>(ponaCommonState?.pona.position || 0);
  
    React.useEffect(() => {
        setSliderValue(ponaCommonState?.pona.position || 0);
    }, [ponaCommonState?.pona.position]);
  
    React.useEffect(()=>{
      if ( !currentTrack )
        setPlayerPopup(()=>{
          document.body.classList.remove('pona-player-focused');
          return false;
        });
      if ( !playerPopup || !currentTrack ) document.body.classList.remove('pona-player-focused');
    }, [currentTrack, playerPopup, setPlayerPopup])

    return (
        <>
        <AnimatePresence>
        {
          (currentTrack && playerPopup && trackFocus) &&
          <motion.div
            className='absolute left-0 top-0 p-8 w-full h-full overflow-hidden pointer-events-auto flex flex-col justify-center items-center'
            id='pona=player-panel-player-focus'
            transition={{
                duration: 0.12
            }}
            initial={beforeState === 'none' ? { opacity: 0, pointerEvents: 'none', translateY: '100%', translateX: '-100%', scale: 0 } : { opacity: 0, pointerEvents: 'none', translateY: '-100%', translateX: '-100%', scale: 0 }}
            animate={{ opacity: 1, pointerEvents: 'auto', translateY: 0, translateX: 0, scale: 1 }}
            exit={afterState === 'none' ? { opacity: 0, pointerEvents: 'none', translateY: '100%', translateX: '-100%', scale: 0 } : { opacity: 0, pointerEvents: 'none', translateY: '-100%', translateX: '-100%', scale: 0 }}>
              <div className='absolute top-0 left-0 w-full h-full' onClick={()=>{
                setAfterState('none');
                setBeforeState('playerPanel');
                setTimeout(() => {
                  setPlayerPopup(false);
                }, 100);
              }} id='pona-music-panel-trigger'></div>
              <div className='max-w-full max-h-full m-auto flex flex-col gap-4 justify-center items-center py-16' id='mobile-pona-player-controller'>
                <div className='w-[calc(100vw_-_3rem)] max-w-[48vh] aspect-square relative flex pointer-events-none'>
                  <Image src={currentTrack ? currentTrack.proxyHighResArtworkUrl || currentTrack?.proxyArtworkUrl : '/public/Ponlponl123 (1459).png'} alt={currentTrack ? currentTrack.title : 'Artwork'}
                    className={
                      'w-full h-full object-cover'
                    }
                    loading='lazy' shadow='lg' radius='lg' isBlurred={userSetting.transparency} id='pona-music-artwork'
                  />
                </div>
                <div className='w-full max-h-full flex flex-col gap-2' id='mobile-pona-music-player-controller-track'>
                  <h1 className='text-3xl !text-[hsl(var(--pona-app-music-accent-color-500))] w-full whitespace-nowrap overflow-hidden overflow-ellipsis'>{currentTrack.title}</h1>
                  <h1 className='text-base !text-[hsl(var(--pona-app-music-accent-color-500)/0.4)] w-full whitespace-nowrap overflow-hidden overflow-ellipsis'>{currentTrack.author}</h1>
                  <div className='my-4 relative' id='mobile-pona-music-player-controller-track-slider'>
                    <Slider
                      aria-label="PlayerSeekBar"
                      className=""
                      classNames={{
                          track: '!border-s-[hsl(var(--pona-app-music-accent-color-500))] cursor-pointer',
                          filler: '!bg-[hsl(var(--pona-app-music-accent-color-500))] transition-all ease-linear group-active:duration-0 duration-[1s]'
                      }}
                      renderThumb={(props) => (
                          <div
                              {...props}
                              className="transition-all p-1 ease-linear group-active:duration-0 duration-[1s] top-1/2 !bg-[hsl(var(--pona-app-music-accent-color-500))] shadow-medium rounded-full cursor-grab data-[dragging=true]:cursor-grabbing"
                          >
                              <span className="group-hover:h-1 group-hover:w-1 transition-transform !bg-[hsl(var(--pona-app-music-accent-color-500))] rounded-full w-1 h-1 block group-data-[dragging=true]:scale-80" />
                          </div>
                      )}
                      value={sliderValue}
                      maxValue={ponaCommonState?.pona.length}
                      minValue={0}
                      size="sm"
                      step={1}
                      onChange={(value) => setSliderValue(value)}
                      onChangeEnd={(value) => {
                          socket?.emit('seek', value);
                      }}
                    />
                    <div className='absolute w-full flex flex-row gap-2 justify-between items-center'>
                      <span className='text-xs text-center !text-[hsl(var(--pona-app-music-accent-color-500)/0.6)]'>{msToTime(ponaCommonState?.pona.position || 0)}</span>
                      <span className='text-xs text-center !text-[hsl(var(--pona-app-music-accent-color-500)/0.6)]'>{msToTime(ponaCommonState?.pona.length || 0)}</span>
                    </div>
                  </div>
                  <div className='w-full flex items-center justify-evenly my-6' id='mobile-pona-music-player-controller-track-action'>
                    <Button isIconOnly radius='lg' size='md' variant='light' className='mr-auto' onPress={onEqualizerModalOpen}><Equalizer weight='fill' /></Button>
                    <Button isIconOnly radius='full' size='md' variant='light' onPress={()=>{socket?.emit('previous')}}><CaretLineLeft weight='fill' /></Button>
                    {
                      !ponaCommonState?.pona.paused ? <>
                        <Button isIconOnly radius='full' size='lg' variant='light' className='scale-125 mx-auto' onPress={()=>{socket?.emit('pause')}}><Pause weight='fill' /></Button>
                      </> : <>
                        <Button isIconOnly radius='full' size='lg' variant='light' className='scale-125 mx-auto' onPress={()=>{socket?.emit('play')}}><Play weight='fill' /></Button>
                      </>
                    }
                    <Button isIconOnly radius='full' size='md' variant='light' onPress={()=>{socket?.emit('next')}}><CaretLineRight weight='fill' /></Button>
                    <Button isIconOnly radius='lg' size='md' variant='light' className='ml-auto' onPress={onRepeatModalOpen}><Repeat weight='fill' /></Button>
                  </div>
                </div>
              </div>
              <Button fullWidth variant='light' radius='full' className='absolute bottom-8 left-8 w-[calc(100%_-_4rem)]' onPress={()=>{
                setTrackFocus(false);
              }}>{language.data.app.guilds.player.tabs.open_queue}</Button>
          </motion.div>
        }
        </AnimatePresence>
        <Modal isOpen={isRepeatModalOpen} onOpenChange={onRepeatModalOpenChange} hideCloseButton backdrop={userSetting.transparency?'blur':'opaque'}>
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader className="flex flex-col gap-1">{language.data.app.guilds.player.repeat.title}</ModalHeader>
                <ModalBody className='pb-6'>
                  <Button variant={(!ponaCommonState?.pona.repeat.track && !ponaCommonState?.pona.repeat.queue)?'solid':'light'} onPress={()=>{socket?.emit('repeat', 'none');onClose();}}><MusicNotes /> {language.data.app.guilds.player.repeat.off}</Button>
                  <Button variant={(ponaCommonState?.pona.repeat.track)?'solid':'light'} onPress={()=>{socket?.emit('repeat', 'track');onClose();}}><RepeatOnce /> {language.data.app.guilds.player.repeat.track}</Button>
                  <Button variant={(ponaCommonState?.pona.repeat.queue)?'solid':'light'} onPress={()=>{socket?.emit('repeat', 'queue');onClose();}}><Repeat /> {language.data.app.guilds.player.repeat.queue}</Button>
                </ModalBody>
              </>
            )}
          </ModalContent>
        </Modal>
        <Modal isOpen={isEqualizerModalOpen} onOpenChange={onEqualizerModalOpenChange} hideCloseButton backdrop={userSetting.transparency?'blur':'opaque'}>
          <ModalContent>
            {() => (
              <>
                <ModalHeader className="flex flex-col gap-1">{language.data.app.guilds.player.equalizer.title}</ModalHeader>
                <ModalBody className='pb-6'>
                  {language.data.extensions.comingsoon}
                </ModalBody>
              </>
            )}
          </ModalContent>
        </Modal>
        <AnimatePresence>
        {
            (currentTrack && playerPopup && !trackFocus) &&
            <motion.div
                className={
                  'absolute left-0 top-0 p-8 w-full h-full overflow-hidden pointer-events-auto'
                }
                id='pona=player-panel-queue-focus'
                transition={{
                    duration: 0.12
                }}
                initial={{ opacity: 0, pointerEvents: 'none', translateY: 96 }}
                animate={{ opacity: 1, pointerEvents: 'auto', translateY: 0 }}
                exit={{ opacity: 0, pointerEvents: 'none', translateY: 64 }}>
                <div className='absolute top-0 left-0 w-full h-full' onClick={()=>{
                  setTrackFocus(true);
                  setAfterState('playerPanel');
                  setBeforeState('queuePanel');
                }} id='pona-music-panel-trigger'></div>
                <div className='w-full h-full flex gap-12 justify-evenly items-center pt-16'>
                    <div className='w-full h-full' id='pona-music-queue'>
                        <Tabs aria-label="Options" placement='top' variant='underlined' size='lg' fullWidth
                            classNames={{
                              base: 'absolute top-20 w-[calc(100%_-_2rem)] left-4',
                              tabContent: '!text-[hsl(var(--pona-app-music-accent-color-500))]',
                              cursor: 'bg-[hsl(var(--pona-app-music-accent-color-500))]',
                              panel: 'max-h-[80vh] h-max absolute top-36 left-1 w-full'
                            }}>
                            <Tab key="next" title={language.data.app.guilds.player.tabs.next}>
                                <ScrollShadow className='max-h-[80vh] pr-2 pb-4' style={{scrollbarWidth:'none'}}>
                                    <div className='flex flex-col gap-2'>
                                    {
                                        ponaCommonState.queue.map((track, index) => {
                                            const isThisTrack = ponaCommonState.current?.uniqueId === track.uniqueId;
                                            return (
                                                <div className={`w-full py-2 px-2.5 flex gap-4 items-center rounded-3xl hover:bg-foreground/5 group ${
                                                    isThisTrack?'[.light_&]:bg-[hsl(var(--pona-app-music-accent-color-100))] [.dark_&]:bg-[hsl(var(--pona-app-music-accent-color-800))] active':''
                                                }`} key={index}>
                                                    <div className='w-11 h-11 select-none relative overflow-hidden rounded-2xl'>
                                                        <Image src={track?.proxyArtworkUrl} alt={track.title} height={44} width={44} className={
                                                            'object-cover rounded-lg z-0 ' + 
                                                            ( (!ponaCommonState.pona.paused && isThisTrack) ? 'brightness-50 saturate-0' : 'group-hover:brightness-50 group-hover:saturate-0' )
                                                        } />
                                                        <div className={'absolute top-0 left-0 w-full h-full bg-background/35 z-[5] ' +
                                                            ( (!ponaCommonState.pona.paused && isThisTrack) ? 'opacity-100' : 'group-hover:opacity-100 opacity-0' )
                                                        }></div>
                                                        {
                                                            (!ponaCommonState.pona.paused && isThisTrack) ?
                                                            <Button className='absolute z-10 top-0 left-0 w-full h-full opacity-100' variant='light' radius='md' isIconOnly onPress={()=>{socket?.emit('pause')}}><SpeakerSimpleHigh className='text-white' weight='fill' /></Button> :
                                                            <Button className='absolute z-10 top-0 left-0 w-full h-full group-hover:opacity-100 opacity-0' variant='light' radius='md' isIconOnly onPress={()=>{
                                                                if ( isThisTrack ) socket?.emit('play');
                                                                else 
                                                                    if (index-1 === 0) socket?.emit('next');
                                                                    else socket?.emit('skipto', index-1);
                                                            }}><Play className='text-white' weight='fill' /></Button>
                                                        }
                                                    </div>
                                                    <div className='w-[calc(100%_-_10rem)]'>
                                                      <h1 className='w-full [div.active_&]:text-[hsl(var(--pona-app-music-accent-color-500))] whitespace-nowrap overflow-hidden overflow-ellipsis'>{track.title}</h1>
                                                      <span className='w-full text-xs text-foreground/40 [div.active_&]:text-[hsl(var(--pona-app-music-accent-color-500)/0.4)] whitespace-nowrap overflow-hidden overflow-ellipsis'>{track.author} ({track.requester?.displayName || '@'+track.requester?.username})</span>
                                                    </div>
                                                    <div className='ml-auto relative w-12 h-12 flex items-center justify-center'>
                                                      <span className='[div.active_&]:text-[hsl(var(--pona-app-music-accent-color-500)/0.64)] opacity-100 pointer-events-none'>{msToTime(track.duration || 0)}</span>
                                                    </div>
                                                </div>
                                            )
                                        })
                                    }
                                    </div>
                                </ScrollShadow>
                            </Tab>
                            <Tab key="lyrics" title={language.data.app.guilds.player.tabs.lyrics} isDisabled={!(currentTrack.lyrics && currentTrack.lyrics.lyrics?.length > 0)}>
                                <ScrollShadow className='max-h-[80vh] pr-2' style={{scrollbarWidth:'none'}} ref={lyricsContainerRef}>
                                    {lyricsContainerRef.current && (
                                        currentTrack.lyrics?.isTimestamp ?
                                            <LyricsDisplay playerPosition={playerPos} currentTrack={currentTrack as Track} lyricsProvider={lyricsContainerRef.current} /> :
                                            (currentTrack.lyrics?.lyrics && currentTrack.lyrics.lyrics.length > 0) && (currentTrack.lyrics.lyrics as string[]).map((lyric, index) => (
                                                <div key={index} className='flex items-center gap-2'>
                                                    <span className='text-2xl my-6 text-[hsl(var(--pona-app-music-accent-color-500))]'>{lyric}</span>
                                                </div>
                                            ))
                                    )}
                                </ScrollShadow>
                            </Tab>
                            <Tab key="related" title={language.data.app.guilds.player.tabs.related}>
                                <ScrollShadow className='max-h-[80vh] pr-2' style={{scrollbarWidth:'none'}}>
                                    <div className='flex flex-col gap-4 items-center justify-center w-full h-full'>
                                        <Coffee size={56} weight='fill' className='text-[hsl(var(--pona-app-music-accent-color-500))]' />
                                        <h1 className='text-2xl max-w-screen-md text-center text-[hsl(var(--pona-app-music-accent-color-500)/0.64)]'>{language.data.app.guilds.player.dev}</h1>
                                        <Link href='/app/updates' rel='noopener' onPress={()=>{router.push('/app/updates')}}>
                                            <Button color='secondary' className='mt-2 bg-[hsl(var(--pona-app-music-accent-color-500))]' radius='full'><Heart weight='fill' /> {language.data.app.updates.follow}</Button>
                                        </Link>
                                    </div>
                                </ScrollShadow>
                            </Tab>
                        </Tabs>
                    </div>
                </div>
            </motion.div>
        }
        </AnimatePresence>
        </>
    )
}

export default MobilePonaPlayerPanel