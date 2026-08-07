'use client';
import React from 'react';
import Link from 'next/link';
import { useDiscordGuildInfo } from '@/contexts/discordGuildInfo';
import {
  ClockCounterClockwise,
  Compass,
  HouseSimple,
} from '@phosphor-icons/react/dist/ssr';
import { useAppStore } from '@/store/coreStore';
import { usePathname } from 'next/navigation';

function PlayerNav() {
  const { guild } = useDiscordGuildInfo();
  const language = useAppStore((state) => state.language);
  const pathname = usePathname();

  const homeHref = `/app/g/${guild?.id}/player`;
  const browseHref = `/app/g/${guild?.id}/player/browse`;
  const historyHref = `/app/g/${guild?.id}/player/history`;

  return (
    <div
      className='w-full h-20 sticky bottom-0 pb-4 left-0 bg-background/90 backdrop-blur-md border-t-2 border-foreground/10 flex flex-row items-center justify-around z-500 md:hidden'
      style={{
        boxShadow: "0 24px 0 0 var(--background)",
      }}
    >
      <Link
        href={homeHref}
        className={`w-full h-full flex flex-col items-center justify-center gap-1 ${pathname === homeHref ? 'text-primary' : 'text-muted-foreground'
          }`}
      >
        <HouseSimple size={20} />
        <span className='text-xs'>{language.data.app.guilds.player.home.title}</span>
      </Link>
      <Link
        href={browseHref}
        className={`w-full h-full flex flex-col items-center justify-center gap-1 ${pathname === browseHref ? 'text-primary' : 'text-muted-foreground'
          }`}
      >
        <Compass size={20} />
        <span className='text-xs'>{language.data.app.guilds.player.browse.title}</span>
      </Link>
      <Link
        href={historyHref}
        className={`w-full h-full flex flex-col items-center justify-center gap-1 ${pathname === historyHref ? 'text-primary' : 'text-muted-foreground'
          }`}
      >
        <ClockCounterClockwise size={20} />
        <span className='text-xs'>{language.data.app.guilds.player.history.title}</span>
      </Link>
    </div>
  );
}

export default PlayerNav;
