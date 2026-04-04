"use client"
import React from "react"
import { useLanguageContext } from "@/contexts/languageContext"
import { useDiscordGuildInfo } from "@/contexts/discordGuildInfo"
import {
  CaretRightIcon,
  GearIcon,
  MusicNoteSimpleIcon,
  TerminalIcon,
} from "@phosphor-icons/react"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import CustomScrollArea from "@/components/ui/custom/scroll-area"
import commands from "@/consts/commands"

function Page() {
  const { guild } = useDiscordGuildInfo()
  const { language } = useLanguageContext()
  const [selectedCommand, setSelectedCommand] = React.useState<string>(
    commands[0]
  )

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
              {language.data.app.guilds.permissions.commands.title}{" "}
              <Badge className="mt-2 -ml-1 rounded-md bg-primary/20 text-primary">
                {language.data.extensions.comingsoon}
              </Badge>
            </h1>
            <div className="pointer-events-none mt-8 flex gap-3 opacity-40 max-md:flex-col">
              <div className="max-md:min-w-0 max-md:flex-1 md:w-48">
                <CustomScrollArea
                  classNames={{
                    viewport:
                      "max-md:max-h-48 max-h-[calc(100vh-15rem)] lg:max-h-[calc(100vh-13rem)]",
                    scrollbar: "translate-x-2.5",
                  }}
                >
                  <div className="flex flex-col gap-1 p-1 max-md:gap-2">
                    {commands.map((command, index) => (
                      <Button
                        key={index}
                        className={cn(
                          "flex items-center justify-start gap-3 rounded-xl bg-muted/20 p-4 text-foreground backdrop-blur-xs hover:bg-muted/80 max-md:p-6",
                          selectedCommand === command &&
                            "bg-primary text-primary-foreground hover:bg-primary/80"
                        )}
                        onClick={() => setSelectedCommand(command)}
                        data-smooth-interaction="true"
                      >
                        {command.startsWith("/music") || command === "/join" ? (
                          <MusicNoteSimpleIcon weight="fill" />
                        ) : command.startsWith("/setting ") ? (
                          <GearIcon weight="fill" />
                        ) : null}
                        <span>{command}</span>
                      </Button>
                    ))}
                  </div>
                </CustomScrollArea>
              </div>
              <div className="m-1 flex h-max min-w-0 flex-3 flex-col gap-2 rounded-xl border-2 border-border/10 bg-background/40 p-3 backdrop-blur-xs">
                <div className="-mt-1 flex items-center gap-2">
                  {selectedCommand.startsWith("/music") ||
                  selectedCommand === "/join" ? (
                    <MusicNoteSimpleIcon className="size-4" weight="fill" />
                  ) : selectedCommand.startsWith("/setting ") ? (
                    <GearIcon className="size-4" weight="fill" />
                  ) : (
                    <TerminalIcon className="size-4" weight="fill" />
                  )}
                  <Badge className="rounded-md bg-primary/20 px-1.5 font-bold text-primary">
                    {selectedCommand}
                  </Badge>
                </div>
                <div className="h-1" />
                <div className="w-full p-2">
                  <h1 className="mb-1 px-3 text-sm text-foreground/40">
                    {
                      language.data.app.guilds.permissions.commands.builder
                        .who_can_use
                    }
                  </h1>
                  <div className="flex flex-wrap gap-2 rounded-lg border-2 border-border/10 bg-background/40 p-2">
                    <Badge className="rounded-md bg-foreground/10 text-foreground select-none">
                      {selectedCommand.startsWith("/setting")
                        ? language.data.common.role.administrator
                        : language.data.common.everyone}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
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
