"use client"
import { useLanguageContext } from "@/contexts/languageContext"
import { ShapesIcon } from "@phosphor-icons/react"
import Theme from "./theme"

function Developer() {
  const { language } = useLanguageContext()
  return (
    <>
      <section
        className="mx-auto flex w-full max-w-lg flex-col gap-2 p-6"
        id="layout"
        data-section
      >
        <div className="flex w-full gap-2 max-md:flex-col-reverse md:items-center md:justify-between">
          <div className="flex flex-col gap-2">
            <h1 className="m-0 text-2xl">
              {language.data.app.setting.layout.title}
            </h1>
            <p className="text-foreground/40">
              {language.data.app.setting.layout.description}
            </p>
          </div>
          <ShapesIcon weight="fill" className="size-12 translate-y-1.5" />
        </div>
      </section>
      <Theme />
    </>
  )
}

export default Developer
