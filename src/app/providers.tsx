"use client"

import { GlobalProvider } from "@/contexts/globalContext"
import { LanguageProvider } from "@/contexts/languageContext"
import { UserSettingProvider } from "@/contexts/userSettingContext"
import { DiscordUserInfoProvider } from "@/contexts/discordUserInfo"
import { DiscordGuildInfoProvider } from "@/contexts/discordGuildInfo"
import PageAnimatePresence from "@/components/HOC/PageAnimatePresence"
import { PonaMusicCacheContextProvider } from "@/contexts/ponaMusicCacheContext"
import FeedbackModal from "@/components/modal/feedback"
import { AnimatePresence, motion } from "motion/react"
import SettingModal from "@/components/modal/setting"
import { Toaster } from "@/components/ui/sonner"
import { usePathname } from "next/navigation"
import { languageKeys } from "@/lib/i18n"
import { ViewTransition } from "react"

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
                {pathname.startsWith("/app") ||
                pathname.startsWith("/updates") ? (
                  <AnimatePresence mode={"popLayout"}>
                    <motion.div className="min-h-screen">
                      <ViewTransition>{children}</ViewTransition>
                    </motion.div>
                  </AnimatePresence>
                ) : (
                  <PageAnimatePresence>{children}</PageAnimatePresence>
                )}
                <Toaster />
                <SettingModal />
                <FeedbackModal />
              </GlobalProvider>
            </PonaMusicCacheContextProvider>
          </DiscordGuildInfoProvider>
        </DiscordUserInfoProvider>
      </UserSettingProvider>
    </LanguageProvider>
  )
}
