"use client"
import React from "react"
import { Button } from "../../ui/button"
import { useLanguageContext } from "@/contexts/languageContext"
import { XIcon } from "@phosphor-icons/react"
import { cn } from "@/lib/utils"
import Modal from "../../ui/custom/modal"
import { useGlobalContext } from "@/contexts/globalContext"
import SettingModalSidebar from "./sidebar"

// Pages
import Account from "./pages/account"
import Privacy from "./pages/privacy"
import Layout from "./pages/layout"
import Keybinds from "./pages/keybinds"
import Developer from "./pages/dev"

export type PageKey = "account" | "privacy" | "layout" | "keybinds" | "dev"
export const Pages: Record<PageKey, React.FC> = {
  account: Account,
  privacy: Privacy,
  layout: Layout,
  keybinds: Keybinds,
  dev: Developer,
}

const SettingModalContext = React.createContext<{
  selectedPage: string
  setSelectedPage: React.Dispatch<React.SetStateAction<string>>
  bodyRef: React.RefObject<HTMLDivElement | null>
  sidebarRef: React.RefObject<HTMLDivElement | null>
}>({
  selectedPage: "",
  setSelectedPage: () => {},
  bodyRef: React.createRef(),
  sidebarRef: React.createRef(),
})

const SettingModalProvider = ({ children }: { children: React.ReactNode }) => {
  const [selectedPage, setSelectedPage] = React.useState<string>("account")
  const bodyRef = React.useRef<HTMLDivElement>(null)
  const sidebarRef = React.useRef<HTMLDivElement>(null)

  return (
    <SettingModalContext.Provider
      value={{
        selectedPage,
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

  const closeModal = () => setIsSettingModalOpen(false)

  return (
    <Modal
      isOpen={isSettingModalOpen}
      setIsOpen={setIsSettingModalOpen}
      layoutId={settingLayoutId}
      className="max-w-4xl gap-0"
    >
      <Modal.Header className="flex-row justify-between border-b border-foreground/10 p-3">
        <Modal.Title className="m-0 pl-2">
          {language.data.app.setting.name}
        </Modal.Title>
        <div>
          <Button
            size={"icon-lg"}
            variant={"ghost"}
            className={"rounded-full"}
            onClick={closeModal}
            data-smooth-interaction="true"
          >
            <XIcon weight="bold" className="size-4" />
          </Button>
        </div>
      </Modal.Header>
      <div className="flex min-h-0 flex-1 flex-row gap-2">
        <Modal.Body className="mt-0 w-48 flex-none border-r border-foreground/10 text-foreground">
          <div className="p-2">
            <SettingModalSidebar />
          </div>
        </Modal.Body>
        <Modal.Body className="text-foreground">
          <div></div>
        </Modal.Body>
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
