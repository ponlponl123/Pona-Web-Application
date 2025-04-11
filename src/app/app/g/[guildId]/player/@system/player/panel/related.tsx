import { useLanguageContext } from '@/contexts/languageContext';
import { relatedInfo, usePonaMusicCacheContext } from '@/contexts/ponaMusicCacheContext';
import { CaretLeft, CaretRight, Ghost } from '@phosphor-icons/react/dist/ssr'
import { Button, Spinner } from '@nextui-org/react'
import React from 'react'
import { getSongRelated } from '@/server-side-api/internal/search';
import { getCookie } from 'cookies-next';
import { useGlobalContext } from '@/contexts/globalContext';
import { PlaylistCard, ArtistCard } from '@/components/music/card';
import useEmblaCarousel from 'embla-carousel-react';
import { usePrevNextButtons } from '@/utils/Embla/CarouselArrowButtons';
import Track from '@/components/music/searchResult/track';

function Related({videoId}: {videoId?: string}) {
    const { language } = useLanguageContext();
    const { ponaCommonState } = useGlobalContext();
    const { relatedInfoCache, SetRelatedInfoCache } = usePonaMusicCacheContext();
    const [ fetched, setFetched ] = React.useState<boolean>(relatedInfoCache.videoId === videoId);
    const [recommendsEmblaRef, recommendsEmblaApi] = useEmblaCarousel({ skipSnaps: true, align: 'start' });
    const [watchPlaylistEmblaRef, watchPlaylistEmblaApi] = useEmblaCarousel({ skipSnaps: true, align: 'start' });
    const [playlistEmblaRef, playlistEmblaApi] = useEmblaCarousel({ skipSnaps: true });
    const [artistEmblaRef, artistEmblaApi] = useEmblaCarousel({ skipSnaps: true });
    const {
        prevBtnDisabled: recommendsEmblaPrevBtnDisabled,
        nextBtnDisabled: recommendsEmblaNextBtnDisabled,
        onPrevButtonClick: recommendsEmblaOnPrevButtonClick,
        onNextButtonClick: recommendsEmblaOnNextButtonClick
    } = usePrevNextButtons(recommendsEmblaApi);
    const {
        prevBtnDisabled: watchPlaylistEmblaPrevBtnDisabled,
        nextBtnDisabled: watchPlaylistEmblaNextBtnDisabled,
        onPrevButtonClick: watchPlaylistEmblaOnPrevButtonClick,
        onNextButtonClick: watchPlaylistEmblaOnNextButtonClick
    } = usePrevNextButtons(watchPlaylistEmblaApi);
    const {
        prevBtnDisabled: playlistEmblaPrevBtnDisabled,
        nextBtnDisabled: playlistEmblaNextBtnDisabled,
        onPrevButtonClick: playlistEmblaOnPrevButtonClick,
        onNextButtonClick: playlistEmblaOnNextButtonClick
    } = usePrevNextButtons(playlistEmblaApi);
    const {
        prevBtnDisabled: artistEmblaPrevBtnDisabled,
        nextBtnDisabled: artistEmblaNextBtnDisabled,
        onPrevButtonClick: artistEmblaOnPrevButtonClick,
        onNextButtonClick: artistEmblaOnNextButtonClick
    } = usePrevNextButtons(artistEmblaApi);
    React.useEffect(() => {
        console.log('relatedInfoCache', relatedInfoCache)
        if ( !videoId || fetched && relatedInfoCache.videoId === videoId ) return;
        const setFetchedCache = (value: relatedInfo | null) => {
            if ( value === null )
                SetRelatedInfoCache({ videoId, related: undefined, watch_playlist: undefined });
            else
                SetRelatedInfoCache({ videoId, related: value.related, watch_playlist: value.watch_playlist });
            setFetched(true);
        }
        const fetchRelated = async () => {
            const accessToken = getCookie('LOGIN_');
            const accessTokenType = getCookie('LOGIN_TYPE_');
            if ( !accessToken || !accessTokenType ) return setFetchedCache(null);
            const songRelated = await getSongRelated(accessTokenType, accessToken, videoId);
            if ( !songRelated ) return setFetchedCache(null);
            setFetchedCache({ videoId, related: songRelated.related, watch_playlist: songRelated.watch_playlist });
        }
        fetchRelated();
    }, [SetRelatedInfoCache, fetched, relatedInfoCache, relatedInfoCache.videoId, videoId])
    if ( !videoId ) return (
        <div className='flex flex-col gap-4 items-center justify-center w-full h-full'>
            <Ghost size={56} weight='fill' className='text-[hsl(var(--pona-app-music-accent-color-500))]' />
            <h1 className='text-2xl max-w-screen-md text-center text-[hsl(var(--pona-app-music-accent-color-500)/0.64)]'>{language.data.app.guilds.player.related.videoId_not_provided}</h1>
        </div>
    )
    return fetched ? (
        <div className='flex flex-col gap-4 w-full mx-auto min-h-full py-2 px-6'>
            {
                relatedInfoCache.related && relatedInfoCache.related.length > 0 &&
                relatedInfoCache.related.map((item, index) => {
                    const title = item.title;
                    const toLangKey = title.toLowerCase().replace(/ /g, '_');
                    const langKeyType = toLangKey as keyof typeof language.data.app.guilds.player.related;
                    const HeaderTitle = ()=>(<h1 className={
                        `text-3xl ${index>0?'mt-4':''} -mb-2 font-bold text-[hsl(var(--pona-app-music-accent-color-500)/0.64)]`
                    }>{
                        language.data.app.guilds.player.related[langKeyType] ? 
                        language.data.app.guilds.player.related[langKeyType] :
                        String(title).toLocaleUpperCase()
                    }</h1>);
                    return (
                    <React.Fragment key={index}>
                    {
                        title === "You might also like" ? <>
                            <div className='flex gap-4 items-center justify-between w-full p-1 -mt-2'>
                                <HeaderTitle />
                                <div className='flex-1'></div>
                                <div className="embla__buttons gap-3 flex items-center justify-center">
                                    <Button
                                        onPress={recommendsEmblaOnPrevButtonClick} disabled={recommendsEmblaPrevBtnDisabled}
                                        title='previous'
                                        className="embla__button embla__button--prev border-2 border-foreground/10 bg-foreground/10 disabled:opacity-30 disabled:bg-transparent disabled:border-foreground/5"
                                        type="button"
                                        size='sm'
                                        radius='full'
                                        isIconOnly
                                    ><CaretLeft/></Button>
                                    <Button
                                        onPress={recommendsEmblaOnNextButtonClick} disabled={recommendsEmblaNextBtnDisabled}
                                        title='next'
                                        className="embla__button embla__button--next border-2 border-foreground/10 bg-foreground/10 disabled:opacity-30 disabled:bg-transparent disabled:border-foreground/5"
                                        type="button"
                                        size='sm'
                                        radius='full'
                                        isIconOnly
                                    ><CaretRight/></Button>
                                </div>
                            </div>
                            <div className="embla w-full max-w-none mx-0 my-0 z-10 relative">
                                <div className="embla__viewport" ref={recommendsEmblaRef}>
                                    <div className="embla__container gap-5 select-none flex-row w-full">
                                    {
                                        // map track by saperate 3 tracks for each column
                                        (() => {
                                            const columns = [];
                                            for (let i = 0; i < Math.ceil(item.contents.length / 3); i++) {
                                                const tracks = [];
                                                for (let j = 0; j < 3; j++) {
                                                    const track = item.contents[i * 3 + j];
                                                    if (track) {
                                                        tracks.push(
                                                            <Track key={`related-track-${i}-${j}`} data={{
                                                                album: track.album,
                                                                artists: track.artists,
                                                                category: 'Songs',
                                                                duration: '',
                                                                duration_seconds: null,
                                                                isExplicit: track.isExplicit,
                                                                resultType: 'song',
                                                                thumbnails: track.thumbnails,
                                                                title: track.title,
                                                                videoId: track.videoId,
                                                                videoType: '',
                                                                year: null
                                                            }} />
                                                        );
                                                    }
                                                }
                                                columns.push(
                                                    <div className='relative flex flex-col min-w-[50%] overflow-hidden' key={`tracks-col-${i}`}>
                                                        {tracks}
                                                    </div>
                                                );
                                            }
                                            return columns;
                                        })()
                                    }
                                    </div>
                                </div>
                            </div>
                        </>:
                        title === "Recommended playlists" ? <>
                            <div className='flex gap-4 items-center justify-between w-full p-1 -mt-2'>
                                <HeaderTitle />
                                <div className='flex-1'></div>
                                <div className="embla__buttons gap-3 flex items-center justify-center">
                                    <Button
                                        onPress={playlistEmblaOnPrevButtonClick} disabled={playlistEmblaPrevBtnDisabled}
                                        title='previous'
                                        className="embla__button embla__button--prev border-2 border-foreground/10 bg-foreground/10 disabled:opacity-30 disabled:bg-transparent disabled:border-foreground/5"
                                        type="button"
                                        size='sm'
                                        radius='full'
                                        isIconOnly
                                    ><CaretLeft/></Button>
                                    <Button
                                        onPress={playlistEmblaOnNextButtonClick} disabled={playlistEmblaNextBtnDisabled}
                                        title='next'
                                        className="embla__button embla__button--next border-2 border-foreground/10 bg-foreground/10 disabled:opacity-30 disabled:bg-transparent disabled:border-foreground/5"
                                        type="button"
                                        size='sm'
                                        radius='full'
                                        isIconOnly
                                    ><CaretRight/></Button>
                                </div>
                            </div>
                            <div className="embla w-full max-w-none mx-0 mt-3 z-10 relative">
                                <div className="embla__viewport" ref={playlistEmblaRef}>
                                    <div className="embla__container gap-5 select-none">
                                    {
                                        item.contents.map((artist, index) => (
                                            <PlaylistCard key={`related-playlist-${index}`} playlist={{
                                                playlistId: artist.playlistId,
                                                thumbnails: artist.thumbnails,
                                                name: artist.title,
                                                artist: { artistId: '', name: '' },
                                                type: 'PLAYLIST'
                                            }} />
                                        ))
                                    }
                                    </div>
                                </div>
                            </div>
                        </> :
                        title === "Similar artists" ? <>
                            <div className='flex gap-4 items-center justify-between w-full p-1 -mt-2'>
                                <HeaderTitle />
                                <div className='flex-1'></div>
                                <div className="embla__buttons gap-3 flex items-center justify-center">
                                    <Button
                                        onPress={artistEmblaOnPrevButtonClick} disabled={artistEmblaPrevBtnDisabled}
                                        title='previous'
                                        className="embla__button embla__button--prev border-2 border-foreground/10 bg-foreground/10 disabled:opacity-30 disabled:bg-transparent disabled:border-foreground/5"
                                        type="button"
                                        size='sm'
                                        radius='full'
                                        isIconOnly
                                    ><CaretLeft/></Button>
                                    <Button
                                        onPress={artistEmblaOnNextButtonClick} disabled={artistEmblaNextBtnDisabled}
                                        title='next'
                                        className="embla__button embla__button--next border-2 border-foreground/10 bg-foreground/10 disabled:opacity-30 disabled:bg-transparent disabled:border-foreground/5"
                                        type="button"
                                        size='sm'
                                        radius='full'
                                        isIconOnly
                                    ><CaretRight/></Button>
                                </div>
                            </div>
                            <div className="embla w-full max-w-none mx-0 mt-3 z-10 relative">
                                <div className="embla__viewport" ref={artistEmblaRef}>
                                    <div className="embla__container gap-5 select-none">
                                    {
                                        item.contents.map((artist, index) => (
                                            <ArtistCard key={`related-artist-${index}`} artist={{
                                                name: artist.title,
                                                artistId: artist.browseId,
                                                thumbnails: artist.thumbnails,
                                                type: 'ARTIST'
                                            }} />
                                        ))
                                    }
                                    </div>
                                </div>
                            </div>
                        </> :
                        title === "About the artist" ?
                        <>
                            <HeaderTitle />
                            <p>{item.contents}</p>
                        </>
                        :
                        String(title).replace(' - Topic','') === ponaCommonState?.current?.author?.replace(' - Topic','') && (()=>{
                            return <>
                                
                            </>
                        })()
                    }
                    </React.Fragment>
                    )
                })
            }
            {
                relatedInfoCache.watch_playlist && relatedInfoCache.watch_playlist.tracks.length > 0 &&
                <>
                <div className='flex gap-4 items-center justify-between w-full p-1 -mt-2'>
                    <h1 className={`text-3xl -mb-2 font-bold text-[hsl(var(--pona-app-music-accent-color-500)/0.64)]`}>{language.data.app.guilds.player.related.play_continuously}</h1>
                    <div className='flex-1'></div>
                    <div className="embla__buttons gap-3 flex items-center justify-center">
                        <Button
                            onPress={watchPlaylistEmblaOnPrevButtonClick} disabled={watchPlaylistEmblaPrevBtnDisabled}
                            title='previous'
                            className="embla__button embla__button--prev border-2 border-foreground/10 bg-foreground/10 disabled:opacity-30 disabled:bg-transparent disabled:border-foreground/5"
                            type="button"
                            size='sm'
                            radius='full'
                            isIconOnly
                        ><CaretLeft/></Button>
                        <Button
                            onPress={watchPlaylistEmblaOnNextButtonClick} disabled={watchPlaylistEmblaNextBtnDisabled}
                            title='next'
                            className="embla__button embla__button--next border-2 border-foreground/10 bg-foreground/10 disabled:opacity-30 disabled:bg-transparent disabled:border-foreground/5"
                            type="button"
                            size='sm'
                            radius='full'
                            isIconOnly
                        ><CaretRight/></Button>
                    </div>
                </div>
                <div className="embla w-full max-w-none mx-0 my-0 z-10 relative">
                    <div className="embla__viewport" ref={watchPlaylistEmblaRef}>
                        <div className="embla__container gap-5 select-none flex-row w-full">
                        {
                            // map track by saperate 3 tracks for each column
                            (() => {
                                const columns = [];
                                for (let i = 0; i < Math.ceil(relatedInfoCache.watch_playlist.tracks.length / 3); i++) {
                                    const tracks = [];
                                    for (let j = 0; j < 3; j++) {
                                        const track = relatedInfoCache.watch_playlist.tracks[i * 3 + j];
                                        if (track) {
                                            tracks.push(
                                                <Track key={`related-track-${i}-${j}`} data={{
                                                    album: null,
                                                    artists: track.artists,
                                                    category: 'Songs',
                                                    duration: '',
                                                    duration_seconds: null,
                                                    isExplicit: false,
                                                    resultType: 'song',
                                                    thumbnails: track.thumbnail,
                                                    title: track.title,
                                                    videoId: track.videoId,
                                                    videoType: '',
                                                    year: null
                                                }} />
                                            );
                                        }
                                    }
                                    columns.push(
                                        <div className='relative flex flex-col min-w-[50%] overflow-hidden' key={`tracks-col-${i}`}>
                                            {tracks}
                                        </div>
                                    );
                                }
                                return columns;
                            })()
                        }
                        </div>
                    </div>
                </div>
                </>
            }
            <div className='h-[16vh]'></div>
        </div>
    ) : (
        <div className='flex flex-col gap-4 items-center justify-center w-full h-full'>
            <Spinner className='text-[hsl(var(--pona-app-music-accent-color-500))]' />
            <h1 className='text-2xl max-w-screen-md text-center text-[hsl(var(--pona-app-music-accent-color-500)/0.64)]'>{language.data.common.friendly_loading}</h1>
        </div>
    )
}

export default Related