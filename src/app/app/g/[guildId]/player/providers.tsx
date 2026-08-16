'use client';

import React, { useEffect, useMemo, useRef } from 'react';
import Image from 'next/image';
import { useMediaQuery } from 'react-responsive';
import { useAtomValue } from 'jotai';
import { MusicNoteSimple } from '@phosphor-icons/react/dist/ssr';

import { usePathname, useSearchParams } from 'next/navigation';
import PageAnimatePresence from '@/components/HOC/PageAnimatePresence';
import PlayerNav from '@/components/mobile/playerNav';

import { useDiscordGuildInfo } from '@/contexts/discordGuildInfo';
import { useDiscordUserInfo } from '@/contexts/discordUserInfo';
import { useSocket } from '@/contexts/ponaMusicContext';
import { useAppStore } from '@/store/coreStore';
import { ponaCommonStateAtom } from '@/store/musicAtoms';
import { isSameVCAtom } from '@/store/uiAtoms';

import LetsPonaJoin from './@system/lets-pona-join';
import NotInSameVC from './@system/not-in-same-vc';
import SocketConnecting from './@system/socket-connecting';

import DesktopPonaPlayer, { MobilePonaPlayer } from './@system/player';
import DesktopPonaPlayerPanel from './@system/player/panel/desktop';
import CustomScrollArea from '@/components/ui/custom/scroll-area';

export default function Providers({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchParamsString = searchParams ? searchParams.toString() : '';

  const { guild } = useDiscordGuildInfo();
  const { userInfo } = useDiscordUserInfo();
  const { isConnected, socket } = useSocket();

  const isMobile = useAppStore((state) => state.isMobile);
  const isSmallScreen = useMediaQuery({maxWidth: 768});
  const language = useAppStore((state) => state.language);
  const userSetting = useAppStore((state) => state.userSetting);

  const ponaCommonState = useAtomValue(ponaCommonStateAtom);
  const isSameVC = useAtomValue(isSameVCAtom);

  const currentTrack = ponaCommonState?.current;

  const backdropBg = useMemo(() => {
    if (currentTrack) {
      return currentTrack.proxyThumbnail
        ? currentTrack.proxyArtworkUrl
        : currentTrack.thumbnail;
    }
    if (guild?.bannerURL) return `${guild.bannerURL}?size=640`;
    if (guild?.iconURL) return `${guild.iconURL}?size=640`;
    if (userInfo?.banner)
      return `https://cdn.discordapp.com/banners/${userInfo.id}/${userInfo.banner}?size=640`;
    if (userInfo?.avatar)
      return `https://cdn.discordapp.com/avatars/${userInfo.id}/${userInfo.avatar}?size=640`;
    return '/static/backdrop.png';
  }, [
    currentTrack,
    guild?.bannerURL,
    guild?.iconURL,
    userInfo?.banner,
    userInfo?.id,
    userInfo?.avatar,
  ]);

  const showMobilePlayer = isSmallScreen || isMobile;

  const musicAppContent = useRef<HTMLDivElement>(null);
  const musicAppScrollingArea = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (musicAppScrollingArea.current) {
      musicAppScrollingArea.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [pathname, searchParamsString]);

  useEffect(() => {
    const element = musicAppContent.current;
    if (!element) return;

    const handleScroll = (e: Event) => {
      if (e.target instanceof Element && e.target.scrollTop > 0) {
        document.body.classList.add('pona-app-music-scrolled');
      } else {
        document.body.classList.remove('pona-app-music-scrolled');
      }
    };

    element.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      element.removeEventListener('scroll', handleScroll);
      document.body.classList.remove('pona-app-music-scrolled');
    };
  }, []);

  const isSocketConnected = isConnected || socket?.connected;
  const hasVoiceChannel = Boolean(ponaCommonState?.pona.voiceChannel);

  return (
    <>
      <div
        id='app-panel'
        ref={musicAppContent}
        className='relative h-screen scrollbar-hide -mb-6 select-none'
      >
        <CustomScrollArea
          ref={musicAppScrollingArea}
          className="h-full border-0 outline-0"
          classNames={{
            viewport: "relative rounded-none w-full overflow-x-hidden",
          }}
        >
          <div className='absolute w-full h-screen top-0 left-0 z-1 opacity-40 overflow-hidden pointer-events-none mask-b-from-0%'>
            {userSetting.transparency ? (
              <Image
                src={`/api/proxy/image?r=${encodeURIComponent(
                  backdropBg || '/static/backdrop.png'
                )}&s=512&blur=16&saturation=96&contrast=12`}
                alt={currentTrack ? currentTrack.title : guild?.name || ''}
                fill
                unoptimized
                priority
                sizes='100vw'
                className='object-cover w-full h-screen pointer-events-none saturate-200 brightness-110 scale-200 select-none'
              />
            ) : (
              <div className='w-full h-96 bg-linear-to-t from-transparent to-[hsl(var(--pona-app-music-accent-color-500))]' />
            )}
            <div className='absolute top-[unset] bottom-0 left-0 w-full h-2/4 bg-linear-to-b from-transparent to-playground-background z-10' />
          </div>
          <main
            className='[body.pona-player-focused_&]:opacity-0 [body.pona-player-focused_&]:-translate-y-8 apply-soft-transition'
            id='app-workspace'
            style={{ maxWidth: 'unset' }}
          >
            <div className='absolute top-6 left-6 flex items-center gap-12 z-50 w-full'>
              <h1 className='items-center text-2xl gap-4 hidden'>
                <MusicNoteSimple weight='fill' size={24} />{' '}
                {language.data.app.guilds.player.name}
              </h1>
            </div>
            {isSocketConnected ? (
              !hasVoiceChannel ? (
                <LetsPonaJoin />
              ) : isSameVC ? (
                <PageAnimatePresence customKey={pathname} presenceAffectsLayout mode='wait'>
                  {children}
                </PageAnimatePresence>
              ) : (
                <NotInSameVC />
              )
            ) : (
              <SocketConnecting />
            )}
          </main>
        </CustomScrollArea>
      </div>
      {isSameVC && (
        <div className='disable-default-transition'>
          {showMobilePlayer ? (
            <MobilePonaPlayer isMobileOverride={true} />
          ) : (
            <>
              <DesktopPonaPlayerPanel />
              <DesktopPonaPlayer />
            </>
          )}
        </div>
      )}
      {showMobilePlayer && <PlayerNav />}
    </>
  );
}


