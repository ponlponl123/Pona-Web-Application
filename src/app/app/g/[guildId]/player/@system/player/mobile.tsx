"use client";
import React from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useGlobalContext } from '@/contexts/globalContext'
import { usePonaMusicContext } from '@/contexts/ponaMusicContext'
import { useUserSettingContext } from '@/contexts/userSettingContext'

import defaultImage from '@/../public/Ponlponl123 (1459).png'

import { CaretDown, CaretUp, Pause, Play } from '@phosphor-icons/react/dist/ssr'
import { Button, Image, Link, Slider } from '@nextui-org/react'
import MobilePonaPlayerPanel from './panel/mobile';

export type MobilePonaPlayerPanelAnimationState = 'none' | 'playerPanel' | 'queuePanel';

function MobilePonaPlayer() {
  const { userSetting } = useUserSettingContext();
  const { ponaCommonState, isMobile } = useGlobalContext();
  const { socket, playerPopup, setPlayerPopup } = usePonaMusicContext();
  const [ beforeState, setBeforeState ] = React.useState<MobilePonaPlayerPanelAnimationState>('none');
  const [ afterState, setAfterState ] = React.useState<MobilePonaPlayerPanelAnimationState>('none');
  const [ trackFocus, setTrackFocus ] = React.useState<boolean>(true);
  const currentTrack = ponaCommonState?.current;
    
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
    <AnimatePresence>
      {currentTrack && <motion.div id='pona=player-wrapper'
            initial={{ opacity: 0, pointerEvents: 'none', translateY: 32 }}
            animate={{ opacity: 1, pointerEvents: 'auto', translateY: 0 }}
            exit={{ opacity: 0, pointerEvents: 'none', translateY: 32 }}
          className={
            `absolute overflow-hidden z-50 [html.light_&]:bg-[hsl(var(--pona-app-music-accent-color-100))] [html.dark_&]:bg-[hsl(var(--pona-app-music-accent-color-800))] apply-soft-transition ${playerPopup?'w-full h-screen rounded-none bottom-4 left-0':`h-16 rounded-lg ${isMobile?'bottom-[5.2rem]':'bottom-6'} left-2 w-[calc(100%_-_1rem)]`}`
            + (userSetting.transparency ? ' backdrop-blur-md' : '')
          }>
          <div className='absolute top-0 left-0 z-0 w-full h-full [body.pona-player-focused_&]:bg-none [html.light_&]:[body.pona-player-focused_&]:bg-[hsl(var(--pona-app-music-accent-color-50))] [html.dark_&]:[body.pona-player-focused_&]:bg-[hsl(var(--pona-app-music-accent-color-900))] rounded-lg'></div>
          <Slider
              aria-label="PlayerSeekBar"
              className={
                "absolute -top-2.5 z-20 group shadow-2xl left-0 w-full max-w-none pointer-events-none" + (playerPopup&&' opacity-0 pointer-events-none')
              }
              classNames={{
                  track: '!border-s-[hsl(var(--pona-app-music-accent-color-500))] cursor-pointer',
                  filler: '!bg-[hsl(var(--pona-app-music-accent-color-500))] transition-all ease-linear group-active:duration-0 duration-[1s]'
              }}
              renderThumb={(props) => (
                  <div
                      {...props}
                      className="transition-all ease-linear group-active:duration-0 duration-[1s] top-1/2 !bg-[hsl(var(--pona-app-music-accent-color-500))] shadow-medium rounded-full cursor-grab data-[dragging=true]:cursor-grabbing"
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
          <div
              id='pona-player'
              className={
                  `rounded-lg p-2 flex flex-row items-center justify-between gap-4 absolute overflow-hidden w-full h-full select-none`
              }>
              <div className='absolute top-0 left-0 w-full h-full' onClick={()=>{
                if ( playerPopup ) {
                  setAfterState('none');
                  setBeforeState('queuePanel');
                  setPlayerPopup(false);
                  document.body.classList.remove('pona-player-focused');
                } else {
                  document.body.classList.add('pona-player-focused');
                  setAfterState('playerPanel');
                  setBeforeState('none');
                  setTrackFocus(true);
                  setPlayerPopup(true);
                }}} id='pona-music-panel-trigger'></div>
              <MobilePonaPlayerPanel
                trackFocus={trackFocus}
                setTrackFocus={setTrackFocus}
                beforeState={beforeState}
                setBeforeState={setBeforeState}
                afterState={afterState}
                setAfterState={setAfterState}
              />
              <Button isIconOnly radius='lg' size='md' variant='light' className={`absolute right-4 top-4 ${playerPopup?'':'opacity-0 pointer-events-none'}`} onPress={()=>{
                if ( trackFocus ) {
                  document.body.classList.remove('pona-player-focused');
                  setAfterState('none');
                  setBeforeState('playerPanel');
                  setTimeout(() => {
                    setPlayerPopup(false);
                  }, 100);
                } else {
                  setAfterState('playerPanel');
                  setBeforeState('queuePanel');
                  setTrackFocus(true);
                }
              }}>
                <CaretUp className={`absolute ${playerPopup?'opacity-0 -translate-y-6':''}`} />
                <CaretDown className={`absolute ${!playerPopup?'opacity-0 translate-y-6':''}`} />
              </Button>
              <div className={((!trackFocus && playerPopup)?' absolute w-[calc(100%_-_4rem)] top-4 left-4':' w-full ' + (playerPopup&&' opacity-0 pointer-events-none')) + ' flex flex-row justify-between items-center'}>
                <motion.div
                  className={'flex items-center justify-start gap-4 w-full max-w-[calc(100%_-_5rem)]'}
                  animate={{
                      transition: {
                          duration: 0.2,
                          type: 'spring'
                      }
                  }}
                  onClick={()=>{
                    if ( !trackFocus && playerPopup ) {
                      setAfterState('playerPanel');
                      setBeforeState('queuePanel');
                      setTrackFocus(true);
                    }
                  }}
                >
                    <Image src={currentTrack ? currentTrack.proxyArtworkUrl : defaultImage.src} alt={currentTrack ? currentTrack.title : 'Thumbnail'}
                        className={
                          'object-cover h-12 w-12 rounded-lg'
                        }
                        loading='lazy' shadow='lg' isBlurred={userSetting.transparency} id='pona-music-thumbnail' />
                    <div className={`flex flex-col justify-center items-start ${userSetting.dev_pona_player_style==='modern'?'':'lg:mt-4'}`} style={{width:'calc(100% - 5.4rem)'}}>
                        <div className='text-xl max-w-full flex gap-2'>
                            <h1 className='text-base !text-[hsl(var(--pona-app-music-accent-color-500))] w-full whitespace-nowrap overflow-hidden overflow-ellipsis'>{currentTrack ? currentTrack.title : 'Music Name'}</h1>
                            {currentTrack ? <Link href={currentTrack.uri} className='!text-[hsl(var(--pona-app-music-accent-color-500))]' showAnchorIcon target='_blank' /> : <></>}
                        </div>
                        <span className='text-xs text-foreground/40 w-full whitespace-nowrap overflow-hidden overflow-ellipsis'>{currentTrack ? currentTrack.author : 'Author'}</span>
                    </div>
                </motion.div>
                <div className={`flex items-center justify-center gap-4 w-16` + ( (!trackFocus && playerPopup)?' absolute right-0 top-0':'' )}>
                  {
                    !ponaCommonState?.pona.paused ? <>
                      <Button isIconOnly radius={(!trackFocus && playerPopup)?'lg':'full'} size={(!trackFocus && playerPopup)?'md':'lg'} variant='light' onPress={()=>{socket?.emit('pause')}}><Pause weight='fill' /></Button>
                    </> : <>
                      <Button isIconOnly radius={(!trackFocus && playerPopup)?'lg':'full'} size={(!trackFocus && playerPopup)?'md':'lg'} variant='light' onPress={()=>{socket?.emit('play')}}><Play weight='fill' /></Button>
                    </>
                  }
                </div>
              </div>
            </div>
      </motion.div>}
  </AnimatePresence>
  )
}

export default MobilePonaPlayer