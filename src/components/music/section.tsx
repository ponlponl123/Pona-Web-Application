'use client';
import React, { useMemo } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { CaretLeftIcon, CaretRightIcon } from '@phosphor-icons/react/dist/ssr';
import { motion } from 'framer-motion';

import { Button } from '@/components/ui/button';
import { usePrevNextButtons } from '@/lib/Embla/CarouselArrowButtons';
import { SectionSkeleton } from './skeleton';
import { cn } from '@/lib/utils';

export interface HomeFeedSectionProps<T> {
  title: string;
  isLoading?: boolean;
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  skeletonCount?: number;
  SkeletonComponent?: React.ComponentType<{ className?: string }>;
  className?: string;
  rightAction?: React.ReactNode;
  rows?: number;
}

export function HomeFeedSection<T>({
  title,
  isLoading = false,
  items,
  renderItem,
  skeletonCount = 6,
  SkeletonComponent,
  className,
  rightAction,
  rows = 1,
}: HomeFeedSectionProps<T>) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ skipSnaps: true });
  const { prevBtnDisabled, nextBtnDisabled, onPrevButtonClick, onNextButtonClick } =
    usePrevNextButtons(emblaApi);

  const chunkedItems = useMemo(() => {
    if (rows <= 1) return null;
    const chunks: { item: T; originalIndex: number }[][] = [];
    for (let i = 0; i < items.length; i += rows) {
      const group: { item: T; originalIndex: number }[] = [];
      for (let r = 0; r < rows && i + r < items.length; r++) {
        group.push({ item: items[i + r], originalIndex: i + r });
      }
      chunks.push(group);
    }
    return chunks;
  }, [items, rows]);

  if (!isLoading && items.length === 0) return null;

  return (
    <div className={cn('embla w-full max-w-none mx-0 z-10 relative', className)}>
      <div className='embla__controls w-full justify-between items-center flex mb-6'>
        <h2 className='text-3xl font-bold tracking-tight text-left'>{title}</h2>
        <div className='flex items-center gap-3'>
          {rightAction}
          {!isLoading && items.length > 0 && (
            <div className='embla__buttons gap-2 hidden sm:flex items-center'>
              <Button
                onClick={onPrevButtonClick}
                disabled={prevBtnDisabled}
                title='previous'
                className='embla__button embla__button--prev border-2 border-foreground/10 bg-foreground/10 disabled:opacity-30 disabled:bg-transparent disabled:border-foreground/5 rounded-full p-0'
                type='button'
                variant='ghost'
                size='icon'
                data-smooth-interaction="true"
              >
                <CaretLeftIcon />
              </Button>
              <Button
                onClick={onNextButtonClick}
                disabled={nextBtnDisabled}
                title='next'
                className='embla__button embla__button--next border-2 border-foreground/10 bg-foreground/10 disabled:opacity-30 disabled:bg-transparent disabled:border-foreground/5 rounded-full p-0'
                type='button'
                variant='ghost'
                size='icon'
                data-smooth-interaction="true"
              >
                <CaretRightIcon />
              </Button>
            </div>
          )}
        </div>
      </div>

      {isLoading ? (
        <SectionSkeleton count={skeletonCount} SkeletonComponent={SkeletonComponent} />
      ) : (
        <div className='embla__viewport' ref={emblaRef}>
          <div className='embla__container gap-4 sm:gap-5'>
            {rows > 1 && chunkedItems ? (
              chunkedItems.map((col, colIndex) => (
                <motion.div
                  key={`col-${colIndex}`}
                  initial={{ opacity: 0, x: -40 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    delay: Math.min(0.04 * colIndex, 0.4),
                    ease: 'easeOut',
                    x: { type: 'spring', damping: 18, stiffness: 180 },
                  }}
                  className='embla__slide w-max flex-none select-none flex flex-col gap-2.5'
                >
                  {col.map(({ item, originalIndex }) => (
                    <React.Fragment key={`item-${originalIndex}`}>
                      {renderItem(item, originalIndex)}
                    </React.Fragment>
                  ))}
                </motion.div>
              ))
            ) : (
              items.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -40 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    delay: Math.min(0.04 * index, 0.4),
                    ease: 'easeOut',
                    x: { type: 'spring', damping: 18, stiffness: 180 },
                  }}
                  className='embla__slide w-max flex-none select-none'
                >
                  {renderItem(item, index)}
                </motion.div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default HomeFeedSection;
