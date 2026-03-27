"use client"
import { AnimatePresence, motion } from "motion/react"
import { useGlobalContext } from "@/contexts/globalContext"
import { useLanguageContext } from "@/contexts/languageContext"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { HandWavingIcon } from "@phosphor-icons/react/dist/ssr"
import Modal from "../ui/custom/modal"
import { Button } from "../ui/button"
import { Badge } from "../ui/badge"
import { langs } from "@/lib/i18n"
import { cn } from "@/lib/utils"
import React from "react"

function LanguageSelectorModal() {
  const { language, setLanguage } = useLanguageContext()
  const { isLanguageModalOpen, setIsLanguageModalOpen } = useGlobalContext()
  const [filterLangs, setFilterLangs] = React.useState("")

  const closeModal = () => setIsLanguageModalOpen(false)

  return (
    <Modal
      isOpen={isLanguageModalOpen}
      setIsOpen={setIsLanguageModalOpen}
      layoutId="language-selector-modal"
      className="min-h-72 max-w-2xl"
    >
      <Modal.Header>
        <Modal.Title>
          {language.data.modal["language-selector"].title}
        </Modal.Title>
        <Modal.Description>
          {language.data.modal["language-selector"].description}
        </Modal.Description>
      </Modal.Header>
      <Modal.Body>
        <div className="grid grid-cols-2 gap-2 px-6 max-sm:grid-cols-1">
          {langs.map((lang, i) => (
            <Button
              key={"lang-select-" + i}
              variant={language.key === lang.key ? "default" : "ghost"}
              data-smooth-interaction="true"
              className={cn(
                "flex justify-start gap-3 rounded-xl border-2 border-transparent px-4 py-6",
                language.key === lang.key &&
                  "border-foreground/40 bg-foreground/10 text-foreground"
              )}
              onClick={() => {
                setLanguage(lang.key)
                closeModal()
              }}
            >
              <Avatar className={"h-6 w-6"}>
                <AvatarImage
                  src={"https://flagcdn.com/" + lang.country + ".svg"}
                  alt={lang.label}
                />
                <AvatarFallback>{lang.key.toUpperCase()}</AvatarFallback>
              </Avatar>
              {lang.label}
              {lang.looking_for_translator && (
                <Badge
                  variant={"secondary"}
                  className="rounded-full bg-amber-400/20 text-amber-400"
                >
                  <HandWavingIcon size={32} weight="fill" />
                  {
                    language.data.modal["language-selector"]
                      .looking_for_translator
                  }
                </Badge>
              )}
            </Button>
          ))}
        </div>
      </Modal.Body>
      <Modal.Footer className="m-0">
        <Button
          size={"lg"}
          variant={"ghost"}
          className={"rounded-full px-6"}
          onClick={closeModal}
          data-smooth-interaction="true"
        >
          {language.data.common.close}
        </Button>
        <Button
          size={"lg"}
          className={"rounded-full px-6"}
          onClick={closeModal}
          data-smooth-interaction="true"
        >
          {language.data.common.ok}
        </Button>
      </Modal.Footer>
    </Modal>
  )
}

export default LanguageSelectorModal
