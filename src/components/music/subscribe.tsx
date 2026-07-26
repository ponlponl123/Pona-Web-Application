'use client';
import subscribe, { unsubscribe } from '@/lib/server-side-api/internal/channel';
import { IconProps, type Icon } from '@phosphor-icons/react';
import { clsx } from 'clsx';
import { getCookie } from 'cookies-next';
import React, { useState, useEffect } from 'react';
import { useAppStore } from '@/store/coreStore';
import { useMusicCacheStore } from '@/store/musicCacheStore';
import { Button } from '@/components/ui/button';

interface SubscribeButtonProps extends React.HTMLAttributes<HTMLDivElement> {
  channelId: string;
  artistName?: string;
  preset?: 'full' | 'minimal';
  unsubscribeConfirmation?: boolean;
  DynamicIcon?: Icon;
  DynamicIconAlign?: 'left' | 'right';
  DynamicIconProps?: IconProps;
  children?: React.ReactNode;
  startContent?: React.ReactNode;
  endContent?: React.ReactNode;
  triggerClassName?: string;
  triggerProps?: any;
}

function SubscribeButton({
  channelId,
  artistName,
  triggerClassName,
  triggerProps,
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
  const [isSubscribed, setIsSubscribed] = useState(false);
  const getSubscribeState = useMusicCacheStore((state) => state.getSubscribeState);

  useEffect(() => {
    const fetchState = async () => {
      const state = await getSubscribeState(channelId);
      setIsSubscribed(state);
    };
    fetchState();
  }, [channelId, getSubscribeState]);

  const handleToggle = async () => {
    const accessTokenType = String(getCookie('LOGIN_TYPE_'));
    const accessToken = String(getCookie('LOGIN_'));
    if (!accessToken || !accessTokenType) return;

    if (isSubscribed) {
      setIsSubscribed(false);
      await unsubscribe(accessTokenType, accessToken, channelId);
    } else {
      setIsSubscribed(true);
      await subscribe(accessTokenType, accessToken, channelId);
    }
  };

  return (
    <div {...rest}>
      <Button
        variant={isSubscribed ? 'default' : 'outline'}
        size='sm'
        className={clsx('rounded-full font-semibold', triggerClassName)}
        onClick={handleToggle}
        {...triggerProps}
      >
        {startContent}
        {DynamicIcon && DynamicIconAlign === 'left' && (
          <DynamicIcon className='mr-1.5' {...DynamicIconProps} />
        )}
        {children ||
          (isSubscribed
            ? language.data.app.guilds.player.artist.subscribed || 'Subscribed'
            : language.data.app.guilds.player.artist.subscribe || 'Subscribe')}
        {DynamicIcon && DynamicIconAlign === 'right' && (
          <DynamicIcon className='ml-1.5' {...DynamicIconProps} />
        )}
        {endContent}
      </Button>
    </div>
  );
}

export default SubscribeButton;
