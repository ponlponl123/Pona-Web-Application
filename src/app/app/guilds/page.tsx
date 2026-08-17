"use client"

import React from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { getCookie } from "cookies-next"
import MyButton from "@/components/ui/custom/button"
import { Button } from "@/components/ui/button"
import { GuildButton } from "@/components/ui/custom/guild/button"
import { useDiscordGuildInfo } from "@/contexts/discordGuildInfo"
import {
  fetchGuilds,
  GuildInfo,
} from "@/lib/server-side-api/discord/fetchGuild"
import { useAppStore } from "@/store/coreStore"
import { Input } from "react-smooth-input"
import {
  ConfettiIcon,
  GhostIcon,
  MagnifyingGlassIcon,
  SquaresFourIcon,
  XIcon,
} from "@phosphor-icons/react/dist/ssr"

function Page(): React.ReactElement {
  const { setCurrentGuild } = useDiscordGuildInfo()
  const language = useAppStore((state) => state.language)

  const [guilds, setGuilds] = React.useState<GuildInfo[] | false | null>(null)
  const [searchQuery, setSearchQuery] = React.useState<string>("")

  const token = getCookie("LOGIN_")
  const tokenType = getCookie("LOGIN_TYPE_")

  React.useEffect(() => {
    let isMounted = true

    async function fetchGuildsFromClient(): Promise<void> {
      const resolvedToken = typeof token === "string" ? token : String(token)
      const resolvedTokenType =
        typeof tokenType === "string" ? tokenType : String(tokenType)

      if (!resolvedToken || !resolvedTokenType) {
        if (isMounted) setGuilds(false)
        return
      }

      try {
        const res = await fetchGuilds(resolvedToken, resolvedTokenType)
        if (isMounted) setGuilds(res)
      } catch {
        if (isMounted) setGuilds(false)
      }
    }

    fetchGuildsFromClient()

    return () => {
      isMounted = false
    }
  }, [token, tokenType])

  const filteredGuilds = React.useMemo(() => {
    if (!Array.isArray(guilds)) return []
    const query = searchQuery.toLowerCase().trim()
    const list = query
      ? guilds.filter(
          (guild) =>
            guild.name.toLowerCase().includes(query) ||
            guild.id.toLowerCase().includes(query)
        )
      : [...guilds]

    // Sort connected guilds to the top (order -1)
    return list.sort((a, b) => (b.isConnected ? 1 : 0) - (a.isConnected ? 1 : 0))
  }, [guilds, searchQuery])

  return (
    <main id="app-panel" className="relative min-h-dvh pb-16">
      <main
        id="app-workspace"
        className="relative z-10 mx-auto w-full max-w-none px-4 pt-12 sm:px-6 lg:px-8"
      >
        <section className="flex flex-col gap-3">
          <motion.div
            initial={{ opacity: 0, filter: "blur(4px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            transition={{ duration: 0.4, delay: 0.05, ease: "easeOut" }}
            className="inline-flex w-max items-center gap-2 rounded-md bg-foreground/10 px-2.5 py-1.5 text-xs font-semibold tracking-wider text-foreground/80 uppercase backdrop-blur-md"
          >
            <span>{language.data.app.guilds.name}</span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, filter: "blur(4px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            transition={{ duration: 0.4, delay: 0.12, ease: "easeOut" }}
            className="flex flex-col gap-2"
          >
            <h1 className="flex items-center gap-3 text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
              <ConfettiIcon weight="fill" className="text-primary" />
              {language.data.app.guilds.title}
            </h1>
            <p className="max-w-2xl text-sm text-foreground/70 sm:text-base">
              {language.data.app.guilds.subtitle}
            </p>
          </motion.div>
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
                {language.data.app.guilds.name}
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
                  placeholder={language.data.app.guilds.search_placeholder}
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
                        style={{ order: guild.isConnected ? -1 : undefined }}
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
                    ? language.data.app.guilds.search_no_results_title
                    : language.data.app.guilds.not_found.title}
                </h3>
                <p className="mt-1 max-w-md text-sm text-foreground/60">
                  {searchQuery
                    ? language.data.app.guilds.search_no_results_desc.replace(
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
                      className="rounded-md border-2"
                      onClick={() => setSearchQuery("")}
                    >
                      {language.data.app.guilds.clear_search}
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
      </main>
    </main>
  )
}

export default Page
