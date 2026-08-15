'use client';

import React, { memo, useEffect, useMemo, useState } from 'react';
import { getCookie } from 'cookies-next';
import useEmblaCarousel from 'embla-carousel-react';
import { motion } from 'framer-motion';
import { useAtomValue } from 'jotai';
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
import { RelatedInfo, useMusicCacheStore } from '@/store/musicCacheStore';
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
                title: 'text-[hsl(var(--pona-app-music-accent-color-800))] dark:text-[hsl(var(--pona-app-music-accent-color-500))]',
                subtitle: 'text-[hsl(var(--pona-app-music-accent-color-800)/0.64)]! dark:text-[hsl(var(--pona-app-music-accent-color-500)/0.64)]!',
                playButton: {
                  playpause:
                    'text-[hsl(var(--pona-app-music-accent-color-500))]',
                },
                artistLink: "text-[hsl(var(--pona-app-music-accent-color-800)/0.75)]! dark:text-[hsl(var(--pona-app-music-accent-color-500)/0.75)]!",
                duration: 'text-[hsl(var(--pona-app-music-accent-color-800)/0.64)] dark:text-[hsl(var(--pona-app-music-accent-color-500)/0.64)]',
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
            className='**:text-[hsl(var(--pona-app-music-accent-color-700))]! **:dark:text-[hsl(var(--pona-app-music-accent-color-500))]!'
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
  const relatedInfoCache = useMusicCacheStore((state) => state.relatedInfoCache);
  const setRelatedInfo = useMusicCacheStore((state) => state.setRelatedInfo);

  const currentCache = videoId ? relatedInfoCache[videoId] : undefined;
  const [fetched, setFetched] = useState<boolean>(Boolean(currentCache));

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

  useEffect(() => {
    if (!videoId || (fetched && currentCache)) return;

    const setFetchedCache = (value: Omit<RelatedInfo, 'videoId'> | null) => {
      if (value === null)
        setRelatedInfo(videoId, {
          related: undefined,
          watch_playlist: undefined,
        });
      else
        setRelatedInfo(videoId, {
          related: value.related,
          watch_playlist: value.watch_playlist,
        });
      setFetched(true);
    };

    const fetchRelated = async () => {
      const accessToken = String(getCookie('LOGIN_'));
      const accessTokenType = String(getCookie('LOGIN_TYPE_'));
      if (!accessToken || accessTokenType === 'undefined')
        return setFetchedCache(null);
      const songRelated = await getSongRelated(
        accessTokenType,
        accessToken,
        videoId
      );
      if (!songRelated) return setFetchedCache(null);
      setFetchedCache({
        related: songRelated.related,
        watch_playlist: songRelated.watch_playlist,
      });
    };
    fetchRelated();
  }, [videoId, currentCache, fetched, setRelatedInfo]);

  if (!videoId)
    return (
      <div className='flex flex-col gap-4 items-center justify-center w-full h-full'>
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

  return fetched ? (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.16 }}
      className='flex flex-col gap-4 w-full mx-auto min-h-full py-2 px-6'
    >
      {watchPlaylistTracks.length > 0 && (
        <>
          <div className='flex gap-4 items-center justify-between w-full p-1 -mt-2'>
            <h1 className='text-3xl -mb-2 font-bold text-[hsl(var(--pona-app-music-accent-color-800)/0.64)] dark:text-[hsl(var(--pona-app-music-accent-color-500)/0.64)]'>
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
              className={`text-3xl ${index > 0 ? 'mt-4' : ''} -mb-2 font-bold text-[hsl(var(--pona-app-music-accent-color-800)/0.64)] dark:text-[hsl(var(--pona-app-music-accent-color-500)/0.64)]`}
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
                <div className='embla w-full max-w-none mx-0 my-0 z-10 relative'>
                  <div className='embla__viewport' ref={recommendsEmblaRef}>
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
                <div className='embla w-full max-w-none mx-0 mt-3 z-10 relative'>
                  <div className='embla__viewport' ref={playlistEmblaRef}>
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
                <div className='embla w-full max-w-none mx-0 mt-3 z-10 relative'>
                  <div className='embla__viewport' ref={artistEmblaRef}>
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
  ) : (
    <div className='flex flex-col gap-4 items-center justify-center w-full h-full'>
      <Spinner className='text-[hsl(var(--pona-app-music-accent-color-800))] dark:text-[hsl(var(--pona-app-music-accent-color-500))]' />
      <h1 className='text-2xl max-w-3xl text-center text-[hsl(var(--pona-app-music-accent-color-800)/0.64)] dark:text-[hsl(var(--pona-app-music-accent-color-500))/0.64]'>
        {language.data.common.friendly_loading}
      </h1>
    </div>
  );
});

Related.displayName = 'Related';

export default Related;
