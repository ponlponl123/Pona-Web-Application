"use client"
import React from "react"
import { useLanguageContext } from "@/contexts/languageContext"
import { useDiscordUserInfo } from "@/contexts/discordUserInfo"
import { motion } from "motion/react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  BugIcon,
  DiscordLogoIcon,
  HandHeartIcon,
  KeyboardIcon,
  LockSimpleIcon,
  ShapesIcon,
  ShieldCheckIcon,
  SignOutIcon,
  SmileyIcon,
  TranslateIcon,
} from "@phosphor-icons/react"
import { PageKey, useSettingModalContext } from "."
import { useGlobalContext } from "@/contexts/globalContext"

export type SubPage = {
  name: string
  target: PageKey | string
}

export interface Link {
  name: string
  target: PageKey
  icon: React.ReactNode
  subpages: SubPage[]
}

export interface Links {
  category: string
  links: Link[]
}

type DelayData = {
  categoryDelay: number
  linkDelays: number[]
  hrDelay: number
}

function SettingModalSidebar() {
  const { language } = useLanguageContext()
  const { setIsSettingModalOpen, setIsFeedbackModalOpen } = useGlobalContext()
  const { userInfo, revokeUserAccessToken } = useDiscordUserInfo()
  const { SelectedPageKey, setSelectedPage, lookingAt, scrollTo } =
    useSettingModalContext()

  const links: Links[] = [
    userInfo && {
      category: language.data.app.setting.category.user_setting,
      links: [
        {
          name: language.data.app.setting.account.title,
          target: "account",
          icon: <SmileyIcon weight="fill" className="size-4" />,
          subpages: [],
        },
        {
          name: language.data.app.setting.privacy.title,
          target: "privacy",
          icon: <ShieldCheckIcon weight="fill" className="size-4" />,
          subpages: [],
        },
      ],
    },
    {
      category: language.data.app.setting.category.app_setting,
      links: [
        {
          name: language.data.app.setting.layout.title,
          target: "layout",
          icon: <ShapesIcon weight="fill" className="size-4" />,
          subpages: [
            {
              name: language.data.app.setting.layout.theme.title,
              target: "layout-theme",
            },
            {
              name: language.data.app.setting.layout.amoled_black.title,
              target: "amoled-black",
            },
            {
              name: language.data.app.setting.layout.player.title,
              target: "layout-player",
            },
            {
              name: language.data.app.setting.layout.transparency.title,
              target: "layout-transparency",
            },
          ],
        },
        {
          name: language.data.app.setting.keybinds.title,
          target: "keybinds",
          icon: <KeyboardIcon weight="fill" className="size-4" />,
          subpages: [
            {
              name: language.data.app.setting.keybinds.category.appearance,
              target: "appearance",
            },
          ],
        },
        {
          name: language.data.app.setting.language_time.title,
          target: "language-time",
          icon: <TranslateIcon weight="bold" className="size-4" />,
          subpages: [
            {
              name: language.data.app.setting.language_time.time.title,
              target: "time-format",
            },
            {
              name: language.data.app.setting.language_time.language.title,
              target: "language",
            },
          ],
        },
      ],
    },
    userInfo && {
      category: language.data.app.setting.category.developer,
      links: [
        {
          name: language.data.app.setting.dev_mode.title,
          target: "dev",
          icon: <BugIcon weight="bold" className="size-4" />,
          subpages: [],
        },
      ],
    },
  ].filter(Boolean) as Links[]

  // Pre-calculate all animation delays
  const animationData = links.reduce(
    (acc, category) => {
      acc.time += 0.024
      const categoryDelay = Number(acc.time.toFixed(3))

      const linkDelays = (category.links || []).map(() => {
        acc.time += 0.032
        return Number(acc.time.toFixed(3))
      })

      const hrDelay = Number((acc.time + 0.016).toFixed(3))

      acc.result.push({ categoryDelay, linkDelays, hrDelay })

      return acc
    },
    { time: 0.3, result: [] as DelayData[] }
  )

  const PreCalcCategoryDelays = animationData.result
  const TOTAL_ANIMATION_DELAY = Number((animationData.time + 0.08).toFixed(3))

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{
          delay: 0.31,
          duration: 0.25,
          ease: "easeOut",
        }}
        className={cn(
          "mb-0.5 flex w-full items-center justify-start gap-3 rounded-xl px-3 py-1 select-none hover:bg-foreground/5 not-dark:hover:bg-foreground/10",
          !userInfo && "bg-transparent! p-0",
          SelectedPageKey === "account" && "opacity-0! blur-sm"
        )}
        onClick={() => setSelectedPage("account")}
        data-smooth-interaction="true"
      >
        {userInfo ? (
          <>
            <motion.div
              layoutId="setting-modal-user-avatar"
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              <Avatar className="h-8 w-8">
                <AvatarImage
                  src={`https://cdn.discordapp.com/avatars/${userInfo.id}/${userInfo.avatar}.png`}
                />
                <AvatarFallback>
                  {userInfo.global_name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </motion.div>

            <motion.div className="flex flex-col items-start py-1">
              <motion.div
                className="leading-4 font-bold"
                layoutId="setting-modal-user-global-name"
                transition={{ duration: 0.25, ease: "easeOut" }}
              >
                <motion.span
                  initial={{ opacity: 0, filter: "blur(3px)" }}
                  animate={{ opacity: 1, filter: "blur(0px)" }}
                  exit={{ opacity: 0, filter: "blur(3px)" }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                >
                  {userInfo.global_name}
                </motion.span>
              </motion.div>
              <motion.div
                className="text-xs leading-4 text-foreground/40"
                layoutId="setting-modal-user-name"
                transition={{ duration: 0.25, ease: "easeOut" }}
              >
                <motion.strong
                  initial={{ opacity: 0, filter: "blur(3px)" }}
                  animate={{ opacity: 1, filter: "blur(0px)" }}
                  exit={{ opacity: 0, filter: "blur(3px)" }}
                  transition={{
                    delay: 0.52,
                    duration: 0.25,
                    ease: "easeOut",
                  }}
                >
                  @{userInfo.username}
                </motion.strong>
              </motion.div>
            </motion.div>
          </>
        ) : (
          <Link href="/app" className="contents">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.16 }}
              className={cn(
                "apply- mb-2 flex w-full flex-col items-center justify-center gap-2 rounded-2xl p-3 select-none",
                !userInfo &&
                  "border-2 border-dashed border-foreground/10 bg-foreground/5 not-dark:bg-foreground/10 hover:bg-foreground/10 not-dark:hover:bg-foreground/5"
              )}
              onClick={() => setIsSettingModalOpen(false)}
              data-smooth-interaction="true"
            >
              <LockSimpleIcon weight="bold" />
              <span className="text-foreground/40">
                {language.data.common.login_first}
              </span>
            </motion.div>
          </Link>
        )}
      </motion.div>
      {links.map((category, categoryIndex) => {
        return (
          <div
            className="mt-2 flex flex-col items-start justify-start gap-1"
            key={"setting-modal-sidebar-category-" + categoryIndex}
          >
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{
                delay: PreCalcCategoryDelays[categoryIndex].categoryDelay,
                duration: 0.25,
                ease: "easeOut",
              }}
              className="px-2 text-xs text-foreground/40"
            >
              {category.category}
            </motion.span>
            {category.links.map((link, linkIndex) => {
              const activeIndices = link.subpages
                .map((s, i) => (lookingAt?.includes(s.target) ? i : -1))
                .filter((i) => i !== -1)

              const hasActive = activeIndices.length > 0
              const firstActive = hasActive ? Math.min(...activeIndices) : 0
              const lastActive = hasActive ? Math.max(...activeIndices) : 0
              const activeCount = hasActive ? lastActive - firstActive + 1 : 0

              const totalItems = link.subpages.length

              const topPercent =
                totalItems > 0 ? (firstActive / totalItems) * 100 : 0
              const heightPercent =
                totalItems > 0 ? (activeCount / totalItems) * 100 : 0

              return (
                <React.Fragment
                  key={
                    "setting-modal-sidebar-category-" +
                    categoryIndex +
                    "-link-" +
                    linkIndex
                  }
                >
                  <motion.button
                    initial={{ opacity: 0, filter: "blur(3px)" }}
                    animate={{ opacity: 1, filter: "blur(0px)" }}
                    exit={{ opacity: 0, filter: "blur(3px)" }}
                    transition={{
                      delay:
                        PreCalcCategoryDelays[categoryIndex].linkDelays[
                          linkIndex
                        ],
                      duration: 0.25,
                      ease: "easeOut",
                    }}
                    data-smooth-interaction="true"
                    className={cn(
                      "group flex w-full items-center justify-start gap-2 rounded-lg bg-transparent px-3 py-2 text-start",
                      "not-hover:text-foreground/60",
                      "hover:bg-foreground/10 active:bg-foreground/10 dark:hover:bg-foreground/5",
                      SelectedPageKey === link.target &&
                        "bg-foreground/10 text-foreground dark:text-foreground"
                    )}
                    onClick={() => setSelectedPage(link.target)}
                  >
                    {link.icon}
                    <span className="text-sm">{link.name}</span>
                  </motion.button>
                  <motion.div
                    initial={{ opacity: 0, filter: "blur(3px)" }}
                    animate={{ opacity: 1, filter: "blur(0px)" }}
                    exit={{ opacity: 0, filter: "blur(3px)" }}
                    transition={{
                      delay:
                        PreCalcCategoryDelays[categoryIndex].linkDelays[
                          linkIndex
                        ],
                      duration: 0.25,
                      ease: "easeOut",
                    }}
                    className={cn(
                      link.subpages.length > 0 &&
                        SelectedPageKey === link.target
                        ? "w-full"
                        : "hidden"
                    )}
                  >
                    {link.subpages.length > 0 &&
                      SelectedPageKey === link.target && (
                        <motion.div
                          initial={{ opacity: 0, y: -3 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -3 }}
                          transition={{
                            duration: 0.25,
                            ease: "easeOut",
                          }}
                          className="relative flex w-full flex-col items-start justify-start px-1"
                        >
                          <motion.div
                            className={cn(
                              "absolute left-2.5 block w-0.5 bg-foreground/10",
                              "group-first/sub:rounded-t-full group-last/sub:rounded-b-full"
                            )}
                            initial={{ height: "0%", originY: 0 }}
                            animate={{ height: "100%" }}
                            exit={{ height: "0%", originY: 1 }}
                            transition={{
                              duration: link.subpages.length * 0.056,
                              ease: "linear",
                            }}
                          />

                          {hasActive && (
                            <motion.div
                              initial={{ height: "0%", opacity: 0 }}
                              animate={{ height: "100%", opacity: 1 }}
                              exit={{ height: "0%", opacity: 0 }}
                              transition={{
                                duration: 0.12,
                                ease: "easeOut",
                              }}
                              className="absolute left-2.5 z-10 block h-full w-0.5 rounded-full"
                            >
                              <motion.div
                                className="absolute z-10 block w-0.5 rounded-full bg-foreground"
                                initial={false}
                                animate={{
                                  top: `${topPercent}%`,
                                  height: `${heightPercent}%`,
                                }}
                                transition={{
                                  type: "spring",
                                  stiffness: 300,
                                  damping: 30,
                                  mass: 1,
                                }}
                              />
                            </motion.div>
                          )}

                          {link.subpages.map((tos, tos_index) => (
                            <motion.div
                              key={
                                "setting-modal-sidebar-category-" +
                                categoryIndex +
                                "-link-" +
                                linkIndex +
                                "-sub-" +
                                tos_index
                              }
                              initial={{ opacity: 0, filter: "blur(3px)" }}
                              animate={{ opacity: 1, filter: "blur(0px)" }}
                              exit={{ opacity: 0, filter: "blur(3px)" }}
                              transition={{
                                delay: tos_index * 0.08,
                                duration: 0.25,
                                ease: "easeOut",
                              }}
                              className={cn(
                                "relative flex w-full items-start justify-start gap-2 pr-1 pl-4",
                                `group/sub`
                              )}
                            >
                              <motion.button
                                className={cn(
                                  "relative flex w-full items-center justify-start gap-2 rounded-md px-2 py-1 text-start text-foreground/40",
                                  "hover:text-foreground/80",
                                  lookingAt?.includes(tos.target) &&
                                    "text-foreground"
                                )}
                                data-smooth-interaction="true"
                                onClick={() => scrollTo(tos.target)}
                              >
                                {tos.name}
                              </motion.button>
                            </motion.div>
                          ))}
                        </motion.div>
                      )}
                  </motion.div>
                </React.Fragment>
              )
            })}

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{
                delay: PreCalcCategoryDelays[categoryIndex].hrDelay,
                duration: 0.25,
                ease: "easeOut",
              }}
              className="my-2 h-px w-full bg-foreground/10"
            />
          </div>
        )
      })}
      <motion.div
        initial={{ opacity: 0, filter: "blur(3px)" }}
        animate={{ opacity: 1, filter: "blur(0px)" }}
        exit={{ opacity: 0, filter: "blur(3px)" }}
        transition={{
          delay: TOTAL_ANIMATION_DELAY,
          duration: 0.25,
          ease: "easeOut",
        }}
        className="flex min-h-0 flex-1 flex-col justify-between"
      >
        <div className="flex flex-col gap-1">
          <motion.button
            initial={{ opacity: 0, filter: "blur(3px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, filter: "blur(3px)" }}
            transition={{
              delay: TOTAL_ANIMATION_DELAY,
              duration: 0.25,
              ease: "easeOut",
            }}
            layoutId="feedback-modal"
            data-smooth-interaction="true"
            className={cn(
              "group flex w-full items-center justify-start gap-2 rounded-lg bg-transparent px-3 py-2 text-start",
              "not-hover:text-foreground/60",
              "hover:bg-foreground/10 active:bg-foreground/10 dark:hover:bg-foreground/5"
            )}
            onClick={() => {
              setIsSettingModalOpen(false)
              setIsFeedbackModalOpen(true)
            }}
          >
            <HandHeartIcon weight="bold" className="size-4" />
            <span className="text-sm">
              {language.data.header.account.feedback}
            </span>
          </motion.button>
          {userInfo && (
            <>
              <motion.button
                initial={{ opacity: 0, filter: "blur(3px)" }}
                animate={{ opacity: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, filter: "blur(3px)" }}
                transition={{
                  delay: TOTAL_ANIMATION_DELAY,
                  duration: 0.25,
                  ease: "easeOut",
                }}
                data-smooth-interaction="true"
                className={cn(
                  "group flex w-full items-center justify-start gap-2 rounded-lg bg-transparent px-3 py-2 dark:hover:bg-foreground/5",
                  "text-rose-400 hover:bg-rose-400/10 active:bg-rose-400/10 hover:dark:bg-rose-400/10"
                )}
                onClick={() => {
                  revokeUserAccessToken().then(() => {
                    if (window.location.pathname.startsWith("/app")) {
                      window.location.href = "/"
                    } else {
                      window.location.reload()
                    }
                  })
                }}
              >
                <SignOutIcon weight="bold" className="size-4" />
                <span className="text-sm">
                  {language.data.header.account.logout}
                </span>
              </motion.button>
            </>
          )}
        </div>
        <motion.div
          initial={{ opacity: 0, filter: "blur(3px)" }}
          animate={{ opacity: 1, filter: "blur(0px)" }}
          exit={{ opacity: 0, filter: "blur(3px)" }}
          transition={{
            delay: TOTAL_ANIMATION_DELAY + 0.032,
            duration: 0.25,
            ease: "easeOut",
          }}
          className="mt-3 mb-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 px-2 select-none"
        >
          <span className="text-xs text-foreground/40">
            Pona! WebApp - v
            {process.env["NEXT_PUBLIC_APP_VERSION"] || "unknown"}
          </span>
          <div className="flex w-full flex-wrap items-center gap-2">
            <Link
              href="https://ponl.link/disgd"
              target="_blank"
              className="text-foreground/40 hover:text-foreground"
              data-smooth-interaction="true"
            >
              <DiscordLogoIcon weight="fill" className="size-4" />
            </Link>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default SettingModalSidebar
