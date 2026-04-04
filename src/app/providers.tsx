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

  return (
    <AppStoreProvider isMobile={isMobile} initialLang={initialLang}>
      <ClientInit />
      <DiscordUserInfoProvider>
        <DiscordGuildInfoProvider>
          <ClickSpark
            sparkColor="#fff"
            sparkSize={10}
            sparkRadius={15}
            sparkCount={8}
            duration={400}
          >
            {pathname.startsWith("/app") || pathname.startsWith("/updates") ? (
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
          </ClickSpark>
        </DiscordGuildInfoProvider>
      </DiscordUserInfoProvider>
    </AppStoreProvider>
  )
}
