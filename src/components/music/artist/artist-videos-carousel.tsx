'use client';

import React from 'react';
import { VideoCard } from '@/components/music/card';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { getCookie } from 'cookies-next';
import { usePrevNextButtons } from '@/lib/Embla/CarouselArrowButtons';
import useEmblaCarousel from 'embla-carousel-react';
import { CaretLeft, CaretRight } from '@phosphor-icons/react/dist/ssr';
import { getChannelVideos } from '@/lib/server-side-api/internal/search';
import { useAppStore } from '@/store/coreStore';
import { ArtistFull as ArtistFullv1 } from '@/types/youtube/ytmusic';
import {
  ArtistFull,
  ArtistVideo,
  ProfileFull,
  VideoDetailed,
} from '@/types/youtube/ytmusic-api';

export interface ArtistVideosCarouselProps {
  channelDetail: ArtistFull | null | false;
  channelDetailv1: ArtistFullv1 | null | false;
  profileDetail: ProfileFull | null | false;
  channelId: string;
  artistName: string;
}

export function ArtistVideosCarousel({
  channelDetail,
  channelDetailv1,
  profileDetail,
  channelId,
  artistName,
}: ArtistVideosCarouselProps) {
  const language = useAppStore((state) => state.language);
  const [videoEmblaRef, videoEmblaApi] = useEmblaCarousel({ skipSnaps: true });
  const [fetchingVideos, setFetchingVideos] = React.useState<
    boolean | undefined
  >(undefined);
  const [videos, setVideos] = React.useState<undefined | ArtistVideo[]>(
    undefined
  );

  const {
    prevBtnDisabled: videoEmblaPrevBtnDisabled,
    nextBtnDisabled: videoEmblaNextBtnDisabled,
    onPrevButtonClick: videoEmblaOnPrevButtonClick,
    onNextButtonClick: videoEmblaOnNextButtonClick,
  } = usePrevNextButtons(videoEmblaApi);

  const hasVideos =
    (channelDetailv1 &&
      channelDetailv1.topVideos &&
      channelDetailv1.topVideos.length > 0) ||
    (channelDetail &&
      channelDetail.videos &&
      channelDetail.videos.results &&
      channelDetail.videos.results.length > 0) ||
    (profileDetail &&
      profileDetail.videos &&
      profileDetail.videos.results.length > 0);

  if (!hasVideos) return null;

  return (
    <section className='c section'>
      <div className='flex gap-4 flex-wrap items-center justify-between w-full p-1 -mt-2'>
        <h1 className='text-start text-4xl'>
          {language.data.app.guilds.player.artist.category.topVideos}
        </h1>
        <div className='flex-1'></div>
        {!(fetchingVideos === false) && (
          <>
            <Button
              variant='outline'
              size='sm'
              className='font-bold rounded-full'
              data-smooth-interaction="true"
              onClick={async () => {
                if (!channelId) return;
                setFetchingVideos(true);
                const accessTokenType = getCookie('LOGIN_TYPE_');
                const accessToken = getCookie('LOGIN_');
                const fetchedVideos = await getChannelVideos(
                  String(accessTokenType),
                  String(accessToken),
                  channelId
                );
                if (fetchedVideos)
                  setVideos(fetchedVideos as unknown as ArtistVideo[]);
                setFetchingVideos(false);
              }}
            >
              {fetchingVideos ? (
                <Spinner className='size-4' />
              ) : (
                language.data.app.guilds.player.artist.showmore
              )}
            </Button>
            <div className='embla__buttons gap-3 flex items-center justify-center'>
              <Button
                onClick={videoEmblaOnPrevButtonClick}
                disabled={videoEmblaPrevBtnDisabled}
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
                onClick={videoEmblaOnNextButtonClick}
                disabled={videoEmblaNextBtnDisabled}
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
          </>
        )}
      </div>
      <div
        className={
          fetchingVideos === false
            ? 'w-full'
            : 'embla w-full max-w-none mx-0 mt-6 z-10 relative'
        }
      >
        <div
          className={fetchingVideos === false ? 'w-full' : 'embla__viewport'}
          ref={videoEmblaRef}
        >
          <div
            className={
              fetchingVideos === false
                ? 'grid gap-4 grid-cols-4 max-[1660px]:grid-cols-3 max-lg:grid-cols-2 max-sm:grid-cols-1 transform-none!'
                : 'embla__container gap-5 select-none px-4'
            }
          >
            {fetchingVideos === false && videos && videos?.length > 0
              ? videos.map((videoDetail, index) => (
                <React.Fragment key={index}>
                  <VideoCard
                    video={
                      {
                        artists: videoDetail.artists,
                        category: 'Videos',
                        duration_seconds: null,
                        isExplicit: false,
                        resultType: 'video',
                        thumbnails: videoDetail.thumbnails,
                        title: videoDetail.title,
                        videoId: videoDetail.videoId,
                        view: videoDetail.views,
                        videoType: null,
                        year: null,
                      } as unknown as VideoDetailed
                    }
                  />
                </React.Fragment>
              ))
              : channelDetail &&
                channelDetail.videos &&
                channelDetail.videos.results &&
                channelDetail.videos.results.length > 0
                ? channelDetail.videos.results.map(
                  (videoDetail, index: number) => (
                    <React.Fragment key={index}>
                      <VideoCard
                        className='w-full'
                        video={
                          {
                            artists: videoDetail.artists,
                            category: 'Videos',
                            duration_seconds: null,
                            isExplicit: false,
                            resultType: 'video',
                            thumbnails: videoDetail.thumbnails,
                            title: videoDetail.title,
                            videoId: videoDetail.videoId,
                            view: videoDetail.views,
                            videoType: null,
                            year: null,
                          } as unknown as VideoDetailed
                        }
                      />
                    </React.Fragment>
                  )
                )
                : channelDetailv1 &&
                  channelDetailv1.topVideos &&
                  channelDetailv1.topVideos.length > 0
                  ? channelDetailv1.topVideos.map((videoDetail, index: number) => (
                    <React.Fragment key={index}>
                      <VideoCard
                        video={
                          {
                            artists: [
                              {
                                id: videoDetail.artist?.artistId || channelId,
                                name: videoDetail.artist?.name || artistName,
                              },
                            ],
                            category: 'Videos',
                            duration: String(videoDetail.duration || ''),
                            duration_seconds: videoDetail.duration || null,
                            isExplicit: false,
                            resultType: 'video',
                            thumbnails: videoDetail.thumbnails,
                            title: videoDetail.name || 'Video',
                            videoId: videoDetail.videoId,
                            view: '',
                            videoType: null,
                            year: null,
                          } as unknown as VideoDetailed
                        }
                      />
                    </React.Fragment>
                  ))
                  : profileDetail &&
                  profileDetail.videos &&
                  profileDetail.videos.results.length > 0 &&
                  profileDetail.videos.results.map(
                    (videoDetail, index: number) => (
                      <React.Fragment key={index}>
                        <VideoCard
                          video={
                            {
                              artists: videoDetail.artists,
                              category: 'Videos',
                              duration: null,
                              duration_seconds: null,
                              isExplicit: false,
                              resultType: 'video',
                              thumbnails: videoDetail.thumbnails,
                              title: videoDetail.title,
                              videoId: videoDetail.videoId,
                              view: null,
                              videoType: null,
                              year: null,
                            } as unknown as VideoDetailed
                          }
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

export default ArtistVideosCarousel;
