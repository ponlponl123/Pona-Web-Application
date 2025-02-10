"use client";
import React from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useGlobalContext } from '@/contexts/globalContext'
import { useLanguageContext } from '@/contexts/languageContext'
import { usePonaMusicContext } from '@/contexts/ponaMusicContext'
import { useUserSettingContext } from '@/contexts/userSettingContext'

import { msToTime } from '@/utils/time'
import defaultImage from '@/../public/Ponlponl123 (1459).png'

import { CaretDown, CaretLineLeft, CaretLineRight, CaretUp, Equalizer, MusicNotes, Pause, Play, Repeat, RepeatOnce, SpeakerSimpleHigh } from '@phosphor-icons/react/dist/ssr'
import { Button, Dropdown, DropdownItem, DropdownMenu, DropdownSection, DropdownTrigger, Image, Link, Popover, PopoverContent, PopoverTrigger, Slider } from '@nextui-org/react'

function DesktopPonaPlayer() {
  const { language } = useLanguageContext();
  const { userSetting } = useUserSettingContext();
  const { ponaCommonState } = useGlobalContext();
  const { socket, playerPopup, setPlayerPopup } = usePonaMusicContext();
  const currentTrack = ponaCommonState?.current;
  const isLoopTrack = ponaCommonState?.pona.repeat.track;
  const isLoopQueue = ponaCommonState?.pona.repeat.queue;
    
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
              (userSetting.dev_pona_player_style === 'modern' ?
              `absolute max-md:overflow-hidden h-[4.8rem] z-50 max-lg:h-16 max-md:bottom-6 bottom-2 left-2 bg-gradient-to-br to-foreground/5 max-md:to-[hsl(var(--pona-app-music-accent-color-500)/.24)] from-[hsl(var(--pona-app-music-accent-color-500)/.24)] max-md:rounded-lg rounded-2xl` :
              `absolute max-md:overflow-hidden h-[5.6rem] z-50 max-lg:h-16 max-md:bottom-6 bottom-2 left-2 bg-gradient-to-br to-foreground/5 max-md:to-[hsl(var(--pona-app-music-accent-color-500)/.24)] from-[hsl(var(--pona-app-music-accent-color-500)/.24)] max-md:rounded-lg rounded-2xl`)
              + (userSetting.transparency ? ' backdrop-blur-md' : '')
          } style={{width:'calc(100% - 1rem)'}}>
          <div className='absolute top-0 left-0 z-0 w-full h-full [body.pona-player-focused_&]:bg-none [html.light_&]:[body.pona-player-focused_&]:bg-[hsl(var(--pona-app-music-accent-color-50))] [html.dark_&]:[body.pona-player-focused_&]:bg-[hsl(var(--pona-app-music-accent-color-900))] max-md:rounded-lg rounded-2xl'></div>
          <Slider
              aria-label="PlayerSeekBar"
              className={
                  userSetting.dev_pona_player_style === 'modern' ?
                  "absolute -top-4 left-2 z-20 group shadow-2xl w-[calc(100%_-_1rem)]" :
                  "absolute top-1 left-24 z-20 group shadow-2xl max-lg:-top-2.5 max-lg:left-2 w-[calc(100%_-_7rem)] max-lg:w-[calc(100%_-_1rem)] max-md:max-w-none max-md:w-full max-md:left-0"
              }
              classNames={{
                  track: '!border-s-[hsl(var(--pona-app-music-accent-color-500))] cursor-pointer',
                  filler: '!bg-[hsl(var(--pona-app-music-accent-color-500))] transition-all ease-linear group-active:duration-0 duration-[1s]'
              }}
              renderThumb={(props) => (
                  <div
                      {...props}
                      className="transition-all md:p-1 ease-linear group-active:duration-0 duration-[1s] top-1/2 !bg-[hsl(var(--pona-app-music-accent-color-500))] shadow-medium rounded-full cursor-grab data-[dragging=true]:cursor-grabbing"
                  >
                      <span className="group-hover:h-1 group-hover:w-1 transition-transform !bg-[hsl(var(--pona-app-music-accent-color-500))] rounded-full max-md:w-1 max-md:h-1 w-0 h-0 block group-data-[dragging=true]:scale-80" />
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
                  `rounded-2xl max-md:rounded-lg max-md:p-2 p-2 max-lg:p-1 flex flex-row items-center justify-between gap-4 absolute overflow-hidden w-full h-full select-none`
              }>
              <div className='absolute top-0 left-0 w-full h-full' onClick={()=>{setPlayerPopup((value)=>{
                  if ( !value ) document.body.classList.add('pona-player-focused');
                  else document.body.classList.remove('pona-player-focused');
                  return !value;
              })}} id='pona-music-panel-trigger'></div>
              {
                  userSetting.transparency ?
                  <Image src={currentTrack ? currentTrack.proxyArtworkUrl : defaultImage.src} alt={currentTrack ? currentTrack.title : 'Thumbnail'} height={'4.4rem'} className='z-10 blur-3xl absolute left-0 -translate-y-1/2 w-1/4 min-w-32 object-cover max-md:hidden' />
                  : <div></div>
              }
              <motion.div
                  className='flex items-center justify-start gap-4 w-full -ml-4 max-lg:max-w-[calc(50%_-_1rem)] max-md:max-w-[calc(100%_-_4rem)] max-w-[calc(33.33%_-_1rem)]'
                  animate={{
                      transition: {
                          duration: 0.2,
                          type: 'spring'
                      }
                  }}
              >
                  <Image src={currentTrack ? currentTrack.proxyArtworkUrl : defaultImage.src} alt={currentTrack ? currentTrack.title : 'Thumbnail'}
                      className={
                          userSetting.dev_pona_player_style === 'modern' ?
                          'w-[3.6rem] h-[3.6rem] object-cover max-lg:h-12 max-lg:w-12 max-md:rounded-lg' :
                          'w-[4.4rem] h-[4.4rem] object-cover max-lg:h-12 max-lg:w-12 max-md:rounded-lg'
                      }
                      loading='lazy' shadow='lg' isBlurred={userSetting.transparency} id='pona-music-thumbnail' />
                  <div className={`flex flex-col justify-center items-start ${userSetting.dev_pona_player_style==='modern'?'':'lg:mt-4'}`} style={{width:'calc(100% - 5.4rem)'}}>
                      <div className='text-xl max-w-full flex gap-2'>
                          <h1 className='text-xl max-lg:text-base !text-[hsl(var(--pona-app-music-accent-color-500))] w-full whitespace-nowrap overflow-hidden overflow-ellipsis'>{currentTrack ? currentTrack.title : 'Music Name'}</h1>
                          {currentTrack ? <Link href={currentTrack.uri} className='!text-[hsl(var(--pona-app-music-accent-color-500))]' showAnchorIcon target='_blank' /> : <></>}
                      </div>
                      <span className='text-sm max-lg:text-xs text-foreground/40 w-full whitespace-nowrap overflow-hidden overflow-ellipsis'>{currentTrack ? currentTrack.author : 'Author'}</span>
                  </div>
              </motion.div>
              <div className={`flex items-center justify-center gap-4 w-full max-lg:max-w-[calc(50%_-_3rem)] max-md:max-w-[3rem] max-w-[calc(33.33%_-_1rem)]  ${userSetting.dev_pona_player_style==='modern'?'':'lg:mt-4'}`}>
                  <span className='w-16 text-center max-lg:hidden !text-[hsl(var(--pona-app-music-accent-color-500))]'>{msToTime(ponaCommonState?.pona.position || 0)}</span>
                  <Button isIconOnly radius='full' size='md' variant='light' className='scale-110 max-lg:scale-100 max-md:hidden' onPress={()=>{socket?.emit('previous')}}><CaretLineLeft weight='fill' /></Button>
                  {
                      !ponaCommonState?.pona.paused ? <>
                          <Button isIconOnly radius='full' size='lg' variant='light' className='scale-125 max-lg:scale-100' onPress={()=>{socket?.emit('pause')}}><Pause weight='fill' /></Button>
                      </> : <>
                          <Button isIconOnly radius='full' size='lg' variant='light' className='scale-125 max-lg:scale-100' onPress={()=>{socket?.emit('play')}}><Play weight='fill' /></Button>
                      </>
                  }
                  <Button isIconOnly radius='full' size='md' variant='light' className='scale-110 max-lg:scale-100 max-md:hidden' onPress={()=>{socket?.emit('next')}}><CaretLineRight weight='fill' /></Button>
                  <div className='w-16 max-lg:w-max max-md:hidden flex gap-1 text-center whitespace-nowrap !text-[hsl(var(--pona-app-music-accent-color-500))]'>
                      <span className='lg:hidden flex !text-[hsl(var(--pona-app-music-accent-color-500))]'>{msToTime(ponaCommonState?.pona.position || 0)} / </span>
                      {msToTime(ponaCommonState?.pona.length || 0)}
                  </div>
              </div>
              <div className={`flex items-center justify-end gap-2 w-full max-lg:max-w-[2rem] max-md:hidden mr-3 max-w-[calc(33.33%_-_1rem)]  ${userSetting.dev_pona_player_style==='modern'?'':'lg:mt-4'}`}>
                  <Dropdown>
                      <DropdownTrigger>
                          <Button isIconOnly radius='lg' size='md' variant='light' className='scale-110 max-lg:hidden'><Repeat weight='fill' /></Button>
                      </DropdownTrigger>
                      <DropdownMenu
                          disallowEmptySelection
                          selectionMode="single"
                          selectedKeys={new Set<string>([(!isLoopTrack&&!isLoopQueue)&&'none', isLoopTrack&&'track', isLoopQueue&&'queue'].filter(Boolean) as string[])}
                          onAction={(key)=>{socket?.emit('repeat', key)}}
                          variant="flat"
                      >
                          <DropdownSection title={language.data.app.guilds.player.repeat.title}>
                              <DropdownItem startContent={<MusicNotes />} key="none">{language.data.app.guilds.player.repeat.off}</DropdownItem>
                              <DropdownItem startContent={<RepeatOnce />} key="track">{language.data.app.guilds.player.repeat.track}</DropdownItem>
                              <DropdownItem startContent={<Repeat />} key="queue">{language.data.app.guilds.player.repeat.queue}</DropdownItem>
                          </DropdownSection>
                      </DropdownMenu>
                  </Dropdown>
                  <Popover placement="top">
                      <PopoverTrigger>
                          <Button isIconOnly radius='lg' size='md' variant='light' className='scale-110 max-lg:hidden'><Equalizer weight='fill' /></Button>
                      </PopoverTrigger>
                      <PopoverContent>
                          <div className="p-1">
                              <div className='w-72 h-36 relative'>
                                  <div className="text-base font-bold">{language.data.app.guilds.player.equalizer.title}</div>
                                  <div className="text-lg absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">{language.data.extensions.comingsoon}</div>
                              </div>
                          </div>
                      </PopoverContent>
                  </Popover>
                  <Button isIconOnly radius='lg' size='md' variant='light' className='scale-110 max-lg:hidden hidden'><SpeakerSimpleHigh weight='fill' /></Button>
                  <Button isIconOnly radius='lg' size='md' variant='light' className='scale-110 max-md:hidden' onPress={()=>{setPlayerPopup((value)=>{
                      if ( !value ) document.body.classList.add('pona-player-focused');
                      else document.body.classList.remove('pona-player-focused');
                      return !value;
                  })}}>
                      <CaretUp className={`absolute ${playerPopup?'opacity-0 -translate-y-6':''}`} />
                      <CaretDown className={`absolute ${!playerPopup?'opacity-0 translate-y-6':''}`} />
                  </Button>
              </div>
          </div>
      </motion.div>}
  </AnimatePresence>
  )
}

export default DesktopPonaPlayer