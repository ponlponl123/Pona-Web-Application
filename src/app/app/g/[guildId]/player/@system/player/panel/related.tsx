import { ArtistCard, PlaylistCard } from '@/components/music/card';
import Track from '@/components/music/searchResult/track';
import { getSongRelated } from '@/lib/server-side-api/internal/search';
import { usePrevNextButtons } from '@/lib/Embla/CarouselArrowButtons';
import { CaretLeft, CaretRight, Ghost } from '@phosphor-icons/react/dist/ssr';
import { getCookie } from 'cookies-next';
import useEmblaCarousel from 'embla-carousel-react';
import { motion } from 'framer-motion';
import React from 'react';
import { useAppStore } from '@/store/coreStore';
import { useAtomValue } from 'jotai';
import { ponaCommonStateAtom } from '@/store/musicAtoms';
import { useMusicCacheStore, RelatedInfo } from '@/store/musicCacheStore';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';

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
              }}
            />
          );
        }
      }
      result.push(
        <div key={`column-${i}`} className='flex flex-col flex-none w-[90%] gap-2'>
          {columnTracks}
        </div>
      );
    }
    return result;
  }, [tracks]);

  return <div className='flex gap-4 min-w-0 flex-[0_0_100%]'>{columns}</div>;
});
TrackColumns.displayName = 'TrackColumns';

// Memoized carousel control buttons component
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
    <div className='flex items-center gap-2'>
      <Button
        variant='ghost'
        size='icon'
        onClick={onPrev}
        disabled={prevDisabled}
        className='rounded-full'
      >
        <CaretLeft />
      </Button>
      <Button
        variant='ghost'
        size='icon'
        onClick={onNext}
        disabled={nextDisabled}
        className='rounded-full'
      >
        <CaretRight />
      </Button>
    </div>
  )
);
CarouselButtons.displayName = 'CarouselButtons';

const Related = React.memo(({ videoId }: { videoId?: string }) => {
  const language = useAppStore((state) => state.language);
  const ponaCommonState = useAtomValue(ponaCommonStateAtom);
  const relatedInfoCache = useMusicCacheStore(
    (state) => (videoId ? state.relatedInfoCache[videoId] : undefined)
  );
  const setRelatedInfo = useMusicCacheStore((state) => state.setRelatedInfo);

  const [fetched, setFetched] = React.useState<boolean>(
    Boolean(relatedInfoCache && relatedInfoCache.videoId === videoId)
  );

  const watchPlaylistTracks = React.useMemo(
    () => relatedInfoCache?.watch_playlist?.tracks || [],
    [relatedInfoCache?.watch_playlist?.tracks]
  );

  const relatedItems = React.useMemo(
    () => relatedInfoCache?.related || [],
    [relatedInfoCache?.related]
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
    if (!videoId || (fetched && relatedInfoCache?.videoId === videoId)) return;

    const fetchRelated = async () => {
      const accessToken = String(getCookie('LOGIN_'));
      const accessTokenType = String(getCookie('LOGIN_TYPE_'));
      if (!accessToken || accessTokenType === 'undefined') {
        setRelatedInfo(videoId, { related: undefined, watch_playlist: undefined });
        setFetched(true);
        return;
      }
      const songRelated = await getSongRelated(
        accessTokenType,
        accessToken,
        videoId
      );
      if (!songRelated) {
        setRelatedInfo(videoId, { related: undefined, watch_playlist: undefined });
        setFetched(true);
        return;
      }
      setRelatedInfo(videoId, {
        related: songRelated.related,
        watch_playlist: songRelated.watch_playlist,
      });
      setFetched(true);
    };
    fetchRelated();
  }, [videoId, fetched, relatedInfoCache?.videoId, setRelatedInfo]);

  if (!videoId)
    return (
      <div className='flex flex-col gap-4 items-center justify-center w-full h-full'>
        <Ghost
          size={56}
          weight='fill'
          className='text-[hsl(var(--pona-app-music-accent-color-500))] opacity-40'
        />
        <h1 className='text-[hsl(var(--pona-app-music-accent-color-500))] opacity-40'>
          {language.data.app.guilds.player.related.videoId_not_provided || 'No related tracks'}
        </h1>
      </div>
    );

  return (
    <div className='flex flex-col gap-8 py-4'>
      {/* Recommended Section */}
      {relatedItems.length > 0 && (
        <div className='flex flex-col gap-4'>
          <div className='flex items-center justify-between'>
            <h2 className='text-lg font-bold text-[hsl(var(--pona-app-music-accent-color-500))]'>
              {language.data.app.guilds.player.tabs.related}
            </h2>
            <CarouselButtons
              onPrev={recommendsEmblaOnPrevButtonClick}
              onNext={recommendsEmblaOnNextButtonClick}
              prevDisabled={recommendsEmblaPrevBtnDisabled}
              nextDisabled={recommendsEmblaNextBtnDisabled}
            />
          </div>
          <div className='overflow-hidden' ref={recommendsEmblaRef}>
            <TrackColumns tracks={relatedItems} />
          </div>
        </div>
      )}

      {!fetched && (
        <div className='flex items-center justify-center py-8'>
          <Spinner size='md' />
        </div>
      )}
    </div>
  );
});

Related.displayName = 'Related';

export default Related;
