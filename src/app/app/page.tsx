"use client"

import React from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { getCookie } from "cookies-next"
import { Button } from "@/components/ui/button"
import MyButton from "@/components/ui/custom/button"
import { GuildButton } from "@/components/ui/custom/guild/button"
import { useDiscordUserInfo } from "@/contexts/discordUserInfo"
import { useDiscordGuildInfo } from "@/contexts/discordGuildInfo"
import { useAppStore } from "@/store/coreStore"
import {
  fetchGuilds,
  GuildInfo,
} from "@/lib/server-side-api/discord/fetchGuild"
import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  HeartIcon,
  NutIcon,
  SmileyWinkIcon,
  MagnifyingGlassIcon,
  SparkleIcon,
  ConfettiIcon,
  GhostIcon,
  XIcon,
  SquaresFourIcon,
} from "@phosphor-icons/react/dist/ssr"
import { Input } from "react-smooth-input"

function Page(): React.ReactElement {
  const language = useAppStore((state) => state.language)
  const { userInfo } = useDiscordUserInfo()
  const { setCurrentGuild } = useDiscordGuildInfo()

  const [guilds, setGuilds] = React.useState<GuildInfo[] | false | null>(null)
  const [searchQuery, setSearchQuery] = React.useState<string>("")

  const token = getCookie("LOGIN_")
  const tokenType = getCookie("LOGIN_TYPE_")

  const date = new Date()
  const hours = date.getHours()
  const isNow =
    hours > 4 && hours < 10
      ? "morning"
      : hours > 9 && hours < 16
        ? "afternoon"
        : hours > 15 && hours < 20
          ? "evening"
          : "night"

  React.useEffect(() => {
    let isMounted = true

    async function fetchUserGuilds(): Promise<void> {
      const resolvedToken = typeof token === "string" ? token : String(token)
      const resolvedTokenType =
        typeof tokenType === "string" ? tokenType : String(tokenType)

      if (!resolvedToken || !resolvedTokenType) {
        if (isMounted) setGuilds(false)
        return
      }

      try {
        const res = await fetchGuilds(resolvedToken, resolvedTokenType)
        if (isMounted) {
          setGuilds(res)
        }
      } catch (err) {
        if (isMounted) {
          setGuilds(false)
        }
      }
    }

    fetchUserGuilds()

    return () => {
      isMounted = false
    }
  }, [token, tokenType])

  const filteredGuilds = React.useMemo(() => {
    if (!Array.isArray(guilds)) return []
    if (!searchQuery.trim()) return guilds
    const query = searchQuery.toLowerCase().trim()
    return guilds.filter(
      (guild) =>
        guild.name.toLowerCase().includes(query) ||
        guild.id.toLowerCase().includes(query)
    )
  }, [guilds, searchQuery])

  const welcomeGreeting = React.useMemo(() => {
    if (hours > 4 && hours < 10)
      return language.data.home.welcome_message.morning
    if (hours > 9 && hours < 16)
      return language.data.home.welcome_message.afternoon
    if (hours > 15 && hours < 20)
      return language.data.home.welcome_message.evening
    return language.data.home.welcome_message.night
  }, [hours, language])

  return (
    <main id="app-panel" className="relative min-h-screen pb-16">
      <div className="pointer-events-none absolute top-0 left-0 z-0 h-96 w-full overflow-hidden">
        <div
          className={cn(
            "apphome-banner absolute top-0 left-0 h-full w-full mask-linear-to-black opacity-80 backdrop-blur-xl transition-all duration-700",
            isNow
          )}
          style={{ maxHeight: "512px" }}
        />
      </div>

      <main
        id="app-workspace"
        className="relative z-10 mx-auto w-full max-w-none px-4 pt-64 sm:px-6 lg:px-8"
      >
        <section className="mt-12 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-2">
            <motion.div
              initial={{ opacity: 0, filter: "blur(4px)" }}
              animate={{ opacity: 1, filter: "blur(0px)" }}
              transition={{ duration: 0.4, delay: 0.05, ease: "easeOut" }}
              className="inline-flex w-max items-center gap-2 rounded-md bg-foreground/10 px-2.5 py-1.5 text-xs font-semibold tracking-wider text-foreground/80 uppercase backdrop-blur-md"
            >
              <SparkleIcon weight="fill" className="text-amber-400" size={14} />
              <span>{welcomeGreeting}</span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, filter: "blur(4px)" }}
              animate={{ opacity: 1, filter: "blur(0px)" }}
              transition={{ duration: 0.4, delay: 0.12, ease: "easeOut" }}
              className="flex items-center gap-4"
            >
              {userInfo?.avatar ? (
                <div className="relative">
                  <Avatar className="size-16 shadow-xl ring-4 ring-primary/20">
                    <AvatarImage
                      src={`https://cdn.discordapp.com/avatars/${userInfo.id}/${userInfo.avatar}.png`}
                      alt={userInfo.global_name || userInfo.username}
                    />
                    <AvatarFallback className="text-2xl font-bold">
                      {(userInfo.global_name || userInfo.username || "P")
                        .charAt(0)
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="absolute right-0 bottom-0 size-4 rounded-full bg-emerald-500 ring-2 ring-background" />
                </div>
              ) : (
                <SmileyWinkIcon
                  weight="fill"
                  size={56}
                  className="text-primary"
                />
              )}
              <div>
                <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
                  {language.data.app.home.title.replace(
                    "[user]",
                    userInfo?.global_name || userInfo?.username || "Friend"
                  )}
                </h1>
                <p className="mt-1 text-sm text-foreground/70 sm:text-base">
                  {language.data.app.home.subtitle}
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        <section className="mt-12">
          <motion.div
            initial={{ opacity: 0, filter: "blur(4px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            transition={{ duration: 0.4, delay: 0.2, ease: "easeOut" }}
            className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex items-center gap-2">
              <SquaresFourIcon
                size={24}
                weight="bold"
                className="text-primary"
              />
              <h2 className="text-2xl font-bold tracking-tight">
                {language.data.app.home.servers_title}
              </h2>
              {Array.isArray(guilds) && (
                <span className="rounded-sm bg-primary/70 px-2 py-0.5 text-xs font-bold text-primary-foreground">
                  {guilds.length}
                </span>
              )}
            </div>

            {Array.isArray(guilds) && guilds.length > 0 && (
              <div className="relative w-full sm:w-72">
                <Input
                  type="text"
                  placeholder={language.data.app.home.search_placeholder}
                  fontStyle={{
                    fontFamily:
                      "var(--font-ponlponl123-article), var(--font-sn-sanafon-maru-j30), sans-serif",
                    fontWeight: "bold",
                    fontSize: "14px",
                    letterSpacing: "1px",
                  }}
                  startContent={
                    <MagnifyingGlassIcon
                      size={18}
                      weight="bold"
                      className="text-foreground/40"
                    />
                  }
                  endContent={
                    searchQuery && (
                      <Button
                        size={"icon-xs"}
                        variant="ghost"
                        onClick={() => setSearchQuery("")}
                        className="rounded-md text-foreground/40 hover:text-foreground"
                      >
                        <XIcon size={14} />
                      </Button>
                    )
                  }
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            )}
          </motion.div>

          <div className="min-h-48">
            {guilds === null ? (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    className="h-24 w-full animate-pulse rounded-2xl border-2 border-foreground/5 bg-foreground/5 p-4"
                  />
                ))}
              </div>
            ) : filteredGuilds.length > 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
                className="grid grid-cols-1 gap-4 rounded-3xl border-2 border-dashed border-transparent sm:grid-cols-2 lg:grid-cols-3"
              >
                <AnimatePresence mode="popLayout">
                  {filteredGuilds.map((guild, index) => {
                    const uri = `/app/g/${guild.id}`
                    return (
                      <motion.div
                        key={guild.id}
                        initial={{ opacity: 0, filter: "blur(4px)" }}
                        animate={{ opacity: 1, filter: "blur(0px)" }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{
                          duration: 0.35,
                          delay: 0.25 + index * 0.04,
                          ease: "easeOut",
                        }}
                      >
                        <GuildButton
                          guild={guild}
                          uri={uri}
                          setCurrentGuild={setCurrentGuild}
                        />
                      </motion.div>
                    )
                  })}
                </AnimatePresence>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, filter: "blur(4px)" }}
                animate={{ opacity: 1, filter: "blur(0px)" }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-foreground/20 bg-foreground/5 p-12 text-center backdrop-blur-xs"
              >
                <GhostIcon size={48} className="mb-3 text-foreground/40" />
                <h3 className="text-xl font-bold">
                  {searchQuery
                    ? language.data.app.home.search_no_results_title
                    : language.data.app.guilds.not_found.title}
                </h3>
                <p className="mt-1 max-w-md text-sm text-foreground/60">
                  {searchQuery
                    ? language.data.app.home.search_no_results_desc.replace(
                        "[query]",
                        searchQuery
                      )
                    : language.data.app.guilds.not_found.description}
                </p>
                <div className="mt-6 flex gap-3">
                  {searchQuery ? (
                    <Button
                      variant="outline"
                      size="sm"
                      className={"rounded-md border-2"}
                      onClick={() => setSearchQuery("")}
                    >
                      {language.data.app.home.clear_search}
                    </Button>
                  ) : (
                    <Link href="/invite" rel="noopener noreferrer">
                      <MyButton
                        size="small"
                        variant="primary"
                        effect="confetti"
                      >
                        <ConfettiIcon weight="fill" />
                        {language.data.header.actions.invite}
                      </MyButton>
                    </Link>
                  )}
                </div>
              </motion.div>
            )}
          </div>
        </section>

        <section className="mt-16 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <motion.div
            initial={{ opacity: 0, filter: "blur(4px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            transition={{ duration: 0.4, delay: 0.42, ease: "easeOut" }}
            className="group relative flex flex-col justify-between overflow-hidden rounded-3xl bg-indigo-500/10 p-8 shadow-xl backdrop-blur-md transition-all duration-300 hover:border-indigo-500/40 hover:shadow-indigo-500/10 dark:border-indigo-500/20 dark:bg-indigo-950/40"
          >
            <div className="relative z-10">
              <div className="mb-4 inline-flex text-indigo-600 dark:text-indigo-300">
                <HeartIcon size={48} weight="fill" />
              </div>
              <h3 className="text-2xl font-bold text-foreground dark:text-white">
                {language.data.app.home.feedback.title}
              </h3>
              <p className="mt-2 text-sm text-foreground/70 dark:text-indigo-100/70">
                {language.data.app.home.feedback.description}
              </p>
            </div>
            <HeartIcon
              size={160}
              className="absolute -right-8 -bottom-8 rotate-12 fill-current text-indigo-500/10 transition-transform duration-500 group-hover:scale-110 dark:text-indigo-400/5"
              weight="fill"
            />
          </motion.div>

          <Link href="/updates">
            <motion.div
              initial={{ opacity: 0, filter: "blur(4px)" }}
              animate={{ opacity: 1, filter: "blur(0px)" }}
              transition={{ duration: 0.4, delay: 0.48, ease: "easeOut" }}
              className="group relative flex flex-col justify-between overflow-hidden rounded-3xl bg-fuchsia-500/10 p-8 shadow-xl backdrop-blur-md transition-all duration-300 hover:border-fuchsia-500/40 hover:shadow-fuchsia-500/10 dark:border-fuchsia-500/20 dark:bg-purple-950/40"
            >
              <div className="relative z-10">
                <div className="mb-4 inline-flex text-fuchsia-600 dark:text-fuchsia-300">
                  <NutIcon size={48} weight="fill" />
                </div>
                <h3 className="text-2xl font-bold text-foreground dark:text-white">
                  {language.data.app.home.whatnew.title.replace(
                    "[version]",
                    `v${process.env.NEXT_PUBLIC_APP_VERSION || "1.0"}`
                  )}
                </h3>
                <p className="mt-2 text-sm text-foreground/70 dark:text-fuchsia-100/70">
                  {language.data.app.home.whatnew.description}
                </p>
              </div>
              <NutIcon
                size={160}
                className="absolute -right-8 -bottom-8 -rotate-45 fill-current text-fuchsia-500/10 transition-transform duration-500 group-hover:scale-110 dark:text-fuchsia-400/5"
                weight="fill"
              />
            </motion.div>
          </Link>

          <Link
            href="/invite"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block"
          >
            <motion.div
              initial={{ opacity: 0, filter: "blur(4px)" }}
              animate={{ opacity: 1, filter: "blur(0px)" }}
              transition={{ duration: 0.4, delay: 0.54, ease: "easeOut" }}
              className="group relative flex flex-col justify-between overflow-hidden rounded-3xl bg-emerald-500/10 p-8 shadow-xl backdrop-blur-md transition-all duration-300 hover:border-emerald-500/40 hover:shadow-emerald-500/10 md:col-span-2 lg:col-span-1 dark:border-emerald-500/20 dark:bg-emerald-950/40"
            >
              <div className="relative z-10">
                <div className="mb-4 inline-flex text-emerald-600 dark:text-emerald-300">
                  <ConfettiIcon size={48} weight="fill" />
                </div>
                <h3 className="text-2xl font-bold text-foreground dark:text-white">
                  {language.data.app.home.invite_card.title}
                </h3>
                <p className="mt-2 text-sm text-foreground/70 dark:text-emerald-100/70">
                  {language.data.app.home.invite_card.description}
                </p>
              </div>
              <SparkleIcon
                size={160}
                className="absolute -right-8 -bottom-8 rotate-12 fill-current text-emerald-500/10 transition-transform duration-500 group-hover:scale-110 dark:text-emerald-400/5"
                weight="fill"
              />
            </motion.div>
          </Link>
        </section>
      </main>
    </main>
  )
}

export default Page
