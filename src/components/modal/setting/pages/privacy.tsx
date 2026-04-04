"use client"
import { useAppStore } from "@/store/coreStore"
import { ShieldCheckIcon } from "@phosphor-icons/react"
import Link from "next/link"
import React from "react"

function Privacy() {
  const language = useAppStore((state) => state.language)
  return (
    <section
      className="mx-auto flex min-h-full w-full max-w-lg flex-col gap-2 p-6"
      id="privacy"
      data-section
    >
      <div className="flex w-full gap-2 max-md:flex-col-reverse md:justify-between">
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <h1 className="m-0 text-2xl">
            {language.data.app.setting.privacy.title}
          </h1>
          <p className="text-foreground/40">
            {language.data.app.setting.privacy.description
              .split("[read_privacypolicy]")
              .map((text, index) => {
                return index === 0 ? (
                  <React.Fragment key={index}>
                    {text}
                    <Link
                      href="https://law.ponlponl123.com/pona#privacy"
                      target="_blank"
                      className="text-cyan-500"
                    >
                      {language.data.app.setting.privacy.read_privacypolicy}
                    </Link>
                  </React.Fragment>
                ) : (
                  text
                )
              })}
          </p>
        </div>
        <ShieldCheckIcon weight="fill" className="size-12 translate-y-1.5" />
      </div>
    </section>
  )
}

export default Privacy
