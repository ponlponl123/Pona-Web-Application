'use client';

import React, { memo, useEffect, useMemo } from 'react';
import { getCookie } from 'cookies-next';
import useEmblaCarousel from 'embla-carousel-react';
import { motion } from 'framer-motion';
import { useAtomValue, useSetAtom } from 'jotai';
import {
  CaretLeftIcon,
  CaretRightIcon,
  GhostIcon,
} from '@phosphor-icons/react/dist/ssr';

import { ArtistCard, PlaylistCard } from '@/components/music/card';
import Track from '@/components/music/searchResult/track';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { getSongRelated } from '@/lib/server-side-api/internal/search';
import { useAppStore } from '@/store/coreStore';
import { ponaCommonStateAtom } from '@/store/musicAtoms';
import { isQueueReorderingAtom } from '@/store/uiAtoms';
import { useMusicCacheStore } from '@/store/musicCacheStore';
import { usePrevNextButtons } from '@/lib/Embla/CarouselArrowButtons';
import {
  ArtistRelated,
  PlaylistBasic,
  SongBasic,
  SongDetailed,
  ThumbnailFull,
  WatchPlaylistTrack,
} from '@/types/youtube/ytmusic-api';

interface TrackColumnsProps {
  tracks: (WatchPlaylistTrack | SongBasic)[];
}

// Memoized track columns component to prevent unnecessary re-renders
const TrackColumns = memo(({ tracks }: TrackColumnsProps) => {
  const columns = useMemo(() => {
    const result: React.ReactNode[] = [];
    const totalCols = Math.ceil(tracks.length / 3);

    for (let i = 0; i < totalCols; i++) {
      const columnTracks: React.ReactNode[] = [];
      for (let j = 0; j < 3; j++) {
        const item = tracks[i * 3 + j];
        if (item) {
          const songDetailedResult: SongDetailed = {
            category: 'Songs',
            resultType: 'song',
            videoId: item.videoId || '',
            videoType: 'MUSIC_VIDEO_TYPE_ATV',
            title: item.title || '',
            artists: item.artists || [],
            album: 'album' in item && item.album && typeof item.album === 'object' ? item.album : null,
            duration: 'length' in item && typeof item.length === 'string' ? item.length : ('duration' in item && typeof item.duration === 'string' ? item.duration : ''),
            duration_seconds: 'duration_seconds' in item && typeof item.duration_seconds === 'number' ? item.duration_seconds : null,
            isExplicit: 'isExplicit' in item ? item.isExplicit : false,
            thumbnails: 'thumbnails' in item && item.thumbnails ? item.thumbnails : ('thumbnail' in item && item.thumbnail ? item.thumbnail : []),
            year: 'year' in item && typeof item.year === 'number' ? item.year : null,
          };

          columnTracks.push(
            <Track
              key={`track-${item.videoId || i}-${j}`}
              classNames={{
                title: 'md:text-[hsl(var(--pona-app-music-accent-color-800))] md:dark:text-[hsl(var(--pona-app-music-accent-color-500))]',
                subtitle: 'max-md:**:text-default-foreground/40! md:text-[hsl(var(--pona-app-music-accent-color-800)/0.64)]! md:dark:text-[hsl(var(--pona-app-music-accent-color-500)/0.64)]!',
                playButton: {
                  playpause:
                    'md:text-[hsl(var(--pona-app-music-accent-color-500))]',
                },
                artistLink: "max-md:text-default-foreground/40! md:text-[hsl(var(--pona-app-music-accent-color-800)/0.75)]! md:dark:text-[hsl(var(--pona-app-music-accent-color-500)/0.75)]!",
                duration: 'max-md:text-default-foreground/40! md:text-[hsl(var(--pona-app-music-accent-color-800)/0.64)] md:dark:text-[hsl(var(--pona-app-music-accent-color-500)/0.64)]',
              }}
              result={songDetailedResult}
            />
          );
        }
      }
      result.push(
        <div
          className='relative flex flex-col min-w-[77%] overflow-hidden'
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

interface PlaylistCardsProps {
  playlists: (PlaylistBasic | { playlistId: string; thumbnails: ThumbnailFull[]; title: string })[];
}

// Memoized playlist cards component
const PlaylistCards = memo(({ playlists }: PlaylistCardsProps) => {
  return (
    <>
      {playlists.map((playlist, index) => {
        const p = playlist as PlaylistBasic;
        return (
          <PlaylistCard
            key={`related-playlist-${p.playlistId || index}`}
            playlist={{
              playlistId: p.playlistId,
              thumbnails: p.thumbnails || [],
              name: p.title,
              artist: { artistId: '', name: '' },
              type: 'PLAYLIST',
            }}
          />
        );
      })}
    </>
  );
});
PlaylistCards.displayName = 'PlaylistCards';

interface ArtistCardsProps {
  artists: (ArtistRelated | { browseId: string; title: string; thumbnails: ThumbnailFull[] })[];
}

// Memoized artist cards component
const ArtistCards = memo(({ artists }: ArtistCardsProps) => {
  return (
    <>
      {artists.map((artist, index) => {
        const a = artist as ArtistRelated;
        return (
          <ArtistCard
            key={`related-artist-${a.browseId || index}`}
            artist={{
              name: a.title,
              artistId: a.browseId,
              thumbnails: a.thumbnails || [],
              type: 'ARTIST',
            }}
            className='md:**:text-[hsl(var(--pona-app-music-accent-color-700))]! md:**:dark:text-[hsl(var(--pona-app-music-accent-color-500))]!'
          />
        );
      })}
    </>
  );
});
ArtistCards.displayName = 'ArtistCards';

// Memoized carousel buttons component
const CarouselButtons = memo(
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
        onClick={onPrev}
        disabled={prevDisabled}
        title='previous'
        variant='outline'
        size='icon'
        className='rounded-full size-8 embla__button embla__button--prev border-2 border-foreground/10 bg-foreground/10 disabled:opacity-30'
        type='button'
        data-smooth-interaction="true"
      >
        <CaretLeftIcon className='size-4' />
      </Button>
      <Button
        onClick={onNext}
        disabled={nextDisabled}
        title='next'
        variant='outline'
        size='icon'
        className='rounded-full size-8 embla__button embla__button--next border-2 border-foreground/10 bg-foreground/10 disabled:opacity-30'
        type='button'
        data-smooth-interaction="true"
      >
        <CaretRightIcon className='size-4' />
      </Button>
    </div>
  )
);
CarouselButtons.displayName = 'CarouselButtons';

const Related = memo(({ videoId }: { videoId?: string }) => {
  const language = useAppStore((state) => state.language);
  const ponaCommonState = useAtomValue(ponaCommonStateAtom);
  const targetVideoId = videoId || ponaCommonState?.current?.identifier;
  const relatedInfoCache = useMusicCacheStore((state) => state.relatedInfoCache);
  const setRelatedInfo = useMusicCacheStore((state) => state.setRelatedInfo);

  const currentCache = targetVideoId ? relatedInfoCache[targetVideoId] : undefined;
  const isLoading = Boolean(targetVideoId) && !currentCache;

  const watchPlaylistTracks = useMemo(
    () => currentCache?.watch_playlist?.tracks || [],
    [currentCache?.watch_playlist?.tracks]
  );

  const relatedItems = useMemo(
    () => currentCache?.related || [],
    [currentCache?.related]
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

  const setIsQueueReordering = useSetAtom(isQueueReorderingAtom);

  useEffect(() => {
    const handlePointerDown = () => setIsQueueReordering(true);
    const handlePointerUp = () => setIsQueueReordering(false);

    const apis = [
      recommendsEmblaApi,
      watchPlaylistEmblaApi,
      playlistEmblaApi,
      artistEmblaApi,
    ];

    apis.forEach((api) => {
      if (!api) return;
      api.on('pointerDown', handlePointerDown);
      api.on('pointerUp', handlePointerUp);
    });

    return () => {
      apis.forEach((api) => {
        if (!api) return;
        api.off('pointerDown', handlePointerDown);
        api.off('pointerUp', handlePointerUp);
      });
      setIsQueueReordering(false);
    };
  }, [
    recommendsEmblaApi,
    watchPlaylistEmblaApi,
    playlistEmblaApi,
    artistEmblaApi,
    setIsQueueReordering,
  ]);

  useEffect(() => {
    if (!targetVideoId || currentCache) return;

    let isMounted = true;

    const fetchRelated = async () => {
      try {
        const accessToken = String(getCookie('LOGIN_'));
        const accessTokenType = String(getCookie('LOGIN_TYPE_'));
        if (!accessToken || accessTokenType === 'undefined') {
          if (isMounted) {
            setRelatedInfo(targetVideoId, {
              related: undefined,
              watch_playlist: undefined,
            });
          }
          return;
        }
        const songRelated = await getSongRelated(
          accessTokenType,
          accessToken,
          targetVideoId
        );
        if (isMounted) {
          if (songRelated) {
            setRelatedInfo(targetVideoId, {
              related: songRelated.related,
              watch_playlist: songRelated.watch_playlist,
            });
          } else {
            setRelatedInfo(targetVideoId, {
              related: undefined,
              watch_playlist: undefined,
            });
          }
        }
      } catch {
        if (isMounted) {
          setRelatedInfo(targetVideoId, {
            related: undefined,
            watch_playlist: undefined,
          });
        }
      }
    };
    fetchRelated();

    return () => {
      isMounted = false;
    };
  }, [targetVideoId, currentCache, setRelatedInfo]);

  if (!targetVideoId)
    return (
      <div className='flex flex-col gap-4 items-center justify-center w-full h-full py-16'>
        <GhostIcon
          size={56}
          weight='fill'
          className='text-[hsl(var(--pona-app-music-accent-color-800))] dark:text-[hsl(var(--pona-app-music-accent-color-500))]'
        />
        <h1 className='text-2xl max-w-3xl text-center text-[hsl(var(--pona-app-music-accent-color-800)/0.64)] dark:text-[hsl(var(--pona-app-music-accent-color-500)/0.64)]'>
          {language.data.app.guilds.player.related.videoId_not_provided}
        </h1>
      </div>
    );

  if (isLoading && !currentCache) {
    return (
      <div className='flex flex-col gap-4 items-center justify-center w-full h-full py-16'>
        <Spinner className='text-[hsl(var(--pona-app-music-accent-color-800))] dark:text-[hsl(var(--pona-app-music-accent-color-500))]' />
        <h1 className='text-2xl max-w-3xl text-center text-[hsl(var(--pona-app-music-accent-color-800)/0.64)] dark:text-[hsl(var(--pona-app-music-accent-color-500))/0.64]'>
          {language.data.common.friendly_loading}
        </h1>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.16 }}
      className='flex flex-col gap-4 w-full mx-auto min-h-full py-2 px-6 max-md:**:text-default-foreground'
    >
      {watchPlaylistTracks.length > 0 && (
        <>
          <div className='flex gap-4 items-center justify-between w-full p-1 -mt-2'>
            <h1 className='text-3xl -mb-2 font-bold md:text-[hsl(var(--pona-app-music-accent-color-800)/0.64)] md:dark:text-[hsl(var(--pona-app-music-accent-color-500)/0.64)]'>
              {language.data.app.guilds.player.related.play_continuously}
            </h1>
            <div className='flex-1' />
            <CarouselButtons
              onPrev={watchPlaylistEmblaOnPrevButtonClick}
              onNext={watchPlaylistEmblaOnNextButtonClick}
              prevDisabled={watchPlaylistEmblaPrevBtnDisabled}
              nextDisabled={watchPlaylistEmblaNextBtnDisabled}
            />
          </div>
          <div
            className='embla w-full max-w-none mx-0 my-0 z-10 relative touch-pan-y'
            onPointerDown={(e) => {
              e.stopPropagation();
              setIsQueueReordering(true);
            }}
            onPointerUp={() => setIsQueueReordering(false)}
            onPointerCancel={() => setIsQueueReordering(false)}
          >
            <div className='embla__viewport touch-pan-y' ref={watchPlaylistEmblaRef}>
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
              className={`text-3xl ${index > 0 ? 'mt-4' : ''} -mb-2 font-bold md:text-[hsl(var(--pona-app-music-accent-color-800)/0.64)] md:dark:text-[hsl(var(--pona-app-music-accent-color-500)/0.64)]`}
            >
              {language.data.app.guilds.player.related[langKeyType]
                ? language.data.app.guilds.player.related[langKeyType]
                : String(title).toUpperCase()}
            </h1>
          );

          if (title === 'You might also like') {
            const contents = item.contents as SongBasic[];
            return (
              <React.Fragment key={`related-sec-${index}`}>
                <div className='flex gap-4 items-center justify-between w-full p-1 -mt-2'>
                  <HeaderTitle />
                  <div className='flex-1' />
                  <CarouselButtons
                    onPrev={recommendsEmblaOnPrevButtonClick}
                    onNext={recommendsEmblaOnNextButtonClick}
                    prevDisabled={recommendsEmblaPrevBtnDisabled}
                    nextDisabled={recommendsEmblaNextBtnDisabled}
                  />
                </div>
                <div
                  className='embla w-full max-w-none mx-0 my-0 z-10 relative touch-pan-y'
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    setIsQueueReordering(true);
                  }}
                  onPointerUp={() => setIsQueueReordering(false)}
                  onPointerCancel={() => setIsQueueReordering(false)}
                >
                  <div className='embla__viewport touch-pan-y' ref={recommendsEmblaRef}>
                    <div className='embla__container gap-5 select-none flex-row w-full'>
                      <TrackColumns tracks={contents || []} />
                    </div>
                  </div>
                </div>
              </React.Fragment>
            );
          }

          if (title === 'Recommended playlists') {
            const contents = item.contents as PlaylistBasic[];
            return (
              <React.Fragment key={`related-sec-${index}`}>
                <div className='flex gap-4 items-center justify-between w-full p-1 -mt-2'>
                  <HeaderTitle />
                  <div className='flex-1' />
                  <CarouselButtons
                    onPrev={playlistEmblaOnPrevButtonClick}
                    onNext={playlistEmblaOnNextButtonClick}
                    prevDisabled={playlistEmblaPrevBtnDisabled}
                    nextDisabled={playlistEmblaNextBtnDisabled}
                  />
                </div>
                <div
                  className='embla w-full max-w-none mx-0 mt-3 z-10 relative touch-pan-y'
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    setIsQueueReordering(true);
                  }}
                  onPointerUp={() => setIsQueueReordering(false)}
                  onPointerCancel={() => setIsQueueReordering(false)}
                >
                  <div className='embla__viewport touch-pan-y' ref={playlistEmblaRef}>
                    <div className='embla__container gap-5 select-none'>
                      <PlaylistCards playlists={contents || []} />
                    </div>
                  </div>
                </div>
              </React.Fragment>
            );
          }

          if (title === 'Similar artists') {
            const contents = item.contents as ArtistRelated[];
            return (
              <React.Fragment key={`related-sec-${index}`}>
                <div className='flex gap-4 items-center justify-between w-full p-1 -mt-2'>
                  <HeaderTitle />
                  <div className='flex-1' />
                  <CarouselButtons
                    onPrev={artistEmblaOnPrevButtonClick}
                    onNext={artistEmblaOnNextButtonClick}
                    prevDisabled={artistEmblaPrevBtnDisabled}
                    nextDisabled={artistEmblaNextBtnDisabled}
                  />
                </div>
                <div
                  className='embla w-full max-w-none mx-0 mt-3 z-10 relative touch-pan-y'
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    setIsQueueReordering(true);
                  }}
                  onPointerUp={() => setIsQueueReordering(false)}
                  onPointerCancel={() => setIsQueueReordering(false)}
                >
                  <div className='embla__viewport touch-pan-y' ref={artistEmblaRef}>
                    <div className='embla__container gap-5 select-none'>
                      <ArtistCards artists={contents || []} />
                    </div>
                  </div>
                </div>
              </React.Fragment>
            );
          }

          if (title === 'About the artist') {
            const description = typeof item.contents === 'string' ? item.contents : '';
            return (
              <React.Fragment key={`related-sec-${index}`}>
                <HeaderTitle />
                <p className='text-[hsl(var(--pona-app-music-accent-color-800))] dark:text-[hsl(var(--pona-app-music-accent-color-500))]'>
                  {description}
                </p>
              </React.Fragment>
            );
          }

          return (
            String(title).replace(' - Topic', '') ===
              ponaCommonState?.current?.author?.replace(' - Topic', '') ? null : null
          );
        })}
      <div className='h-[16vh]' />
    </motion.div>
  );
});

Related.displayName = 'Related';

export default Related;
