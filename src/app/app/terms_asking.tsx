"use client"
import BorderGlow from "@/components/BorderGlow"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useAppStore } from "@/store/coreStore"
import { PersonSimpleHikeIcon } from "@phosphor-icons/react"
import { setCookie } from "cookies-next/client"
import { motion } from "motion/react"
import Link from "next/link"

function TermsAsking() {
  const language = useAppStore((state) => state.language)

  return (
    <div className="relative flex min-h-screen w-full flex-col items-start justify-center gap-3 py-24 text-center">
      <div className="pointer-events-none absolute top-0 left-0 h-full w-full bg-[radial-gradient(var(--foreground)_1px,transparent_1px)] bg-size-[16px_16px] opacity-10 dark:opacity-5" />
      <motion.div
        initial={{ opacity: 0, y: 3, filter: "blur(6px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        exit={{ opacity: 0, y: -3, filter: "blur(6px)" }}
        transition={{
          delay: 0.48,
          duration: 1,
          ease: "easeOut",
        }}
        className="m-auto"
      >
        <BorderGlow
          edgeSensitivity={30}
          glowColor="40 80 80"
          backgroundColor="var(--card)"
          borderRadius={28}
          glowRadius={40}
          glowIntensity={1}
          coneSpread={25}
          animated={false}
          colors={["#c084fc", "#f472b6", "#38bdf8"]}
        >
          <div className="flex max-w-md flex-col items-center justify-center gap-3 p-6">
            <PersonSimpleHikeIcon className="mb-2 size-12" />
            <h1 className="text-3xl font-bold">
              {language.data.terms_asking.title}
            </h1>
            <p className="font text-foreground/40">
              {language.data.terms_asking.description
                .split("{terms}")
                .map((text, i) =>
                  i === 1 ? (
                    <Link
                      target="_blank"
                      href="https://law.ponlponl123.com/pona"
                      key={i}
                      className="text-cyan-400"
                    >
                      {language.data.terms_asking.terms_label}
                    </Link>
                  ) : (
                    <span key={i}>{text}</span>
                  )
                )}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Link href={"/"} tabIndex={-1}>
                <Tooltip>
                  <TooltipTrigger
                    delay={320}
                    data-smooth-interaction="true"
                    className="h-8 rounded-full px-4 py-1 text-sm hover:bg-foreground/10 dark:hover:bg-foreground/5"
                  >
                    {language.data.terms_asking.actions.cancel}
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    {language.data.terms_asking.cancel_tooltip}
                  </TooltipContent>
                </Tooltip>
              </Link>
              <Button
                className="rounded-full px-4 py-1 text-sm"
                data-smooth-interaction="true"
                onClick={() => {
                  setCookie("TERMS_ACCEPTED", "1")
                  window.location.reload()
                }}
              >
                {language.data.terms_asking.actions.accept}
              </Button>
            </div>
          </div>
        </BorderGlow>
      </motion.div>
    </div>
  )
}

export default TermsAsking
