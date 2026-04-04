"use client"
import React from "react"
import { useDiscordGuildInfo } from "@/contexts/discordGuildInfo"
import { CaretRightIcon, GearIcon } from "@phosphor-icons/react"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"
import { useAppStore } from "@/store/coreStore"

function Page() {
  const { guild } = useDiscordGuildInfo()
  const language = useAppStore((state) => state.language)

  return (
    <main id="app-panel">
      <main id="app-workspace">
        {guild ? (
          <>
            <h1 className="text-base text-foreground/40">{guild.name}</h1>
            <h1 className="mt-4 flex items-center gap-4 text-5xl max-md:gap-2 max-md:text-3xl">
              <GearIcon weight="fill" className="size-12 max-md:size-6" />{" "}
              {language.data.app.guilds.permissions.title}{" "}
              <CaretRightIcon
                weight="bold"
                className="mt-2 size-4 max-md:-mx-1 max-md:size-3 md:mt-3"
              />{" "}
              {language.data.app.guilds.permissions.music.title}{" "}
              <Badge className="mt-2 -ml-1 rounded-md bg-primary/20 text-primary">
                {language.data.extensions.comingsoon}
              </Badge>
            </h1>
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
