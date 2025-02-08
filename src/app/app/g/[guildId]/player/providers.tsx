"use client"
import React from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useDiscordUserInfo } from '@/contexts/discordUserInfo'
import { useDiscordGuildInfo } from '@/contexts/discordGuildInfo'
import { useLanguageContext } from '@/contexts/languageContext'
import { usePonaMusicContext } from '@/contexts/ponaMusicContext'
import { useUserSettingContext } from '@/contexts/userSettingContext'

import PageAnimatePresence from '@/components/HOC/PageAnimatePresence'
import { CaretDown, CaretLineLeft, CaretLineRight, CaretUp, Coffee, DotsThreeVertical, Equalizer, Heart, MusicNotes, MusicNoteSimple, Pause, Play, Repeat, RepeatOnce, SpeakerSimpleHigh } from '@phosphor-icons/react/dist/ssr'
import { Button, Dropdown, DropdownItem, DropdownMenu, DropdownSection, DropdownTrigger, Image, Link, Popover, PopoverContent, PopoverTrigger, ScrollShadow, Slider, Tab, Tabs } from '@nextui-org/react'

import backdrop from '@/../public/backdrop.png'
import defaultImage from '@/../public/Ponlponl123 (1459).png'

import LetsPonaJoin from './@system/lets-pona-join'
import SocketConnecting from './@system/socket-connecting'
import { useGlobalContext } from '@/contexts/globalContext'
import { msToTime } from '@/utils/time'
import { useRouter } from 'next/navigation'

function Providers({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const { guild } = useDiscordGuildInfo();
    const { language } = useLanguageContext();
    const { userInfo } = useDiscordUserInfo();
    const { ponaCommonState } = useGlobalContext();
    const { userSetting } = useUserSettingContext();
    const { isConnected, socket, playerPopup, setPlayerPopup } = usePonaMusicContext();
    const isLoopTrack = ponaCommonState?.pona.repeat.track;
    const isLoopQueue = ponaCommonState?.pona.repeat.queue;
    const currentTrack = ponaCommonState?.current;
    const backdropBg = currentTrack ? currentTrack.artworkUrl ? currentTrack.artworkUrl : currentTrack.thumbnail : guild?.bannerURL ? guild.bannerURL+'?size=640' :
        guild?.iconURL ? guild.iconURL+'?size=640' : userInfo?.banner ? `https://cdn.discordapp.com/banners/${userInfo.id}/${userInfo.banner}?size=640` : userInfo?.avatar ? `https://cdn.discordapp.com/avatars/${userInfo.id}/${userInfo.avatar}?size=640` :
        backdrop.src;
    
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
            <main id='app-panel' className='relative bg-gradient-to-t light:from-warning/10 to-primary/20 h-screen -mb-6 border-l-2 border-foreground/10'>
                <div className='absolute w-full h-1/2 max-h-96 min-h-48 top-0 left-0 z-[1] opacity-40'>
                {
                    userSetting.transparency ? 
                    <Image src={backdropBg || backdrop.src} alt={currentTrack?currentTrack.title:guild?.name || ''} width={"100%"} height={320}
                        className='object-cover blur-3xl scale-125 w-full h-96 pointer-events-none saturate-200 brightness-110'
                    />
                    : <div className='w-full h-96 bg-gradient-to-t from-transparent to-[hsl(var(--pona-app-music-accent-color-500))]'></div>
                }
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
                {
                    (currentTrack && playerPopup) &&
                    <motion.div
                        className={
                            (
                                userSetting.dev_pona_player_style === 'modern' ?
                                'absolute z-40 left-2 p-8 bottom-[6.1rem] max-md:rounded-lg rounded-2xl w-[calc(100%_-_1rem)] h-[calc(100vh_-_6.8rem)] transition-all ease-out duration-250 overflow-hidden' :
                                'absolute z-40 left-2 p-8 bottom-[6.4rem] max-md:rounded-lg rounded-2xl w-[calc(100%_-_1rem)] h-[calc(100vh_-_6.8rem)] transition-all ease-out duration-250 overflow-hidden'
                            )
                            + (userSetting.transparency ? ' backdrop-blur-2xl to-playground-background/100' : ' [html.light_&]:!to-[hsl(var(--pona-app-music-accent-color-50))] [html.dark_&]:!to-[hsl(var(--pona-app-music-accent-color-800))]')
                        }
                        id='pona=player-panel'
                        transition={{
                            duration: 0.12
                        }}
                        initial={{ opacity: 0, pointerEvents: 'none', translateY: 96 }}
                        animate={{ opacity: 1, pointerEvents: 'auto', translateY: 0 }}
                        exit={{ opacity: 0, pointerEvents: 'none', translateY: 64 }}>
                        {
                            userSetting.transparency &&
                            <Image src={currentTrack ? currentTrack.artworkUrl : defaultImage.src} alt={currentTrack ? currentTrack.title : 'Backdrop'}
                                className='absolute -z-10 w-full h-full top-0 left-0 object-cover blur-3xl'/>
                        }
                        <div className={
                            'absolute -z-10 w-full h-full top-0 left-0 ' +
                            ( userSetting.transparency ? ' bg-gradient-to-t [html.light_&]:!from-[hsl(var(--pona-app-music-accent-color-50))] [html.dark_&]:!from-[hsl(var(--pona-app-music-accent-color-900))]' :
                                '[html.light_&]:!bg-[hsl(var(--pona-app-music-accent-color-50))] [html.dark_&]:!bg-[hsl(var(--pona-app-music-accent-color-900))]' )
                        }></div>
                        <div className='w-full h-full flex gap-12 justify-evenly items-center pt-16'>
                            <div className='w-[64vh] h-[64vh] max-2xl:w-[42vh] max-2xl:h-[42vh] max-xl:w-[26vh] max-xl:h-[26vh] max-xl:[body:not(.sidebar-collapsed)_&]:hidden max-lg:hidden max-lg:h-12 max-lg:w-12 aspect-square relative flex'>
                                <Image src={currentTrack ? currentTrack.highResArtworkUrl || currentTrack.artworkUrl : defaultImage.src} alt={currentTrack ? currentTrack.title : 'Artwork'}
                                    className={
                                        'w-full h-full object-cover'
                                    }
                                    loading='lazy' shadow='lg' radius='lg' isBlurred={userSetting.transparency} id='pona-music-artwork'
                                />
                            </div>
                            <div className='w-full h-full max-w-lg' id='pona-music-queue'>
                                <Tabs aria-label="Options" variant='underlined' size='lg' fullWidth
                                    classNames={{
                                        tabContent: '!text-[hsl(var(--pona-app-music-accent-color-500))]',
                                        cursor: 'bg-[hsl(var(--pona-app-music-accent-color-500))]',
                                        panel: 'h-full max-h-full'
                                    }}>
                                    <Tab key="next" title="Next">
                                        <ScrollShadow className='h-full pr-2' style={{scrollbarWidth:'thin',scrollbarColor:'hsl(var(--pona-app-music-accent-color-500))'}}>
                                            <div className='flex flex-col gap-2'>
                                            {
                                                ponaCommonState.queue.map((track, index) => {
                                                    const isThisTrack = ponaCommonState.current?.identifier === track.identifier;
                                                    return (
                                                        <div className={`w-full py-2 px-2.5 flex gap-4 items-center rounded-3xl group ${
                                                            isThisTrack?'[.light_&]:bg-[hsl(var(--pona-app-music-accent-color-100))] [.dark_&]:bg-[hsl(var(--pona-app-music-accent-color-800))] active':''
                                                        }`} key={index}>
                                                            <div className='w-11 h-11 select-none relative overflow-hidden rounded-2xl'>
                                                                <Image src={track.artworkUrl} alt={track.title} height={44} width={44} className={
                                                                    'object-cover rounded-lg z-0 ' + 
                                                                    ( (!ponaCommonState.pona.paused && isThisTrack) ? 'brightness-50 saturate-0' : 'group-hover:brightness-50 group-hover:saturate-0' )
                                                                } />
                                                                <div className={'absolute top-0 left-0 w-full h-full bg-background/35 z-[5] ' +
                                                                    ( (!ponaCommonState.pona.paused && isThisTrack) ? 'opacity-100' : 'group-hover:opacity-100 opacity-0' )
                                                                }></div>
                                                                {
                                                                    (!ponaCommonState.pona.paused && isThisTrack) ?
                                                                    <Button className='absolute z-10 top-0 left-0 w-full h-full opacity-100' variant='light' radius='full' isIconOnly onPress={()=>{socket?.emit('pause')}}><SpeakerSimpleHigh className='text-white' weight='fill' /></Button> :
                                                                    <Button className='absolute z-10 top-0 left-0 w-full h-full group-hover:opacity-100 opacity-0' variant='light' radius='full' isIconOnly onPress={()=>{
                                                                        if ( isThisTrack ) socket?.emit('play');
                                                                        else 
                                                                            if (index-1 === 0) socket?.emit('next');
                                                                            else socket?.emit('skipto', index-1);
                                                                    }}><Play className='text-white' weight='fill' /></Button>
                                                                }
                                                            </div>
                                                            <div className='w-[calc(100%_-_10rem)]'>
                                                                <h1 className='w-full [div.active_&]:text-[hsl(var(--pona-app-music-accent-color-500))] whitespace-nowrap overflow-hidden overflow-ellipsis'>{track.title}</h1>
                                                                <span className='w-full text-xs text-foreground/40 [div.active_&]:text-[hsl(var(--pona-app-music-accent-color-500)/0.4)] whitespace-nowrap overflow-hidden overflow-ellipsis'>{track.author}</span>
                                                            </div>
                                                            <div className='ml-auto relative w-12 h-12 flex items-center justify-center'>
                                                                <span className='[div.active_&]:text-[hsl(var(--pona-app-music-accent-color-500)/0.64)] group-hover:opacity-0 opacity-100 pointer-events-none'>{msToTime(track.duration || 0)}</span>
                                                                <Button className='absolute z-10 top-0 left-0 w-full h-full group-hover:opacity-100 opacity-0' variant='light' radius='full' isIconOnly><DotsThreeVertical weight='bold' /></Button>
                                                            </div>
                                                        </div>
                                                    )
                                                })
                                            }
                                            </div>
                                        </ScrollShadow>
                                    </Tab>
                                    <Tab key="lyrics" title="Lyrics">
                                        <ScrollShadow className='h-full pr-2' style={{scrollbarWidth:'thin',scrollbarColor:'hsl(var(--pona-app-music-accent-color-500))'}}>
                                            <div className='flex flex-col gap-4 items-center justify-center w-full h-full'>
                                                <Coffee size={56} weight='fill' className='text-[hsl(var(--pona-app-music-accent-color-500))]' />
                                                <h1 className='text-2xl max-w-screen-md text-center text-[hsl(var(--pona-app-music-accent-color-500)/0.64)]'>{language.data.app.guilds.player.dev}</h1>
                                                <Link href='/app/updates' rel='noopener' onPress={()=>{router.push('/app/updates')}}>
                                                    <Button color='secondary' className='mt-2 bg-[hsl(var(--pona-app-music-accent-color-500))]' radius='full'><Heart weight='fill' /> {language.data.app.updates.follow}</Button>
                                                </Link>
                                            </div>
                                        </ScrollShadow>
                                    </Tab>
                                    <Tab key="related" title="Related">
                                        <ScrollShadow className='h-full pr-2' style={{scrollbarWidth:'thin',scrollbarColor:'hsl(var(--pona-app-music-accent-color-500))'}}>
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
                            <Image src={currentTrack ? currentTrack.artworkUrl : defaultImage.src} alt={currentTrack ? currentTrack.title : 'Thumbnail'} height={'4.4rem'} className='z-10 blur-3xl absolute left-0 -translate-y-1/2 w-1/4 min-w-32 object-cover max-md:hidden' />
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
                            <Image src={currentTrack ? currentTrack.artworkUrl : defaultImage.src} alt={currentTrack ? currentTrack.title : 'Thumbnail'}
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
        </>
    )
}

export default Providers