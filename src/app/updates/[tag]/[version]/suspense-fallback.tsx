"use client"

import { useLanguageContext } from "@/contexts/languageContext"

export default function SuspenseFallback() {
  const { language } = useLanguageContext()

  return (
    <div className="animate-pulse text-muted-foreground">
      {language.data.app.updates.suspense}
    </div>
  )
}
