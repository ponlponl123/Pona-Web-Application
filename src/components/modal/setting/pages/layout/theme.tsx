"use client"
import { Badge } from "@/components/ui/badge"
import { useThemeContext } from "@/components/theme-provider"
import { ThemeDot, ThemePreview } from "@/components/ui/custom/theme"
import { useLanguageContext } from "@/contexts/languageContext"
import { darkThemes, lightThemes, themes } from "@/consts/theme"
import { UAParser } from "ua-parser-js"
import {
  AndroidLogoIcon,
  AppleLogoIcon,
  GoogleChromeLogoIcon,
  HouseLineIcon,
  LightbulbIcon,
  LinuxLogoIcon,
  PaintBrushIcon,
  WarningIcon,
  WindowsLogoIcon,
} from "@phosphor-icons/react"
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
import { cn } from "@/lib/utils"
import React from "react"

function Theme() {
  const { theme, setTheme } = useTheme()
  const { appTheme, isAmoled, isCurrentlyDark, setAppTheme, setAmoled } =
    useThemeContext()
  const { language } = useLanguageContext()
  const [osType, setOsType] = React.useState<UAParser.IOS | undefined>(
    undefined
  )

  React.useEffect(() => {
    const parser = new UAParser()
    const os = parser.getOS()

    setOsType(os)
  }, [])

  return (
    <>
      <section
        className="mx-auto flex w-full max-w-lg flex-col gap-2 px-6"
        id="layout-theme"
        data-section
      >
        <div className="mx-auto mb-2 flex w-full max-w-lg gap-2 max-md:flex-col-reverse md:items-center md:justify-between">
          <div className="flex flex-col">
            <h1 className="m-0 text-2xl">
              {language.data.app.setting.layout.theme.title}
            </h1>
            <p className="text-foreground/40">
              {language.data.app.setting.layout.theme.description}
            </p>
          </div>
          <HouseLineIcon weight="fill" className="size-6 translate-y-1.5" />
        </div>
        {theme !== "custom" && theme === "system" ? (
          <div className="mx-auto w-full max-w-lg rounded-4xl border-2 border-primary p-1">
            <Badge className="m-1 rounded-full bg-primary/10 text-primary">
              <PaintBrushIcon className="mr-1" weight="fill" />
              {language.data.app.setting.layout.theme.title}
            </Badge>
            <ThemePreview theme={appTheme} className="mt-2" />
            <div className="mt-2 flex gap-1">
              <div className="flex flex-wrap items-center gap-2 rounded-3xl bg-foreground/5 p-1">
                {themes.map((collectedTheme, index) => (
                  <Tooltip data-theme={collectedTheme.name} key={index}>
                    <TooltipTrigger
                      data-theme={collectedTheme.name}
                      className={cn(
                        `theme-dot interactive hover:opacity-100 active:scale-90`,
                        isCurrentlyDark ? "dark" : "light",
                        appTheme === collectedTheme.name
                          ? "active"
                          : "scale-90 opacity-60 hover:scale-95 active:scale-80"
                      )}
                      delay={0}
                      data-smooth-interaction="true"
                      onClick={() => {
                        setAppTheme(collectedTheme.name)
                        setTheme("system")
                      }}
                    >
                      <div>
                        <div></div>
                        <div></div>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className={`z-10 capitalize`}>
                      {[collectedTheme.light, collectedTheme.dark]
                        .join(" / ")
                        .replaceAll(/[-_]/g, " ")}
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>
            </div>
          </div>
        ) : theme !== "custom" && theme !== "system" ? (
          <div className="mx-auto w-full max-w-lg rounded-4xl border-2 border-primary p-1">
            <Badge className="m-1 rounded-full bg-primary/10 text-primary">
              <PaintBrushIcon className="mr-1" weight="fill" />
              {language.data.app.setting.layout.theme.title}
            </Badge>
            <ThemePreview theme={appTheme} className="mt-2" />
            <div className="mt-2 flex gap-1">
              <div className="flex flex-wrap content-start items-center gap-x-2 rounded-3xl bg-foreground/5 p-1">
                <span className="ml-2 text-xs text-foreground/40">
                  {language.data.app.setting.layout.theme.light}
                </span>
                {lightThemes.map((collectedTheme, index) => (
                  <ThemeDot
                    key={index}
                    theme={collectedTheme}
                    isDark={false}
                    active={
                      appTheme === collectedTheme.name && theme === "light"
                    }
                    onClick={() => {
                      setAppTheme(collectedTheme.name)
                      setTheme("light")
                    }}
                  />
                ))}
              </div>
              <div className="flex flex-wrap content-start items-center gap-x-2 rounded-3xl bg-foreground/5 p-1">
                <span className="ml-2 text-xs text-foreground/40">
                  {language.data.app.setting.layout.theme.dark}
                </span>
                {darkThemes.map((collectedTheme, index) => (
                  <ThemeDot
                    key={index}
                    theme={collectedTheme}
                    isDark={true}
                    active={
                      appTheme === collectedTheme.name && theme === "dark"
                    }
                    onClick={() => {
                      setAppTheme(collectedTheme.name)
                      setTheme("dark")
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="mx-auto w-full max-w-lg rounded-4xl border-2 border-primary p-1">
            <Badge className="m-1 rounded-full bg-primary/10 text-primary">
              <PaintBrushIcon className="mr-1" weight="fill" />
              {language.data.app.setting.layout.theme.title}
            </Badge>
            <ThemePreview theme={appTheme} className="mt-2" />
            <div className="mt-2 flex gap-1">
              <div className="flex flex-wrap items-center gap-2 rounded-3xl bg-foreground/5 p-1">
                <span className="ml-2 text-xs text-foreground/40">
                  {language.data.app.setting.layout.theme.light}
                </span>
                {lightThemes.map((collectedTheme, index) => (
                  <ThemeDot
                    key={index}
                    theme={collectedTheme}
                    isDark={false}
                    active={
                      appTheme === collectedTheme.name && !isCurrentlyDark
                    }
                    onClick={() => {
                      setAppTheme(collectedTheme.name)
                      setTheme("light")
                    }}
                  />
                ))}
              </div>
              <div className="flex flex-wrap items-center gap-2 rounded-3xl bg-foreground/5 p-1">
                <span className="ml-2 text-xs text-foreground/40">
                  {language.data.app.setting.layout.theme.dark}
                </span>
                {darkThemes.map((collectedTheme, index) => (
                  <ThemeDot
                    key={index}
                    theme={collectedTheme}
                    isDark={true}
                    active={appTheme === collectedTheme.name && isCurrentlyDark}
                    onClick={() => {
                      setAppTheme(collectedTheme.name)
                      setTheme("dark")
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
        <div className="mx-auto mt-2 flex w-full max-w-lg gap-2 max-md:flex-col-reverse md:items-center md:justify-between">
          <div className="flex flex-col">
            <p className="text-foreground/40">
              {language.data.app.setting.layout.theme.option}
            </p>
          </div>
        </div>
      </section>
      <section
        className="mx-auto flex w-full max-w-lg flex-col gap-2 p-6"
        id="amoled-black"
        data-section
      >
        <FieldGroup className="mx-auto w-full max-w-lg gap-2">
          <FieldLabel
            htmlFor="theme-sync"
            className="group/label rounded-xl! border-2! pl-1 not-data-active:border-border/40 hover:scale-101 hover:bg-foreground/5 active:scale-96"
            data-smooth-interaction="true"
          >
            <Field orientation="horizontal">
              <FieldContent>
                <FieldTitle className="text-base">
                  <div className="flex flex-wrap items-center gap-x-2">
                    {osType?.name?.includes("Windows") ? (
                      <WindowsLogoIcon
                        weight="fill"
                        className="-mr-0.5 size-4 translate-y-0.5"
                      />
                    ) : osType?.name?.includes("macOS") ||
                      osType?.name?.includes("iOS") ||
                      osType?.name?.includes("iOS") ? (
                      <AppleLogoIcon
                        weight="fill"
                        className="-mr-0.5 size-4 translate-y-0.5"
                      />
                    ) : osType?.name?.includes("Android") ? (
                      <AndroidLogoIcon
                        weight="fill"
                        className="-mr-0.5 size-4 translate-y-0.5"
                      />
                    ) : osType?.name?.includes("Chrome") ? (
                      <GoogleChromeLogoIcon
                        weight="fill"
                        className="-mr-0.5 size-4 translate-y-0.5"
                      />
                    ) : osType?.is("Linux") ? (
                      <LinuxLogoIcon
                        weight="fill"
                        className="-mr-0.5 size-4 translate-y-0.5"
                      />
                    ) : (
                      <></>
                    )}
                    <h1>{language.data.app.setting.layout.theme_sync.title}</h1>
                    <Tooltip>
                      <TooltipTrigger delay={0}>
                        <Badge className="rounded-full bg-foreground/10 text-foreground">
                          {theme === "system"
                            ? language.data.common.enabled
                            : language.data.common.disabled}
                        </Badge>
                      </TooltipTrigger>
                      <TooltipContent>
                        {theme === "system"
                          ? language.data.common.enabled_description
                          : language.data.common.disabled_description}
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </FieldTitle>
                <FieldDescription className="pt-1">
                  {language.data.app.setting.layout.theme_sync.description}
                </FieldDescription>
              </FieldContent>
              <Switch
                id="theme-sync"
                data-smooth-interaction="true"
                className="group-active/label:scale-80"
                onCheckedChange={(e) =>
                  setTheme(e ? "system" : isCurrentlyDark ? "dark" : "light")
                }
                checked={theme === "system"}
              />
            </Field>
          </FieldLabel>
          <FieldLabel
            htmlFor="amoled-black-switch"
            className="group/label rounded-xl! border-2! pl-1 not-data-active:border-border/40 hover:scale-101 hover:bg-foreground/5 active:scale-96"
            data-smooth-interaction="true"
          >
            <Field orientation="horizontal">
              <FieldContent>
                <FieldTitle className="text-base">
                  <div className="flex flex-wrap items-center gap-x-2">
                    <LightbulbIcon
                      weight={isAmoled ? "bold" : "fill"}
                      className="-mr-0.5 size-4 translate-y-0.5"
                    />
                    <h1>
                      {language.data.app.setting.layout.amoled_black.title}
                    </h1>
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
                          {
                            language.data.app.setting.layout.amoled_black
                              .warning
                          }
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
                id="amoled-black-switch"
                data-smooth-interaction="true"
                className="group-active/label:scale-80"
                onCheckedChange={setAmoled}
                checked={isAmoled}
              />
            </Field>
          </FieldLabel>
        </FieldGroup>
      </section>
    </>
  )
}

export default Theme
