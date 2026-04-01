"use client"
import { Button } from "@/components/ui/button"
import MyButton from "@/components/ui/custom/button"
import { useDiscordUserInfo } from "@/contexts/discordUserInfo"
import { useLanguageContext } from "@/contexts/languageContext"
import { cn } from "@/lib/utils"
import {
  HeartIcon,
  NutIcon,
  SmileyWinkIcon,
} from "@phosphor-icons/react/dist/ssr"
import { motion } from "framer-motion"
import Link from "next/link"

function Page() {
  const { language } = useLanguageContext()
  const { userInfo } = useDiscordUserInfo()
  const date = new Date()
  const hours = date.getHours()
  const isNow =
    hours > 4 && hours < 10
      ? "morning"
      : hours > 9 && hours < 16
        ? "afternoon"
        : hours > 9 && hours < 20
          ? "evening"
          : "night"

  return (
    <main id="app-panel" className="relative">
      <div className="pointer-events-none absolute top-0 left-0 h-full w-full bg-[radial-gradient(var(--foreground)_1px,transparent_1px)] bg-size-[16px_16px] opacity-10 dark:opacity-5" />
      <div className="absolute h-screen max-h-96 min-h-36 w-full">
        <div
          className={cn(
            `apphome-banner absolute top-0 left-0 h-screen min-h-36 w-full`,
            isNow,
            "mask-linear-to-black"
          )}
          style={{ maxHeight: "512px" }}
        />
      </div>
      <main id="app-workspace" className="relative z-10">
        <motion.h1
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.32, delay: 0.24 }}
          className="mt-64 mb-4 text-2xl"
        >
          {hours > 4 && hours < 10
            ? language.data.home.welcome_message.morning
            : hours > 9 && hours < 16
              ? language.data.home.welcome_message.afternoon
              : hours > 15 && hours < 20
                ? language.data.home.welcome_message.evening
                : language.data.home.welcome_message.night}
        </motion.h1>
        <motion.h1
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.32, delay: 0.32 }}
          className="flex items-center gap-3 text-6xl font-bold"
        >
          <SmileyWinkIcon weight="fill" size={64} />{" "}
          {language.data.app.home.title.replace(
            "[user]",
            userInfo?.global_name as string
          )}
        </motion.h1>
        <div className="mt-16"></div>
        <div className="mt-4 flex w-full items-start gap-6 p-4 max-lg:flex-wrap">
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.32, delay: 0.48 }}
            className="relative flex w-full flex-col gap-3 overflow-hidden rounded-3xl bg-linear-to-br from-indigo-800/20 to-violet-800/30 p-16 shadow-2xl shadow-indigo-300/10 max-sm:p-8"
          >
            <h1 className="text-4xl font-bold text-white! max-sm:text-2xl">
              Give us a feedback
            </h1>
            <p className="text-white!">
              Help us make Pona! better. Share your suggestions, report issues,
              or tell us what you think.
            </p>
            <div className="mt-4 flex flex-col gap-2">
              <Link href="/app/feedback" className="w-max">
                <Button
                  size="lg"
                  variant="default"
                  className="w-max bg-violet-700 text-white!"
                >
                  Send Feedback
                </Button>
              </Link>
            </div>
            <div className="absolute right-4 bottom-0">
              <HeartIcon
                size={128}
                className="scale-200 rotate-z-25 fill-current text-white! opacity-10"
                weight="fill"
              />
            </div>
          </motion.div>
        </div>
        <div className="flex w-full items-start gap-6 p-4 max-lg:flex-wrap">
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.32, delay: 0.48 }}
            className="from-primary-50/10 to-primary-300/10 shadow-primary-300/10 relative flex w-full flex-col gap-3 overflow-hidden rounded-3xl bg-linear-to-br p-16 shadow-2xl max-sm:p-8"
          >
            <h1 className="text-4xl font-bold max-sm:text-2xl">
              {language.data.app.home.whatnew.title.replace(
                "[version]",
                ("v" + process.env.NEXT_PUBLIC_APP_VERSION) as string
              )}
            </h1>
            <p>{language.data.app.home.whatnew.description}</p>
            <div className="mt-4 flex flex-col gap-2">
              <Link href="/app/updates" className="w-max">
                <MyButton size="small" variant="primary" className="w-max">
                  {language.data.app.home.whatnew.button}
                </MyButton>
              </Link>
            </div>
            <div className="absolute right-4 bottom-4">
              <NutIcon
                size={128}
                className="scale-200 -rotate-z-45 fill-current opacity-10"
                weight="fill"
              />
            </div>
          </motion.div>
        </div>
      </main>
    </main>
  )
}

export default Page
