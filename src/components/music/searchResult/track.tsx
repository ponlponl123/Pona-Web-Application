'use client';
import { useDiscordGuildInfo } from '@/contexts/discordGuildInfo';
import { useLanguageContext } from '@/contexts/languageContext';
import {
  ArtistBasic,
  SearchResult as HTTP_SearchResult,
  ResultType,
} from '@/interfaces/ytmusic-api';
import { msToTime } from '@/utils/time';
import { Button, Image, Link } from '@nextui-org/react';
import { Play } from '@phosphor-icons/react/dist/ssr';
import clsx from 'clsx';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { useRouter } from 'next/navigation';
import React from 'react';
import PlayButton, { PlayButtonClassNames } from '../play';

export interface TrackClassNames {
  title?: string;
  subtitle?: string;
  wrapper?: string;
  playButton?: PlayButtonClassNames;
  image?: string;
  imageWrapper?: string;
}

export interface CombineArtistNameOptions {
  className?: string;
}
export function combineArtistName(artists: ArtistBasic[]): string;
export function combineArtistName(
  artists: ArtistBasic[],
  isElement?: boolean
): React.ReactNode;
export function combineArtistName(
  artists: ArtistBasic[],
  isElement?: boolean,
  router?: AppRouterInstance
): React.ReactNode;
export function combineArtistName(
  artists: ArtistBasic[],
  isElement?: boolean,
  router?: AppRouterInstance,
  options?: CombineArtistNameOptions
): React.ReactNode;
export function combineArtistName(
  artists: ArtistBasic[],
  isElement?: boolean,
  router?: AppRouterInstance,
  options?: CombineArtistNameOptions
): string | React.ReactNode {
  let artist: string = '';
  if (!artists) return artist;
  if (isElement) {
    return (
      <>
        {artists.map((artist, index) => {
          if (!artist.id)
            return index === 0 ? (
              <React.Fragment key={index}>{artist.name}</React.Fragment>
            ) : (
              <React.Fragment key={index}> & {artist.name}</React.Fragment>
            );
          const href =
            window.location.pathname.split('/player')[0] +
            '/player/c?c=' +
            artist.id;
          const Linked = () =>
            router ? (
              <Link
                onPress={() => {
                  if (router) router.push(href);
                }}
                className={'cursor-pointer ' + (options?.className || '')}
                underline='hover'
                color='foreground'
              >
                {artist.name}
              </Link>
            ) : (
              <Link
                href={href}
                underline='hover'
                color='foreground'
                className={options?.className}
              >
                {artist.name}
              </Link>
            );
          return index === 0 ? (
            <Linked key={index} />
          ) : (
            <React.Fragment key={index}>
              {' '}
              & <Linked />
            </React.Fragment>
          );
        })}
      </>
    );
  }
  for (let i = 0; i < artists.length; i++) {
    if (artists[i].name) {
      if (i > 0) artist = artist + ' & ' + artists[i].name;
      else artist = artists[i].name;
    }
  }
  return artist;
}

export function TrackDetail({
  data,
  isHasPlay = true,
  classNames,
}: {
  data: HTTP_SearchResult;
  classNames?: TrackClassNames;
  isHasPlay?: boolean;
}) {
  const router = useRouter();
  const { language } = useLanguageContext();
  const title =
    'title' in data
      ? data?.title
      : 'name' in data
        ? data?.name
        : 'artist' in data
          ? data?.artist
          : '';
  return (
    <div className='w-full flex gap-4 items-center justify-start group hover:bg-foreground/5 p-2 rounded-2xl border-2 border-foreground/0 hover:border-foreground/5'>
      <div className='relative w-14 h-14'>
        <Image
          src={`/api/proxy/image?r=${data?.thumbnails && data?.thumbnails.length > 0 ? (data?.thumbnails[data?.thumbnails.length - 1] ? data?.thumbnails[data?.thumbnails.length - 1]?.url : data?.thumbnails[0]?.url) : '/static/default.png'}`}
          alt={title}
          height={56}
          width={56}
          className='object-cover rounded-xl w-14 h-14'
          classNames={{
            img: clsx('w-14 h-14 scale-150', classNames?.image),
            wrapper: clsx(
              'w-full h-full overflow-hidden',
              classNames?.imageWrapper
            ),
          }}
        />
        {!isHasPlay && (
          <div className='absolute w-full h-full opacity-0 group-hover:opacity-100 bg-black/40 top-0 left-0 z-10 rounded-xl flex items-center justify-center'>
            <Play weight='fill' size={16} />
          </div>
        )}
        {isHasPlay &&
          (data?.category === 'Songs' || data?.category === 'Videos') && (
            <PlayButton
              className={clsx('rounded-xl')}
              classNames={classNames?.playButton}
              iconSize={16}
              detail={{
                author:
                  'artists' in data ? combineArtistName(data.artists) : '',
                identifier: data?.videoId,
                sourceName: 'youtube music',
                resultType: data?.resultType,
                title: data?.title,
                uri: `https://music.youtube.com/watch?v=${data?.videoId}`,
              }}
            />
          )}
      </div>
      <div className='flex flex-col justify-center items-start w-[calc(100%_-_6rem)]'>
        <h1
          className={clsx(
            'text-xl w-full overflow-hidden overflow-ellipsis whitespace-nowrap text-start',
            classNames?.title
          )}
        >
          {title}
        </h1>
        <h3
          className={clsx(
            'text-sm w-full overflow-hidden overflow-ellipsis whitespace-nowrap text-start opacity-30 gap-2 flex items-center',
            classNames?.subtitle
          )}
        >
          {'resultType' in data &&
          language.data.app.guilds.player.search.category[
            (data.resultType[0].toUpperCase() +
              data.resultType.slice(1, data.resultType.length) +
              's') as keyof typeof language.data.app.guilds.player.search.category
          ]
            ? language.data.app.guilds.player.search.category[
                (data.resultType[0].toUpperCase() +
                  data.resultType.slice(1, data.resultType.length) +
                  's') as keyof typeof language.data.app.guilds.player.search.category
              ]
            : data.resultType.toLocaleUpperCase()}
          {'artists' in data && 'duration_seconds' in data ? (
            <>
              {' '}
              •{' '}
              {combineArtistName(data?.artists, true, router, {
                className: classNames?.subtitle,
              })}
              {data.duration_seconds &&
                ' • ' + msToTime(data?.duration_seconds * 1000)}
            </>
          ) : 'artists' in data && 'year' in data ? (
            <>
              {' '}
              •{' '}
              {combineArtistName(data?.artists, true, router, {
                className: classNames?.subtitle,
              })}{' '}
              • {data?.year}
            </>
          ) : 'artists' in data ? (
            <>
              {' '}
              •{' '}
              {combineArtistName(data?.artists, true, router, {
                className: classNames?.subtitle,
              })}
            </>
          ) : 'author' in data ? (
            <> • {data?.author}</>
          ) : (
            <></>
          )}
        </h3>
      </div>
    </div>
  );
}

function Track({
  data,
  classNames,
}: {
  data: HTTP_SearchResult;
  classNames?: TrackClassNames;
}) {
  const router = useRouter();
  const { guild } = useDiscordGuildInfo();
  return data?.category === 'Songs' || data?.category === 'Videos' ? (
    <PlayButton
      className='rounded-xl h-max relative opacity-100 bg-transparent active:!scale-[0.98]'
      detail={{
        author: combineArtistName(data?.artists),
        identifier: data?.videoId,
        resultType: data?.resultType,
        sourceName: 'youtube',
        title: data?.title,
        uri: `https://www.youtube.com/watch?v=${data?.videoId}`,
      }}
    >
      <TrackDetail data={data} classNames={classNames} isHasPlay={false} />
    </PlayButton>
  ) : (data?.category === 'Artists' ||
      data?.resultType === 'artist' ||
      data?.resultType === 'profile') &&
    'browseId' in data ? (
    <Button
      className='w-full rounded-xl relative opacity-100 bg-transparent active:!scale-[0.98] h-max p-0'
      onPress={() => {
        router.push(`/app/g/${guild?.id}/player/c?c=${data?.browseId}`);
      }}
    >
      <TrackDetail data={data} classNames={classNames} />
    </Button>
  ) : data?.category === 'Albums' || data?.resultType === 'album' ? (
    <Button
      className='w-full rounded-xl relative opacity-100 bg-transparent active:!scale-[0.98] h-max p-0'
      onPress={() => {
        router.push(
          `/app/g/${guild?.id}/player/playlist?list=${data?.browseId}abm`
        );
      }}
    >
      <TrackDetail data={data} classNames={classNames} />
    </Button>
  ) : (data?.category === 'Community playlists' ||
      data?.resultType === ('playlist' as ResultType)) &&
    'browseId' in data ? (
    <Button
      className='w-full rounded-xl relative opacity-100 bg-transparent active:!scale-[0.98] h-max p-0'
      onPress={() => {
        router.push(
          `/app/g/${guild?.id}/player/playlist?list=${data?.browseId}`
        );
      }}
    >
      <TrackDetail data={data} classNames={classNames} />
    </Button>
  ) : (
    <TrackDetail data={data} classNames={classNames} />
  );
}

export default Track;
