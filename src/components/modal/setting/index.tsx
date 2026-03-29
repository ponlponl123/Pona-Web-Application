"use client"
import React from "react"
import { Button } from "../../ui/button"
import { useLanguageContext } from "@/contexts/languageContext"
import { XIcon } from "@phosphor-icons/react"
import Modal from "../../ui/custom/modal"
import { useGlobalContext } from "@/contexts/globalContext"
import { useDiscordUserInfo } from "@/contexts/discordUserInfo"
import SettingModalSidebar from "./sidebar"
import { AnimatePresence, motion } from "motion/react"

// Pages
import Account from "./pages/account"
import Privacy from "./pages/privacy"
import Layout from "./pages/layout"
import Keybinds from "./pages/keybinds"
import LanguageAndTime from "./pages/language_time"
import Developer from "./pages/dev"

export type PageKey =
  | "account"
  | "privacy"
  | "layout"
  | "keybinds"
  | "language-time"
  | "dev"
export const Pages: Record<PageKey, React.ReactNode> = {
  account: <Account />,
  privacy: <Privacy />,
  layout: <Layout />,
  keybinds: <Keybinds />,
  "language-time": <LanguageAndTime />,
  dev: <Developer />,
}

const SettingModalContext = React.createContext<{
  SelectedPageKey: PageKey
  setSelectedPage: (pageKey: PageKey) => void
  bodyRef: React.RefObject<HTMLDivElement | null>
  sidebarRef: React.RefObject<HTMLDivElement | null>
  lookingAt?: string[]
  scrollTo: (id: string) => void
}>({
  SelectedPageKey: "layout",
  setSelectedPage: () => {},
  bodyRef: React.createRef(),
  sidebarRef: React.createRef(),
  lookingAt: [],
  scrollTo: () => {},
})

const SettingModalProvider = ({ children }: { children: React.ReactNode }) => {
  const { userInfo } = useDiscordUserInfo()
  const { isSettingModalOpen } = useGlobalContext()
  const [SelectedPageKey, setSelectedPageKey] =
    React.useState<PageKey>("layout")
  const [lookingAt, setLookingAt] = React.useState<string[]>([])
  const bodyRef = React.useRef<HTMLDivElement | null>(null)
  const sidebarRef = React.useRef<HTMLDivElement | null>(null)

  const setSelectedPage = (pageKey: PageKey) => {
    setSelectedPageKey(pageKey)
  }

  React.useEffect(() => {
    setLookingAt([])
    if (!isSettingModalOpen || !bodyRef.current) return

    const observer = new IntersectionObserver(
      (entries) => {
        setLookingAt((prev) => {
          const updated = new Set(prev)
          let hasChanges = false

          entries.forEach((entry) => {
            const id = entry.target.id
            if (!id) return

            if (entry.isIntersecting) {
              if (!updated.has(id)) {
                updated.add(id)
                hasChanges = true
              }
            } else {
              if (updated.has(id)) {
                updated.delete(id)
                hasChanges = true
              }
            }
          })

          return hasChanges ? Array.from(updated) : prev
        })
      },
      {
        root: bodyRef.current,
        rootMargin: "0px",
        threshold: 0.1,
      }
    )

    const timeoutId = setTimeout(() => {
      if (bodyRef.current) {
        const sections = bodyRef.current.querySelectorAll(
          '[data-section="true"]'
        )
        sections.forEach((section) => observer.observe(section))
      }
    }, 120)

    return () => {
      clearTimeout(timeoutId)
      observer.disconnect()
    }
  }, [SelectedPageKey, isSettingModalOpen, bodyRef.current])

  const scrollTo = (rawId: string) => {
    const targetId = rawId.startsWith("#") ? rawId.substring(1) : rawId

    setTimeout(() => {
      if (!bodyRef.current) return
      const sectionElement = document.getElementById(targetId)

      if (sectionElement) {
        const container = bodyRef.current
        const containerRect = container.getBoundingClientRect()
        const sectionRect = sectionElement.getBoundingClientRect()
        const offset = targetId.includes("-") ? 156 : 96
        const targetScrollTop =
          sectionRect.top - containerRect.top + container.scrollTop - offset

        container.scrollTo({
          top: targetScrollTop,
          behavior: "smooth",
        })
      } else {
        console.warn(`[ScrollTo] Could not find element with id: ${targetId}`)
      }
    }, 50)
  }

  React.useEffect(() => {
    if (userInfo) {
      setSelectedPage("account")
    }
  }, [userInfo])

  return (
    <SettingModalContext.Provider
      value={{
        SelectedPageKey,
        setSelectedPage,
        bodyRef,
        sidebarRef,
        lookingAt,
        scrollTo,
      }}
    >
      {children}
    </SettingModalContext.Provider>
  )
}

export const useSettingModalContext = () =>
  React.useContext(SettingModalContext)

export { SettingModalContext, SettingModalProvider }

function SettingModal() {
  const { language } = useLanguageContext()
  const { isSettingModalOpen, setIsSettingModalOpen, settingLayoutId } =
    useGlobalContext()
  const { SelectedPageKey, sidebarRef, bodyRef } = useSettingModalContext()

  const closeModal = () => setIsSettingModalOpen(false)

  return (
    <Modal
      isOpen={isSettingModalOpen}
      setIsOpen={setIsSettingModalOpen}
      layoutId={settingLayoutId}
      className="relative h-[calc(100vh-2rem)] max-w-4xl gap-0 max-md:h-screen max-md:max-h-none max-md:rounded-none lg:h-[calc(100vh-12rem)]"
      classNames={{
        root: "max-md:p-0",
      }}
    >
      <Button
        size={"icon-lg"}
        variant={"ghost"}
        className={"absolute top-2 right-2 z-50 rounded-full"}
        onClick={closeModal}
        data-smooth-interaction="true"
      >
        <XIcon weight="bold" className="size-4" />
      </Button>
      <div className="flex min-h-0 flex-1 flex-row">
        <Modal.Body
          className="mt-0 w-48 flex-none border-r border-foreground/10 text-foreground"
          ref={sidebarRef}
        >
          <div className="p-2">
            <SettingModalSidebar />
          </div>
        </Modal.Body>
        <div className="flex h-full min-w-0 flex-1 flex-col">
          <motion.div
            initial={{ opacity: 0, filter: "blur(3px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, filter: "blur(3px)" }}
            transition={{
              delay: 0.26,
              duration: 0.25,
              ease: "easeOut",
            }}
          >
            <Modal.Header className="m-0 w-full border-b border-foreground/10 p-3">
              <Modal.Title className="m-0 text-base leading-6.5 text-foreground/60">
                {language.data.app.setting.name}
              </Modal.Title>
            </Modal.Header>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, filter: "blur(3px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, filter: "blur(3px)" }}
            transition={{
              delay: 0.64,
              duration: 0.25,
              ease: "easeOut",
            }}
            className="relative min-h-0 flex-1"
          >
            <AnimatePresence mode="wait" propagate={true}>
              <motion.div
                initial={{ opacity: 0, y: 3, filter: "blur(3px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{
                  opacity: 0,
                  y: -3,
                  filter: "blur(3px)",
                  position: "absolute",
                  left: 0,
                  top: 0,
                }}
                transition={{
                  duration: 0.25,
                  ease: "easeOut",
                }}
                key={"setting-modal-body-" + SelectedPageKey}
                className="h-full w-full"
              >
                <Modal.Body
                  className="mt-0 h-full w-full text-foreground"
                  ref={bodyRef}
                >
                  {Pages[SelectedPageKey]}
                </Modal.Body>
              </motion.div>
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </Modal>
  )
}

function SettingModalWrapper() {
  return (
    <SettingModalProvider>
      <SettingModal />
    </SettingModalProvider>
  )
}

export default SettingModalWrapper
