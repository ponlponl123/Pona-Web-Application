"use client"
import React from "react"
import {
  BriefcaseIcon,
  DiamondsFourIcon,
  SmileyIcon,
  TextAaIcon,
  WarningIcon,
} from "@phosphor-icons/react"
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
import { useThemeContext } from "@/components/theme-provider"
import { AppFont } from "@/types/settings"

function Fonts() {
  const language = useAppStore((state) => state.language)
  const userSetting = useAppStore((state) => state.userSetting)
  const setUserSetting = useAppStore((state) => state.setUserSetting)
  const { appFont, setAppFont } = useThemeContext()

  const currentFont = appFont || userSetting.appFont || "friendly"

  const handleFontChange = (value: string) => {
    const nextFont = value as AppFont
    setAppFont(nextFont)
    setUserSetting({
      ...userSetting,
      appFont: nextFont,
    })
  }

  const fontOptions: {
    id: AppFont
    title: string
    description: string
    fontFamily: string
    icon: React.ReactNode
    previewEn: string
    previewTh: string
  }[] = [
      {
        id: "friendly",
        title: language.data.app.setting.layout.fonts.friendly.title,
        description: language.data.app.setting.layout.fonts.friendly.description,
        fontFamily: "var(--font-friendly)",
        icon: <SmileyIcon weight="fill" className="size-4 little-font:translate-y-0.5" />,
        previewEn: language.data.app.setting.layout.fonts.preview.en,
        previewTh: language.data.app.setting.layout.fonts.preview.th,
      },
      {
        id: "business",
        title: language.data.app.setting.layout.fonts.business.title,
        description: language.data.app.setting.layout.fonts.business.description,
        fontFamily: "var(--font-business)",
        icon: <BriefcaseIcon weight="fill" className="size-4 little-font:translate-y-0.5" />,
        previewEn: language.data.app.setting.layout.fonts.preview.en,
        previewTh: language.data.app.setting.layout.fonts.preview.th,
      },
      {
        id: "modern",
        title: language.data.app.setting.layout.fonts.modern.title,
        description: language.data.app.setting.layout.fonts.modern.description,
        fontFamily: "var(--font-modern)",
        icon: <DiamondsFourIcon weight="fill" className="size-4 little-font:translate-y-0.5" />,
        previewEn: language.data.app.setting.layout.fonts.preview.en,
        previewTh: language.data.app.setting.layout.fonts.preview.th,
      },
    ]

  return (
    <section
      className="mx-auto flex w-full max-w-lg flex-col gap-2 p-6"
      id="layout-fonts"
      data-section
    >
      <div className="mx-auto flex w-full max-w-lg gap-2 max-md:flex-col-reverse md:items-center md:justify-between">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <h1 className="m-0 text-2xl">
              {language.data.app.setting.layout.fonts.title}
            </h1>
            <Tooltip>
              <TooltipTrigger delay={0}>
                <WarningIcon weight="bold" className="mt-1 text-amber-400" />
              </TooltipTrigger>
              <TooltipContent>
                {language.data.app.setting.layout.locked}
              </TooltipContent>
            </Tooltip>
          </div>
          <p className="text-foreground/40">
            {language.data.app.setting.layout.fonts.description}
          </p>
        </div>
        <TextAaIcon weight="fill" className="size-6 little-font:translate-y-1.5" />
      </div>
      <RadioGroup
        className="mx-auto mt-2 w-full max-w-lg"
        value={currentFont}
        onValueChange={handleFontChange}
      >
        {fontOptions.map((opt) => {
          const isSelected = currentFont === opt.id
          return (
            <FieldLabel
              key={opt.id}
              htmlFor={`font-option-${opt.id}`}
              data-smooth-interaction="true"
              className="group/label rounded-xl! border-2! pl-1 not-data-active:border-border/40 hover:scale-101 hover:bg-foreground/5 active:scale-96"
            >
              <Field orientation="horizontal">
                <FieldContent>
                  <div className="bg-playground-background mb-4 rounded-xl p-3">
                    <div
                      className="flex flex-col gap-1.5 rounded-xl bg-foreground/5 p-3.5 transition-all"
                      style={{ fontFamily: opt.fontFamily }}
                    >
                      <div className="text-base font-bold tracking-tight text-foreground">
                        {opt.previewEn}
                      </div>
                      <div className="text-xs text-foreground/70">
                        {opt.previewTh}
                      </div>
                    </div>
                  </div>
                  <FieldTitle className="text-base">
                    {opt.icon}
                    {opt.title}
                    {isSelected && (
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
                  <FieldDescription>{opt.description}</FieldDescription>
                </FieldContent>
                <RadioGroupItem
                  value={opt.id}
                  className="hidden"
                  id={`font-option-${opt.id}`}
                />
              </Field>
            </FieldLabel>
          )
        })}
      </RadioGroup>
    </section>
  )
}

export default Fonts
