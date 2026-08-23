"use client"
import { MusicNoteIcon } from "@phosphor-icons/react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import { useAppStore } from "@/store/coreStore"

function Player() {
  const language = useAppStore((state) => state.language)
  const userSetting = useAppStore((state) => state.userSetting)
  const setUserSetting = useAppStore((state) => state.setUserSetting)

  return (
    <section
      className="mx-auto flex w-full max-w-lg flex-col gap-2 p-6"
      id="layout-player"
      data-section
    >
      <div className="mx-auto flex w-full max-w-lg gap-2 max-md:flex-col-reverse md:items-center md:justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="m-0 text-2xl">
            {language.data.app.setting.layout.player.title}
          </h1>
          <p className="text-foreground/40">
            {language.data.app.setting.layout.player.description}
          </p>
        </div>
        <MusicNoteIcon weight="fill" className="size-6 little-font:translate-y-1.5" />
      </div>
      <RadioGroup
        className="mx-auto mt-2 w-full max-w-lg"
        value={String(userSetting.dev_pona_player_style) || "compact"}
        onValueChange={(value) => {
          setUserSetting({
            ...userSetting,
            dev_pona_player_style: value as "compact" | "modern",
          })
        }}
      >
        <FieldLabel
          htmlFor="compact"
          data-smooth-interaction="true"
          className="group/label rounded-xl! border-2! pl-1 not-data-active:border-border/40 hover:scale-101 hover:bg-foreground/5 active:scale-96"
        >
          <Field orientation="horizontal">
            <FieldContent>
              <div className="bg-playground-background mb-4 rounded-xl p-2">
                <div className="flex w-full items-center justify-center rounded-xl bg-foreground/10 p-3 text-foreground/50">
                  <div className="mr-4 size-12 rounded-lg bg-primary/80 max-md:mr-2 max-md:size-10" />
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="mb-2 flex w-full items-center justify-between gap-1 max-md:mb-1">
                      <div className="h-1 min-w-0 flex-1 rounded-full bg-primary max-md:h-0.5" />
                      <div className="h-1 w-1/4 rounded-full bg-foreground/10 max-md:h-0.5" />
                    </div>
                    <div className="flex w-full items-center justify-between">
                      <div className="mr-4 flex min-w-0 flex-1 flex-col">
                        <span className="text-sm max-md:text-xs">
                          {
                            language.data.app.setting.layout.player.preview
                              .component.title
                          }
                        </span>
                        <span className="text-[8px] opacity-40">
                          {
                            language.data.app.setting.layout.player.preview
                              .component.artist
                          }
                        </span>
                      </div>
                      <div className="flex flex-row items-center gap-2">
                        <span className="text-sm max-md:text-xs">0:00</span>
                        <div className="flex items-center gap-2">
                          <div className="size-3 rounded-full bg-primary/80 max-md:size-2" />
                          <div className="size-6 rounded-full bg-primary/80 max-md:size-4" />
                          <div className="size-3 rounded-full bg-primary/80 max-md:size-2" />
                        </div>
                        <span className="text-sm max-md:text-xs">3:45</span>
                      </div>
                      <div className="ml-4 flex min-w-0 flex-1 flex-row items-center justify-end gap-2">
                        <div className="h-2 w-2 rounded-full bg-primary/80" />
                        <div className="h-2 w-2 rounded-full bg-primary/80" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <FieldTitle className="text-base">
                {language.data.app.setting.layout.player.compact.title}
                {userSetting.dev_pona_player_style === "compact" && (
                  <Tooltip>
                    <TooltipTrigger delay={0}>
                      <Badge className="rounded-full bg-foreground/10 text-foreground">
                        {language.data.common.enabled}
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      {language.data.common.enabled_description}
                    </TooltipContent>
                  </Tooltip>
                )}
              </FieldTitle>
              <FieldDescription>
                {language.data.app.setting.layout.player.compact.description}
              </FieldDescription>
            </FieldContent>
            <RadioGroupItem value="compact" className="hidden" id="compact" />
          </Field>
        </FieldLabel>
        <FieldLabel
          htmlFor="modern"
          data-smooth-interaction="true"
          className="group/label rounded-xl! border-2! pl-1 not-data-active:border-border/40 hover:scale-101 hover:bg-foreground/5 active:scale-96"
        >
          <Field orientation="horizontal">
            <FieldContent>
              <div className="bg-playground-background mb-4 rounded-xl p-2">
                <div className="mb-2 flex w-full items-center justify-between gap-1 px-2 max-md:mb-1">
                  <div className="h-1 min-w-0 flex-1 rounded-full bg-primary max-md:h-0.5" />
                  <div className="h-1 w-1/4 rounded-full bg-foreground/10 max-md:h-0.5" />
                </div>
                <div className="flex w-full flex-col items-center justify-center rounded-2xl bg-foreground/10 p-3 text-foreground/50">
                  <div className="flex w-full items-center justify-between">
                    <div className="flex w-full items-center justify-between">
                      <div className="mr-2 flex min-w-0 flex-1">
                        <div className="mr-2 size-8 rounded-lg bg-primary/80" />
                        <div className="flex min-w-0 flex-1 flex-col">
                          <span className="text-sm max-md:text-xs">
                            {
                              language.data.app.setting.layout.player.preview
                                .component.title
                            }
                          </span>
                          <span className="text-[8px] opacity-40">
                            {
                              language.data.app.setting.layout.player.preview
                                .component.artist
                            }
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-row items-center gap-2">
                        <span className="text-sm max-md:text-xs">0:00</span>
                        <div className="flex items-center gap-2">
                          <div className="size-3 rounded-full bg-primary/80 max-md:size-2" />
                          <div className="size-6 rounded-full bg-primary/80 max-md:size-4" />
                          <div className="size-3 rounded-full bg-primary/80 max-md:size-2" />
                        </div>
                        <span className="text-sm max-md:text-xs">3:45</span>
                      </div>
                      <div className="ml-4 flex min-w-0 flex-1 flex-row items-center justify-end gap-2">
                        <div className="h-2 w-2 rounded-full bg-primary/80" />
                        <div className="h-2 w-2 rounded-full bg-primary/80" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <FieldTitle className="text-base">
                {language.data.app.setting.layout.player.comfortable.title}
                {userSetting.dev_pona_player_style === "modern" && (
                  <Tooltip>
                    <TooltipTrigger delay={0}>
                      <Badge className="rounded-full bg-foreground/10 text-foreground">
                        {language.data.common.enabled}
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      {language.data.common.enabled_description}
                    </TooltipContent>
                  </Tooltip>
                )}
              </FieldTitle>
              <FieldDescription>
                {
                  language.data.app.setting.layout.player.comfortable
                    .description
                }
              </FieldDescription>
            </FieldContent>
            <RadioGroupItem value="modern" className="hidden" id="modern" />
          </Field>
        </FieldLabel>
      </RadioGroup>
    </section>
  )
}

export default Player
