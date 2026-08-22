"use client"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { SmileySadIcon, HandWavingIcon } from "@phosphor-icons/react"
import React, { useEffect, useRef } from "react"
import { Input } from "react-smooth-input"
import Modal from "../ui/custom/modal"
import { motion } from "motion/react"
import { Button } from "../ui/button"
import { Badge } from "../ui/badge"
import { langs } from "@/lib/i18n"
import { cn } from "@/lib/utils"
import { useAtom } from "jotai"
import { useAppStore } from "@/store/coreStore"
import { isLanguageModalOpenAtom } from "@/store/uiAtoms"
import { AutoHeight } from "../animate-ui/primitives/effects/auto-height"

function LanguageSelectorModal() {
  const language = useAppStore((state) => state.language)
  const setLanguage = useAppStore((state) => state.setLanguage)
  const [isLanguageModalOpen, setIsLanguageModalOpen] = useAtom(
    isLanguageModalOpenAtom
  )
  const [isInputFocus, setIsInputFocus] = React.useState(false)
  const [filterLangs, setFilterLangs] = React.useState("")
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }
    debounceRef.current = setTimeout(() => {
      // Filter logic will be recalculated on next render
    }, 300)

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [filterLangs])

  const AvailableLangs = React.useMemo(() => {
    if (!filterLangs.trim()) return langs

    const searchQuery = filterLangs.toLowerCase().trim()

    return langs.filter((lang) => {
      const labelMatch = lang.label.toLowerCase().includes(searchQuery)
      const keyMatch = lang.key.toLowerCase().includes(searchQuery)
      const countryMatch = lang.country.toLowerCase().includes(searchQuery)

      const words = searchQuery.split(/\s+/)
      const partialMatch = words.some((word) =>
        lang.label.toLowerCase().includes(word)
      )

      return labelMatch || keyMatch || countryMatch || partialMatch
    })
  }, [filterLangs])

  const closeModal = () => setIsLanguageModalOpen(false)

  useEffect(() => {
    if (!isLanguageModalOpen) {
      queueMicrotask(() => setFilterLangs(""))
    }
  }, [isLanguageModalOpen])

  return (
    <Modal
      isOpen={isLanguageModalOpen}
      setIsOpen={setIsLanguageModalOpen}
      layoutId="language-selector-modal"
      className={cn(
        "min-h-72 max-w-2xl",
        isLanguageModalOpen && "duration-0!"
      )}
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
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{
            delay: 0.3,
            duration: 0.25,
            ease: "easeOut",
          }}
          className="mb-3 px-6"
        >
          <Input
            type="text"
            className="font-sans"
            defaultValue={filterLangs}
            placeholder={language.data.modal["language-selector"].filter}
            fontStyle={{
              fontFamily:
                "var(--font-app), sans-serif",
              fontWeight: "bold",
              fontSize: "14px",
              letterSpacing: "1px",
            }}
            onFocus={() => setIsInputFocus(true)}
            onBlur={() => setIsInputFocus(false)}
            onChange={(e) => setFilterLangs(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                closeModal()
              }
            }}
          />
        </motion.div>
        <AutoHeight>
          <div
            className={cn(
              "px-6 pb-2",
              AvailableLangs.length > 0
                ? "grid grid-cols-2 gap-2 max-sm:grid-cols-1 items-start justify-start content-start"
                : "w-full",
              isInputFocus && AvailableLangs.length > 0 && "min-h-[calc(100vh-340px)]",
            )}
          >
            {AvailableLangs.length > 0 ? (
              AvailableLangs.map((lang, i) => (
                <motion.div
                  initial={{ opacity: 0, y: 6, filter: "blur(3px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: 6, filter: "blur(3px)" }}
                  transition={{
                    delay: 0.4 + i * 0.05,
                    duration: 0.25,
                    ease: "easeOut",
                  }}
                  key={"lang-select-" + i}
                >
                  <Button
                    variant={language.key === lang.key ? "default" : "ghost"}
                    data-smooth-interaction="true"
                    className={cn(
                      "flex w-full justify-start gap-3 rounded-xl border-2 border-transparent px-4 py-6 not-dark:hover:bg-foreground/5",
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
                </motion.div>
              ))
            ) : (
              <div className="flex w-full flex-col items-center justify-center gap-2 p-6">
                <SmileySadIcon size={32} />
                <h1>{language.data.modal["language-selector"].not_found}</h1>
              </div>
            )}
          </div>
        </AutoHeight>
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
