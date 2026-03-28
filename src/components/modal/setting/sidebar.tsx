"use client"
import React from "react"
import { useLanguageContext } from "@/contexts/languageContext"
import { useDiscordUserInfo } from "@/contexts/discordUserInfo"
import { motion } from "motion/react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  KeyboardIcon,
  LockSimpleIcon,
  ShapesIcon,
  ShieldCheckIcon,
  SignOutIcon,
  SmileyIcon,
} from "@phosphor-icons/react"
import { Pages } from "."

export type SubPage = {
  name: string
  target: React.FC | string
}

export interface Link {
  name: string
  target: React.FC
  icon: React.ReactNode
  subpages: SubPage[]
}

export interface Links {
  category: string
  links: Link[]
}

function SettingModalSidebar() {
  const { language } = useLanguageContext()
  const { userInfo, revokeUserAccessToken } = useDiscordUserInfo()

  const links: Links[] = [
    userInfo && {
      category: language.data.app.setting.category.user_setting,
      links: [
        {
          name: language.data.app.setting.account.title,
          target: Pages.account,
          icon: <SmileyIcon weight="fill" className="size-4" />,
          subpages: [],
        },
        {
          name: language.data.app.setting.privacy.title,
          target: Pages.account,
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
          target: Pages.account,
          icon: <ShapesIcon weight="fill" className="size-4" />,
          subpages: [],
        },
        {
          name: language.data.app.setting.keybinds.title,
          target: Pages.account,
          icon: <KeyboardIcon weight="fill" className="size-4" />,
          subpages: [],
        },
      ],
    },
  ].filter(Boolean) as Links[]

  return (
    <div>
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
          "mb-0.5 flex w-full items-center justify-start gap-3 rounded-lg px-3 py-1 select-none hover:bg-foreground/5 not-dark:hover:bg-foreground/10",
          !userInfo && "bg-transparent! p-0"
        )}
      >
        {userInfo ? (
          <>
            <Avatar className="h-8 w-8">
              <AvatarImage
                src={`https://cdn.discordapp.com/avatars/${userInfo.id}/${userInfo.avatar}.png`}
              />
              <AvatarFallback>
                {userInfo.global_name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <motion.div className="flex flex-col items-start py-1">
              <motion.p
                initial={{ opacity: 0, filter: "blur(3px)" }}
                animate={{ opacity: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, filter: "blur(3px)" }}
                transition={{
                  delay: 0.45,
                  duration: 0.25,
                  ease: "easeOut",
                }}
                className="leading-4 font-bold"
              >
                {userInfo.global_name}
              </motion.p>
              <motion.strong
                initial={{ opacity: 0, filter: "blur(3px)" }}
                animate={{ opacity: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, filter: "blur(3px)" }}
                transition={{
                  delay: 0.52,
                  duration: 0.25,
                  ease: "easeOut",
                }}
                className="text-xs leading-4 text-foreground/40"
              >
                @{userInfo.username}
              </motion.strong>
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
                "apply- flex w-full flex-col items-center justify-center gap-2 rounded-lg p-3 select-none",
                !userInfo &&
                  "border-2 border-dashed border-foreground/10 bg-foreground/5 not-dark:bg-foreground/10 hover:bg-foreground/10 not-dark:hover:bg-foreground/5 active:scale-95 active:duration-150"
              )}
              data-default-transition="true"
            >
              <LockSimpleIcon weight="bold" />
              <span>{language.data.common.login_first}</span>
            </motion.div>
          </Link>
        )}
      </motion.div>
      {links.map((category, index) => (
        <div
          className="mt-2 flex flex-col items-start justify-start gap-1"
          key={"setting-modal-sidebar-category-" + index}
        >
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              delay: 0.5 + index * 0.05,
              duration: 0.25,
              ease: "easeOut",
            }}
            className="px-2 text-xs text-foreground/40"
          >
            {category.category}
          </motion.span>
          {category.links.map((link, i) => (
            <motion.button
              initial={{ opacity: 0, filter: "blur(3px)" }}
              animate={{ opacity: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, filter: "blur(3px)" }}
              transition={{
                delay: 0.5 + index * 0.08 + i * 0.08,
                duration: 0.25,
                ease: "easeOut",
              }}
              data-smooth-interaction="true"
              className={cn(
                "group flex w-full items-center justify-start gap-2 rounded-md bg-transparent px-3 py-2",
                "not-hover:text-foreground/60",
                "hover:bg-foreground/10 active:bg-foreground/10 dark:hover:bg-foreground/5"
              )}
              key={"setting-modal-sidebar-category-" + index + "-link-" + i}
            >
              {link.icon}
              <span className="text-sm">{link.name}</span>
            </motion.button>
          ))}

          <motion.hr
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{
              delay: 0.5 + index * 0.08,
              duration: 0.25,
              ease: "easeOut",
            }}
            className="my-2 w-full"
          />
        </div>
      ))}
      <motion.div
        initial={{ opacity: 0, filter: "blur(3px)" }}
        animate={{ opacity: 1, filter: "blur(0px)" }}
        exit={{ opacity: 0, filter: "blur(3px)" }}
        transition={{
          delay: 0.5 + links.length * 0.08,
          duration: 0.25,
          ease: "easeOut",
        }}
      >
        {userInfo && (
          <motion.button
            initial={{ opacity: 0, filter: "blur(3px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, filter: "blur(3px)" }}
            transition={{
              delay: 0.5 + links.length * 0.08 + 0.1,
              duration: 0.25,
              ease: "easeOut",
            }}
            data-smooth-interaction="true"
            className={cn(
              "group flex w-full items-center justify-start gap-2 rounded-md bg-transparent px-3 py-2 dark:hover:bg-foreground/5",
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
        )}
        <motion.div
          initial={{ opacity: 0, filter: "blur(3px)" }}
          animate={{ opacity: 1, filter: "blur(0px)" }}
          exit={{ opacity: 0, filter: "blur(3px)" }}
          transition={{
            delay: 0.5 + links.length * 0.08 + 0.2,
            duration: 0.25,
            ease: "easeOut",
          }}
          className="mt-1 flex flex-wrap gap-1 px-2"
        >
          <span className="text-xs text-foreground/40">
            v{process.env["NEXT_PUBLIC_APP_VERSION"] || "unknown"}
          </span>
        </motion.div>
      </motion.div>
    </div>
  )
}

export default SettingModalSidebar
