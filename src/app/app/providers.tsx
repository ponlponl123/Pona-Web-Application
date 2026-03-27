"use client"
import React from "react"
import Sidebar from "@/components/root/sidebar"
import PageAnimatePresence from "@/components/HOC/PageAnimatePresence"
import { useDiscordUserInfo } from "@/contexts/discordUserInfo"
import ScrollArea from "@/components/ui/custom/scroll-area"
import { Spinner } from "@/components/ui/spinner"
import { usePathname } from "next/navigation"
import RedirectOauth from "./redirectOauth"

function Providers({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || ""
  const { userInfo, loading } = useDiscordUserInfo()
  const appContent = React.useRef<HTMLElement>(null)

  React.useEffect(() => {
    if (appContent.current) {
      appContent.current.addEventListener("scroll", (e) => {
        if (e.target instanceof Element && e.target.scrollTop > 0) {
          document.body.classList.add("app-scrolled")
        } else {
          document.body.classList.add("app-scrolled")
        }
      })
    }
  }, [appContent])

  return (
    <>
      {pathname.startsWith("/app/callback") ? (
        children
      ) : loading ? (
        <div className="flex min-h-screen w-full items-center justify-center">
          <Spinner />
        </div>
      ) : !userInfo ? (
        <RedirectOauth />
      ) : (
        <main className="app flex bg-background">
          <Sidebar canCollapsed={true} userInfo={userInfo} />
          <main
            ref={appContent}
            id="app-content"
            className="scrollbar-hide w-full bg-(--color-playground-background) max-md:h-[calc(100vh+1rem)] max-md:rounded-b-3xl md:h-screen md:rounded-l-3xl"
          >
            <ScrollArea
              className="h-full border-0 outline-0"
              classNames={{
                viewport: "relative pb-6",
              }}
            >
              <PageAnimatePresence customKey={pathname} mode="wait">
                {children}
              </PageAnimatePresence>
            </ScrollArea>
          </main>
        </main>
      )}
    </>
  )
}

export default Providers
