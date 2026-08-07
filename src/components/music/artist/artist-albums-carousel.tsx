'use client';

import React from 'react';
import { AlbumCard } from '@/components/music/card';
import { Button } from '@/components/ui/button';
import { usePrevNextButtons } from '@/lib/Embla/CarouselArrowButtons';
import useEmblaCarousel from 'embla-carousel-react';
import { CaretLeft, CaretRight } from '@phosphor-icons/react/dist/ssr';
import { useAppStore } from '@/store/coreStore';
import { ArtistFull as ArtistFullv1 } from '@/types/youtube/ytmusic';
import { ArtistFull, ProfileFull } from '@/types/youtube/ytmusic-api';

export interface ArtistAlbumsCarouselProps {
  channelDetail: ArtistFull | null | false;
  channelDetailv1: ArtistFullv1 | null | false;
  profileDetail: ProfileFull | null | false;
  channelId: string;
  artistName: string;
}

export function ArtistAlbumsCarousel({
  channelDetail,
  channelDetailv1,
  profileDetail,
  channelId,
  artistName,
}: ArtistAlbumsCarouselProps) {
  const language = useAppStore((state) => state.language);
  const [albumEmblaRef, albumEmblaApi] = useEmblaCarousel({ skipSnaps: true });

  const {
    prevBtnDisabled: albumEmblaPrevBtnDisabled,
    nextBtnDisabled: albumEmblaNextBtnDisabled,
    onPrevButtonClick: albumEmblaOnPrevButtonClick,
    onNextButtonClick: albumEmblaOnNextButtonClick,
  } = usePrevNextButtons(albumEmblaApi);

  const hasAlbums =
    !profileDetail &&
    ((channelDetailv1 &&
      channelDetailv1.topAlbums &&
      channelDetailv1.topAlbums.length > 0) ||
      (channelDetail &&
        channelDetail.albums &&
        channelDetail.albums.results &&
        channelDetail.albums.results.length > 0));

  if (!hasAlbums) return null;

  return (
    <section className='c section'>
      <div className='flex gap-4 items-center justify-between w-full p-1 -mt-2'>
        <h1 className='text-start text-4xl'>
          {language.data.app.guilds.player.artist.category.topAlbums}
        </h1>
        <div className='flex-1'></div>
        {channelDetail &&
          channelDetail?.albums?.browseId &&
          channelDetail?.albums?.params && (
            <Button
              variant='outline'
              size='sm'
              className='font-bold rounded-full'
            >
              {language.data.app.guilds.player.artist.showmore}
            </Button>
          )}
        <div className='embla__buttons gap-3 flex items-center justify-center'>
          <Button
            onClick={albumEmblaOnPrevButtonClick}
            disabled={albumEmblaPrevBtnDisabled}
            title='previous'
            variant='ghost'
            size='icon'
            className='rounded-full size-8 embla__button embla__button--prev border-2 border-foreground/10 bg-foreground/10 disabled:opacity-30'
            type='button'
          >
            <CaretLeft className='size-4' />
          </Button>
          <Button
            onClick={albumEmblaOnNextButtonClick}
            disabled={albumEmblaNextBtnDisabled}
            title='next'
            variant='ghost'
            size='icon'
            className='rounded-full size-8 embla__button embla__button--next border-2 border-foreground/10 bg-foreground/10 disabled:opacity-30'
            type='button'
          >
            <CaretRight className='size-4' />
          </Button>
        </div>
      </div>
      <div className='embla w-full max-w-none mx-0 mt-6 z-10 relative'>
        <div className='embla__viewport' ref={albumEmblaRef}>
          <div className='embla__container gap-5 select-none px-4'>
            {channelDetail &&
            channelDetail.albums &&
            channelDetail.albums.results &&
            channelDetail.albums.results.length > 0
              ? channelDetail.albums.results.map(
                  (albumDetail, index: number) => (
                    <React.Fragment key={index}>
                      <AlbumCard
                        album={{
                          artists: [
                            {
                              id: channelId,
                              name: channelDetail.name,
                            },
                          ],
                          browseId: albumDetail.browseId,
                          category: 'Albums',
                          duration: null,
                          isExplicit: false,
                          playlistId: albumDetail.browseId,
                          resultType: 'album',
                          thumbnails: albumDetail.thumbnails,
                          title: albumDetail.title,
                          year: Number(albumDetail.year),
                          type: '',
                        }}
                      />
                    </React.Fragment>
                  )
                )
              : channelDetailv1 &&
                channelDetailv1.topAlbums &&
                channelDetailv1.topAlbums.length > 0 &&
                channelDetailv1.topAlbums.map((albumDetail, index: number) => (
                  <React.Fragment key={index}>
                    <AlbumCard
                      album={{
                        artists: [
                          {
                            id: albumDetail.artist?.artistId || channelId,
                            name: albumDetail.artist?.name || artistName,
                          },
                        ],
                        browseId: albumDetail.albumId || '',
                        category: 'Albums',
                        duration: null,
                        isExplicit: false,
                        playlistId: albumDetail.albumId || '',
                        resultType: 'album',
                        thumbnails: albumDetail.thumbnails,
                        title: albumDetail.name || 'Album',
                        year: Number(albumDetail.year) || 0,
                        type: albumDetail.type || '',
                      }}
                    />
                  </React.Fragment>
                ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default ArtistAlbumsCarousel;
