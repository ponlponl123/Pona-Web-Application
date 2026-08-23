'use client';
import React from 'react';
import { cn } from '@/lib/utils';

export function Shimmer({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-3xl bg-foreground/8 before:absolute before:inset-0 before:-translate-x-full before:animate-shimmer before:bg-gradient-to-r before:from-transparent before:via-foreground/15 before:to-transparent',
        className
      )}
    />
  );
}

export function MusicCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('w-48 flex-none', className)}>
      <div className='flex flex-col items-start justify-start gap-3 w-full'>
        <Shimmer className='aspect-square w-full rounded-3xl' />
        <Shimmer className='h-5 w-3/4 rounded-lg' />
        <Shimmer className='h-3.5 w-1/2 rounded-lg' />
      </div>
    </div>
  );
}

export function VideoCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('w-64 flex-none', className)}>
      <div className='flex flex-col items-start justify-start gap-3 w-full'>
        <Shimmer className='aspect-video w-full rounded-3xl' />
        <Shimmer className='h-5 w-3/4 rounded-lg' />
        <Shimmer className='h-3.5 w-1/2 rounded-lg' />
      </div>
    </div>
  );
}

export function AlbumCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('w-48 flex-none p-4', className)}>
      <div className='flex flex-col items-start justify-start gap-3 w-full'>
        <Shimmer className='aspect-square w-full rounded-3xl' />
        <Shimmer className='h-5 w-3/4 rounded-lg' />
        <Shimmer className='h-3.5 w-1/2 rounded-lg' />
      </div>
    </div>
  );
}

export function MoodTileSkeleton({ className }: { className?: string }) {
  return (
    <Shimmer className={cn('h-20 w-full rounded-2xl', className)} />
  );
}

export function SectionSkeleton({
  count = 6,
  SkeletonComponent = MusicCardSkeleton,
  className,
}: {
  count?: number;
  SkeletonComponent?: React.ComponentType<{ className?: string }>;
  className?: string;
}) {
  return (
    <div className={cn('flex gap-5 overflow-hidden', className)}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonComponent key={i} />
      ))}
    </div>
  );
}

export function SearchTopResultSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'relative w-full rounded-3xl p-4 backdrop-blur-lg bg-card/10 border border-border/10 overflow-hidden flex flex-col gap-4 items-start z-10 animate-pulse',
        className
      )}
    >
      <div className='flex gap-4 items-center w-full'>
        <Shimmer className='size-24 rounded-2xl flex-none' />
        <div className='flex flex-col items-start gap-2.5 flex-1 min-w-0'>
          <Shimmer className='h-7 w-2/3 rounded-xl' />
          <Shimmer className='h-4 w-1/3 rounded-lg' />
          <Shimmer className='h-8 w-24 rounded-full mt-1' />
        </div>
      </div>
    </div>
  );
}

export function SearchTrackItemSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'w-full flex items-center justify-between p-3 rounded-2xl gap-4 bg-card/5 border border-border/5 animate-pulse',
        className
      )}
    >
      <div className='flex items-center gap-3 min-w-0 flex-1'>
        <Shimmer className='size-12 rounded-xl flex-none' />
        <div className='flex flex-col gap-2 flex-1 min-w-0'>
          <Shimmer className='h-4 w-1/2 rounded-md' />
          <Shimmer className='h-3 w-1/3 rounded-md' />
        </div>
      </div>
      <Shimmer className='h-3 w-10 rounded-md flex-none' />
    </div>
  );
}

export function SearchResultSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('w-full flex flex-col gap-6 items-start justify-center', className)}>
      <div className='w-full flex flex-col gap-3 items-start'>
        <Shimmer className='h-6 w-28 rounded-lg' />
        <SearchTopResultSkeleton />
        <SearchTrackItemSkeleton />
        <SearchTrackItemSkeleton />
      </div>

      <div className='w-full flex flex-col gap-3 items-start mt-2'>
        <Shimmer className='h-6 w-20 rounded-lg' />
        <SearchTrackItemSkeleton />
        <SearchTrackItemSkeleton />
        <SearchTrackItemSkeleton />
        <SearchTrackItemSkeleton />
      </div>
    </div>
  );
}

export function PlaylistSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'w-full z-4 p-8 flex max-lg:flex-col max-lg:gap-12 lg:gap-24 max-lg:items-center items-start lg:justify-center pb-[24vh] animate-pulse',
        className
      )}
    >
      <div className='w-full max-w-xs flex flex-col gap-3 justify-center items-center lg:items-start'>
        <Shimmer className='h-4 w-32 rounded-md mx-auto lg:mx-0' />
        <Shimmer className='aspect-square w-full rounded-3xl shadow-lg' />
        <Shimmer className='h-8 w-3/4 rounded-xl mt-3 mx-auto lg:mx-0' />
        <Shimmer className='h-4 w-1/3 rounded-md mx-auto lg:mx-0' />
        <Shimmer className='h-6 w-28 rounded-full mx-auto lg:mx-0 mt-1' />
        <div className='flex justify-center lg:justify-start w-full mt-2'>
          <Shimmer className='size-14 rounded-full' />
        </div>
      </div>
      <div className='w-full max-w-lg flex flex-col gap-3 justify-start items-center'>
        {Array.from({ length: 8 }).map((_, i) => (
          <SearchTrackItemSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

export function ChannelSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'w-full flex flex-col items-start justify-start animate-pulse',
        className
      )}
    >
      <div className='w-[calc(100%+6rem)] h-[64vh] min-h-48 relative top-0 left-0 z-1 -translate-x-12 -translate-y-16 max-lg:-translate-y-24 bg-foreground/5 rounded-2xl overflow-hidden'>
        <Shimmer className='w-full h-full rounded-none' />
        <div className='flex flex-col -translate-x-1/2 w-full h-full absolute top-0 left-1/2 items-start justify-end z-20 px-36 max-lg:px-12 py-8 gap-4'>
          <Shimmer className='h-16 w-80 max-w-[80%] rounded-2xl' />
          <Shimmer className='h-4 w-96 max-w-[60%] rounded-lg' />
          <Shimmer className='h-10 w-36 rounded-full mt-2' />
        </div>
      </div>
      <div className='w-full z-4 p-8 max-lg:p-0 flex flex-col max-lg:gap-12 lg:gap-24 items-center justify-start pb-[24vh] -mt-12'>
        <div className='w-full flex flex-col gap-4'>
          <Shimmer className='h-7 w-40 rounded-xl' />
          <div className='grid grid-cols-1 md:grid-cols-2 gap-3 w-full'>
            {Array.from({ length: 4 }).map((_, i) => (
              <SearchTrackItemSkeleton key={i} />
            ))}
          </div>
        </div>
        <div className='w-full flex flex-col gap-4'>
          <Shimmer className='h-7 w-48 rounded-xl' />
          <SectionSkeleton count={5} SkeletonComponent={VideoCardSkeleton} />
        </div>
        <div className='w-full flex flex-col gap-4'>
          <Shimmer className='h-7 w-48 rounded-xl' />
          <SectionSkeleton count={5} SkeletonComponent={AlbumCardSkeleton} />
        </div>
      </div>
    </div>
  );
}

export function RelatedTrackItemSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'w-full flex items-center justify-between p-3 rounded-2xl gap-3.5',
        className
      )}
    >
      <div className='flex items-center gap-3 min-w-0 flex-1'>
        <Shimmer className='size-12 rounded-xl flex-none' />
        <div className='flex flex-col gap-2 flex-1 min-w-0'>
          <Shimmer className='h-4 w-3/5 rounded-md' />
          <Shimmer className='h-3 w-2/5 rounded-md' />
        </div>
      </div>
      <Shimmer className='h-3.5 w-10 rounded-md flex-none' />
    </div>
  );
}

export function RelatedColumnSkeleton() {
  return (
    <div className='relative flex flex-col min-w-[77%] overflow-hidden'>
      <RelatedTrackItemSkeleton />
      <RelatedTrackItemSkeleton />
      <RelatedTrackItemSkeleton />
    </div>
  );
}

export function RelatedSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'flex flex-col gap-6 w-full mx-auto min-h-full max-md:py-6 max-md:px-3 md:py-2 md:px-6',
        className
      )}
    >
      <div className='flex flex-col gap-3 w-full'>
        <div className='flex gap-4 items-center justify-between w-full p-1 -mt-2'>
          <Shimmer className='h-7 w-48 md:w-64 rounded-xl' />
          <div className='flex gap-2'>
            <Shimmer className='size-9 rounded-full' />
            <Shimmer className='size-9 rounded-full' />
          </div>
        </div>
        <div className='flex gap-5 overflow-hidden w-full'>
          <RelatedColumnSkeleton />
          <RelatedColumnSkeleton />
        </div>
      </div>

      <div className='flex flex-col gap-3 w-full mt-2'>
        <div className='flex gap-4 items-center justify-between w-full p-1 -mt-2'>
          <Shimmer className='h-7 w-44 md:w-56 rounded-xl' />
          <div className='flex gap-2'>
            <Shimmer className='size-9 rounded-full' />
            <Shimmer className='size-9 rounded-full' />
          </div>
        </div>
        <div className='flex gap-5 overflow-hidden w-full'>
          <RelatedColumnSkeleton />
          <RelatedColumnSkeleton />
        </div>
      </div>

      <div className='flex flex-col gap-3 w-full mt-2'>
        <div className='flex gap-4 items-center justify-between w-full p-1 -mt-2'>
          <Shimmer className='h-7 w-52 md:w-60 rounded-xl' />
          <div className='flex gap-2'>
            <Shimmer className='size-9 rounded-full' />
            <Shimmer className='size-9 rounded-full' />
          </div>
        </div>
        <div className='flex gap-5 overflow-hidden w-full'>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className='w-48 flex-none flex flex-col gap-3'>
              <Shimmer className='aspect-square w-full rounded-2xl' />
              <Shimmer className='h-4 w-3/4 rounded-lg' />
              <Shimmer className='h-3 w-1/2 rounded-lg' />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

