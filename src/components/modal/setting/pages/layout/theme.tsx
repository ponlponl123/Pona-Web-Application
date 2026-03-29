"use client"
import { Badge } from "@/components/ui/badge"
import { useThemeContext } from "@/components/theme-provider"
import { ThemeDot, ThemePreview } from "@/components/ui/custom/theme"
import { useLanguageContext } from "@/contexts/languageContext"
import { darkThemes, lightThemes } from "@/consts/theme"
import { PaintBrushIcon, WarningIcon } from "@phosphor-icons/react"
import React from "react"
import { useTheme } from "next-themes"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field"
import { Switch } from "@/components/ui/switch"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"

function Theme() {
  const { theme, setTheme } = useTheme()
  const {
    appTheme,
    appDayTheme,
    appNightTheme,
    isAmoled,
    isCurrentlyDark,
    setAppTheme,
    setAmoled,
  } = useThemeContext()
  const { language } = useLanguageContext()

  return (
    <section
      className="mx-auto flex min-h-full w-full max-w-lg flex-col gap-2"
      id="layout-theme"
      data-section
    >
      <div className="flex w-full gap-2 max-md:flex-col-reverse md:items-center md:justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="m-0 px-6 text-foreground/40">
            {language.data.app.setting.layout.theme.title}
          </h1>
        </div>
      </div>
      {theme !== "custom" && theme !== "system" ? (
        <div className="rounded-2xl border-2 border-primary p-1">
          <Badge className="ml-0.5 rounded-full bg-primary/10 text-primary">
            <PaintBrushIcon className="mr-1" weight="fill" />
            {language.data.app.setting.layout.theme.title}
          </Badge>
          <ThemePreview theme={appTheme} className="mt-2" />
          <div className="mt-2 flex flex-wrap gap-2 rounded-xl bg-foreground/10 p-1">
            {lightThemes.map((collectedTheme, index) => (
              <ThemeDot
                key={index}
                theme={collectedTheme}
                isDark={false}
                active={appTheme === collectedTheme.name && theme === "light"}
                onClick={() => {
                  setAppTheme(collectedTheme.name)
                  setTheme("light")
                }}
              />
            ))}
            {darkThemes.map((collectedTheme, index) => (
              <ThemeDot
                key={index}
                theme={collectedTheme}
                isDark={true}
                active={appTheme === collectedTheme.name && theme === "dark"}
                onClick={() => {
                  setAppTheme(collectedTheme.name)
                  setTheme("dark")
                }}
              />
            ))}
          </div>
        </div>
      ) : (
        <></>
      )}
      <FieldGroup className="w-full">
        <FieldLabel
          htmlFor="switch-share"
          className="group/label rounded-lg! border-2! not-data-active:border-border/10 hover:scale-101 hover:bg-foreground/5 active:scale-96"
          data-smooth-interaction="true"
        >
          <Field orientation="horizontal">
            <FieldContent>
              <FieldTitle className="text-base">
                <div className="flex flex-wrap items-center gap-x-2">
                  <h1>{language.data.app.setting.layout.amoled_black.title}</h1>
                  <Tooltip>
                    <TooltipTrigger delay={0}>
                      <Badge className="rounded-full bg-foreground/10 text-foreground">
                        {isAmoled
                          ? language.data.common.enabled
                          : language.data.common.disabled}
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      {isAmoled
                        ? language.data.common.enabled_description
                        : language.data.common.disabled_description}
                    </TooltipContent>
                  </Tooltip>
                  {isAmoled && !isCurrentlyDark && (
                    <Tooltip>
                      <TooltipTrigger delay={0}>
                        <WarningIcon
                          weight="bold"
                          className="mt-1 text-amber-400"
                        />
                      </TooltipTrigger>
                      <TooltipContent>
                        {language.data.app.setting.layout.amoled_black.warning}
                      </TooltipContent>
                    </Tooltip>
                  )}
                </div>
              </FieldTitle>
              <FieldDescription className="pt-1">
                {language.data.app.setting.layout.amoled_black.description}
              </FieldDescription>
            </FieldContent>
            <Switch
              id="switch-share"
              data-smooth-interaction="true"
              className="group-active/label:scale-80"
              onCheckedChange={setAmoled}
              checked={isAmoled}
            />
          </Field>
        </FieldLabel>
      </FieldGroup>
    </section>
  )
}

export default Theme
