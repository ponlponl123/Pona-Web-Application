"use client"
import React from "react"
import {
  ConfettiIcon,
  FishSimpleIcon,
  PlantIcon,
} from "@phosphor-icons/react/dist/ssr"
import { useLanguageContext } from "@/contexts/languageContext"
import MyButton from "@/components/ui/custom/button"
import Link from "next/link"

function NotFound() {
  const { language } = useLanguageContext()
  return (
    <main className="min-h-screen w-full">
      <div className="grid min-h-screen grid-rows-[20px_1fr_20px] items-center justify-items-center gap-16 p-8 pb-20 sm:p-20">
        <main className="row-start-2 flex w-full max-w-screen-sm flex-row items-center justify-center gap-10 max-sm:flex-col">
          <FishSimpleIcon fontSize={64} />
          <div className="flex max-w-3xl flex-col items-center gap-2 sm:items-start">
            <h1 className="text-3xl font-bold max-sm:text-center">
              {language.data.not_found.title}
            </h1>
            <p className="text-lg max-sm:text-center">
              {language.data.not_found.description}
            </p>
            <div className="flex flex-wrap max-sm:justify-center sm:gap-3">
              <Link href={"/app"} className="mt-4">
                <MyButton variant="invert" size="medium">
                  <ConfettiIcon />
                  {language.data.not_found.actions.app}
                </MyButton>
              </Link>
              <Link href={"/"} className="mt-4">
                <MyButton variant="invert" size="medium">
                  <PlantIcon />
                  {language.data.not_found.actions.home}
                </MyButton>
              </Link>
            </div>
          </div>
        </main>
      </div>
    </main>
  )
}

export default NotFound
