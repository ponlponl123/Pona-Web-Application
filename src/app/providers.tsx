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
import { languageKeys } from "@/lib/i18n"

export function Providers({
  children,
  isMobile,
  initialLang,
}: {
  children: React.ReactNode
  isMobile: boolean
  initialLang?: languageKeys
}) {
  const pathname = usePathname() || ""
  return (
    <LanguageProvider initialLang={initialLang}>
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
