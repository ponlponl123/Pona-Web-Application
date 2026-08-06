import { ArtistCard, PlaylistCard } from '@/components/music/card';
import Track from '@/components/music/searchResult/track';
import { useGlobalContext } from '@/contexts/globalContext';
import { useLanguageContext } from '@/contexts/languageContext';
import {
  relatedInfo,
  usePonaMusicCacheContext,
} from '@/contexts/ponaMusicCacheContext';
import { getSongRelated } from '@/server-side-api/internal/search';
import { usePrevNextButtons } from '@/utils/Embla/CarouselArrowButtons';
import { Button, Spinner } from "@heroui/react";
import { CaretLeft, CaretRight, Ghost } from '@phosphor-icons/react/dist/ssr';
import { getCookie } from 'cookies-next';
import useEmblaCarousel from 'embla-carousel-react';
import { motion } from 'framer-motion';
import React from 'react';

// Memoized track columns component to prevent unnecessary re-renders
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const TrackColumns = React.memo(({ tracks }: { tracks: any[] }) => {
  const columns = React.useMemo(() => {
    const result = [];
    for (let i = 0; i < Math.ceil(tracks.length / 3); i++) {
      const columnTracks = [];
      for (let j = 0; j < 3; j++) {
        const track = tracks[i * 3 + j];
        if (track) {
          columnTracks.push(
            <Track
              key={`track-${track.videoId || i}-${j}`}
              classNames={{
                title: 'text-[hsl(var(--pona-app-music-accent-color-500))]',
                subtitle: 'text-[hsl(var(--pona-app-music-accent-color-500))]',
                playButton: {
                  playpause:
                    'text-[hsl(var(--pona-app-music-accent-color-500))]',
                },
              }}
              data={{
                album: track.album || null,
                artists: track.artists,
                category: 'Songs',
                duration: '',
                duration_seconds: null,
                isExplicit: track.isExplicit || false,
                resultType: 'song',
                thumbnails: track.thumbnails || track.thumbnail,
                title: track.title,
                videoId: track.videoId,
                videoType: '',
                year: null,
              }}
            />
          );
        }
      }
      result.push(
        <div
          className='relative flex flex-col min-w-[50%] overflow-hidden'
          key={`tracks-col-${i}`}
        >
          {columnTracks}
        </div>
      );
    }
    return result;
  }, [tracks]);

  return <>{columns}</>;
});
TrackColumns.displayName = 'TrackColumns';

// Memoized playlist cards component
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const PlaylistCards = React.memo(({ playlists }: { playlists: any[] }) => {
  return (
    <>
      {playlists.map((playlist, index) => (
        <PlaylistCard
          key={`related-playlist-${playlist.playlistId || index}`}
          playlist={{
            playlistId: playlist.playlistId,
            thumbnails: playlist.thumbnails,
            name: playlist.title,
            artist: { artistId: '', name: '' },
            type: 'PLAYLIST',
          }}
        />
      ))}
    </>
  );
});
PlaylistCards.displayName = 'PlaylistCards';

// Memoized artist cards component
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ArtistCards = React.memo(({ artists }: { artists: any[] }) => {
  return (
    <>
      {artists.map((artist, index) => (
        <ArtistCard
          key={`related-artist-${artist.browseId || index}`}
          artist={{
            name: artist.title,
            artistId: artist.browseId,
            thumbnails: artist.thumbnails,
            type: 'ARTIST',
          }}
        />
      ))}
    </>
  );
});
ArtistCards.displayName = 'ArtistCards';

// Memoized carousel buttons component
const CarouselButtons = React.memo(
  ({
    onPrev,
    onNext,
    prevDisabled,
    nextDisabled,
  }: {
    onPrev: () => void;
    onNext: () => void;
    prevDisabled: boolean;
    nextDisabled: boolean;
  }) => (
    <div className='embla__buttons gap-3 flex items-center justify-center'>
      <Button
        onPress={onPrev}
        disabled={prevDisabled}
        title='previous'
        className='embla__button embla__button--prev border-2 border-foreground/10 bg-foreground/10 disabled:opacity-30 disabled:bg-transparent disabled:border-foreground/5'
        type='button'
        size='sm'
        radius='full'
        isIconOnly
      >
        <CaretLeft />
      </Button>
      <Button
        onPress={onNext}
        disabled={nextDisabled}
        title='next'
        className='embla__button embla__button--next border-2 border-foreground/10 bg-foreground/10 disabled:opacity-30 disabled:bg-transparent disabled:border-foreground/5'
        type='button'
        size='sm'
        radius='full'
        isIconOnly
      >
        <CaretRight />
      </Button>
    </div>
  )
);
CarouselButtons.displayName = 'CarouselButtons';

const Related = React.memo(({ videoId }: { videoId?: string }) => {
  const { language } = useLanguageContext();
  const { ponaCommonState } = useGlobalContext();
  const { relatedInfoCache, SetRelatedInfoCache } = usePonaMusicCacheContext();
  const [fetched, setFetched] = React.useState<boolean>(
    relatedInfoCache.videoId === videoId
  );

  // Memoize watch playlist tracks to prevent unnecessary re-renders
  const watchPlaylistTracks = React.useMemo(
    () => relatedInfoCache.watch_playlist?.tracks || [],
    [relatedInfoCache.watch_playlist?.tracks]
  );

  // Memoize related items to prevent unnecessary re-renders
  const relatedItems = React.useMemo(
    () => relatedInfoCache.related || [],
    [relatedInfoCache.related]
  );
  const [recommendsEmblaRef, recommendsEmblaApi] = useEmblaCarousel({
    skipSnaps: true,
    align: 'start',
  });
  const [watchPlaylistEmblaRef, watchPlaylistEmblaApi] = useEmblaCarousel({
    skipSnaps: true,
    align: 'start',
  });
  const [playlistEmblaRef, playlistEmblaApi] = useEmblaCarousel({
    skipSnaps: true,
  });
  const [artistEmblaRef, artistEmblaApi] = useEmblaCarousel({
    skipSnaps: true,
  });
  const {
    prevBtnDisabled: recommendsEmblaPrevBtnDisabled,
    nextBtnDisabled: recommendsEmblaNextBtnDisabled,
    onPrevButtonClick: recommendsEmblaOnPrevButtonClick,
    onNextButtonClick: recommendsEmblaOnNextButtonClick,
  } = usePrevNextButtons(recommendsEmblaApi);
  const {
    prevBtnDisabled: watchPlaylistEmblaPrevBtnDisabled,
    nextBtnDisabled: watchPlaylistEmblaNextBtnDisabled,
    onPrevButtonClick: watchPlaylistEmblaOnPrevButtonClick,
    onNextButtonClick: watchPlaylistEmblaOnNextButtonClick,
  } = usePrevNextButtons(watchPlaylistEmblaApi);
  const {
    prevBtnDisabled: playlistEmblaPrevBtnDisabled,
    nextBtnDisabled: playlistEmblaNextBtnDisabled,
    onPrevButtonClick: playlistEmblaOnPrevButtonClick,
    onNextButtonClick: playlistEmblaOnNextButtonClick,
  } = usePrevNextButtons(playlistEmblaApi);
  const {
    prevBtnDisabled: artistEmblaPrevBtnDisabled,
    nextBtnDisabled: artistEmblaNextBtnDisabled,
    onPrevButtonClick: artistEmblaOnPrevButtonClick,
    onNextButtonClick: artistEmblaOnNextButtonClick,
  } = usePrevNextButtons(artistEmblaApi);
  React.useEffect(() => {
    // Only trigger when videoId changes and we haven't fetched for this videoId yet
    if (!videoId || (fetched && relatedInfoCache.videoId === videoId)) return;

    const setFetchedCache = (value: relatedInfo | null) => {
      if (value === null)
        SetRelatedInfoCache({
          videoId,
          related: undefined,
          watch_playlist: undefined,
        });
      else
        SetRelatedInfoCache({
          videoId,
          related: value.related,
          watch_playlist: value.watch_playlist,
        });
      setFetched(true);
    };

    const fetchRelated = async () => {
      const accessToken = String(getCookie('LOGIN_'));
      const accessTokenType = String(getCookie('LOGIN_TYPE_'));
      if (!accessToken || accessTokenType === 'undefined') return setFetchedCache(null);
      const songRelated = await getSongRelated(
        accessTokenType,
        accessToken,
        videoId
      );
      if (!songRelated) return setFetchedCache(null);
      setFetchedCache({
        videoId,
        related: songRelated.related,
        watch_playlist: songRelated.watch_playlist,
      });
    };
    fetchRelated();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoId, relatedInfoCache.videoId]);
  if (!videoId)
    return (
      <div className='flex flex-col gap-4 items-center justify-center w-full h-full'>
        <Ghost
          size={56}
          weight='fill'
          className='text-[hsl(var(--pona-app-music-accent-color-500))]'
        />
        <h1 className='text-2xl max-w-screen-md text-center text-[hsl(var(--pona-app-music-accent-color-500)/0.64)]'>
          {language.data.app.guilds.player.related.videoId_not_provided}
        </h1>
      </div>
    );
  return fetched ? (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.16 }}
      layoutId='panel-related'
      className='flex flex-col gap-4 w-full mx-auto min-h-full py-2 px-6'
    >
      {watchPlaylistTracks.length > 0 && (
        <>
          <div className='flex gap-4 items-center justify-between w-full p-1 -mt-2'>
            <h1
              className={`text-3xl -mb-2 font-bold text-[hsl(var(--pona-app-music-accent-color-500)/0.64)]`}
            >
              {language.data.app.guilds.player.related.play_continuously}
            </h1>
            <div className='flex-1'></div>
            <CarouselButtons
              onPrev={watchPlaylistEmblaOnPrevButtonClick}
              onNext={watchPlaylistEmblaOnNextButtonClick}
              prevDisabled={watchPlaylistEmblaPrevBtnDisabled}
              nextDisabled={watchPlaylistEmblaNextBtnDisabled}
            />
          </div>
          <div className='embla w-full max-w-none mx-0 my-0 z-10 relative'>
            <div className='embla__viewport' ref={watchPlaylistEmblaRef}>
              <div className='embla__container gap-5 select-none flex-row w-full'>
                <TrackColumns tracks={watchPlaylistTracks} />
              </div>
            </div>
          </div>
        </>
      )}
      {relatedItems.length > 0 &&
        relatedItems.map((item, index) => {
          const title = item.title;
          const toLangKey = title.toLowerCase().replace(/ /g, '_');
          const langKeyType =
            toLangKey as keyof typeof language.data.app.guilds.player.related;
          const HeaderTitle = () => (
            <h1
              className={`text-3xl ${index > 0 ? 'mt-4' : ''} -mb-2 font-bold text-[hsl(var(--pona-app-music-accent-color-500)/0.64)]`}
            >
              {language.data.app.guilds.player.related[langKeyType]
                ? language.data.app.guilds.player.related[langKeyType]
                : String(title).toLocaleUpperCase()}
            </h1>
          );
          return (
            <React.Fragment key={index}>
              {title === 'You might also like' ? (
                <>
                  <div className='flex gap-4 items-center justify-between w-full p-1 -mt-2'>
                    <HeaderTitle />
                    <div className='flex-1'></div>
                    <CarouselButtons
                      onPrev={recommendsEmblaOnPrevButtonClick}
                      onNext={recommendsEmblaOnNextButtonClick}
                      prevDisabled={recommendsEmblaPrevBtnDisabled}
                      nextDisabled={recommendsEmblaNextBtnDisabled}
                    />
                  </div>
                  <div className='embla w-full max-w-none mx-0 my-0 z-10 relative'>
                    <div className='embla__viewport' ref={recommendsEmblaRef}>
                      <div className='embla__container gap-5 select-none flex-row w-full'>
                        <TrackColumns tracks={item.contents} />
                      </div>
                    </div>
                  </div>
                </>
              ) : title === 'Recommended playlists' ? (
                <>
                  <div className='flex gap-4 items-center justify-between w-full p-1 -mt-2'>
                    <HeaderTitle />
                    <div className='flex-1'></div>
                    <CarouselButtons
                      onPrev={playlistEmblaOnPrevButtonClick}
                      onNext={playlistEmblaOnNextButtonClick}
                      prevDisabled={playlistEmblaPrevBtnDisabled}
                      nextDisabled={playlistEmblaNextBtnDisabled}
                    />
                  </div>
                  <div className='embla w-full max-w-none mx-0 mt-3 z-10 relative'>
                    <div className='embla__viewport' ref={playlistEmblaRef}>
                      <div className='embla__container gap-5 select-none'>
                        <PlaylistCards playlists={item.contents} />
                      </div>
                    </div>
                  </div>
                </>
              ) : title === 'Similar artists' ? (
                <>
                  <div className='flex gap-4 items-center justify-between w-full p-1 -mt-2'>
                    <HeaderTitle />
                    <div className='flex-1'></div>
                    <CarouselButtons
                      onPrev={artistEmblaOnPrevButtonClick}
                      onNext={artistEmblaOnNextButtonClick}
                      prevDisabled={artistEmblaPrevBtnDisabled}
                      nextDisabled={artistEmblaNextBtnDisabled}
                    />
                  </div>
                  <div className='embla w-full max-w-none mx-0 mt-3 z-10 relative'>
                    <div className='embla__viewport' ref={artistEmblaRef}>
                      <div className='embla__container gap-5 select-none'>
                        <ArtistCards artists={item.contents} />
                      </div>
                    </div>
                  </div>
                </>
              ) : title === 'About the artist' ? (
                <>
                  <HeaderTitle />
                  <p className='text-[hsl(var(--pona-app-music-accent-color-500))]'>
                    {item.contents}
                  </p>
                </>
              ) : (
                String(title).replace(' - Topic', '') ===
                  ponaCommonState?.current?.author?.replace(' - Topic', '') &&
                (() => {
                  return <></>;
                })()
              )}
            </React.Fragment>
          );
        })}
      <div className='h-[16vh]'></div>
    </motion.div>
  ) : (
    <div className='flex flex-col gap-4 items-center justify-center w-full h-full'>
      <Spinner className='text-[hsl(var(--pona-app-music-accent-color-500))]' />
      <h1 className='text-2xl max-w-screen-md text-center text-[hsl(var(--pona-app-music-accent-color-500)/0.64)]'>
        {language.data.common.friendly_loading}
      </h1>
    </div>
  );
});
Related.displayName = 'Related';

export default Related;
