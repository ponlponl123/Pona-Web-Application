'use client';

import { NextUIProvider } from '@nextui-org/react';
import { LanguageProvider } from '@/contexts/languageContext';
import { DiscordUserInfoProvider } from '@/contexts/discordUserInfo';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NextUIProvider>
      <LanguageProvider>
        <DiscordUserInfoProvider>
          {children}
        </DiscordUserInfoProvider>
      </LanguageProvider>
    </NextUIProvider>
  );
}