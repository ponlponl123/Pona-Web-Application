"use client"
import { useGlobalContext } from "@/contexts/globalContext"
import { useLanguageContext } from "@/contexts/languageContext"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { SmileySadIcon, HandWavingIcon } from "@phosphor-icons/react"
import { Input } from "react-smooth-input"
import Modal from "../ui/custom/modal"
import { Button } from "../ui/button"
import { Badge } from "../ui/badge"
import { langs } from "@/lib/i18n"
import { cn } from "@/lib/utils"
import React, { useEffect, useRef } from "react"

function LanguageSelectorModal() {
  const { language, setLanguage } = useLanguageContext()
  const { isLanguageModalOpen, setIsLanguageModalOpen } = useGlobalContext()
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
      setFilterLangs("")
    }
  }, [isLanguageModalOpen])

  return (
    <Modal
      isOpen={isLanguageModalOpen}
      setIsOpen={setIsLanguageModalOpen}
      layoutId="language-selector-modal"
      className={cn(
        "min-h-72 max-w-2xl",
        isInputFocus && "h-screen",
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
        <div className="mb-3 px-6">
          <Input
            type="text"
            className="font-sans"
            defaultValue={filterLangs}
            placeholder={language.data.modal["language-selector"].filter}
            fontStyle={{
              fontFamily:
                "var(--font-ponlponl123-article), var(--font-sn-sanafon-maru-j30), sans-serif",
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
        </div>
        <div
          className={cn(
            "px-6",
            AvailableLangs.length > 0
              ? "grid grid-cols-2 gap-2 max-sm:grid-cols-1"
              : "w-full"
          )}
        >
          {AvailableLangs.length > 0 ? (
            AvailableLangs.map((lang, i) => (
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
            ))
          ) : (
            <div className="flex w-full flex-col items-center justify-center gap-2 p-6">
              <SmileySadIcon size={32} />
              <h1>{language.data.modal["language-selector"].not_found}</h1>
            </div>
          )}
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
