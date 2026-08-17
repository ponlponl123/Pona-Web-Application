"use client"

import { DiscordUserInfoProvider } from "@/contexts/discordUserInfo"
import { DiscordGuildInfoProvider } from "@/contexts/discordGuildInfo"
import PageAnimatePresence from "@/components/HOC/PageAnimatePresence"
import FeedbackModal from "@/components/modal/feedback"
import { AnimatePresence, motion } from "motion/react"
import SettingModal from "@/components/modal/setting"
import { Toaster } from "@/components/ui/sonner"
import { usePathname } from "next/navigation"
import { languageKeys } from "@/lib/i18n"
import { useEffect, ViewTransition } from "react"
import ClickSpark from "@/components/ClickSpark"
import { AppStoreProvider, useAppStore } from "@/store/coreStore"
import { useThemeContext } from "@/components/theme-provider"

function ClientInit() {
  const initClientSettings = useAppStore((state) => state.initClientSettings)
  useEffect(() => {
    initClientSettings()
  }, [initClientSettings])
  return null
}

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
  const isUpdatesRoute = pathname.startsWith("/updates")
  const { isPointerClickSpark } =
    useThemeContext()

  return (
    <AppStoreProvider isMobile={isMobile} initialLang={initialLang}>
      <ClientInit />
      <DiscordUserInfoProvider>
        <DiscordGuildInfoProvider>
          <ClickSpark
            sparkColor="#fff"
            sparkSize={isPointerClickSpark ? 10 : 0}
            sparkRadius={isPointerClickSpark ? 15 : 0}
            sparkCount={isPointerClickSpark ? 8 : 0}
            duration={isPointerClickSpark ? 400 : 0}
          >
            {pathname.startsWith("/app") || isUpdatesRoute ? (
              <AnimatePresence mode={"popLayout"}>
                <motion.div className="min-h-dvh">
                  {isUpdatesRoute ? (
                    <ViewTransition>{children}</ViewTransition>
                  ) : (
                    children
                  )}
                </motion.div>
              </AnimatePresence>
            ) : (
              <PageAnimatePresence>{children}</PageAnimatePresence>
            )}
            <Toaster position="top-center" />
            <SettingModal />
            <FeedbackModal />
          </ClickSpark>
        </DiscordGuildInfoProvider>
      </DiscordUserInfoProvider>
    </AppStoreProvider>
  )
}
