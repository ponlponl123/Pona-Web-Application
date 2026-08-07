'use client';
import React, { useState, useEffect } from 'react';
import { getCookie } from 'cookies-next';
import { IconProps, type Icon } from '@phosphor-icons/react';
import { clsx } from 'clsx';

import { useAppStore } from '@/store/coreStore';
import { useMusicCacheStore } from '@/store/musicCacheStore';
import subscribe, { unsubscribe } from '@/lib/server-side-api/internal/channel';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

import { ThumbnailFull } from '@/types/youtube/ytmusic-api';

interface SubscribeButtonProps extends React.HTMLAttributes<HTMLDivElement> {
  channelId: string;
  artistName?: string;
  artistThumbnails?: ThumbnailFull[];
  preset?: 'full' | 'minimal';
  unsubscribeConfirmation?: boolean;
  DynamicIcon?: Icon;
  DynamicIconAlign?: 'left' | 'right';
  DynamicIconProps?: IconProps;
  children?: React.ReactNode;
  startContent?: React.ReactNode;
  endContent?: React.ReactNode;
  triggerClassName?: string;
}

function SubscribeButton({
  channelId,
  artistName,
  artistThumbnails,
  triggerClassName,
  children,
  DynamicIcon,
  DynamicIconAlign = 'left',
  DynamicIconProps,
  unsubscribeConfirmation = true,
  startContent,
  endContent,
  preset,
  ...rest
}: SubscribeButtonProps) {
  const language = useAppStore((state) => state.language);
  const getSubscribeState = useMusicCacheStore((state) => state.getSubscribeState);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;
    getSubscribeState(channelId).then((state) => {
      if (isMounted) setIsSubscribed(state);
    });
    return () => {
      isMounted = false;
    };
  }, [getSubscribeState, channelId]);

  return (
    <>
      <SubscribeButtonTrigger
        channelId={channelId}
        artistName={artistName}
        artistThumbnails={artistThumbnails}
        isSubscribed={isSubscribed}
        className={clsx('group', triggerClassName)}
        noUnsubscribe={unsubscribeConfirmation}
        preset={preset}
        onPress={() => {
          setIsSubscribed((prevState) => {
            const newState = !prevState;
            if (!newState && unsubscribeConfirmation) {
              setIsModalOpen(true);
              return prevState;
            }
            return newState;
          });
        }}
      >
        {children ?? (
          <div
            className={clsx(
              'flex flex-row gap-2 items-center justify-center',
              isSubscribed && 'text-background'
            )}
            {...rest}
          >
            {DynamicIcon && DynamicIconAlign === 'left' && (
              <DynamicIcon
                weight={isSubscribed ? 'fill' : 'bold'}
                {...DynamicIconProps}
              />
            )}
            {startContent}
            {isSubscribed
              ? language.data.app.guilds.player.artist.subscribed
              : language.data.app.guilds.player.artist.subscribe}
            {endContent}
            {DynamicIcon && DynamicIconAlign === 'right' && (
              <DynamicIcon
                weight={isSubscribed ? 'fill' : 'bold'}
                {...DynamicIconProps}
              />
            )}
          </div>
        )}
      </SubscribeButtonTrigger>
      {unsubscribeConfirmation && (
        <UnSubscribeModal
          artistName={artistName}
          channelId={channelId}
          isOpen={isModalOpen}
          onOpenChange={setIsModalOpen}
          onSubmit={() => {
            setIsSubscribed(false);
          }}
        />
      )}
    </>
  );
}

export function UnSubscribeModal({
  artistName,
  channelId,
  isOpen,
  onOpenChange,
  onSubmit,
}: {
  artistName?: string;
  channelId: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit?: () => void;
}) {
  const language = useAppStore((state) => state.language);
  const removeSubscribedChannel = useMusicCacheStore((state) => state.removeSubscribedChannel);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-md'>
        <DialogHeader>
          <DialogTitle>
            {language.data.app.guilds.player.artist.unsubscribe_confirmation.replace(
              '[artist_name]',
              artistName || ''
            )}
          </DialogTitle>
        </DialogHeader>
        <DialogFooter className='gap-2 sm:gap-0'>
          <Button
            variant='outline'
            onClick={() => onOpenChange(false)}
          >
            {language.data.common.no}
          </Button>
          <Button
            variant='destructive'
            onClick={async () => {
              if (onSubmit) onSubmit();
              const accessToken = getCookie('LOGIN_');
              const accessTokenType = getCookie('LOGIN_TYPE_');
              if (!accessToken || !accessTokenType) return onOpenChange(false);
              unsubscribe(
                accessTokenType as string,
                accessToken as string,
                channelId
              );
              removeSubscribedChannel(channelId);
              onOpenChange(false);
            }}
          >
            {language.data.app.guilds.player.artist.unsubscribe}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function SubscribeButtonTrigger({
  channelId,
  artistName,
  artistThumbnails,
  children,
  className,
  onPress,
  noUnsubscribe,
  isSubscribed,
  preset,
}: {
  channelId: string;
  artistName?: string;
  artistThumbnails?: ThumbnailFull[];
  children: React.ReactNode;
  className?: string;
  onPress?: (e: React.MouseEvent, state?: boolean) => void;
  noUnsubscribe?: boolean;
  isSubscribed?: boolean;
  preset?: 'full' | 'minimal';
}) {
  const accessToken = getCookie('LOGIN_');
  const accessTokenType = getCookie('LOGIN_TYPE_');
  const getSubscribeState = useMusicCacheStore((state) => state.getSubscribeState);
  const addSubscribedChannel = useMusicCacheStore((state) => state.addSubscribedChannel);
  const removeSubscribedChannel = useMusicCacheStore((state) => state.removeSubscribedChannel);

  const buttonVariant =
    preset === 'full'
      ? isSubscribed
        ? 'default'
        : 'outline'
      : 'ghost';

  const presetClassName =
    preset === 'full'
      ? 'rounded-full font-bold max-md:text-sm max-md:py-3 max-md:px-4 cursor-pointer'
      : preset === 'minimal'
      ? 'rounded-full cursor-pointer'
      : className;

  return (
    <Button
      data-active={isSubscribed}
      variant={buttonVariant}
      className={presetClassName}
      onClick={async (e) => {
        if (!accessToken || !accessTokenType) {
          if (onPress) onPress(e);
          return;
        }
        const currentState = await getSubscribeState(channelId);
        if (onPress) onPress(e, currentState);
        if (currentState) {
          if (noUnsubscribe) return;
          unsubscribe(
            accessTokenType as string,
            accessToken as string,
            channelId
          );
          removeSubscribedChannel(channelId);
        } else {
          subscribe(
            accessTokenType as string,
            accessToken as string,
            channelId
          );
          addSubscribedChannel({
            artistId: channelId,
            info: {
              v1: undefined,
              v2: {
                browseId: channelId,
                name: artistName || '',
                thumbnails: artistThumbnails || [],
              },
              user: undefined,
            },
          });
        }
      }}
    >
      {children}
    </Button>
  );
}

export default SubscribeButton;
