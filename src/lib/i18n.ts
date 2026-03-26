"use client"
import thTH from "@/langs/th.json"
import enUS from "@/langs/en.json"
import jaJP from "@/langs/jp.json"

export type languageKeys = "th-TH" | "en-US" | "ja-JP"

export interface Language {
  key: languageKeys
  label: string
  country: string
  data: typeof enUS
}

const langMap: Record<languageKeys, typeof enUS> = {
  "th-TH": thTH,
  "en-US": enUS,
  "ja-JP": jaJP,
}

export const langs: Language[] = [
  { key: "th-TH", label: "ไทย", country: "th", data: thTH },
  { key: "en-US", label: "English", country: "us", data: enUS },
  { key: "ja-JP", label: "日本語", country: "jp", data: jaJP },
]

export default function lang(languageKey: languageKeys): Language {
  const selected = langMap[languageKey] || enUS

  return {
    key: (selected.key || languageKey) as languageKeys,
    label: selected.label,
    country: selected.country,
    data: selected,
  }
}
