'use client';

import React from 'react';
import { ArtistCard } from '@/components/music/card';
import { Button } from '@/components/ui/button';
import { usePrevNextButtons } from '@/lib/Embla/CarouselArrowButtons';
import useEmblaCarousel from 'embla-carousel-react';
import { CaretLeft, CaretRight } from '@phosphor-icons/react/dist/ssr';
import { useAppStore } from '@/store/coreStore';
import { ArtistFull as ArtistFullv1 } from '@/types/youtube/ytmusic';
import { ArtistFull } from '@/types/youtube/ytmusic-api';

export interface ArtistSimilarCarouselProps {
  channelDetail: ArtistFull | null | false;
  channelDetailv1: ArtistFullv1 | null | false;
  artistName: string;
}

export function ArtistSimilarCarousel({
  channelDetail,
  channelDetailv1,
  artistName,
}: ArtistSimilarCarouselProps) {
  const language = useAppStore((state) => state.language);
  const [artistEmblaRef, artistEmblaApi] = useEmblaCarousel({
    skipSnaps: true,
  });

  const {
    prevBtnDisabled: artistEmblaPrevBtnDisabled,
    nextBtnDisabled: artistEmblaNextBtnDisabled,
    onPrevButtonClick: artistEmblaOnPrevButtonClick,
    onNextButtonClick: artistEmblaOnNextButtonClick,
  } = usePrevNextButtons(artistEmblaApi);

  const hasSimilar =
    (channelDetailv1 &&
      channelDetailv1.similarArtists &&
      channelDetailv1.similarArtists.length > 0) ||
    (channelDetail &&
      channelDetail.related &&
      channelDetail.related.results &&
      channelDetail.related.results.length > 0);

  if (!hasSimilar) return null;

  return (
    <section className='c section'>
      <div className='flex gap-4 items-center justify-between w-full p-1 -mt-2'>
        <h1 className='w-full text-start text-4xl font-bold'>
          {language.data.app.guilds.player.artist.category.similarArtists}{' '}
          {artistName}
        </h1>
        <div className='flex-1'></div>
        <div className='embla__buttons gap-3 flex items-center justify-center'>
          <Button
            onClick={artistEmblaOnPrevButtonClick}
            disabled={artistEmblaPrevBtnDisabled}
            title='previous'
            variant='ghost'
            size='icon'
            className='rounded-full size-8 embla__button embla__button--prev border-2 border-foreground/10 bg-foreground/10 disabled:opacity-30'
            type='button'
            data-smooth-interaction="true"
          >
            <CaretLeft className='size-4' />
          </Button>
          <Button
            onClick={artistEmblaOnNextButtonClick}
            disabled={artistEmblaNextBtnDisabled}
            title='next'
            variant='ghost'
            size='icon'
            className='rounded-full size-8 embla__button embla__button--next border-2 border-foreground/10 bg-foreground/10 disabled:opacity-30'
            type='button'
            data-smooth-interaction="true"
          >
            <CaretRight className='size-4' />
          </Button>
        </div>
      </div>
      <div className='embla w-full max-w-none mx-0 mt-6 z-10 relative'>
        <div className='embla__viewport' ref={artistEmblaRef}>
          <div className='embla__container gap-5 select-none px-4'>
            {channelDetail &&
            channelDetail.related &&
            channelDetail.related.results &&
            channelDetail.related.results.length > 0
              ? channelDetail.related.results.map((artistDetail, index) => (
                  <React.Fragment key={index}>
                    <ArtistCard
                      artist={{
                        name: artistDetail.title,
                        artistId: artistDetail.browseId,
                        thumbnails: artistDetail.thumbnails,
                        type: 'ARTIST',
                      }}
                    />
                  </React.Fragment>
                ))
              : channelDetailv1 &&
                channelDetailv1.similarArtists &&
                channelDetailv1.similarArtists.length > 0 &&
                channelDetailv1.similarArtists.map(
                  (artistDetail, index: number) => (
                    <React.Fragment key={index}>
                      <ArtistCard
                        artist={{
                          name: artistDetail.name || 'Artist',
                          artistId: artistDetail.artistId || '',
                          thumbnails: artistDetail.thumbnails || [],
                          type: 'ARTIST',
                        }}
                      />
                    </React.Fragment>
                  )
                )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default ArtistSimilarCarousel;
