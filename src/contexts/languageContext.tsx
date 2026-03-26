"use client"
import {
  createContext,
  useContext,
  useState,
  useMemo,
  useCallback,
} from "react"
import lang, { Language, languageKeys } from "@/lib/i18n"
import { getCookie, setCookie } from "cookies-next"

interface LanguageContextType {
  language: Language
  setLanguage: (languageKey: languageKeys) => void
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
)

export const LanguageProvider = ({
  children,
  initialLang,
}: {
  children: React.ReactNode
  initialLang?: languageKeys
}) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const currentLangKey =
      initialLang || (getCookie("lang") as languageKeys) || "en-US"
    return lang(currentLangKey)
  })

  const setLanguage = useCallback((languageKey: languageKeys) => {
    setCookie("lang", languageKey)
    setLanguageState(lang(languageKey))
  }, [])

  const value = useMemo(
    () => ({ language, setLanguage }),
    [language, setLanguage]
  )

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}

export const useLanguageContext = () => {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error("useLanguageContext must be used within a LanguageProvider")
  }
  return context
}

export default LanguageContext
