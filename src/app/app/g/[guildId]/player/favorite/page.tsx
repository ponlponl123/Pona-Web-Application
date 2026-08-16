"use client"

import React, {
  useState,
  useEffect,
  useMemo,
  useTransition,
  useRef,
} from "react"
import Link from "next/link"
import Image from "next/image"
import { getCookie } from "cookies-next"
import { motion, AnimatePresence } from "framer-motion"
import { Input } from "react-smooth-input"
import {
  Heart,
  UserCheck,
  SortAscending,
  Clock,
  MusicNotes,
  Flame,
} from "@phosphor-icons/react/dist/ssr"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useDiscordGuildInfo } from "@/contexts/discordGuildInfo"
import { useAppStore } from "@/store/coreStore"
import { extractArtistInfo } from "@/lib/artist"
import { resolveThumbnailUrl } from "@/lib/image"
import {
  fetchSubscribedChannels,
  SubscribedChannelsResult,
} from "@/lib/server-side-api/internal/channel"
import {
  fetchHistoryStats,
  HistoryStats,
} from "@/lib/server-side-api/internal/history"
import { cn } from "@/lib/utils"
import { ArtistDetailed } from "@/types/youtube/ytmusic"
import { AutoHeight } from "@/components/animate-ui/primitives/effects/auto-height"
import { AnimateIcon } from "@/components/animate-ui/icons/icon"
import { Search } from "@/components/animate-ui/icons/search"

interface PageArtistCardProps {
  artistId?: string
  name: string
  thumbnail: string | null
  guildId?: string
  badge?: string
  count?: number
  rank?: number
  href?: string
}

const PageArtistCard = React.memo(function PageArtistCard({
  artistId,
  name,
  thumbnail,
  guildId,
  badge,
  count,
  rank,
  href: customHref,
}: PageArtistCardProps) {
  const targetHref =
    customHref ||
    (guildId && artistId
      ? `/app/g/${guildId}/player/c?c=${artistId}`
      : guildId
        ? `/app/g/${guildId}/player/search?q=${encodeURIComponent(name)}`
        : "#")

  return (
    <div className="group relative w-full">
      <Link
        href={targetHref}
        className="block no-underline"
        data-smooth-interaction="true"
      >
        <div className="flex w-full cursor-pointer flex-col items-center gap-2.5 rounded-2xl p-3.5 text-center transition-colors duration-200 hover:bg-secondary/10 hover:backdrop-blur-sm">
          <div className="relative aspect-square w-full rounded-full border-2 border-transparent bg-linear-to-br from-primary/10 via-secondary/10 to-accent/10 shadow-sm transition-colors duration-200 group-hover:border-primary/40">
            {thumbnail ? (
              <Image
                src={thumbnail}
                alt={name}
                fill
                className="pointer-events-none rounded-full object-cover transition-transform duration-300 select-none group-hover:scale-105"
                sizes="(max-width: 640px) 30vw, (max-width: 1024px) 20vw, 12vw"
                unoptimized
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-primary/20 via-secondary to-accent/20 text-xl font-bold text-foreground uppercase">
                {name?.[0] ?? "?"}
              </div>
            )}
            {rank !== undefined && (
              <div
                className={cn(
                  "absolute top-1 left-1 flex h-5 w-5 items-center justify-center rounded-full border text-[10px] font-bold shadow-xs",
                  rank === 1
                    ? "border-amber-400 bg-amber-500 text-black"
                    : rank === 2
                      ? "border-border/60 bg-secondary text-foreground"
                      : rank === 3
                        ? "border-orange-500/60 bg-orange-600/80 text-white"
                        : "border-border/40 bg-background/90 text-muted-foreground"
                )}
              >
                {rank}
              </div>
            )}
          </div>

          <div className="w-full min-w-0">
            <p className="truncate text-xs leading-tight font-semibold text-foreground transition-colors group-hover:text-primary">
              {name}
            </p>
            {badge && (
              <p className="mt-0.5 truncate text-[10px] text-muted-foreground">
                {badge}
                {count !== undefined && (
                  <span className="ml-1 text-muted-foreground/70">
                    · {count}
                  </span>
                )}
              </p>
            )}
            {count !== undefined && !badge && (
              <p className="mt-0.5 text-[10px] text-muted-foreground tabular-nums">
                {count} plays
              </p>
            )}
          </div>
        </div>
      </Link>
    </div>
  )
})

function Page() {
  const [artists, setArtists] = useState<SubscribedChannelsResult[]>([])
  const [stats, setStats] = useState<HistoryStats | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [sortBy, setSortBy] = useState<"recent" | "name">("recent")
  const [visibleCount, setVisibleCount] = useState<number>(32)
  const [, startTransition] = useTransition()
  const observerRef = useRef<HTMLDivElement | null>(null)

  const language = useAppStore((state) => state.language)
  const { guild } = useDiscordGuildInfo()

  useEffect(() => {
    let isMounted = true
    const load = async () => {
      setLoading(true)
      const tokenType = String(getCookie("LOGIN_TYPE_"))
      const token = String(getCookie("LOGIN_"))

      if (!tokenType || !token) {
        if (isMounted) setLoading(false)
        return
      }

      const [channelsRes, statsRes] = await Promise.all([
        fetchSubscribedChannels(tokenType, token, "all"),
        fetchHistoryStats(tokenType, token),
      ])

      if (isMounted) {
        if (channelsRes && Array.isArray(channelsRes)) setArtists(channelsRes)
        if (statsRes && statsRes.stats) setStats(statsRes.stats)
        setLoading(false)
      }
    }
    load()
    return () => {
      isMounted = false
    }
  }, [])

  const parsedArtists = useMemo(() => {
    return artists.map((item) => {
      const extracted = extractArtistInfo(item)
      const artistDetailed: ArtistDetailed = {
        artistId: item.artistId || extracted.artistId,
        name: extracted.name,
        thumbnails: extracted.thumbnails as ArtistDetailed["thumbnails"],
        type: "ARTIST",
      }
      const thumbnail = resolveThumbnailUrl(artistDetailed)
      return { raw: item, extracted: artistDetailed, thumbnail }
    })
  }, [artists])

  const filteredArtists = useMemo(() => {
    let list = [...parsedArtists]
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      list = list.filter((a) => a.extracted.name.toLowerCase().includes(q))
    }
    if (sortBy === "name") {
      list.sort((a, b) => a.extracted.name.localeCompare(b.extracted.name))
    }
    return list
  }, [parsedArtists, searchQuery, sortBy])

  const visibleArtists = useMemo(
    () => filteredArtists.slice(0, visibleCount),
    [filteredArtists, visibleCount]
  )

  useEffect(() => {
    if (loading) return
    const target = observerRef.current
    if (!target) return

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisibleCount((prev) => prev + 24)
        }
      },
      { rootMargin: "400px" }
    )
    io.observe(target)
    return () => io.disconnect()
  }, [loading, visibleCount, filteredArtists.length])

  const enrichedTopArtists = useMemo(() => {
    if (!stats?.topArtists || !Array.isArray(stats.topArtists)) return []

    return stats.topArtists.slice(0, 10).map((entry) => {
      const cleanName = entry.name.trim()
      const lowerName = cleanName.toLowerCase()

      const matchedSub = parsedArtists.find((a) => {
        const subName = a.extracted.name.toLowerCase()
        return (
          subName === lowerName ||
          subName.includes(lowerName) ||
          lowerName.includes(subName)
        )
      })

      const artistId = matchedSub?.extracted.artistId || entry.artistId
      const rawThumb = matchedSub?.thumbnail || entry.thumbnail

      let thumbnail: string | null = null
      if (rawThumb) {
        if (
          rawThumb.startsWith("/api/proxy") ||
          rawThumb.startsWith("blob:") ||
          rawThumb.startsWith("http")
        ) {
          thumbnail =
            rawThumb.startsWith("http") && !rawThumb.includes("/api/proxy")
              ? `/api/proxy/image?r=${encodeURIComponent(rawThumb)}&s=192`
              : rawThumb
        } else {
          thumbnail = resolveThumbnailUrl({ thumbnails: [{ url: rawThumb }] }, 192)
        }
      }

      const href = guild?.id
        ? artistId
          ? `/app/g/${guild.id}/player/c?c=${artistId}`
          : `/app/g/${guild.id}/player/search?q=${encodeURIComponent(cleanName)}`
        : "#"

      return {
        name: cleanName,
        count: entry.count,
        artistId,
        thumbnail,
        href,
      }
    })
  }, [stats, parsedArtists, guild])

  const fav = language.data.app.guilds.player.favorite

  return (
    <div className="mx-auto mt-8 flex w-full max-w-6xl flex-col gap-10 px-4 pb-[16vh] text-foreground antialiased md:mt-12 md:px-6">
      <motion.div
        initial={{ opacity: 0, filter: "blur(2px)" }}
        animate={{ opacity: 1, filter: "blur(0px)" }}
        transition={{ duration: 0.44, delay: 0, ease: "easeOut" }}
        className="z-10 flex flex-col items-start justify-between gap-4 rounded-xl bg-card/40 p-4 backdrop-blur-lg sm:flex-row sm:items-center"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center">
            <Heart size={24} weight="fill" className="text-rose-500" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-foreground">
                {fav.favorite_tracks_coming_soon_title ??
                  "Track Favorites Coming Soon"}
              </span>
            </div>
            <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
              {fav.favorite_tracks_coming_soon_desc ??
                "Track favorites are on their way."}
            </p>
          </div>
        </div>
        <Link href="/app/updates" className="shrink-0">
          <Button
            variant="secondary"
            size="sm"
            className="h-8 gap-1.5 rounded-md text-xs"
            data-smooth-interaction="true"
          >
            {language.data.app.updates.follow ?? "Updates"}
          </Button>
        </Link>
      </motion.div>

      <AutoHeight className="z-10">
        {loading ? (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <Skeleton className="h-6 w-6 rounded" />
              <Skeleton className="h-6 w-52" />
            </div>
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-10">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="flex flex-col items-center gap-2 p-3">
                  <Skeleton className="aspect-square w-full rounded-full" />
                  <Skeleton className="h-3 w-3/4" />
                </div>
              ))}
            </div>
          </div>
        ) : enrichedTopArtists.length > 0 ? (
          <div className="flex flex-col gap-4">
            <motion.div
              initial={{ opacity: 0, filter: "blur(2px)" }}
              animate={{ opacity: 1, filter: "blur(0px)" }}
              transition={{ duration: 0.44, delay: 0.08, ease: "easeOut" }}
            >
              <h2 className="flex items-center gap-2 text-xl font-bold tracking-tight">
                <Flame size={22} weight="fill" className="text-amber-500" />
                {fav.top_artists_this_month ?? "Top Artists This Month"}
              </h2>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {fav.top_artists_desc ??
                  "Your most-listened creators over the past 30 days."}
              </p>
            </motion.div>

            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-10">
              {enrichedTopArtists.map((entry, idx) => {
                const row = Math.floor(idx / 5)
                const col = idx % 5
                const delay = 0.16 + (row + col) * 0.08

                return (
                  <motion.div
                    key={`${entry.name}-${idx}`}
                    initial={{ opacity: 0, filter: "blur(2px)" }}
                    animate={{ opacity: 1, filter: "blur(0px)" }}
                    exit={{ opacity: 0, filter: "blur(2px)" }}
                    transition={{ duration: 0.42, delay, ease: "easeOut" }}
                  >
                    <PageArtistCard
                      artistId={entry.artistId}
                      name={entry.name}
                      thumbnail={entry.thumbnail}
                      rank={idx + 1}
                      count={entry.count}
                      href={entry.href}
                    />
                  </motion.div>
                )
              })}
            </div>
          </div>
        ) : null}
      </AutoHeight>

      <div className="z-10 flex flex-col gap-5">
        <div className="flex flex-col justify-between gap-4 border-b border-border/30 pb-5 md:flex-row md:items-end">
          <motion.div
            initial={{ opacity: 0, filter: "blur(2px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            transition={{ duration: 0.44, delay: 0.44, ease: "easeOut" }}
          >
            <h2 className="flex items-center gap-2.5 text-xl font-bold tracking-tight">
              <UserCheck size={22} weight="bold" />
              {fav.subscribed_artists_title ?? "Subscribed Artists"}
              {!loading && (
                <span className="rounded-full border border-border/40 bg-secondary px-2 py-0.5 text-xs font-normal tracking-wider text-muted-foreground">
                  {(fav.total_artists ?? "[count] Artists").replace(
                    "[count]",
                    String(artists.length)
                  )}
                </span>
              )}
            </h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {fav.subscribed_artists_desc ??
                "Your favorite music creators and subscribed channels."}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, filter: "blur(2px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            transition={{ duration: 0.44, delay: 0.52, ease: "easeOut" }}
            className="flex w-full flex-wrap items-center gap-2 md:w-auto"
          >
            <div className="relative flex-1 md:w-60">
              <AnimateIcon className="w-full" animateOnHover>
                <Input
                  name="search-fav-artists"
                  type="text"
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck={false}
                  startContent={<Search className="mr-1 size-4" />}
                  placeholder={
                    fav.search_artists ?? "Search subscribed artists..."
                  }
                  fontStyle={{
                    fontFamily:
                      "var(--font-ponlponl123-article), var(--font-sn-sanafon-maru-j30), sans-serif",
                    fontWeight: "bold",
                    fontSize: "14px",
                    letterSpacing: "1px",
                  }}
                  value={searchQuery}
                  maxLength={512}
                  onChange={(e) => {
                    const val = e.target.value
                    startTransition(() => setSearchQuery(val))
                    setVisibleCount(24)
                  }}
                  className={cn(
                    "pona-music-searchbox w-full rounded-xl backdrop-blur-xl"
                  )}
                />
              </AnimateIcon>
            </div>

            <div className="flex items-center rounded-xl border-2 border-default-foreground/5 bg-default-foreground/10 p-0.5 backdrop-blur-sm">
              <button
                type="button"
                onClick={() => {
                  setSortBy("recent")
                  setVisibleCount(24)
                }}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all",
                  sortBy === "recent"
                    ? "bg-secondary text-secondary-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Clock size={12} />
                {fav.sort_recent ?? "Recent"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setSortBy("name")
                  setVisibleCount(24)
                }}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all",
                  sortBy === "name"
                    ? "bg-secondary text-secondary-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <SortAscending size={12} />
                {fav.sort_name ?? "Name"}
              </button>
            </div>
          </motion.div>
        </div>

        <AutoHeight>
          {loading ? (
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8">
              {Array.from({ length: 24 }).map((_, i) => (
                <div key={i} className="flex flex-col items-center gap-2 p-4">
                  <Skeleton className="aspect-square w-full rounded-full" />
                  <Skeleton className="h-3 w-3/4" />
                  <Skeleton className="h-2.5 w-1/2" />
                </div>
              ))}
            </div>
          ) : filteredArtists.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-border/30 bg-card/20 py-16 text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl border border-border/30 bg-secondary text-muted-foreground">
                <MusicNotes size={22} />
              </div>
              <h3 className="text-sm font-semibold">
                {searchQuery
                  ? (language.data.app.guilds.player.history.no_results.title ??
                    "No matching artists")
                  : (fav.no_subscriptions_title ?? "No subscribed artists yet")}
              </h3>
              <p className="mt-1 max-w-xs text-xs leading-relaxed text-muted-foreground">
                {searchQuery
                  ? (
                      language.data.app.guilds.player.history.no_results
                        .description ?? 'No results for "[query]".'
                    ).replace("[query]", searchQuery)
                  : (fav.no_subscriptions_desc ??
                    "Subscribe to artists while listening to see them here.")}
              </p>
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSearchQuery("")}
                  className="mt-3 h-7 rounded-md text-xs underline"
                >
                  {language.data.app.guilds.player.history.no_results
                    .clear_search ?? "Clear Search"}
                </Button>
              )}
            </div>
          ) : (
            <>
              <motion.div
                layout
                className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8"
              >
                <AnimatePresence mode="popLayout">
                  {visibleArtists.map((item, idx) => {
                    const row = Math.floor(idx / 6)
                    const col = idx % 6
                    const delay = 0.6 + (row + col) * 0.08

                    return (
                      <motion.div
                        key={item.extracted.artistId}
                        layout
                        initial={{ opacity: 0, filter: "blur(2px)" }}
                        animate={{ opacity: 1, filter: "blur(0px)" }}
                        exit={{ opacity: 0, filter: "blur(2px)" }}
                        transition={{ duration: 0.42, delay, ease: "easeOut" }}
                      >
                        <PageArtistCard
                          artistId={item.extracted.artistId}
                          name={item.extracted.name}
                          thumbnail={item.thumbnail}
                          guildId={guild?.id}
                          badge={fav.artist_badge ?? "Artist"}
                        />
                      </motion.div>
                    )
                  })}
                </AnimatePresence>
              </motion.div>

              {visibleCount < filteredArtists.length && (
                <div
                  ref={observerRef}
                  className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8"
                >
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div
                      key={i}
                      className="flex flex-col items-center gap-2 p-4"
                    >
                      <Skeleton className="aspect-square w-full rounded-full" />
                      <Skeleton className="h-3 w-3/4" />
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </AutoHeight>
      </div>
    </div>
  )
}

export default Page
