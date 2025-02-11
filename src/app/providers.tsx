'use client';

import { NextUIProvider } from '@nextui-org/react';
import { GlobalProvider } from '@/contexts/globalContext';
import ThemeContextProvider from '@/contexts/themeContext';
import { LanguageProvider } from '@/contexts/languageContext';
import { UserSettingProvider } from '@/contexts/userSettingContext';
import { DiscordUserInfoProvider } from '@/contexts/discordUserInfo';
import { DiscordGuildInfoProvider } from '@/contexts/discordGuildInfo';
import PageAnimatePresence from "@/components/HOC/PageAnimatePresence";
import { usePathname } from 'next/navigation';
import { Toaster } from 'react-hot-toast';
import Snowfall from 'react-snowfall';

export function Providers({ children, isMobile }: { children: React.ReactNode; isMobile: boolean; }) {
  const pathname = usePathname();
  const date = new Date();
  return (
    <ThemeContextProvider>
      <NextUIProvider>
        <LanguageProvider>
          <UserSettingProvider>
            <DiscordUserInfoProvider>
              <DiscordGuildInfoProvider>
                <GlobalProvider isMobile={isMobile}>
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
                <Toaster />
                </GlobalProvider>
              </DiscordGuildInfoProvider>
            </DiscordUserInfoProvider>
          </UserSettingProvider>
        </LanguageProvider>
      </NextUIProvider>
    </ThemeContextProvider>
  );
}