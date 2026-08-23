import thTH from "@/langs/th.json"
import enUS from "@/langs/en.json"
import jaJP from "@/langs/jp.json"

export type languageKeys = "th-TH" | "en-US" | "ja-JP"

const validKeys: languageKeys[] = ["th-TH", "en-US", "ja-JP"]

export const isValidLanguageKey = (key: string): key is languageKeys => {
  return validKeys.includes(key as languageKeys)
}

export interface Language {
  key: languageKeys
  label: string
  country: string
  data: typeof enUS
  looking_for_translator: boolean
}

const langMap: Record<languageKeys, typeof enUS> = {
  "th-TH": thTH,
  "en-US": enUS,
  "ja-JP": jaJP,
}

export const langs: Language[] = [
  {
    key: "th-TH",
    label: "ไทย",
    country: "th",
    data: thTH,
    looking_for_translator: thTH.looking_for_translator,
  },
  {
    key: "en-US",
    label: "English",
    country: "us",
    data: enUS,
    looking_for_translator: enUS.looking_for_translator,
  },
  {
    key: "ja-JP",
    label: "日本語",
    country: "jp",
    data: jaJP,
    looking_for_translator: jaJP.looking_for_translator,
  },
]

export default function lang(languageKey: languageKeys): Language {
  const selected = langMap[languageKey] || enUS

  return {
    key: (selected.key || languageKey) as languageKeys,
    label: selected.label,
    country: selected.country,
    data: selected,
    looking_for_translator: selected.looking_for_translator,
  }
}
