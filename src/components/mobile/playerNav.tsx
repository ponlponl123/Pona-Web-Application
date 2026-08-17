'use client';
import Link from 'next/link';
import { useDiscordGuildInfo } from '@/contexts/discordGuildInfo';
import { useAppStore } from '@/store/coreStore';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { AnimateIcon } from '../animate-ui/icons/icon';
import { SearchIcon } from '../animate-ui/icons/search';
import { CompassIcon } from '../animate-ui/icons/compass';
import { HistoryIcon, HistoryIconHandle, HouseIcon, HouseIconHandle } from '@animateicons/react/lucide';
import { motion } from 'motion/react';
import { useRef } from 'react';

const navHighlight = () => <motion.div
  initial={{
    scaleX: 0,
    opacity: 0,
  }}
  animate={{
    scaleX: 1,
    opacity: 1,
  }}
  exit={{
    scaleX: 0,
    opacity: 0,
  }}
  className={cn(
    'absolute inset-0 px-6 py-3 left-1/2 top-1/2 -translate-1/2 bg-primary rounded-full -z-10 apply-long-soft-transition duration-500',
  )} />

function PlayerNav() {
  const { guild } = useDiscordGuildInfo();
  const language = useAppStore((state) => state.language);
  const pathname = usePathname() || '';

  const guildIdFromPath = pathname.match(/\/app\/g\/([^/]+)/)?.[1];
  const guildId = guild?.id || guildIdFromPath || '';

  const refHome = useRef<HouseIconHandle>(null);
  const refHistory = useRef<HistoryIconHandle>(null);

  const homeHref = `/app/g/${guildId}/player`;
  const browseHref = `/app/g/${guildId}/player/browse`;
  const searchHref = `/app/g/${guildId}/player/search`;
  const historyHref = `/app/g/${guildId}/player/history`;

  const isHome = pathname === homeHref;
  const isBrowse = pathname === browseHref || pathname.startsWith(`${browseHref}/`);
  const isSearch = pathname === searchHref || pathname.startsWith(`${searchHref}/`);
  const isHistory = pathname === historyHref || pathname.startsWith(`${historyHref}/`);

  const navClass = (isActive: boolean) => cn(
    `w-full h-full flex flex-col items-center justify-center gap-1`,
    isActive ? 'text-primary' : 'text-muted-foreground'
  );

  return (
    <div
      id="pona-player-nav"
      className='w-full h-20 fixed bottom-0 pb-4 left-0 bg-background/90 backdrop-blur-md border-t-2 border-foreground/10 flex flex-row items-center justify-around z-500 md:hidden [body.pona-player-focused_&]:pointer-events-none transform-gpu'
      style={{
        boxShadow: "0 24px 0 0 var(--background)",
        transform: "translateY(calc(var(--player-drag-prog, 0) * 100%))",
        opacity: "calc(1 - var(--player-drag-prog, 0))",
      }}
    >
      <Link
        href={homeHref}
        className={navClass(isHome)}
        onMouseEnter={() => refHome.current && refHome.current.startAnimation()}
        onMouseLeave={() => refHome.current && refHome.current.stopAnimation()}
      >
        <div className='relative flex items-center justify-center'>
          {
            isHome && navHighlight()
          }
          <HouseIcon className={cn(
            isHome ? 'text-primary-foreground' : 'text-muted-foreground',
          )} ref={refHome} size={20} />
        </div>
        <span className={cn(
          'text-xs',
          isHome ? 'font-bold' : '',
        )}>{language.data.app.guilds.player.home.title}</span>
      </Link>
      <Link
        href={browseHref}
        className={navClass(isBrowse)}
      >
        <div className='relative flex items-center justify-center'>
          {
            isBrowse && navHighlight()
          }
          <AnimateIcon animateOnHover>
            <CompassIcon className={cn(
              isBrowse ? 'text-primary-foreground' : 'text-muted-foreground',
            )} size={20} />
          </AnimateIcon>
        </div>
        <span className={cn(
          'text-xs',
          isBrowse ? 'font-bold' : '',
        )}>{language.data.app.guilds.player.browse.title}</span>
      </Link>
      <Link
        href={searchHref}
        className={navClass(isSearch)}
      >
        <div className='relative flex items-center justify-center'>
          {
            isSearch && navHighlight()
          }
          <AnimateIcon animateOnHover="find">
            <SearchIcon className={cn(
              isSearch ? 'text-primary-foreground' : 'text-muted-foreground',
            )} size={20} />
          </AnimateIcon>
        </div>
        <span className={cn(
          'text-xs',
          isSearch ? 'font-bold' : '',
        )}>{language.data.app.guilds.player.search.title}</span>
      </Link>
      <Link
        href={historyHref}
        className={navClass(isHistory)}
        onMouseEnter={() => refHistory.current && refHistory.current.startAnimation()}
        onMouseLeave={() => refHistory.current && refHistory.current.stopAnimation()}
      >
        <div className='relative flex items-center justify-center'>
          {
            isHistory && navHighlight()
          }
          <HistoryIcon className={cn(
            isHistory ? 'text-primary-foreground' : 'text-muted-foreground',
          )} ref={refHistory} size={20} />
        </div>
        <span className={cn(
          'text-xs',
          isHistory ? 'font-bold' : '',
        )}>{language.data.app.guilds.player.history.title}</span>
      </Link>
    </div>
  );
}

export default PlayerNav;
