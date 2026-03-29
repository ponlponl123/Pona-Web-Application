"use client"
import { useLanguageContext } from "@/contexts/languageContext"
import { BugIcon, InfoIcon } from "@phosphor-icons/react"
import { Alert, AlertDescription } from "@/components/ui/alert"

function Developer() {
  const { language } = useLanguageContext()
  return (
    <section
      className="mx-auto flex min-h-full w-full max-w-lg flex-col gap-2 p-6"
      id="dev-zone"
      data-section
    >
      <div className="flex w-full gap-2 max-md:flex-col-reverse md:items-center md:justify-between">
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <h1 className="m-0 text-2xl">
            {language.data.app.setting.dev_mode.title}
          </h1>
          <p className="text-foreground/40">
            {language.data.app.setting.dev_mode.description}
          </p>
        </div>
        <BugIcon weight="fill" className="size-12 translate-y-1.5" />
      </div>
      <Alert className="mt-4 rounded-xl">
        <InfoIcon weight="fill" className="mt-0.5" />
        <AlertDescription className="tracking-wider">
          {language.data.app.setting.dev_mode.no_test_element}
        </AlertDescription>
      </Alert>
    </section>
  )
}

export default Developer
