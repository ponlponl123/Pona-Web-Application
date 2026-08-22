"use client"
import React from "react"
import { useDiscordUserInfo } from "@/contexts/discordUserInfo"
import { useDiscordGuildInfo } from "@/contexts/discordGuildInfo"
import {
  BroadcastIcon,
  FacebookLogoIcon,
  PlusIcon,
  TiktokLogoIcon,
  TwitchLogoIcon,
  YoutubeLogoIcon,
} from "@phosphor-icons/react"
import { Alert } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"
import ImageWithSkeleton from "@/components/ui/custom/image"
import { Input } from "react-smooth-input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { parseHour } from "@/lib/parser"
import { useAppStore } from "@/store/coreStore"

function Page() {
  const { userInfo } = useDiscordUserInfo()
  const { guild } = useDiscordGuildInfo()

  const language = useAppStore((state) => state.language)
  const userSetting = useAppStore((state) => state.userSetting)
  const [message, setMessage] = React.useState("")

  React.useEffect(() => {
    setMessage(
      language.data.app.guilds.utilities.live_notify.builder.message.default.replace(
        "{username}",
        userInfo?.global_name || ""
      )
    )
  }, [language, userInfo?.global_name])

  return (
    <main id="app-panel">
      <main id="app-workspace">
        {guild ? (
          <>
            <h1 className="text-base text-foreground/40">{guild.name}</h1>
            <h1 className="mt-4 flex items-center gap-4 text-5xl max-lg:text-4xl max-md:gap-2 max-md:text-3xl">
              <BroadcastIcon weight="fill" className="size-12 max-md:size-6" />{" "}
              {language.data.app.guilds.utilities.live_notify.name}{" "}
              <Badge className="mt-2 -ml-1 rounded-md bg-primary/20 text-primary">
                {language.data.extensions.comingsoon}
              </Badge>
            </h1>
            <Alert className="mt-6 rounded-xl border-2 border-amber-400 bg-amber-400/10 tracking-wider text-amber-400 backdrop-blur-xs">
              {language.data.app.guilds.utilities.live_notify.dev}
            </Alert>
            <div className="pointer-events-none mt-3 flex flex-col gap-2 rounded-2xl border-2 border-border/10 bg-background/40 p-3 backdrop-blur-xs">
              <h1 className="text-xl font-bold opacity-40">
                {language.data.app.guilds.utilities.live_notify.presets.title}
              </h1>
              <p className="-mt-2 text-sm text-foreground/40 opacity-40">
                {
                  language.data.app.guilds.utilities.live_notify.presets
                    .description
                }
              </p>
              <div className="grid w-full grid-cols-1 gap-2 not-dark:opacity-40 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 dark:brightness-25">
                <div className="pointer-events-none flex items-center justify-center gap-3 rounded-xl bg-rose-600 p-3 font-bold text-white select-none">
                  <YoutubeLogoIcon weight="fill" />
                  <h1>Youtube</h1>
                </div>
                <div className="pointer-events-none flex items-center justify-center gap-3 rounded-xl bg-purple-600 p-3 font-bold text-white select-none">
                  <TwitchLogoIcon weight="fill" />
                  <h1>Twitch.tv</h1>
                </div>
                <div className="pointer-events-none flex items-center justify-center gap-3 rounded-xl bg-gray-950 p-3 font-bold text-white select-none">
                  <TiktokLogoIcon weight="fill" />
                  <h1>Tiktok</h1>
                </div>
                <div className="pointer-events-none flex items-center justify-center gap-3 rounded-xl bg-blue-600 p-3 font-bold text-white select-none">
                  <FacebookLogoIcon weight="fill" />
                  <h1>Facebook</h1>
                </div>
              </div>
            </div>
            <div className="flex max-lg:flex-col-reverse lg:gap-3 xl:gap-6">
              <div className="pointer-events-none mt-3 flex min-w-0 flex-1 flex-col gap-2 rounded-2xl border-2 border-border/10 bg-background/40 p-3 backdrop-blur-xs">
                <h1 className="text-xl font-bold opacity-40">
                  {language.data.app.guilds.utilities.live_notify.builder.title}
                </h1>
                <div className="opacity-40">
                  <p className="mb-1 px-3 text-sm text-foreground/40 opacity-40">
                    {
                      language.data.app.guilds.utilities.live_notify.builder
                        .custom_webhook
                    }
                  </p>
                  <Input
                    type="text"
                    placeholder={`https://discord.com/api/webhooks/${guild.id}/...`}
                    fontStyle={{
                      fontFamily:
                        "var(--font-app), sans-serif",
                      fontWeight: "bold",
                      fontSize: "14px",
                      letterSpacing: "1px",
                    }}
                    disabled
                  />
                </div>
                <div className="opacity-40">
                  <p className="mb-1 px-3 text-sm text-foreground/40 opacity-40">
                    {
                      language.data.app.guilds.utilities.live_notify.builder
                        .message.title
                    }
                  </p>
                  <Textarea
                    className="min-h-32 rounded-xl border-2 border-transparent bg-foreground/10! text-sm! tracking-wider hover:border-foreground/10 hover:bg-foreground/5!"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                </div>
                <div className="pointer-events-none opacity-40">
                  <p className="mb-1 px-3 text-sm text-foreground/40 opacity-40">
                    {
                      language.data.app.guilds.utilities.live_notify.builder
                        .component.title
                    }
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Button className="flex items-center justify-center gap-3 rounded-xl bg-primary p-3 font-bold text-primary-foreground">
                      <PlusIcon weight="bold" />
                      <h1>
                        {
                          language.data.app.guilds.utilities.live_notify.builder
                            .component.add_embed
                        }
                      </h1>
                    </Button>
                    <Button className="flex items-center justify-center gap-3 rounded-xl bg-primary p-3 font-bold text-primary-foreground">
                      <PlusIcon weight="bold" />
                      <h1>
                        {
                          language.data.app.guilds.utilities.live_notify.builder
                            .component.add_button
                        }
                      </h1>
                    </Button>
                  </div>
                </div>
              </div>
              <div className="mt-3 flex min-w-0 flex-1 flex-col gap-2 rounded-2xl border-2 border-border/10 bg-background/40 p-3 backdrop-blur-xs">
                <h1 className="text-xl font-bold opacity-40">Preview</h1>
                <div className="flex min-h-0 w-full flex-1 items-center justify-center gap-2 rounded-lg border border-border/30 bg-[#f0f0f0] py-1 lg:py-4 dark:bg-[#23272a]">
                  <div className="flex w-full gap-3 p-2 hover:bg-foreground/5 lg:px-6">
                    <div>
                      <ImageWithSkeleton
                        alt="Pona!"
                        src="https://cdn.discordapp.com/avatars/1041665523651457044/8c11d232da3c230dab12ab629de3ed26.webp?size=28"
                        className="pointer-events-none size-7 rounded-full select-none"
                      />
                    </div>
                    <div className="flex flex-col">
                      <div className="pointer-events-none -mt-1.5 flex items-center gap-2 select-none">
                        <h1 className="text-lg font-bold">Pona!</h1>
                        <span className="mt-1 text-xs text-foreground/40">
                          {new Date().toLocaleString(language.key, {
                            hour: "numeric",
                            minute: "numeric",
                            hour12: parseHour(userSetting.timeformat),
                          })}
                        </span>
                      </div>
                      <p className="-mt-1 whitespace-pre-wrap">
                        {message.split(/(@\w+)/g).map((part, index) => {
                          if (part.startsWith("@")) {
                            return (
                              <span
                                key={index}
                                className="rounded-sm bg-amber-400/20 px-1 text-amber-400"
                              >
                                {part}
                              </span>
                            )
                          }

                          return part
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="my-6" />
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
