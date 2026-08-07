"use client"
import React from "react"
import { useDiscordGuildInfo } from "@/contexts/discordGuildInfo"
import { GearIcon } from "@phosphor-icons/react"
import { Alert } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"
import { useAppStore } from "@/store/coreStore"

type GuildSettings = Record<string, unknown>

function Page() {
  const { guild } = useDiscordGuildInfo()
  const language = useAppStore((state) => state.language)
  const [loading, setLoading] = React.useState<boolean>(true)
  const [guildSettings, setGuildSettings] =
    React.useState<GuildSettings | null>(null)

  React.useEffect(() => {
    queueMicrotask(() => setLoading(false))
  }, [])

  return (
    <main id="app-panel">
      <main id="app-workspace">
        {guild ? (
          <>
            <h1 className="text-base text-foreground/40">{guild.name}</h1>
            <h1 className="mt-4 flex items-center gap-4 text-5xl max-md:gap-2 max-md:text-3xl">
              <GearIcon weight="fill" className="size-12 max-md:size-6" />{" "}
              {language.data.app.guilds.setting.name}{" "}
              <Badge className="mt-2 -ml-1 rounded-md bg-primary/20 text-primary">
                {language.data.extensions.beta}
              </Badge>
            </h1>
            {!loading ? (
              guildSettings ? (
                <></>
              ) : (
                <Alert className="mt-6 rounded-xl border-2 border-rose-400 bg-rose-400/10 text-rose-400 backdrop-blur-xs">
                  Cannot fetch guild setting :(
                </Alert>
              )
            ) : (
              <div
                className="mt-16 flex w-full max-w-5xl flex-col items-center justify-center gap-4 text-center"
                style={{ minHeight: "48vh" }}
              >
                <Spinner />
              </div>
            )}
          </>
        ) : (
          <>
            <Spinner />
          </>
        )}
      </main>
    </main>
  )
}

export default Page
