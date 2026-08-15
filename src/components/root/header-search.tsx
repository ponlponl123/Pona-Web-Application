"use client"

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import { getCookie } from "cookies-next"
import { useAtomValue } from "jotai"
import {
  ClockCounterClockwiseIcon,
  MagnifyingGlassIcon,
} from "@phosphor-icons/react/dist/ssr"
import { Input } from "react-smooth-input"
import { useDiscordGuildInfo } from "@/contexts/discordGuildInfo"
import { fetchSearchHistory } from "@/lib/server-side-api/internal/history"
import { fetchSearchSuggestionResult } from "@/lib/server-side-api/internal/search"
import { cn } from "@/lib/utils"
import { useAppStore } from "@/store/coreStore"
import { navOpenedAtom } from "@/store/uiAtoms"
import { AnimateIcon } from "../animate-ui/icons/icon"
import { Search } from "../animate-ui/icons/search"
import { Button } from "../ui/button"
import { ScrollArea } from "../ui/scroll-area"
import { AutoHeight } from "../animate-ui/primitives/effects/auto-height"

export interface HeaderSearchProps {
  navOpened?: boolean
  className?: string
  containerClassName?: string
  inputClassName?: string
  dropdownClassName?: string
}

export default function HeaderSearch({
  navOpened: propNavOpened,
  className,
  containerClassName,
  inputClassName,
  dropdownClassName,
}: HeaderSearchProps) {
  const router = useRouter()
  const pathname = usePathname() || ""
  const { guild } = useDiscordGuildInfo()
  const language = useAppStore((state) => state.language)
  const globalNavOpened = useAtomValue(navOpenedAtom)

  const navOpened = propNavOpened ?? globalNavOpened

  const searchSuggestionRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const [searching, setSearching] = useState<boolean>(false)
  const [searchValue, setSearchValue] = useState<string>("")
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([])
  const [searchHistory, setSearchHistory] = useState<string[]>([])
  const [fetchedSearchHistory, setFetchedSearchHistory] = useState<boolean>(false)
  const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null)

  const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    if (
      searchSuggestionRef.current &&
      !searchSuggestionRef.current.contains(event.relatedTarget as Node)
    ) {
      setSearching(false)
    }
  }

  const addToSearchHistory = (value: string) => {
    setSearchHistory((prevValue) => {
      const updated = prevValue.includes(value)
        ? prevValue.filter((item) => item !== value)
        : prevValue
      return [value, ...updated.slice(0, 6)]
    })
  }

  useEffect(() => {
    if (searching) {
      const handlePointerDown = (event: PointerEvent) => {
        if (
          searchSuggestionRef.current &&
          !searchSuggestionRef.current.contains(event.target as Node) &&
          searchInputRef.current &&
          !searchInputRef.current.contains(event.target as Node)
        ) {
          setSearching(false)
        }
      }
      window.addEventListener("pointerdown", handlePointerDown)
      return () => {
        window.removeEventListener("pointerdown", handlePointerDown)
      }
    }
  }, [searching])

  const showDropdown =
    searching &&
    (searchHistory.length > 0 ||
      searchSuggestions.length > 0 ||
      searchValue.length > 0)

  if (navOpened) return null

  return (
    <form
      className={cn(
        "flex items-center gap-3",
        className
      )}
      onSubmit={(e) => {
        e.preventDefault()
        const data = Object.fromEntries(new FormData(e.currentTarget))
        const query = data.search?.toString() || ""
        if (query) {
          router.push(
            `/app/g/${guild?.id}/player/search?q=${encodeURIComponent(query)}`
          )
          addToSearchHistory(query)
        }
      }}
    >
      <div
        className={cn(
          "md:w-80 max-md:top-24 max-md:w-[calc(100%-2rem)] max-md:fixed max-md:left-1/2 max-md:max-w-[32vw] max-md:-translate-x-1/2 md:relative [body.pona-player-focused_&]:pointer-events-none [body.pona-player-focused_&]:-translate-y-6 [body.pona-player-focused_&]:opacity-0",
          containerClassName
        )}
      >
        <AnimateIcon animateOnHover>
          <Input
            ref={searchInputRef}
            name="search"
            type="text"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            startContent={
              <Search className="mr-1 size-4 max-md:absolute max-md:scale-75" />
            }
            placeholder={language.data.app.guilds.player.search.search_box}
            fontStyle={{
              fontFamily:
                "var(--font-ponlponl123-article), var(--font-sn-sanafon-maru-j30), sans-serif",
              fontWeight: "bold",
              fontSize: "14px",
              letterSpacing: "1px",
            }}
            value={searchValue}
            maxLength={512}
            onChange={(e) => {
              const val = e.target.value
              setSearching(true)
              setSearchValue(val)
              if (typingTimeout) clearTimeout(typingTimeout)
              setTypingTimeout(
                setTimeout(async () => {
                  if (!val) return setSearchSuggestions([])
                  const accessTokenType = String(getCookie("LOGIN_TYPE_"))
                  const accessToken = String(getCookie("LOGIN_"))
                  if (
                    !accessTokenType ||
                    accessTokenType === "undefined" ||
                    !accessToken ||
                    accessToken === "undefined"
                  ) {
                    return false
                  }

                  const searcher = await fetchSearchSuggestionResult(
                    accessTokenType,
                    accessToken,
                    val
                  )
                  if (searcher) {
                    setSearchSuggestions(searcher.searchSuggestions)
                  } else {
                    setSearchSuggestions([])
                  }
                }, 250)
              )
            }}
            onFocus={async () => {
              setSearching(true)
              if (!fetchedSearchHistory) {
                const accessTokenType = String(getCookie("LOGIN_TYPE_"))
                const accessToken = String(getCookie("LOGIN_"))
                if (
                  !accessTokenType ||
                  accessTokenType === "undefined" ||
                  !accessToken ||
                  accessToken === "undefined"
                ) {
                  return false
                }
                const history = await fetchSearchHistory(
                  accessTokenType,
                  accessToken
                )
                if (history) {
                  setSearchHistory(history)
                  setFetchedSearchHistory(true)
                }
              }
            }}
            onBlur={handleBlur}
            className={cn(
              pathname.includes("player") && pathname.includes("search")
                ? "max-md:translate-x-0"
                : "max-md:min-w-0 max-md:w-10 max-md:pointer-events-none max-md:opacity-0 max-md:-translate-y-8",
              "pona-music-searchbox backdrop-blur-xl rounded-xl",
              searching && "bg-background/60",
              inputClassName
            )}
          />
        </AnimateIcon>

        <AnimatePresence>
          {showDropdown && (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="absolute left-0 top-0 z-10 flex min-h-6 h-max max-h-[calc(96vh-64px)] w-full"
            >
              <motion.div
                id="pona-search-suggestions"
                ref={searchSuggestionRef}
                layout
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                className={cn(
                  "absolute top-10 left-0 z-30 flex flex-col min-h-6 h-max max-h-[calc(96vh-64px)] w-full rounded-xl border-2 border-foreground/10 shadow-2xl bg-background/60 max-md:bg-playground-background overflow-hidden",
                  dropdownClassName
                )}
              >
                <AutoHeight className="overflow-hidden rounded-xl p-1 h-full w-full flex flex-col backdrop-blur-xl">
                  <ScrollArea
                    className="w-full flex-1 max-h-[calc(96vh-80px)]"
                    style={{
                      scrollbarWidth: "thin",
                      scrollbarColor: "hsl(var(--pona-app)) transparent",
                    }}
                  >
                    <motion.div layout className="flex h-max w-full flex-col">
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={searchSuggestions.length > 0 ? "suggestions" : searchValue ? "query-only" : "history"}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.15 }}
                          className="flex flex-col w-full"
                        >
                          {searchValue && (
                            <motion.div
                              initial={{ opacity: 0, filter: "blur(2px)", y: -6 }}
                              animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                              exit={{ opacity: 0, filter: "blur(2px)", y: -4 }}
                              transition={{ duration: 0.2, delay: 0, ease: [0.16, 1, 0.3, 1] }}
                            >
                              <Button
                                onClick={() => {
                                  router.push(
                                    `/app/g/${guild?.id}/player/search?q=${encodeURIComponent(searchValue)}`
                                  )
                                  setSearching(false)
                                  setSearchValue(searchValue)
                                  addToSearchHistory(searchValue)
                                }}
                                data-smooth-interaction="true"
                                value={searchValue}
                                variant="ghost"
                                size="lg"
                                className="w-full flex flex-row items-center justify-start gap-3 text-start rounded-lg"
                              >
                                <MagnifyingGlassIcon
                                  size={14}
                                  weight="bold"
                                  className="text-foreground shrink-0"
                                />
                                <span className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap">
                                  {searchValue}
                                </span>
                              </Button>
                            </motion.div>
                          )}
                          {searchSuggestions.length > 0 &&
                            searchSuggestions.map((value, index) => (
                              <motion.div
                                key={`sug-${value}-${index}`}
                                initial={{ opacity: 0, filter: "blur(2px)", y: -6 }}
                                animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                                exit={{ opacity: 0, filter: "blur(2px)", y: -4 }}
                                transition={{
                                  duration: 0.2,
                                  delay: (searchValue ? index + 1 : index) * 0.03,
                                  ease: [0.16, 1, 0.3, 1],
                                }}
                              >
                                <Button
                                  onClick={() => {
                                    router.push(
                                      `/app/g/${guild?.id}/player/search?q=${encodeURIComponent(value)}`
                                    )
                                    setSearching(false)
                                    setSearchValue(value)
                                    addToSearchHistory(value)
                                  }}
                                  onFocus={() => {
                                    setSearchValue(value)
                                  }}
                                  data-smooth-interaction="true"
                                  value={value}
                                  variant="ghost"
                                  size="lg"
                                  className="w-full flex flex-row items-center justify-start gap-3 text-start rounded-lg"
                                >
                                  <MagnifyingGlassIcon
                                    size={14}
                                    weight="bold"
                                    className="text-foreground shrink-0"
                                  />
                                  <span className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap">
                                    {value}
                                  </span>
                                </Button>
                              </motion.div>
                            ))}
                          {searchHistory.length > 0 &&
                            !searchSuggestions.length &&
                            searchHistory.map((value, index) => (
                              <motion.div
                                key={`hist-${value}-${index}`}
                                initial={{ opacity: 0, filter: "blur(2px)", y: -6 }}
                                animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
                                exit={{ opacity: 0, filter: "blur(2px)", y: -4 }}
                                transition={{
                                  duration: 0.2,
                                  delay: (searchValue ? index + 1 : index) * 0.03,
                                  ease: [0.16, 1, 0.3, 1],
                                }}
                              >
                                <Button
                                  onClick={() => {
                                    router.push(
                                      `/app/g/${guild?.id}/player/search?q=${encodeURIComponent(value)}`
                                    )
                                    setSearching(false)
                                    setSearchValue(value)
                                    addToSearchHistory(value)
                                  }}
                                  data-smooth-interaction="true"
                                  onFocus={() => {
                                    setSearchValue(value)
                                  }}
                                  value={value}
                                  variant="ghost"
                                  size="lg"
                                  className="w-full flex flex-row items-center justify-start gap-3 text-start rounded-lg"
                                >
                                  <ClockCounterClockwiseIcon
                                    size={14}
                                    weight="bold"
                                    className="text-foreground shrink-0"
                                  />
                                  <span className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap">
                                    {value}
                                  </span>
                                </Button>
                              </motion.div>
                            ))}
                        </motion.div>
                      </AnimatePresence>
                    </motion.div>
                  </ScrollArea>
                </AutoHeight>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </form>
  )
}
