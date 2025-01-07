'use client';

import { NextUIProvider } from '@nextui-org/react';
import { LanguageProvider } from '@/contexts/languageContext';
import { DiscordUserInfoProvider } from '@/contexts/discordUserInfo';
import { DiscordGuildInfoProvider } from '@/contexts/discordGuildInfo';
import PageAnimatePresence from "@/components/HOC/PageAnimatePresence";
import { usePathname } from 'next/navigation';
import Snowfall from 'react-snowfall';

export function Providers({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const date = new Date();
  return (
    <NextUIProvider>
      <LanguageProvider>
        <DiscordUserInfoProvider>
          <DiscordGuildInfoProvider>
            {
              date.getMonth() === 11 && (
                <Snowfall
                  snowflakeCount={12}
                  speed={[0.5, 3]}
                  wind={[-0.5, 1]}
                  radius={[0.5, 3]}
                  style={{zIndex: 99}}
                />
              )
            }
            {
              pathname.startsWith('/app') ? children : <PageAnimatePresence>{children}</PageAnimatePresence>
            }
          </DiscordGuildInfoProvider>
        </DiscordUserInfoProvider>
      </LanguageProvider>
    </NextUIProvider>
  );
}