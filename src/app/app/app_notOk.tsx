"use client"
import MyButton from "@/components/ui/custom/button"
import { useAppStore } from "@/store/coreStore"
import {
  BirdIcon,
  PlugsConnectedIcon,
  PlugsIcon,
} from "@phosphor-icons/react/dist/ssr"
import Link from "next/link"

function App_notOk() {
  const language = useAppStore((state) => state.language)
  return (
    <main className="min-h-dvh w-full">
      <div className="grid min-h-dvh grid-rows-[20px_1fr_20px] items-center justify-items-center gap-16 p-8 pb-20 sm:p-20">
        <main className="row-start-2 flex w-full max-w-3xl flex-row items-center justify-center gap-10 max-sm:flex-col">
          <div className="flex flex-col items-center justify-center gap-3">
            <PlugsIcon fontSize={64} />
            <span className="mt-2 rounded-lg bg-red-500/10 p-1 px-3 text-center whitespace-nowrap">
              ERR: APP_NOT_OK
            </span>
          </div>
          <div className="flex max-w-lg flex-col items-center gap-2 sm:items-start">
            <h1 className="text-3xl font-bold max-sm:text-center">
              {language.data.app_notok.title}
            </h1>
            <p className="text-lg max-sm:text-center">
              {language.data.app_notok.description}
            </p>
            <div className="mt-2 flex flex-wrap max-sm:justify-center sm:gap-3">
              <MyButton
                variant="invert"
                size="medium"
                onClick={() => window.location.reload()}
              >
                <PlugsConnectedIcon />
                {language.data.app_notok.actions.refresh}
              </MyButton>
              <Link href={"https://ponlponl123.com/discord"}>
                <MyButton variant="invert" size="medium">
                  <BirdIcon />
                  {language.data.app_notok.actions.support}
                </MyButton>
              </Link>
            </div>
          </div>
        </main>
      </div>
    </main>
  )
}

export default App_notOk
