"use client"
import React, { useState } from "react"
import PonaIcon from "@/../public/static/flower.png"
import MyButton from "@/components/ui/custom/button"
import { useDiscordGuildInfo } from "@/contexts/discordGuildInfo"
import { useDiscordUserInfo } from "@/contexts/discordUserInfo"
import {
  ArrowLeftIcon,
  CaretDownIcon,
  ConfettiIcon,
  DiscordLogoIcon,
} from "@phosphor-icons/react/dist/ssr"
import ConfettiButtonTrigger from "../ui/custom/confetti-button"
import UserAccountDropdown from "./user-account-dropdown"
import HeaderSearch from "./header-search"
import { usePathname } from "next/navigation"
import { AnimatePresence, motion } from "framer-motion"
import { Button } from "../ui/button"
import Sidebar from "./sidebar"
import Image from "next/image"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { useAppStore } from "@/store/coreStore"
import { useAtom, useAtomValue } from "jotai"
import { ponaCommonStateAtom } from "@/store/musicAtoms"
import { isMemberInVCAtom, isSameVCAtom, navOpenedAtom } from "@/store/uiAtoms"

function Header() {
  const pathname = usePathname() || ""
  const [navOpened, setNavOpened] = useAtom(navOpenedAtom)

  const { guild } = useDiscordGuildInfo()
  const { userInfo } = useDiscordUserInfo()
  const language = useAppStore((state) => state.language)
  const ponaCommonState = useAtomValue(ponaCommonStateAtom)
  const isSameVC = useAtomValue(isSameVCAtom)
  const isMemberInVC = useAtomValue(isMemberInVCAtom)

  const isApp = pathname.startsWith("/app")
  const pathSegments = pathname.split("/")
  const isInGuild =
    isApp &&
    pathSegments.includes("g") &&
    !isNaN(Number(pathSegments[3]))
  const currentGuildId = isInGuild ? pathSegments[3] : guild?.id || ""
  const guildPath = isInGuild ? pathSegments[4] : ""
  const playerHomePath = currentGuildId ? `/app/g/${currentGuildId}/player` : "/app"
  const isMusicApp = isApp && pathname.includes("/player")
  const isIndex = pathname === "/"
  const isInChannelPage = pathname.includes("player/c")

  return (
    <motion.header
      className={cn(
        `nav-opened-${navOpened}`,
        "pona-header flex h-20 w-full items-center justify-center gap-3 p-6 px-8 max-md:px-3",
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
            href={isApp ? playerHomePath || "/app" : "/"}
            onClick={() => {
              setNavOpened(false)
            }}
            className={cn(
              isInChannelPage && "max-md:hidden"
            )}
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
          <Link
            href={isApp ? playerHomePath || "/app" : "/"}
            onClick={() => {
              setNavOpened(false)
            }}
            className={cn(
              !isInChannelPage && "hidden",
              isInChannelPage && "md:hidden"
            )}
          >
            <Button variant={"ghost"} size={"icon-lg"} className={"rounded-full size-12"}>
              <ArrowLeftIcon weight="bold" />
            </Button>
          </Link>
        </div>
        <div className="z-20 flex items-center gap-4">
          {pathname.includes("player") &&
            ponaCommonState &&
            ponaCommonState.pona.voiceChannel &&
            isSameVC && <HeaderSearch className="absolute left-54 [body.sidebar-collapsed_&]:left-16 disable-default-transition apply-long-soft-transition duration-700! max-md:hidden" navOpened={navOpened} />}
          <UserAccountDropdown minimize={true} className="-mr-2 md:hidden" />
          <MyButton
            className={`btn-icon m-0 mr-0! h-12 w-12 min-w-0! md:hidden! ${isMusicApp ? "max-md:hidden" : ""}`}
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
          <div className="header mb-6 h-20 w-full border-b border-foreground/10 md:hidden"></div>
          <div className="flex min-h-0 flex-1 gap-3 max-sm:p-0!">
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
          <div className="mt-3 flex items-center gap-3">
            {!userInfo && (
              <Link href="/app" rel="noopener noreferrer" tabIndex={-1}>
                <MyButton
                  size="small"
                  variant="text"
                  style="rounded"
                  className="z-40"
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
                    className="max-md:hidden z-10"
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
