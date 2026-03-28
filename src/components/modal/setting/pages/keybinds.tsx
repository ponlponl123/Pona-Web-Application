"use client"
import { useLanguageContext } from "@/contexts/languageContext"
import { InfoIcon, KeyboardIcon } from "@phosphor-icons/react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

function KeyBinds() {
  const { language } = useLanguageContext()
  return (
    <section
      className="mx-auto flex min-h-full w-full max-w-lg flex-col gap-2 p-6"
      id="time-format"
      data-section
    >
      <div className="flex w-full gap-2 max-md:flex-col-reverse md:items-center md:justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="m-0 text-2xl">
            {language.data.app.setting.keybinds.title}
          </h1>
          <p className="text-foreground/40">
            {language.data.app.setting.keybinds.description}
          </p>
        </div>
        <KeyboardIcon weight="fill" className="size-12 translate-y-1.5" />
      </div>
      <Alert className="mt-4 rounded-xl">
        <InfoIcon weight="fill" className="mt-0.5" />
        <AlertDescription className="tracking-wider">
          {language.data.app.setting.keybinds.announcement}
        </AlertDescription>
      </Alert>
      <div
        className="flex flex-col gap-4"
        id="keybinds-list"
        data-section
      ></div>
    </section>
  )
}

export default KeyBinds
