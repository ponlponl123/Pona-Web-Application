"use client"
import React from "react"
import { CaretRightIcon } from "@phosphor-icons/react"
import { GuildInfo } from "@/lib/server-side-api/discord/fetchGuild"
import { Avatar, AvatarFallback, AvatarImage } from "../../avatar"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Button } from "../../button"
import { Spinner } from "../../spinner"

export function GuildButton({
  guild,
  uri,
  setCurrentGuild,
}: {
  guild: GuildInfo
  uri: string
  setCurrentGuild: (guild: GuildInfo) => void
}) {
  const [loading, setLoading] = React.useState<boolean>(false)
  const onClick = () => {
    setLoading(true)
    setCurrentGuild(guild)
  }
  return (
    <Link href={uri}>
      <Button
        onClick={onClick}
        className="group w-full rounded-3xl bg-foreground/10 py-12"
        data-smooth-interaction="true"
      >
        <div className="flex max-h-none w-full items-center justify-center gap-3 p-2">
          <div className="relative flex h-16 w-16 flex-col items-center justify-center">
            <Avatar className={cn(loading ? "size-12" : "size-16")}>
              <AvatarImage src={guild.iconURL as string} />
              <AvatarFallback>
                {guild.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <Spinner className={cn("absolute size-14", !loading && "hidden")} />
          </div>
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl leading-8">{guild.name}</h1>
            <span className="text-start text-base">{guild.id}</span>
          </div>
          <div className="m-auto mr-4">
            <CaretRightIcon
              className="group-hover:translate-x-1 group-active:-translate-x-1"
              size={18}
            />
          </div>
        </div>
      </Button>
    </Link>
  )
}
