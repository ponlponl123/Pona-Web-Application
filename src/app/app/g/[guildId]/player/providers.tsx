"use client"
import React, { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useLanguageContext } from '@/contexts/languageContext'
import { CaretDown, CaretLineLeft, CaretLineRight, CaretUp, Equalizer, MusicNotes, MusicNoteSimple, Pause, Play, Repeat, RepeatOnce, SpeakerSimpleHigh } from '@phosphor-icons/react/dist/ssr'
import PageAnimatePresence from '@/components/HOC/PageAnimatePresence'
import { Button, Dropdown, DropdownItem, DropdownMenu, DropdownSection, DropdownTrigger, Image, Link, Popover, PopoverContent, PopoverTrigger, Slider } from '@nextui-org/react'

import defaultImage from '@/../public/Ponlponl123 (1459).png';
import SocketConnecting from './@system/socket-connecting'
import { usePonaMusicContext } from '@/contexts/ponaMusicContext'
import LetsPonaJoin from './@system/lets-pona-join'
import { useDiscordGuildInfo } from '@/contexts/discordGuildInfo'
import { useDiscordUserInfo } from '@/contexts/discordUserInfo'

import backdrop from '@/../public/backdrop.png'
import { useGlobalContext } from '@/contexts/globalContext'
import { msToTime } from '@/utils/time'

function Providers({ children }: { children: React.ReactNode }) {
    const [ playerPopup, setPlayerPopup ] = useState<boolean>(false);
    const { guild } = useDiscordGuildInfo();
    const { language } = useLanguageContext();
    const { userInfo } = useDiscordUserInfo();
    const { isConnected, socket } = usePonaMusicContext();
    const { ponaCommonState } = useGlobalContext();
    const isLoopTrack = ponaCommonState?.pona.repeat.track;
    const isLoopQueue = ponaCommonState?.pona.repeat.queue;
    const currentTrack = ponaCommonState?.current;
    const backdropBg = currentTrack ? currentTrack.artworkUrl ? currentTrack.artworkUrl : currentTrack.thumbnail : guild?.bannerURL ? guild.bannerURL+'?size=640' :
        guild?.iconURL ? guild.iconURL+'?size=640' : userInfo?.banner ? `https://cdn.discordapp.com/banners/${userInfo.id}/${userInfo.banner}?size=640` : userInfo?.avatar ? `https://cdn.discordapp.com/avatars/${userInfo.id}/${userInfo.avatar}?size=640` :
        backdrop.src;

    return (
        <>
            <main id='app-panel' className='relative bg-gradient-to-t light:from-warning/10 to-primary/20 h-screen -mb-6 border-l-2 border-foreground/10'>
                <div className='absolute w-full h-1/2 max-h-96 min-h-48 top-0 left-0 z-[1] opacity-40'>
                    <Image src={backdropBg || backdrop.src} alt={currentTrack?currentTrack.title:guild?.name || ''} width={"100%"} height={320}
                        className='object-cover blur-3xl scale-125 w-full h-96 pointer-events-none'
                    />
                </div>
                <main id='app-workspace' style={{maxWidth:'unset'}}>
                    <div className='absolute top-6 left-6 flex items-center gap-12 z-50 w-full'>
                        <h1 className='items-center text-2xl gap-4 hidden'>
                            <MusicNoteSimple weight='fill' size={24} /> {language.data.app.guilds.player.name}
                        </h1>
                    </div>
                    {
                        (isConnected || socket?.connected) ?
                            !ponaCommonState?.pona.voiceChannel ?
                            <LetsPonaJoin /> :
                            <PageAnimatePresence>{children}</PageAnimatePresence>
                        : <SocketConnecting />
                    }
                </main>
            </main>
            <AnimatePresence>
                <motion.div id='pona=player-wrapper'
                    key={currentTrack?'true':'false'}
                    initial={{ opacity: 0, pointerEvents: 'none', translateY: 32 }}
                    animate={{ opacity: 1, pointerEvents: 'all', translateY: 0 }}
                    exit={{ opacity: 0, pointerEvents: 'none', translateY: 32 }}
                    className={
                        `absolute max-md:overflow-hidden h-[5.6rem] max-lg:h-16 max-md:bottom-6 bottom-2 left-2 bg-gradient-to-br to-foreground/5 max-md:to-[hsl(var(--pona-app-music-accent-color-500),0.24)] from-[hsl(var(--pona-app-music-accent-color-500),0.24)] md:border-2 border-foreground/5 backdrop-blur-md max-md:rounded-lg rounded-2xl`
                    } style={{width:'calc(100% - 1rem)'}}>
                    <Slider
                        aria-label="PlayerSeekBar"
                        className="absolute top-1 left-24 z-20 group shadow-2xl max-lg:-top-2.5 max-lg:left-2 w-[calc(100%_-_7rem)] max-lg:w-[calc(100%_-_1rem)] max-md:max-w-none max-md:w-full max-md:left-0"
                        classNames={{
                            track: '!border-s-[hsl(var(--pona-app-music-accent-color-500))] cursor-pointer',
                            filler: '!bg-[hsl(var(--pona-app-music-accent-color-500))] transition-all ease-linear duration-[1s]'
                        }}
                        renderThumb={(props) => (
                            <div
                                {...props}
                                className="transition-all md:p-1 ease-linear duration-[1s] top-1/2 !bg-[hsl(var(--pona-app-music-accent-color-500))] shadow-medium rounded-full cursor-grab data-[dragging=true]:cursor-grabbing"
                            >
                                <span className="group-hover:h-1 group-hover:w-1 transition-transform !bg-[hsl(var(--pona-app-music-accent-color-500))] rounded-full max-md:w-1 max-md:h-1 w-0 h-0 block group-data-[dragging=true]:scale-80" />
                            </div>
                        )}
                        defaultValue={ponaCommonState?.pona.position}
                        maxValue={ponaCommonState?.pona.length}
                        value={ponaCommonState?.pona.position}
                        minValue={0}
                        size="sm"
                        step={1}
                    />
                    <div
                        id='pona-player'
                        className={
                            `rounded-2xl max-md:rounded-lg max-md:p-2 p-2 max-lg:p-1 flex flex-row items-center justify-between gap-4 absolute overflow-hidden w-full h-full select-none`
                        } onClick={()=>{setPlayerPopup((value)=>!value)}}>
                        <Image src={currentTrack ? currentTrack.artworkUrl : defaultImage.src} alt={currentTrack ? currentTrack.title : 'Thumbnail'} height={'4.4rem'} className='z-10 blur-3xl absolute left-0 -translate-y-1/2 w-1/4 min-w-32 object-cover max-md:hidden' />
                        <motion.div
                            className='flex items-center justify-start gap-4 w-full -ml-4 max-lg:max-w-[calc(50%_-_1rem)] max-md:max-w-[calc(100%_-_4rem)] max-w-[calc(33.33%_-_1rem)]'
                            animate={{
                                transition: {
                                    duration: 0.2,
                                    type: 'spring'
                                }
                            }}
                        >
                            <Image src={currentTrack ? currentTrack.artworkUrl : defaultImage.src} alt={currentTrack ? currentTrack.title : 'Thumbnail'}
                                className='w-[4.4rem] h-[4.4rem] object-cover max-lg:h-12 max-lg:w-12 max-md:rounded-lg'
                                loading='lazy' shadow='lg' isBlurred id='pona-music-thumbnail' />
                            <div className='flex flex-col justify-center items-start lg:mt-4' style={{width:'calc(100% - 5.4rem)'}}>
                                <div className='text-xl max-w-full flex gap-2'>
                                    <h1 className='text-xl max-lg:text-base !text-[hsl(var(--pona-app-music-accent-color-500))] w-full whitespace-nowrap overflow-hidden overflow-ellipsis'>{currentTrack ? currentTrack.title : 'Music Name'}</h1>
                                    {currentTrack ? <Link href={currentTrack.uri} className='!text-[hsl(var(--pona-app-music-accent-color-500))]' showAnchorIcon target='_blank' /> : <></>}
                                </div>
                                <span className='text-sm max-lg:text-xs text-foreground/40 w-full whitespace-nowrap overflow-hidden overflow-ellipsis'>{currentTrack ? currentTrack.author : 'Author'}</span>
                            </div>
                        </motion.div>
                        <div className='flex items-center justify-center gap-4 w-full max-lg:max-w-[calc(50%_-_3rem)] max-md:max-w-[3rem] max-w-[calc(33.33%_-_1rem)] lg:mt-4'>
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
                        <div className='flex items-center justify-end gap-2 w-full max-lg:max-w-[2rem] max-md:hidden mr-3 max-w-[calc(33.33%_-_1rem)] lg:mt-4'>
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
                            <Popover placement="top" showArrow={true}>
                                <PopoverTrigger>
                                    <Button isIconOnly radius='lg' size='md' variant='light' className='scale-110 max-lg:hidden'><Equalizer weight='fill' /></Button>
                                </PopoverTrigger>
                                <PopoverContent>
                                    <div className="px-1 py-2">
                                    <div className="text-small font-bold">Popover Content</div>
                                    <div className="text-tiny">This is the popover content</div>
                                    </div>
                                </PopoverContent>
                            </Popover>
                            <Button isIconOnly radius='lg' size='md' variant='light' className='scale-110 max-lg:hidden hidden'><SpeakerSimpleHigh weight='fill' /></Button>
                            <Button isIconOnly radius='lg' size='md' variant='light' className='scale-110 max-md:hidden' onPress={()=>{setPlayerPopup((value)=>!value)}}>
                                <CaretUp className={`absolute ${playerPopup?'opacity-0 -translate-y-6':''}`} />
                                <CaretDown className={`absolute ${!playerPopup?'opacity-0 translate-y-6':''}`} />
                            </Button>
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>
        </>
    )
}

export default Providers