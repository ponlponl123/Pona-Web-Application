"use client"
import React from "react"
import { Button } from "../../ui/button"
import { useLanguageContext } from "@/contexts/languageContext"
import { XIcon } from "@phosphor-icons/react"
import { cn } from "@/lib/utils"
import Modal from "../../ui/custom/modal"
import { useGlobalContext } from "@/contexts/globalContext"
import { useDiscordUserInfo } from "@/contexts/discordUserInfo"
import SettingModalSidebar from "./sidebar"
import { motion } from "motion/react"

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
}>({
  SelectedPageKey: "layout",
  setSelectedPage: () => {},
  bodyRef: React.createRef(),
  sidebarRef: React.createRef(),
})

const SettingModalProvider = ({ children }: { children: React.ReactNode }) => {
  const { userInfo } = useDiscordUserInfo()
  const [SelectedPageKey, setSelectedPageKey] =
    React.useState<PageKey>("layout")
  const bodyRef = React.useRef<HTMLDivElement | null>(null)
  const sidebarRef = React.useRef<HTMLDivElement | null>(null)

  const setSelectedPage = (pageKey: PageKey) => {
    setSelectedPageKey(pageKey)
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
  const { SelectedPageKey } = useSettingModalContext()

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
        <Modal.Body className="mt-0 w-48 flex-none border-r border-foreground/10 text-foreground">
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
              delay: 1,
              duration: 0.25,
              ease: "easeOut",
            }}
            className="min-h-0 flex-1"
          >
            <motion.div
              initial={{ opacity: 0, y: 3, filter: "blur(3px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -3, filter: "blur(3px)" }}
              transition={{
                duration: 0.25,
                ease: "easeOut",
              }}
              key={"setting-modal-body-" + SelectedPageKey}
              className="h-full w-full"
            >
              <Modal.Body className="mt-0 h-full w-full text-foreground">
                {Pages[SelectedPageKey]}
              </Modal.Body>
            </motion.div>
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
