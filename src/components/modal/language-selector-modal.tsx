"use client"
import React from "react"
import { AnimatePresence, motion } from "framer-motion" // แก้ไข import ตามเวอร์ชันที่คุณใช้
import { useGlobalContext } from "@/contexts/globalContext"
import { useLanguageContext } from "@/contexts/languageContext"
import { Button } from "../ui/button"
import { langs } from "@/lib/i18n"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { cn } from "@/lib/utils"
import { Badge } from "../ui/badge"
import { HandWavingIcon } from "@phosphor-icons/react/dist/ssr"

function LanguageSelectorModal() {
  const { language, setLanguage } = useLanguageContext()
  const { isLanguageModalOpen, setIsLanguageModalOpen } = useGlobalContext()

  const closeModal = () => setIsLanguageModalOpen(false)

  return (
    <AnimatePresence>
      {isLanguageModalOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeModal}
          className="fixed inset-0 z-1000 flex items-center justify-center bg-black/40 p-2 backdrop-blur-md"
        >
          <motion.div
            layoutId="language-selector-modal"
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl rounded-4xl border-2 border-foreground/10 bg-background/90 p-6 shadow-xl"
          >
            <div>
              <h1 className="mb-2 text-3xl font-bold text-foreground">
                {language.data.modal["language-selector"].title}
              </h1>
              <p className="text-sm text-foreground">
                {language.data.modal["language-selector"].description}
              </p>
              <div className="mt-6 grid grid-cols-2 gap-2 max-sm:grid-cols-1">
                {langs.map((lang, i) => (
                  <Button
                    key={"lang-select-" + i}
                    variant={language.key === lang.key ? "default" : "ghost"}
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
              <div className="mt-6 flex w-full justify-end gap-2">
                <Button
                  size={"lg"}
                  variant={"ghost"}
                  className={"rounded-full px-6"}
                  onClick={closeModal}
                >
                  {language.data.common.close}
                </Button>
                <Button
                  size={"lg"}
                  className={"rounded-full px-6"}
                  onClick={closeModal}
                >
                  {language.data.common.ok}
                </Button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default LanguageSelectorModal
