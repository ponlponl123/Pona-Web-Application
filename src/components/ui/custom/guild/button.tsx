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
  return (
    <Link href={uri}>
      <Button
        onClick={() => {
          setLoading(true)
          setCurrentGuild(guild)
        }}
        className="group w-full rounded-[calc(var(--radius)*4.8)] bg-foreground/5 py-12 text-foreground backdrop-blur-xs hover:bg-foreground/10 max-lg:py-10"
        data-smooth-interaction="true"
      >
        <div className="flex max-h-none w-full items-center justify-center gap-3 p-2">
          <div className="relative flex size-16 flex-col items-center justify-center max-lg:size-12">
            <Avatar
              className={cn(
                loading ? "size-10 max-lg:size-8" : "size-16 max-lg:size-12"
              )}
            >
              <AvatarImage src={guild.iconURL as string} />
              <AvatarFallback>
                {guild.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <Spinner
              weight={"light"}
              className={cn(
                "absolute size-16 max-lg:size-14",
                !loading && "hidden"
              )}
            />
          </div>
          <div className="flex flex-col">
            <h1 className="text-2xl max-lg:text-xl">{guild.name}</h1>
            <span className="text-start text-base opacity-40 max-lg:text-sm">
              {guild.id}
            </span>
          </div>
          <div className="m-auto mr-4">
            <CaretRightIcon
              weight="bold"
              className="group-hover:translate-x-1 group-active:-translate-x-1"
              size={18}
            />
          </div>
        </div>
      </Button>
    </Link>
  )
}
