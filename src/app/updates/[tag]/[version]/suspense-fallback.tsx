"use client"

import { useAppStore } from "@/store/coreStore"

export default function SuspenseFallback() {
  const language = useAppStore((state) => state.language)

  return (
    <div className="animate-pulse text-muted-foreground">
      {language.data.app.updates.suspense}
    </div>
  )
}
