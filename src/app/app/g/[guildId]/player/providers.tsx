'use client';
import { Image } from '@heroui/react';
import React from 'react';
import { useMediaQuery } from 'react-responsive';

import PageAnimatePresence from '@/components/HOC/PageAnimatePresence';
import { MusicNoteSimple } from '@phosphor-icons/react/dist/ssr';

import { useDiscordGuildInfo } from '@/contexts/discordGuildInfo';
import { useDiscordUserInfo } from '@/contexts/discordUserInfo';
import { useGlobalContext } from '@/contexts/globalContext';
import { useLanguageContext } from '@/contexts/languageContext';
import { usePonaMusicContext } from '@/contexts/ponaMusicContext';
import { useUserSettingContext } from '@/contexts/userSettingContext';

import LetsPonaJoin from './@system/lets-pona-join';
import NotInSameVC from './@system/not-in-same-vc';
import SocketConnecting from './@system/socket-connecting';

import PlayerNav from '@/components/mobile/playerNav';
import DesktopPonaPlayer from './@system/player/desktop';
import MobilePonaPlayer from './@system/player/mobile';
import DesktopPonaPlayerPanel from './@system/player/panel/desktop';

function Providers({ children }: { children: React.ReactNode }) {
  const { guild } = useDiscordGuildInfo();
  const { language } = useLanguageContext();
  const { userInfo } = useDiscordUserInfo();
  const { userSetting } = useUserSettingContext();
  const { isConnected, socket } = usePonaMusicContext();
  const { ponaCommonState, isSameVC, isMobile } = useGlobalContext();
  const currentTrack = ponaCommonState?.current;
  const backdropBg = currentTrack
    ? currentTrack?.proxyThumbnail
      ? currentTrack?.proxyArtworkUrl
      : currentTrack?.thumbnail
    : guild?.bannerURL
      ? guild?.bannerURL + '?size=640'
      : guild?.iconURL
        ? guild?.iconURL + '?size=640'
        : userInfo?.banner
          ? `https://cdn.discordapp.com/banners/${userInfo?.id}/${userInfo?.banner}?size=640`
          : userInfo?.avatar
            ? `https://cdn.discordapp.com/avatars/${userInfo?.id}/${userInfo?.avatar}?size=640`
            : '/static/backdrop.png';

  const isTabletOrMobile = useMediaQuery({ query: '(max-width: 768px)' });

  const musicAppContent = React.useRef<HTMLElement>(null);

  React.useEffect(() => {
    if (musicAppContent.current) {
      musicAppContent.current.addEventListener('scroll', e => {
        if (e.target instanceof Element && e.target.scrollTop > 0) {
          document.body.classList.add('pona-app-music-scrolled');
        } else {
          document.body.classList.remove('pona-app-music-scrolled');
        }
      });
    }
  }, [musicAppContent]);

  return (
    <>
      <main
        id='app-panel'
        ref={musicAppContent}
        className='relative h-screen overflow-x-hidden overflow-y-auto scrollbar-hide -mb-6 pb-12 select-none'
      >
        <div className='absolute w-full h-max max-h-[48vh] min-h-48 top-0 left-0 z-[1] opacity-40 pointer-events-none scale-[2]'>
          {userSetting.transparency ? (
            <Image
              src={`/api/proxy/image?r=${encodeURIComponent(backdropBg || '/static/backdrop.png')}&s=512&blur=16&saturation=96&contrast=12`}
              alt={currentTrack ? currentTrack.title : guild?.name || ''}
              width={'100%'}
              height={undefined}
              className='object-cover w-full h-full max-h-[48vh] pointer-events-none saturate-200 brightness-110 -translate-y-1'
            />
          ) : (
            <div className='w-full h-96 bg-gradient-to-t from-transparent to-[hsl(var(--pona-app-music-accent-color-500))]' />
          )}
          <div className='absolute top-[unset] bottom-0 left-0 w-full h-2/4 bg-gradient-to-b from-transparent to-playground-background z-10' />
        </div>
        <main
          className={`[body.pona-player-focused_&]:opacity-0 [body.pona-player-focused_&]:-translate-y-8 apply-soft-transition`}
          id='app-workspace'
          style={{ maxWidth: 'unset' }}
        >
          <div className='absolute top-6 left-6 flex items-center gap-12 z-50 w-full'>
            <h1 className='items-center text-2xl gap-4 hidden'>
              <MusicNoteSimple weight='fill' size={24} />{' '}
              {language.data.app.guilds.player.name}
            </h1>
          </div>
          {isConnected || socket?.connected ? (
            !ponaCommonState?.pona.voiceChannel ? (
              <LetsPonaJoin />
            ) : isSameVC ? (
              <PageAnimatePresence presenceAffectsLayout mode='popLayout'>
                {children}
              </PageAnimatePresence>
            ) : (
              <NotInSameVC />
            )
          ) : (
            <SocketConnecting />
          )}
        </main>
      </main>
      {isSameVC && (
        <>
          {isTabletOrMobile || isMobile ? (
            <>
              <MobilePonaPlayer />
            </>
          ) : (
            <>
              <DesktopPonaPlayerPanel />
              <DesktopPonaPlayer />
            </>
          )}
        </>
      )}
      {isMobile && <PlayerNav />}
    </>
  );
}

export default Providers;
