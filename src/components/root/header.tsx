"use client"
import React, { useCallback, useEffect, useRef, useState } from "react"
import PonaIcon from "@/../public/static/flower.png"
import MyButton from "@/components/ui/custom/button"
import { useDiscordGuildInfo } from "@/contexts/discordGuildInfo"
import { useDiscordUserInfo } from "@/contexts/discordUserInfo"
import { useGlobalContext } from "@/contexts/globalContext"
import { useLanguageContext } from "@/contexts/languageContext"
import { fetchSearchHistory } from "@/lib/server-side-api/internal/history"
import { fetchSearchSuggestionResult } from "@/lib/server-side-api/internal/search"
import { Controller, useForm } from "react-hook-form"
import {
  CaretDownIcon,
  ClockCounterClockwiseIcon,
  ConfettiIcon,
  DiscordLogoIcon,
  MagnifyingGlassIcon,
} from "@phosphor-icons/react/dist/ssr"
import ConfettiButtonTrigger from "../ui/custom/confetti-button"
import UserAccountDropdown from "./user-account-dropdown"
import { usePathname, useRouter } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import { zodResolver } from "@hookform/resolvers/zod"
import { ScrollArea } from "../ui/scroll-area"
import { getCookie } from "cookies-next"
import { Button } from "../ui/button"
import { Field } from "../ui/field"
import Sidebar from "./sidebar"
import Image from "next/image"
import Link from "next/link"
import * as z from "zod"
import { cn } from "@/lib/utils"

const formSchema = z.object({
  search: z
    .string()
    .min(1, "Search must be at least 1 characters.")
    .max(512, "Search must be at most 512 characters."),
})

function Header() {
  const router = useRouter()
  const pathname = usePathname() || ""
  const [navOpened, setNavOpened] = useState<boolean>(false)

  const { guild } = useDiscordGuildInfo()
  const { language } = useLanguageContext()
  const { userInfo } = useDiscordUserInfo()
  const { ponaCommonState, isSameVC, isMemberInVC } = useGlobalContext()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { search: "" },
  })

  const isApp = pathname.startsWith("/app")
  const isInGuild =
    isApp &&
    pathname.split("/").includes("g") &&
    !isNaN(Number(pathname.split("/")[3]))
  const guildPath = isInGuild ? pathname.split("/")[4] : ""
  const isMusicApp = isApp && pathname.includes("/player")
  const isIndex = pathname === "/"

  const searchSuggestionRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const [searching, setSearching] = useState<boolean>(false)
  const [searchValue, setSearchValue] = useState<string>("")
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([])
  const [searchHistory, setSearchHistory] = useState<string[]>([])
  const [fetchedSearchHistory, setFetchedSearchHistory] =
    useState<boolean>(false)
  const [typingTimeout, setTypingTimeout] =
    React.useState<NodeJS.Timeout | null>(null)

  const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    if (
      searchSuggestionRef.current &&
      !searchSuggestionRef.current.contains(event.relatedTarget as Node)
    )
      setSearching(false)
  }

  const handleClickOutside = useCallback(
    (event: MouseEvent) => {
      if (
        searchSuggestionRef.current &&
        !searchSuggestionRef.current.contains(event.target as Node) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target as Node)
      ) {
        setSearching(false)
      }
    },
    [setSearching]
  )

  const addToSearchHistory = (value: string) => {
    setSearchHistory((prev_value) => {
      if (prev_value.includes(value))
        prev_value.splice(prev_value.indexOf(value), 1)
      prev_value = [value, ...prev_value.slice(0, 6)]
      return prev_value
    })
  }

  useEffect(() => {
    if (searching) {
      window.addEventListener("click", handleClickOutside)
    }
    return () => {
      window.removeEventListener("click", handleClickOutside)
    }
  }, [searching, handleClickOutside])

  return (
    <motion.header
      className={cn(
        `nav-opened-${navOpened}`,
        "pona-header flex h-20 w-full items-center justify-center gap-3 p-6 px-8",
        isApp && "md:px-2",
        !isIndex && !isMusicApp && "max-md:backdrop-blur-md",
        !isIndex &&
          isMusicApp &&
          "max-md:[body.pona-app-music-scrolled_&]:bg-playground-background/40 apply-soft-transition border-b-2 border-foreground/0 bg-transparent duration-1000! max-md:[body.pona-app-music-scrolled_&]:border-foreground/10 max-md:[body.pona-app-music-scrolled_&]:backdrop-blur-md",
        !isIndex &&
          isMemberInVC &&
          isSameVC &&
          "max-md:[body.pona-player-focused_&]:pointer-events-none max-md:[body.pona-player-focused_&]:opacity-0"
      )}
      initial={isIndex && { y: "-100%", opacity: 0 }}
      animate={isIndex && { y: 0, opacity: 1 }}
      transition={{ duration: 0.16, delay: 6 }}
    >
      <div
        className={`w-full ${!isApp && "max-w-5xl"} flex h-full items-center justify-between gap-6`}
      >
        <div className="z-20 flex gap-2 pl-1 active:scale-95">
          <Link
            href={isApp ? "/app" : "/"}
            onClick={() => {
              setNavOpened(false)
            }}
          >
            <h1 className="flex items-center gap-2 text-xl max-md:text-base">
              {isApp ? (
                <>
                  <Image
                    src={PonaIcon}
                    alt="Pona! Application"
                    className={cn(
                      "disable-default-transition apply-long-soft-transition max-md:h-6 max-md:w-6",
                      isApp && "ml-1"
                    )}
                    width={32}
                    height={32}
                  />
                  <AnimatePresence>
                    {pathname.includes("player") ? (
                      <>
                        <motion.span
                          layoutId="app-title"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.16 }}
                          className="max-md:hidden md:contents"
                        >
                          Pona! {language.data.app.title}
                        </motion.span>
                        <motion.span
                          layoutId="app-title"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.16 }}
                          className="hidden max-md:contents"
                        >
                          {language.data.app.guilds.player.name}
                        </motion.span>
                      </>
                    ) : (
                      <>
                        <motion.span
                          layoutId="app-title"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.16 }}
                          className="max-sm:hidden sm:contents"
                        >
                          Pona! {language.data.app.title}
                        </motion.span>
                      </>
                    )}
                  </AnimatePresence>
                </>
              ) : (
                "Pona!"
              )}
            </h1>
          </Link>
        </div>
        <div className="z-20 flex items-center gap-4">
          {pathname.includes("player") &&
            ponaCommonState &&
            ponaCommonState.pona.voiceChannel &&
            isSameVC && (
              <div className={`${navOpened ? "hidden" : "contents"}`}>
                <Link href={`/app/g/${guild?.id}/player/search`}>
                  <Button
                    className={`${navOpened || (pathname.includes("player") && pathname.includes("search")) ? "hidden" : ""} miniscreen:translate-y-8 miniscreen:pointer-events-none miniscreen:opacity-0 absolute left-1/2 z-20 -translate-x-1/2 bg-black text-white`}
                    size="sm"
                  >
                    <MagnifyingGlassIcon size={14} />
                  </Button>
                </Link>
                <form
                  className="top-5 flex items-center justify-center gap-3 max-md:contents md:absolute md:left-72 md:w-[calc(100%-18rem)] md:px-4 md:[body.sidebar-collapsed_&]:left-16 md:[body.sidebar-collapsed_&]:w-[calc(100%-4rem)]"
                  onSubmit={(e) => {
                    e.preventDefault()
                    const data = Object.fromEntries(
                      new FormData(e.currentTarget)
                    )
                    router.push(
                      `/app/g/${guild?.id}/player/search?q=${encodeURIComponent(data.search.toString())}`
                    )
                    addToSearchHistory(data.search.toString())
                  }}
                >
                  <div className="flex w-full max-w-6xl items-center justify-start gap-4 max-md:contents">
                    <div className="miniscreen:w-80 max-miniscreen:top-24 max-miniscreen:left-4 max-miniscreen:translate-x-0 max-miniscreen:max-w-full max-miniscreen:w-[calc(100%-2rem)] max-md:fixed max-md:left-1/2 max-md:max-w-[32vw] max-md:-translate-x-1/2 md:relative [body.pona-player-focused_&]:pointer-events-none [body.pona-player-focused_&]:-translate-y-6 [body.pona-player-focused_&]:opacity-0">
                      <Controller
                        name="search"
                        control={form.control}
                        render={() => (
                          <Field
                            ref={searchInputRef}
                            aria-placeholder={
                              language.data.app.guilds.player.search.search_box
                            }
                            defaultValue={searchValue}
                            onChange={(value) => {
                              setSearching(true)
                              setSearchValue(value.target.nodeValue as string)
                              if (typingTimeout) clearTimeout(typingTimeout)
                              setTypingTimeout(
                                setTimeout(async () => {
                                  if (!value.target.nodeValue)
                                    return setSearchSuggestions([])
                                  const accessTokenType = String(
                                    getCookie("LOGIN_TYPE_")
                                  )
                                  const accessToken = String(
                                    getCookie("LOGIN_")
                                  )
                                  if (
                                    !accessTokenType ||
                                    accessTokenType === "undefined" ||
                                    !accessToken ||
                                    accessToken === "undefined"
                                  )
                                    return false

                                  const searcher =
                                    await fetchSearchSuggestionResult(
                                      accessTokenType,
                                      accessToken,
                                      value.target.nodeValue as string
                                    )
                                  if (searcher)
                                    setSearchSuggestions(
                                      searcher.searchSuggestions
                                    )
                                  else setSearchSuggestions([])
                                }, 500)
                              )
                            }}
                            onFocus={async () => {
                              setSearching(true)
                              if (!fetchedSearchHistory) {
                                const accessTokenType = String(
                                  getCookie("LOGIN_TYPE_")
                                )
                                const accessToken = String(getCookie("LOGIN_"))
                                if (
                                  !accessTokenType ||
                                  accessTokenType === "undefined" ||
                                  !accessToken ||
                                  accessToken === "undefined"
                                )
                                  return false
                                const searchHistory = await fetchSearchHistory(
                                  accessTokenType,
                                  accessToken
                                )
                                if (searchHistory) {
                                  setSearchHistory(searchHistory)
                                  setFetchedSearchHistory(true)
                                }
                              }
                            }}
                            onBlur={handleBlur}
                            className={`${
                              pathname.includes("player") &&
                              pathname.includes("search")
                                ? "max-miniscreen:translate-x-0"
                                : "max-miniscreen:min-w-0 max-miniscreen:w-10 max-miniscreen:pointer-events-none max-miniscreen:opacity-0 max-miniscreen:-translate-y-8"
                            } pona-music-searchbox z-10 rounded-xl text-foreground backdrop-blur max-md:rounded-full`}
                          />
                        )}
                      />
                      <motion.div
                        initial={{ y: -10 }}
                        animate={{ y: 0 }}
                        exit={{ y: -10 }}
                        transition={{ duration: 0.16 }}
                        layoutId="search-suggestions"
                        key={String(searching)}
                        className={`lef-0 absolute top-0 h-max max-h-[calc(96vh-64px)] min-h-6 w-full`}
                      >
                        <ScrollArea
                          id="pona-search-suggestions"
                          ref={searchSuggestionRef}
                          className={`max-miniscreen:bg-playground-background miniscreen:backdrop-blur-3xl absolute top-12 z-30 h-max max-h-[calc(96vh-64px)] min-h-6 w-full rounded-2xl border-2 border-foreground/10 bg-background/25 p-1 ${searching && (searchHistory.length > 0 || searchSuggestions.length > 0) ? "" : "pointer-events-none -translate-y-6 opacity-0"}`}
                          style={{
                            scrollbarWidth: "thin",
                            scrollbarColor: "hsl(var(--pona-app)) transparent",
                          }}
                        >
                          <div className="flex h-max w-full flex-col gap-1">
                            {searchValue && (
                              <Button
                                onClick={() => {
                                  router.push(
                                    `/app/g/${guild?.id}/player/search?q=${searchValue}`
                                  )
                                  setSearching(false)
                                  setSearchValue(searchValue)
                                  addToSearchHistory(searchValue)
                                }}
                                value={searchValue}
                                variant="ghost"
                                className="flex flex-row items-center justify-start gap-3 text-start"
                              >
                                <MagnifyingGlassIcon
                                  size={14}
                                  weight="bold"
                                  className="text-foreground"
                                />{" "}
                                <span className="flex-1 overflow-hidden overflow-ellipsis whitespace-nowrap">
                                  {searchValue}
                                </span>
                              </Button>
                            )}
                            {searchSuggestions.length > 0 &&
                              searchSuggestions?.map((value, index) => (
                                <Button
                                  key={index}
                                  onClick={() => {
                                    router.push(
                                      `/app/g/${guild?.id}/player/search?q=${value}`
                                    )
                                    setSearching(false)
                                    setSearchValue(value)
                                    addToSearchHistory(value)
                                  }}
                                  onFocus={() => {
                                    setSearchValue(value)
                                  }}
                                  value={value}
                                  variant="ghost"
                                  className="flex flex-row items-center justify-start gap-3 text-start"
                                >
                                  <MagnifyingGlassIcon
                                    size={14}
                                    weight="bold"
                                    className="text-foreground"
                                  />{" "}
                                  <span className="flex-1 overflow-hidden overflow-ellipsis whitespace-nowrap">
                                    {value}
                                  </span>
                                </Button>
                              ))}
                            {searchHistory.length > 0 &&
                              !searchSuggestions.length &&
                              searchHistory?.map((value, index) => (
                                <Button
                                  key={index}
                                  onClick={() => {
                                    router.push(
                                      `/app/g/${guild?.id}/player/search?q=${value}`
                                    )
                                    setSearching(false)
                                    setSearchValue(value)
                                    addToSearchHistory(value)
                                  }}
                                  onFocus={() => {
                                    setSearchValue(value)
                                  }}
                                  value={value}
                                  className="flex flex-row items-center justify-start gap-3 text-start"
                                >
                                  <ClockCounterClockwiseIcon
                                    size={14}
                                    weight="bold"
                                    className="text-foreground"
                                  />{" "}
                                  <span className="flex-1 overflow-hidden overflow-ellipsis whitespace-nowrap">
                                    {value}
                                  </span>
                                </Button>
                              ))}
                          </div>
                        </ScrollArea>
                      </motion.div>
                    </div>
                  </div>
                </form>
              </div>
            )}
          <UserAccountDropdown minimize={true} className="-mr-2 md:hidden" />
          <MyButton
            className={`btn-icon m-0 mr-0! h-12 w-12 min-w-0! md:hidden! ${isMusicApp ? "max-miniscreen:hidden" : ""}`}
            style="rounded"
            variant="text"
            onClick={() => {
              setNavOpened((value) => !value)
            }}
          >
            <CaretDownIcon
              size={16}
              weight="bold"
              className={navOpened ? "-rotate-180" : "rotate-0"}
            />
          </MyButton>
        </div>
        <nav className={`nav-opened-${navOpened}`}>
          <div className="header mb-6 h-24 w-full border-b border-foreground/10 md:hidden"></div>
          <div className="flex gap-3 max-sm:p-0!">
            {isApp && userInfo && (
              <Sidebar
                userInfo={userInfo}
                nav={true}
                onPushLocation={() => {
                  setNavOpened(false)
                }}
                canCollapsed={false}
                setNavActive={setNavOpened}
              />
            )}
          </div>
          <div className="flex items-center gap-3">
            {!userInfo && (
              <Link href="/app" rel="noopener noreferrer" tabIndex={-1}>
                <MyButton
                  size="small"
                  variant="text"
                  style="rounded"
                  onClick={() => {
                    setNavOpened(false)
                  }}
                >
                  <DiscordLogoIcon weight="fill" />
                  <span className="text-sm">
                    {language.data.header.actions.login}
                  </span>
                </MyButton>
              </Link>
            )}
            {userInfo && isInGuild && guildPath === "player" ? (
              <>
                <UserAccountDropdown minimize={true} />
              </>
            ) : (
              <>
                <Link href="/invite" rel="noopener noreferrer" tabIndex={-1}>
                  <MyButton
                    size="small"
                    variant="primary"
                    effect="confetti"
                    className="max-md:hidden"
                    onClick={() => {
                      setNavOpened(false)
                    }}
                  >
                    <ConfettiIcon weight="fill" />
                    <span className="text-sm">
                      {language.data.header.actions.invite}
                    </span>
                  </MyButton>
                  <div className="md:hidden">
                    <ConfettiButtonTrigger>
                      <Button
                        className="w-full justify-center rounded-lg bg-primary/10 p-5 text-primary"
                        data-smooth-interaction="true"
                      >
                        <ConfettiIcon weight="fill" />
                        <span className="text-sm">
                          {language.data.header.actions.invite}
                        </span>
                      </Button>
                    </ConfettiButtonTrigger>
                  </div>
                </Link>
                <UserAccountDropdown className="max-md:hidden" />
              </>
            )}
          </div>
        </nav>
      </div>
    </motion.header>
  )
}

export default Header
