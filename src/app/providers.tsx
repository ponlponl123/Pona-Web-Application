'use client';

import { NextUIProvider } from '@nextui-org/react';
import { LanguageProvider } from '@/contexts/languageContext';
import { DiscordUserInfoProvider } from '@/contexts/discordUserInfo';
import { DiscordGuildInfoProvider } from '@/contexts/discordGuildInfo';
import PageAnimatePresence from "@/components/HOC/PageAnimatePresence";
import { usePathname } from 'next/navigation';

export function Providers({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  return (
    <NextUIProvider>
      <LanguageProvider>
        <DiscordUserInfoProvider>
          <DiscordGuildInfoProvider>
          {
            pathname.startsWith('/app') ? children : <PageAnimatePresence>{children}</PageAnimatePresence>
          }
          </DiscordGuildInfoProvider>
        </DiscordUserInfoProvider>
      </LanguageProvider>
    </NextUIProvider>
  );
}