"use client"

import React, { useMemo } from "react"
import Link from "next/link"
import { CaretRightIcon, UsersIcon } from "@phosphor-icons/react/dist/ssr"
import { GuildInfo } from "@/lib/server-side-api/discord/fetchGuild"
import { Avatar, AvatarFallback, AvatarImage } from "../../avatar"
import { cn } from "@/lib/utils"
import { Button } from "../../button"
import { Spinner } from "../../spinner"
import ImageWithSkeleton from "../image"

interface GuildButtonProps {
  guild: GuildInfo
  uri: string
  setCurrentGuild: (guild: GuildInfo) => void
}

export function GuildButton({
  guild,
  uri,
  setCurrentGuild,
}: GuildButtonProps): React.ReactElement {
  const [loading, setLoading] = React.useState<boolean>(false)

  const backdropBg = useMemo(() => {
    if (guild?.bannerURL) return `${guild.bannerURL}?size=640`
    if (guild?.iconURL) return `${guild.iconURL}?size=640`
    return "/static/backdrop.png"
  }, [guild])

  const formattedMemberCount = React.useMemo(() => {
    if (typeof guild.memberCount !== "number") return null
    return new Intl.NumberFormat().format(guild.memberCount)
  }, [guild.memberCount])

  return (
    <Link
      href={uri}
      className={cn("block w-full", guild.isConnected && "-order-1")}
      style={{ order: guild.isConnected ? -1 : undefined }}
    >
      <Button
        onClick={() => {
          setLoading(true)
          setCurrentGuild(guild)
        }}
        className={cn(
          "group relative flex h-auto w-full flex-col justify-between overflow-hidden rounded-3xl border-2 border-foreground/10 bg-foreground/5 p-0 text-foreground backdrop-blur-md transition-all duration-300 hover:border-primary/40 hover:bg-foreground/10 hover:shadow-xl hover:shadow-primary/5",
          guild.isConnected && "border-emerald-500/30 bg-emerald-500/5 dark:bg-emerald-950/20",
          loading && "border-primary/60 bg-foreground/10"
        )}
        data-smooth-interaction="true"
      >
        <div className="bg-foreground-50 pointer-events-none h-24 w-full mask-b-from-0%">
          {guild.bannerURL ? (
            <ImageWithSkeleton
              alt={guild.name || "Guild Banner"}
              src={`${guild.bannerURL}?size=480`}
              width={"100%"}
              height={192}
              className="h-full w-full bg-primary object-cover"
            />
          ) : (
            <div className="h-full w-full overflow-hidden">
              <ImageWithSkeleton
                alt={guild.name || "Default Banner"}
                src={
                  guild.iconURL
                    ? `${guild.iconURL}?size=320`
                    : "/static/app/default.png"
                }
                width={"100%"}
                height={192}
                className="h-full w-full bg-primary object-cover blur-2xl"
              />
            </div>
          )}
        </div>

        <div className="relative z-10 -mt-10 flex w-full items-center justify-between p-5 pt-0">
          <div className="flex items-center gap-4">
            <div className="relative flex size-16 shrink-0 items-center justify-center">
              <Avatar
                className={cn(
                  "size-16 shadow-lg ring-4 ring-background transition-transform duration-300",
                  guild.isConnected && "ring-emerald-500/40",
                  loading ? "scale-90 opacity-60" : "group-hover:scale-105"
                )}
              >
                <AvatarImage src={guild.iconURL as string} alt={guild.name} />
                <AvatarFallback className="bg-primary/20 text-lg font-bold text-primary">
                  {guild.nameAcronym || guild.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              {guild.isConnected && (
                <span
                  className="absolute bottom-0 right-0 size-4 rounded-full bg-emerald-500 ring-2 ring-background animate-pulse"
                  title="Connected"
                />
              )}

              {loading && (
                <Spinner
                  weight="light"
                  className="absolute size-20 animate-spin text-primary"
                />
              )}
            </div>
            <div className="flex flex-col text-left">
              <div className="flex items-center gap-2">
                <h3 className="line-clamp-1 text-xl font-bold tracking-tight text-foreground transition-colors group-hover:text-primary">
                  {guild.name}
                </h3>
              </div>
              <span className="font-mono text-xs text-foreground/50">
                {guild.id}
              </span>

              <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                {formattedMemberCount && (
                  <div className="inline-flex w-max items-center gap-1.5 rounded-md bg-foreground/10 px-1.5 py-0.5 text-xs text-foreground/70">
                    <UsersIcon size={12} weight="bold" className="text-primary" />
                    <span>{formattedMemberCount}</span>
                  </div>
                )}

                {guild.isConnected && (
                  <div className="inline-flex w-max items-center gap-1 rounded-md bg-emerald-500/10 px-1.5 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Connected</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="ml-2 shrink-0 text-foreground/40 transition-all duration-300 group-hover:translate-x-1 group-hover:text-primary">
            <CaretRightIcon size={20} weight="bold" />
          </div>
        </div>
      </Button>
    </Link>
  )
}
