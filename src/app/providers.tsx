"use client"

import { GlobalProvider } from "@/contexts/globalContext"
import { LanguageProvider } from "@/contexts/languageContext"
import { UserSettingProvider } from "@/contexts/userSettingContext"
import { DiscordUserInfoProvider } from "@/contexts/discordUserInfo"
import { DiscordGuildInfoProvider } from "@/contexts/discordGuildInfo"
import PageAnimatePresence from "@/components/HOC/PageAnimatePresence"
import { PonaMusicCacheContextProvider } from "@/contexts/ponaMusicCacheContext"
import { usePathname } from "next/navigation"
import { Toaster } from "@/components/ui/sonner"

export function Providers({
  children,
  isMobile,
}: {
  children: React.ReactNode
  isMobile: boolean
}) {
  const pathname = usePathname() || ""
  return (
    <LanguageProvider>
      <UserSettingProvider>
        <DiscordUserInfoProvider>
          <DiscordGuildInfoProvider>
            <PonaMusicCacheContextProvider>
              <GlobalProvider isMobile={isMobile}>
                {pathname.startsWith("/app") ? (
                  children
                ) : (
                  <PageAnimatePresence>{children}</PageAnimatePresence>
                )}
                <Toaster />
              </GlobalProvider>
            </PonaMusicCacheContextProvider>
          </DiscordGuildInfoProvider>
        </DiscordUserInfoProvider>
      </UserSettingProvider>
    </LanguageProvider>
  )
}
