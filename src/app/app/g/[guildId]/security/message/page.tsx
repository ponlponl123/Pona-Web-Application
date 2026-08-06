"use client"

import React from "react"
import { useParams } from "next/navigation"
import { ComingSoon } from "@/components/ui/custom/coming-soon"
import { useAppStore } from "@/store/coreStore"

export default function MultiFactorAuthPage(): React.ReactElement {
  const params = useParams()
  const guildId = (params?.guildId as string) || ""
  const language = useAppStore((state) => state.language)

  return (
    <main id="app-panel" className="relative min-h-screen">
      <ComingSoon
        title={language?.data?.app?.guilds?.security?.message?.title || "Security Message"}
        backUrl={guildId ? `/app/g/${guildId}` : "/app"}
      />
    </main>
  )
}
