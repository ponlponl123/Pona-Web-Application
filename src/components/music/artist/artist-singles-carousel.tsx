'use client';

import React from 'react';
import { AlbumCard, PlaylistCard } from '@/components/music/card';
import { Button } from '@/components/ui/button';
import { usePrevNextButtons } from '@/lib/Embla/CarouselArrowButtons';
import useEmblaCarousel from 'embla-carousel-react';
import { CaretLeft, CaretRight } from '@phosphor-icons/react/dist/ssr';
import { useAppStore } from '@/store/coreStore';
import { ArtistFull as ArtistFullv1 } from '@/types/youtube/ytmusic';
import { ArtistFull } from '@/types/youtube/ytmusic-api';

export interface ArtistSinglesCarouselProps {
  channelDetail: ArtistFull | null | false;
  channelDetailv1: ArtistFullv1 | null | false;
  channelId: string;
  artistName: string;
}

export function ArtistSinglesCarousel({
  channelDetail,
  channelDetailv1,
  channelId,
  artistName,
}: ArtistSinglesCarouselProps) {
  const language = useAppStore((state) => state.language);
  const [channelEmblaRef, channelEmblaApi] = useEmblaCarousel({
    skipSnaps: true,
  });
  const [singleEmblaRef, singleEmblaApi] = useEmblaCarousel({
    skipSnaps: true,
  });

  const {
    prevBtnDisabled: channelEmblaPrevBtnDisabled,
    nextBtnDisabled: channelEmblaNextBtnDisabled,
    onPrevButtonClick: channelEmblaOnPrevButtonClick,
    onNextButtonClick: channelEmblaOnNextButtonClick,
  } = usePrevNextButtons(channelEmblaApi);

  const {
    prevBtnDisabled: singleEmblaPrevBtnDisabled,
    nextBtnDisabled: singleEmblaNextBtnDisabled,
    onPrevButtonClick: singleEmblaOnPrevButtonClick,
    onNextButtonClick: singleEmblaOnNextButtonClick,
  } = usePrevNextButtons(singleEmblaApi);

  const hasFeaturedOn =
    channelDetailv1 &&
    channelDetailv1.featuredOn &&
    channelDetailv1.featuredOn.length > 0 &&
    channelDetail &&
    channelDetail.related?.results &&
    channelDetailv1.featuredOn[0]?.name !==
      channelDetail.related.results[0]?.title;

  const hasSingles =
    (channelDetailv1 &&
      channelDetailv1.topSingles &&
      channelDetailv1.topSingles.length > 0) ||
    (channelDetail &&
      channelDetail.singles &&
      channelDetail.singles.results &&
      channelDetail.singles.results.length > 0);

  return (
    <>
      {hasFeaturedOn && (
        <section className='c section'>
          <div className='flex gap-4 items-center justify-between w-full p-1 -mt-2'>
            <h1 className='w-full text-start text-4xl'>
              {language.data.app.guilds.player.artist.category.featuredOn}{' '}
              {(channelDetail && channelDetail?.name) ||
                (channelDetailv1 && channelDetailv1.name)}
            </h1>
            <div className='flex-1'></div>
            <div className='embla__buttons gap-3 flex items-center justify-center'>
              <Button
                onClick={channelEmblaOnPrevButtonClick}
                disabled={channelEmblaPrevBtnDisabled}
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
                onClick={channelEmblaOnNextButtonClick}
                disabled={channelEmblaNextBtnDisabled}
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
            <div className='embla__viewport' ref={channelEmblaRef}>
              <div className='embla__container gap-5 select-none px-4'>
                {channelDetailv1.featuredOn.map((playlistDetailed, index) => (
                  <React.Fragment key={index}>
                    <PlaylistCard playlist={playlistDetailed} />
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {hasSingles && (
        <section className='c section'>
          <div className='flex gap-4 items-center justify-between w-full p-1 -mt-2'>
            <h1 className='text-start text-4xl'>
              {language.data.app.guilds.player.artist.category.topSingles}
            </h1>
            <div className='flex-1'></div>
            {channelDetail &&
              channelDetail?.singles?.browseId &&
              channelDetail?.singles?.params && (
                <Button
                  variant='outline'
                  size='sm'
                  className='font-bold rounded-full'
                  data-smooth-interaction="true"
                >
                  {language.data.app.guilds.player.artist.showmore}
                </Button>
              )}
            <div className='embla__buttons gap-3 flex items-center justify-center'>
              <Button
                onClick={singleEmblaOnPrevButtonClick}
                disabled={singleEmblaPrevBtnDisabled}
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
                onClick={singleEmblaOnNextButtonClick}
                disabled={singleEmblaNextBtnDisabled}
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
            <div className='embla__viewport' ref={singleEmblaRef}>
              <div className='embla__container gap-5 select-none px-4'>
                {channelDetail &&
                channelDetail.singles &&
                channelDetail.singles.results &&
                channelDetail.singles.results.length > 0
                  ? channelDetail.singles.results.map((singleDetail, index) => (
                      <React.Fragment key={index}>
                        <AlbumCard
                          album={{
                            artists: [
                              {
                                id: channelId,
                                name: channelDetail.name,
                              },
                            ],
                            browseId: singleDetail.browseId,
                            category: 'Albums',
                            duration: null,
                            isExplicit: false,
                            playlistId: singleDetail.browseId,
                            resultType: 'single',
                            thumbnails: singleDetail.thumbnails,
                            title: singleDetail.title,
                            year: Number(singleDetail.year),
                            type: '',
                          }}
                        />
                      </React.Fragment>
                    ))
                  : channelDetailv1 &&
                    channelDetailv1.topSingles &&
                    channelDetailv1.topSingles.length > 0 &&
                    channelDetailv1.topSingles.map((singleDetail, index) => (
                      <React.Fragment key={index}>
                        <AlbumCard
                          album={{
                            artists: [
                              {
                                id: singleDetail.artist?.artistId || channelId,
                                name: singleDetail.artist?.name || artistName,
                              },
                            ],
                            browseId: singleDetail.albumId || '',
                            category: 'Albums',
                            duration: null,
                            isExplicit: false,
                            playlistId: singleDetail.albumId || '',
                            resultType: 'single',
                            thumbnails: singleDetail.thumbnails,
                            title: singleDetail.name || 'Single',
                            year: Number(singleDetail.year) || 0,
                            type: singleDetail.type || '',
                          }}
                        />
                      </React.Fragment>
                    ))}
              </div>
            </div>
          </div>
        </section>
      )}
    </>
  );
}

export default ArtistSinglesCarousel;
