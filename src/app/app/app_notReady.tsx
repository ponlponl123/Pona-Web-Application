"use client"
import MyButton from "@/components/ui/custom/button"
import { useLanguageContext } from "@/contexts/languageContext"
import {
  BirdIcon,
  CubeIcon,
  PersonSimpleRunIcon,
} from "@phosphor-icons/react/dist/ssr"
import Link from "next/link"

function App_notReady() {
  const { language } = useLanguageContext()
  return (
    <main className="min-h-screen w-full">
      <div className="grid min-h-screen grid-rows-[20px_1fr_20px] items-center justify-items-center gap-16 p-8 pb-20 sm:p-20">
        <main className="row-start-2 flex w-full max-w-4xl flex-row items-center justify-center gap-10 max-sm:flex-col">
          <div className="flex flex-col items-center justify-center gap-3">
            <PersonSimpleRunIcon fontSize={96} />
            <span className="mt-2 rounded-lg bg-red-500/10 p-1 px-3 text-center whitespace-nowrap">
              ERR: APP_NOT_READY
            </span>
          </div>
          <div className="flex max-w-lg flex-col items-center gap-2 sm:items-start">
            <h1 className="text-3xl font-bold max-sm:text-center">
              {language.data.app_notready.title}
            </h1>
            <p className="text-lg max-sm:text-center">
              {language.data.app_notready.description}
            </p>
            <div className="mt-2 flex flex-wrap max-sm:justify-center sm:gap-3">
              <Link href={"https://ponlponl123.com/discord"}>
                <MyButton variant="invert" size="medium">
                  <BirdIcon />
                  {language.data.app_notready.actions.support}
                </MyButton>
              </Link>
              <Link href={"/status"}>
                <MyButton variant="invert" size="medium">
                  <CubeIcon />
                  {language.data.app_notready.actions.status}
                </MyButton>
              </Link>
            </div>
          </div>
        </main>
      </div>
    </main>
  )
}

export default App_notReady
