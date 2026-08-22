"use client"
import { useDiscordUserInfo } from "@/contexts/discordUserInfo"
import {
  ConfettiIcon,
  GearSixIcon,
  HandHeartIcon,
  LifebuoyIcon,
  ListIcon,
  LockSimpleIcon,
  SignOutIcon,
} from "@phosphor-icons/react"
import { AnimatePresence, LayoutGroup } from "motion/react"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import React, { useState, useRef } from "react"
import { motion } from "motion/react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { useMediaQuery } from "@heroui/react"
import { useSetAtom } from "jotai"
import {
  isFeedbackModalOpenAtom,
  isSettingModalOpenAtom,
  settingLayoutIdAtom,
} from "@/store/uiAtoms"
import { useAppStore } from "@/store/coreStore"

export default function UserAccountDropdown({
  className,
  minimize = false,
}: {
  className?: string
  minimize?: boolean
}) {
  const [isActive, setIsActive] = useState(false)
  const { userInfo, revokeUserAccessToken } = useDiscordUserInfo()
  const setSettingLayoutId = useSetAtom(settingLayoutIdAtom)
  const setIsSettingModalOpen = useSetAtom(isSettingModalOpenAtom)
  const setIsFeedbackModalOpen = useSetAtom(isFeedbackModalOpenAtom)
  const language = useAppStore((state) => state.language)
  const isMobile = useMediaQuery("(max-width: 760px)")
  const popupRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const [contentHeight, setContentHeight] = useState(0)

  const cooldownRef = useRef<NodeJS.Timeout | null>(null)

  const layoutTransition = {
    type: "spring",
    stiffness: 240,
    damping: 38,
    mass: 1.2,
    bounce: 0,
  } as const

  const btnClassname = cn(
    "m-3 h-max w-max rounded-xl border-2 border-transparent p-3 backdrop-blur-none! outline-none z-40",
    "hover:border-card/5 active:border-card/5 active:bg-card/5",
    !minimize &&
    "flex w-fit items-center justify-center gap-3 backdrop-blur-md",
    className
  )

  const dropdownBtnClassname = cn(
    "px-3 py-2",
    "flex w-full items-center justify-start gap-3 rounded-lg hover:bg-foreground/10 dark:hover:bg-foreground/5"
  )

  const handleToggle = () => {
    if (isMobile) {
      setIsSettingModalOpen(true)
      return
    }
    if (cooldownRef.current) return
    setIsActive((prev) => !prev)
    cooldownRef.current = setTimeout(() => {
      cooldownRef.current = null
    }, 450)
  }

  React.useEffect(() => {
    if (isActive && popupRef.current) popupRef.current.focus()
  }, [isActive])

  React.useEffect(() => {
    if (isActive && contentRef.current) {
      const resizeObserver = new ResizeObserver(() => {
        setContentHeight(contentRef.current?.scrollHeight || 0)
      })
      resizeObserver.observe(contentRef.current)
      return () => resizeObserver.disconnect()
    }
  }, [isActive])

  return (
    <div className="relative">
      <div
        className="pointer-events-none invisible"
        aria-hidden="true"
        tabIndex={-1}
      >
        <div className={cn(btnClassname, userInfo && "rounded-full p-1")}>
          {userInfo ? (
            <div className="h-8 w-8" />
          ) : (
            <ListIcon weight="bold" className="size-4" />
          )}
        </div>
      </div>

      <AnimatePresence mode="popLayout">
        <LayoutGroup>
          {" "}
          <motion.button
            key="button"
            layout={!minimize}
            // layoutId={minimize ? undefined : "user-action"}
            className={cn(
              btnClassname,
              "absolute top-0 left-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus focus-visible:outline-solid",
              userInfo
                ? "rounded-full p-1"
                : "hover:bg-foreground/10 dark:hover:bg-foreground/5"
            )}
            onClick={handleToggle}
            transition={layoutTransition}
          >
            <motion.div
              whileHover={{ scale: 1.06 }}
              whileTap={{
                scale: 0.93,
                transition: { type: "spring", stiffness: 700, damping: 22 },
              }}
              tabIndex={-1}
            >
              {userInfo ? (
                <motion.div
                  layoutId="user-action-avatar"
                  layout="position"
                  transition={layoutTransition}
                  tabIndex={-1}
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
              ) : (
                <ListIcon weight="bold" className="size-4" />
              )}
            </motion.div>
          </motion.button>
          {isActive && (
            <motion.div
              key="modal"
              ref={popupRef}
              layout="position"
              // layoutId="user-action"
              className="absolute top-16 right-0 z-1001 w-max max-w-64 rounded-xl bg-card p-1 md:right-4"
              style={{ scrollbarWidth: "thin" }}
              onClick={(e) => e.stopPropagation()}
              transition={layoutTransition}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onKeyDown={(e) => {
                if (e.key === "Escape") setIsActive(false)
              }}
            >
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: contentHeight || "auto" }}
                exit={{ height: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 30,
                  mass: 0.8,
                }}
                className="overflow-hidden"
              >
                <div ref={contentRef} className="overscroll-y-auto">
                  <motion.div
                    className={cn(
                      "mb-0.5 flex w-full items-center justify-start gap-3 rounded-lg px-3 py-1 select-none hover:bg-foreground/5 not-dark:hover:bg-foreground/10",
                      !userInfo && "bg-transparent! p-0"
                    )}
                    layout
                    transition={layoutTransition}
                  >
                    {userInfo ? (
                      <>
                        <motion.div
                          layoutId="user-action-avatar"
                          layout="position"
                          transition={layoutTransition}
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

                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{
                            delay: 0.1,
                            duration: 0.25,
                            ease: "easeOut",
                          }}
                          className="flex flex-col items-start py-1"
                        >
                          <p className="text-xs leading-4 text-foreground/40">
                            {language.data.header.account.signinas}
                          </p>
                          <motion.strong
                            initial={{ opacity: 0, filter: "blur(3px)" }}
                            animate={{ opacity: 1, filter: "blur(0px)" }}
                            exit={{ opacity: 0, filter: "blur(3px)" }}
                            transition={{
                              delay: 0.15,
                              duration: 0.25,
                              ease: "easeOut",
                            }}
                            className="leading-4 font-bold"
                          >
                            @{userInfo.username}
                          </motion.strong>
                        </motion.div>
                      </>
                    ) : (
                      <Link href="/app" className="contents" tabIndex={-1}>
                        <motion.button
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ delay: 0.16 }}
                          className={cn(
                            "apply- flex w-full flex-col items-center justify-center gap-2 rounded-lg p-3 select-none",
                            !userInfo &&
                            "border-2 border-dashed border-foreground/10 bg-foreground/5 not-dark:bg-foreground/10 hover:bg-foreground/10 not-dark:hover:bg-foreground/5"
                          )}
                          onClick={() => setIsActive(false)}
                          data-smooth-interaction="true"
                        >
                          <LockSimpleIcon weight="bold" />
                          <span className="text-foreground/40">
                            {language.data.common.login_first}
                          </span>
                        </motion.button>
                      </Link>
                    )}
                  </motion.div>
                  {[
                    userInfo && {
                      icon: <ConfettiIcon weight="bold" className="size-4" />,
                      label: language.data.header.account.playground,
                      className: cn(),
                      layoutId: undefined,
                      href: "/app",
                    },
                    {
                      icon: <LifebuoyIcon weight="bold" className="size-4" />,
                      label: language.data.header.account.support,
                      className: cn(),
                      layoutId: undefined,
                      href: "https://ponl.link/disgd",
                    },
                    {
                      icon: <HandHeartIcon weight="bold" className="size-4" />,
                      label: language.data.header.account.feedback,
                      className: cn(),
                      layoutId: "feedback-modal",
                      onClick: () => setIsFeedbackModalOpen(true),
                      href: null,
                    },
                    {
                      icon: <GearSixIcon weight="bold" className="size-4" />,
                      label: language.data.header.account.setting,
                      className: cn(),
                      layoutId: "setting-modal-by-account-dropdown",
                      onClick: () => {
                        setSettingLayoutId("setting-modal-by-account-dropdown")
                        setIsSettingModalOpen(true)
                      },
                      href: null,
                    },
                    userInfo && {
                      icon: <SignOutIcon weight="bold" className="size-4" />,
                      label: language.data.header.account.logout,
                      className: cn(
                        "hover:bg-rose-400/10 hover:text-rose-400 active:bg-rose-400/10"
                      ),
                      layoutId: undefined,
                      onClick: async () => {
                        revokeUserAccessToken().then(() => {
                          if (window.location.pathname.startsWith("/app")) {
                            window.location.href = "/"
                          } else {
                            window.location.reload()
                          }
                        })
                      },
                      href: null,
                    },
                  ].map((item, index) => {
                    if (!item)
                      return <React.Fragment key={index}></React.Fragment>
                    const DropdownButton = () => (
                      <motion.div
                        initial={{ opacity: 0, filter: "blur(3px)" }}
                        animate={{ opacity: 1, filter: "blur(0px)" }}
                        exit={{ opacity: 0, filter: "blur(3px)" }}
                        transition={{
                          delay: 0.4 + index * 0.05,
                          duration: 0.25,
                          ease: "easeOut",
                        }}
                      >
                        <motion.button
                          layoutId={item.layoutId}
                          layout="position"
                          transition={layoutTransition}
                          className={cn(dropdownBtnClassname, item.className)}
                          onClick={() => {
                            item.onClick?.()
                            setIsActive(false)
                          }}
                          data-smooth-interaction="true"
                        >
                          {item.icon}
                          <span className="text-sm">{item.label}</span>
                        </motion.button>
                      </motion.div>
                    )
                    if (item.href)
                      return (
                        <Link
                          key={"account-dropdown-btn-" + index}
                          href={item.href}
                          tabIndex={-1}
                        >
                          <DropdownButton />
                        </Link>
                      )

                    return (
                      <DropdownButton key={"account-dropdown-btn-" + index} />
                    )
                  })}
                </div>
              </motion.div>
            </motion.div>
          )}
        </LayoutGroup>
      </AnimatePresence>

      <AnimatePresence>
        {isActive && (
          <motion.div
            key="bg"
            layoutId="user-action-bg"
            onClick={() => setIsActive(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed inset-0 w-dvw h-dvh z-1000 flex items-center justify-center bg-black/30 p-2 backdrop-blur-[2px]"
          />
        )}
      </AnimatePresence>
    </div>
  )
}
