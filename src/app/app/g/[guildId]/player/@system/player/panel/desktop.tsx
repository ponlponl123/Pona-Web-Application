"use client";
import React from 'react'
import { AnimatePresence, HTMLMotionProps, motion } from 'framer-motion'
import { useGlobalContext } from '@/contexts/globalContext'
import { useLanguageContext } from '@/contexts/languageContext'
import { usePonaMusicContext } from '@/contexts/ponaMusicContext'
import { useUserSettingContext } from '@/contexts/userSettingContext'
import { usePlaybackContext } from '@/contexts/playbackContext'

import { msToTime } from '@/utils/time'
import { useRouter } from 'next/navigation'

import { Coffee, DotsThreeVertical, Heart, MonitorPlay, PersonSimple, PictureInPicture, Play, Trash } from '@phosphor-icons/react/dist/ssr'
import { Button, Dropdown, DropdownItem, DropdownMenu, DropdownSection, DropdownTrigger, Image, Link, ScrollShadow, Skeleton, Spinner, Tab, Tabs } from '@nextui-org/react'
import LyricsDisplay from '@/components/music/lyricsDisplay';
import { Track, UnresolvedTrack } from '@/interfaces/ponaPlayer';

import {
    DndContext, 
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {CSS} from '@dnd-kit/utilities';
import Equalizing from '@/components/equalizing';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuLabel, ContextMenuTrigger } from '@/components/context-menu';
import toast from 'react-hot-toast';

function DesktopPonaPlayerPanel() {
    const router = useRouter();
    const { language } = useLanguageContext();
    const { ponaCommonState, ponaTrackQueue, setPonaTrackQueue, isFullscreenMode, setIsFullscreenMode } = useGlobalContext();
    const { playback } = usePlaybackContext();
    const { userSetting } = useUserSettingContext();
    const { socket, playerPopup } = usePonaMusicContext();
    const currentTrack = ponaCommonState?.current;
    const lyricsContainerRef = React.useRef<HTMLElement>(null);
    const playerPos = playback;
    const sensors = useSensors(
      useSensor(PointerSensor),
      useSensor(KeyboardSensor, {
        coordinateGetter: sortableKeyboardCoordinates,
      })
    );
  
    function handleDragEnd(event: DragEndEvent) {
        if ( !ponaTrackQueue ) return;
        const {active, over} = event;
        if (over && active.id !== over.id) {
            setPonaTrackQueue((value) => {
                if (!value.queue) return value;
                const oldIndex = value.queue.findIndex(track => track.uniqueId === active.id);
                const newIndex = value.queue.findIndex(track => track.uniqueId === over.id);
                socket?.emit('move', oldIndex, newIndex);
                return {
                    queue: arrayMove(value.queue, oldIndex, newIndex),
                    updating: true
                };
            });
        }
      }

    return (
        <>
        <AnimatePresence>
        {
            (currentTrack && playerPopup) &&
            <motion.div
                className={
                    (
                        userSetting.dev_pona_player_style === 'modern' ?
                        'absolute z-40 left-2 p-8 bottom-[6.1rem] max-lg:bottom-[5.3rem] max-lg:h-[calc(100vh_-_5.8rem)] max-md:rounded-lg rounded-3xl w-[calc(100%_-_1rem)] h-[calc(100vh_-_6.6rem)] transition-all ease-out duration-250 overflow-hidden' :
                        'absolute z-40 left-2 p-8 bottom-[6.4rem] max-lg:bottom-[5.3rem] max-lg:h-[calc(100vh_-_6rem)] max-md:rounded-lg rounded-3xl w-[calc(100%_-_1rem)] h-[calc(100vh_-_6.8rem)] transition-all ease-out duration-250 overflow-hidden'
                    )
                    + (userSetting.transparency ? ' backdrop-blur-2xl to-playground-background/100' : ' [html.light_&]:!from-[hsl(var(--pona-app-music-accent-color-200))] [html.light_&]:!to-[hsl(var(--pona-app-music-accent-color-50))] [html.dark_&]:!to-[hsl(var(--pona-app-music-accent-color-800))] [html.dark_&]:!from-[hsl(var(--pona-app-music-accent-color-400))]')
                }
                id='pona=player-panel'
                transition={{
                    duration: 0.12
                }}
                initial={{ opacity: 0, pointerEvents: 'none', translateY: 32 }}
                animate={{ opacity: 1, pointerEvents: 'auto', translateY: 0 }}
                exit={{ opacity: 0, pointerEvents: 'none', translateY: 64 }}>
                {
                    userSetting.transparency &&
                    <Image src={currentTrack ? currentTrack?.proxyArtworkUrl : '/static/Ponlponl123 (1459).png'} alt={currentTrack ? currentTrack.title : 'Backdrop'}
                        className='absolute -z-10 scale-[2] w-full h-full top-0 left-0 object-cover blur-[128px] [html.dark_&]:brightness-50 [html.light_&]:brightness-200 [html.dark_&]:saturate-150' classNames={{wrapper:'contents'}}/>
                }
                <div className={
                    'absolute -z-10 w-full h-full top-0 left-0 ' +
                    ( userSetting.transparency ? ' bg-gradient-to-t [html.light_&]:!from-[hsl(var(--pona-app-music-accent-color-50))] [html.dark_&]:!from-[hsl(var(--pona-app-music-accent-color-900))]' :
                        '[html.light_&]:!bg-[hsl(var(--pona-app-music-accent-color-50))] [html.dark_&]:!bg-[hsl(var(--pona-app-music-accent-color-900))]' )
                }></div>
                <div className='w-full h-full flex gap-12 justify-between items-center pt-16'>
                    <motion.div layoutId='pona-music-panel-artwork' className='m-auto flex flex-col items-center gap-6'>
                        <div className='flex flex-wrap gap-4 items-center justify-center -mt-12'>
                            <Button color='default' variant='ghost' radius='full' className='w-fit' onPress={()=>{setIsFullscreenMode((value)=>!value)}}>
                                {
                                    !isFullscreenMode ? <><MonitorPlay />{language.data.app.guilds.player.full_screen_mode.enter}</>
                                    : <Spinner size='sm' />
                                }
                            </Button>
                            <Button color='default' variant='ghost' radius='full' className='w-fit' isDisabled><PictureInPicture />{language.data.app.guilds.player.picinpic_mode.enter}</Button>
                        </div>
                        <div className='w-[56vh] max-2xl:w-[42vh] max-xl:w-[32vh] max-xl:[body:not(.sidebar-collapsed)_&]:w-[26vh] aspect-square relative flex group hover:scale-[1.032] active:scale-[1.016]'>
                            <Image src={currentTrack ? currentTrack.proxyHighResArtworkUrl || currentTrack?.proxyArtworkUrl : '/static/Ponlponl123 (1459).png'} alt={currentTrack ? currentTrack.title : 'Artwork'}
                                className={
                                    'w-full h-full object-cover select-none rounded-2xl'
                                }
                                loading='lazy' shadow='lg' isBlurred={userSetting.transparency} id='pona-music-artwork'
                            />
                            <div className='absolute top-0 left-0 z-[14] w-full h-full bg-gradient-to-t to-transparent rounded-2xl [html.light_&]:from-white/40 [html.dark_&]:from-black/40 opacity-0 group-hover:opacity-100 pointer-events-none'></div>
                        </div>
                    </motion.div>
                    <div className='w-full h-full max-w-screen-md' id='pona-music-queue'>
                        <Tabs aria-label="Options" variant='underlined' size='lg' radius='full' fullWidth
                            classNames={{
                                tabContent: '[html.dark_&]:!text-[hsl(var(--pona-app-music-accent-color-300))] [html.light_&]:!text-[hsl(var(--pona-app-music-accent-color-700))]',
                                cursor: '[html.dark_&]:bg-[hsl(var(--pona-app-music-accent-color-300))] [html.light_&]:bg-[hsl(var(--pona-app-music-accent-color-700))]',
                                panel: 'h-full max-h-full'
                            }}>
                            <Tab key="next" title={language.data.app.guilds.player.tabs.next}>
                                <ScrollShadow className='overflow-x-hidden h-full pr-2 pb-4 relative' style={{scrollbarWidth:'thin',scrollbarColor:'hsl(var(--pona-app-music-accent-color-500)) transparent'}}>
                                    <div className='flex flex-col gap-2 px-3 py-1'>
                                    {
                                        ponaTrackQueue && ponaTrackQueue.queue && ponaTrackQueue.queue[0] &&
                                        <TrackQueue active={ponaCommonState.current?.uniqueId === ponaTrackQueue.queue[0].uniqueId} index={0} track={ponaTrackQueue.queue[0]} />
                                    }
                                    { ponaTrackQueue && ponaTrackQueue.queue &&
                                    <DndContext
                                        sensors={sensors}
                                        collisionDetection={closestCenter}
                                        onDragEnd={handleDragEnd}
                                        autoScroll
                                    >
                                    <SortableContext
                                        items={ponaTrackQueue.queue.filter(track => track.uniqueId !== undefined).map(track => track.uniqueId as string)}
                                        strategy={verticalListSortingStrategy}
                                    >
                                    {
                                        ponaTrackQueue.queue.slice(1).map((track, index) => {
                                            const isThisTrack = ponaCommonState.current?.uniqueId === track.uniqueId;
                                            return <DraggableTrack isLoading={ponaTrackQueue.updating} active={isThisTrack} index={index+1} key={track.uniqueId} track={track} />
                                        })
                                    }
                                    </SortableContext>
                                    </DndContext>
                                    }</div>
                                </ScrollShadow>
                            </Tab>
                            <Tab key="lyrics" title={language.data.app.guilds.player.tabs.lyrics} isDisabled={!(currentTrack.lyrics && currentTrack.lyrics.lyrics?.length > 0)}>
                                <ScrollShadow className='h-full pr-2 pt-4 pb-12' style={{scrollbarWidth:'thin',scrollbarColor:'hsl(var(--pona-app-music-accent-color-500)) transparent'}} ref={lyricsContainerRef}>
                                    {lyricsContainerRef.current && (
                                        currentTrack.lyrics?.isTimestamp ?
                                            <LyricsDisplay playerPosition={playerPos} currentTrack={currentTrack as Track} lyricsProvider={lyricsContainerRef.current} /> :
                                            (currentTrack.lyrics?.lyrics && currentTrack.lyrics.lyrics.length > 0) && (currentTrack.lyrics.lyrics as string[]).map((lyric, index) => (
                                                <div key={index} className='flex items-center gap-2'>
                                                    <span className='text-2xl [html.dark_&]:brightness-125 my-4 text-[hsl(var(--pona-app-music-accent-color-500))]'>{lyric}</span>
                                                </div>
                                            ))
                                    )}
                                </ScrollShadow>
                            </Tab>
                            <Tab key="related" title={language.data.app.guilds.player.tabs.related}>
                                <ScrollShadow className='h-full pr-2' style={{scrollbarWidth:'thin',scrollbarColor:'hsl(var(--pona-app-music-accent-color-500)) transparent'}}>
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

export function DraggableTrack({index, track, active, isLoading}:
    {
        index: number,
        track: Track | UnresolvedTrack,
        active: boolean,
        isLoading?: boolean
    }
) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({id: track.uniqueId as string});
    
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };
    return (
        <TrackQueue
            ref={setNodeRef}
            active={active}
            index={index}
            track={track}
            isLoading={isLoading}
            params={{
                layout: true,
                initial: false,
                whileTap: {
                    outline: "2px hsl(var(--pona-app-music-accent-color-500)) solid",
                    backdropFilter: 'blur(12px)',
                    userSelect: "none",
                    zIndex: 24,
                },
                style,
                ...attributes,
                ...listeners
            }}
            key={index}
        />
    )
}

export function TrackQueueContextFunction({ track }: { track: Track | UnresolvedTrack })
{
    const { language } = useLanguageContext();
    const { ponaCommonState } = useGlobalContext();
    const { socket } = usePonaMusicContext();
    return (
        <>
            <ContextMenuLabel>{track.title}</ContextMenuLabel>
            <ContextMenuItem className='contents'>
                <Button fullWidth variant='light' className='justify-start'><Heart weight='bold' /> {language.data.app.guilds.player.context_menu.add_to_favorite}</Button>
            </ContextMenuItem>
            {
                ponaCommonState?.current?.uniqueId !== track.uniqueId &&
                <ContextMenuItem className='contents' onClick={()=>{toast.promise(
                    new Promise<void>((resolve, reject) => {
                        socket?.emit('rm', track.uniqueId, (error: unknown) => {
                            if (error && (error as { status?: string }).status !== 'ok') {
                                reject(error);
                            } else {
                                resolve();
                            }
                        });
                    }),
                    {
                        loading: language.data.app.guilds.player.toast.rm_track.loading.replace('[track_name]', track.title).replace('[artist]', String(track.author)),
                        success: language.data.app.guilds.player.toast.rm_track.success.replace('[track_name]', track.title).replace('[artist]', String(track.author)),
                        error: language.data.app.guilds.player.toast.rm_track.error,
                    },
                    {
                        position: 'top-center'
                    }
                )}}>
                    <Button fullWidth variant='light' className='justify-start'><Trash weight='bold' /> {language.data.app.guilds.player.context_menu.rm_from_queue}</Button>
                </ContextMenuItem>
            }
            <ContextMenuItem className='contents'>
                <Button fullWidth variant='light' className='justify-start'><PersonSimple weight='bold' /> {language.data.app.guilds.player.context_menu.goto_artist}</Button>
            </ContextMenuItem>
        </>
    )
}

export function TrackQueue({index, track, active, isLoading, ref, params}:
    {
        index: number,
        track: Track | UnresolvedTrack,
        active: boolean,
        isLoading?: boolean,
        ref?: React.LegacyRef<HTMLDivElement>,
        params?: HTMLMotionProps<"div">
    }
) {
    const { ponaCommonState } = useGlobalContext();
    const { socket } = usePonaMusicContext();
    const paused = ponaCommonState?.pona?.paused || false;
    const { language } = useLanguageContext();

    return (
        <ContextMenu modal={false}>
            <ContextMenuTrigger>
                <motion.div ref={ref}
                    className={`w-full py-2 px-2.5 flex gap-4 items-center rounded-3xl group ${
                        active?'[.light_&]:bg-[hsl(var(--pona-app-music-accent-color-100))] [.dark_&]:bg-[hsl(var(--pona-app-music-accent-color-800))] active':''
                    } ${isLoading?'pointer-events-none':''}`} key={index} {...params}
                >
                    <div className='flex-[0 1 auto] w-11 h-11 select-none relative overflow-hidden rounded-2xl'>
                        <Skeleton isLoaded={!isLoading}>
                            <Image src={track?.proxyArtworkUrl} alt={track.title} height={44} width={44} className={
                                'object-cover rounded-lg z-0 ' + 
                                ( (!paused && active) ? 'brightness-50 saturate-0' : 'group-hover:brightness-50 group-hover:saturate-0' )
                            } />
                        </Skeleton>
                        <div className={'absolute top-0 left-0 w-full h-full bg-background/35 z-[5] ' +
                            ( (!paused && active) ? 'opacity-100' : 'group-hover:opacity-100 opacity-0' )
                        }></div>
                        {
                            (!paused && active) ?
                            <Button className='absolute z-10 top-0 left-0 w-full h-full opacity-100' variant='light' radius='md' isIconOnly onPress={()=>{socket?.emit('pause')}}>
                                <Equalizing steps={3} />
                            </Button> :
                            <Button className='absolute z-10 top-0 left-0 w-full h-full group-hover:opacity-100 opacity-0' variant='light' radius='md' isIconOnly onPress={()=>{
                                if ( active ) socket?.emit('play');
                                else 
                                    if (index-1 === 0) socket?.emit('next');
                                    else socket?.emit('skipto', index-1);
                            }}><Play className='text-white' weight='fill' /></Button>
                        }
                    </div>
                    <div className={`w-0 min-w-0 flex-1 ${isLoading?'flex flex-col gap-1':''}`}>
                        <Skeleton className={isLoading?'rounded-full h-5':'h-max' + ' max-w-full'} isLoaded={!isLoading}
                            classNames={{
                                content: 'whitespace-nowrap overflow-hidden overflow-ellipsis'
                            }}>
                            <h1 className='max-w-full [div.active_&]:text-[hsl(var(--pona-app-music-accent-color-500))]'>{track.title}</h1>
                        </Skeleton>
                        <Skeleton className={isLoading?'rounded-full h-3 w-2/5':'h-max -mt-1' + ' max-w-full'} isLoaded={!isLoading}
                            classNames={{
                                content: 'whitespace-nowrap overflow-hidden overflow-ellipsis'
                            }}>
                            <span className='max-w-full text-xs text-foreground/40 [div.active_&]:text-[hsl(var(--pona-app-music-accent-color-500)/0.4)]'>{track.author} ({track.requester?.displayName || '@'+track.requester?.username})</span>
                        </Skeleton>
                    </div>
                    <div className={`flex-[0 1 auto] ml-auto relative w-12 h-12 flex items-center justify-center ${isLoading?'opacity-0 pointer-events-none':''}`}>
                        <span className='[div.active_&]:text-[hsl(var(--pona-app-music-accent-color-500)/0.64)] group-hover:opacity-0 opacity-100 pointer-events-none'>{msToTime(track.duration || 0)}</span>
		                <Dropdown shouldBlockScroll={false} className='bg-content1/90 backdrop-blur-lg backdrop-brightness-200 backdrop-saturate-200 w-64 rounded-2xl p-[2px] border-2 border-content1-foreground/5 flex flex-col gap-[2px]'>
                            <DropdownTrigger>
                                <Button className='absolute z-10 top-0 left-0 w-full h-full group-hover:opacity-100 opacity-0' variant='light' radius='full' isIconOnly><DotsThreeVertical weight='bold' /></Button>
                            </DropdownTrigger>
                            <DropdownMenu classNames={{
                                base: 'p-0'
                            }}>
                                <DropdownSection title={track.title} classNames={{
                                    heading: 'mb-2 opacity-100 text-foreground mx-2 mb-1 mt-2 text-sm max-h-none block',
                                    base: 'm-0'
                                }}>
                                    <DropdownItem className='p-0 rounded-xl hover:!bg-default/40' key='add_to_fav'>
                                        <Button fullWidth variant='light' className='justify-start !bg-transparent'><Heart weight='bold' /> {language.data.app.guilds.player.context_menu.add_to_favorite}</Button>
                                    </DropdownItem>
                                    {
                                        !active ? (
                                            <DropdownItem className='p-0 rounded-xl hover:!bg-default/40' key='rm_from_queue'>
                                                <Button fullWidth variant='light' className='justify-start !bg-transparent' onPress={()=>{
                                                    toast.promise(
                                                        new Promise<void>((resolve, reject) => {
                                                            socket?.emit('rm', track.uniqueId, (error: unknown) => {
                                                                if (error && (error as { status?: string }).status !== 'ok') {
                                                                    reject(error);
                                                                } else {
                                                                    resolve();
                                                                }
                                                            });
                                                        }),
                                                        {
                                                            loading: language.data.app.guilds.player.toast.rm_track.loading.replace('[track_name]', track.title).replace('[artist]', String(track.author)),
                                                            success: language.data.app.guilds.player.toast.rm_track.success.replace('[track_name]', track.title).replace('[artist]', String(track.author)),
                                                            error: language.data.app.guilds.player.toast.rm_track.error,
                                                        },
                                                        {
                                                            position: 'top-center'
                                                        }
                                                    );
                                                }}><Trash weight='bold' /> {language.data.app.guilds.player.context_menu.rm_from_queue}</Button>
                                            </DropdownItem>
                                        ) : null
                                    }
                                    <DropdownItem className='p-0 rounded-xl hover:!bg-default/40' key='goto_artist'>
                                        <Button fullWidth variant='light' className='justify-start !bg-transparent'><PersonSimple weight='bold' /> {language.data.app.guilds.player.context_menu.goto_artist}</Button>
                                    </DropdownItem>
                                </DropdownSection>
                            </DropdownMenu>
                        </Dropdown>
                    </div>
                </motion.div>
            </ContextMenuTrigger>
            <ContextMenuContent className='z-50 contents'>
                <motion.div
                    initial={{ opacity: 0, y: -6, x: -6 }}
                    animate={{ opacity: 1, y: 0, x: 0 }}
                    exit={{ opacity: 0, y: 12 }}
                    className='bg-content1/90 backdrop-blur-lg backdrop-brightness-200 backdrop-saturate-200 w-64 rounded-2xl p-[2px] border-2 border-content1-foreground/5 flex flex-col gap-[2px]'>
                    <TrackQueueContextFunction track={track} />
                </motion.div>
            </ContextMenuContent>
        </ContextMenu>
    )
}

export default DesktopPonaPlayerPanel