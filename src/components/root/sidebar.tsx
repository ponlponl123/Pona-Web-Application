"use client"
import { useDiscordGuildInfo } from "@/contexts/discordGuildInfo"
import { useGlobalContext } from "@/contexts/globalContext"
import { useLanguageContext } from "@/contexts/languageContext"
import { UserInfo } from "@/lib/server-side-api/discord/fetchUser"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollShadow } from "@heroui/react"
import {
  BroadcastIcon,
  CaretDownIcon,
  CaretLeftIcon,
  CaretLineLeftIcon,
  ChartPieSliceIcon,
  ClockCounterClockwiseIcon,
  CompassIcon,
  ConfettiIcon,
  GearIcon,
  HeartIcon,
  HouseIcon,
  HouseSimpleIcon,
  MusicNoteSimpleIcon,
  PlaylistIcon,
  WrenchIcon,
} from "@phosphor-icons/react"
import clsx from "clsx"
import { cn } from "@/lib/utils"
import { useState, useEffect, useMemo } from "react"
import FrozenRoute from "../HOC/FrozenRoute"
import { usePathname } from "next/navigation"
import { AnimatePresence, motion } from "motion/react"
import ActivationLink from "@/components/activationLink"
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip"
import { useUserSettingContext } from "@/contexts/userSettingContext"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible"

const variants = {
  hidden: { opacity: 0, x: -12, y: 0 },
  enter: { opacity: 1, x: 0, y: 0 },
  exit: { opacity: 0, x: 12, y: 0 },
}

interface SidebarProps {
  userInfo: UserInfo
  nav?: boolean
  onPushLocation?: () => void
  canCollapsed: boolean
  onCollapsed?: (value: boolean) => void
  setNavActive?: (value: boolean) => void
}

function Sidebar({
  userInfo,
  nav = false,
  onPushLocation,
  canCollapsed = true,
  onCollapsed,
  setNavActive,
}: SidebarProps) {
  const pathname = usePathname() || ""
  const ownerId = process.env["NEXT_PUBLIC_DISCORD_OWNER_ID"]
  const isOwner = userInfo.id === ownerId
  const { guild } = useDiscordGuildInfo()
  const { language } = useLanguageContext()
  const {
    ponaCommonState,
    isSameVC,
    isSettingModalOpen,
    setIsSettingModalOpen,
    setSettingLayoutId,
  } = useGlobalContext()
  const { userSetting, setUserSetting } = useUserSettingContext()
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(
    userSetting.isSidebarCollapsed
  )

  const inGuild = pathname.startsWith("/app/g/")
  const isCollapsed = canCollapsed && sidebarCollapsed

  const handlePushLocation = () => {
    if (onPushLocation) onPushLocation()
  }

  useEffect(() => {
    if (!isCollapsed) document.body.classList.remove("sidebar-collapsed")
    else document.body.classList.add("sidebar-collapsed")

    return () => {
      document.body.classList.remove("sidebar-collapsed")
    }
  }, [isCollapsed])

  useEffect(() => {
    setSidebarCollapsed(userSetting.isSidebarCollapsed)
  }, [userSetting])

  return (
    <main
      className={cn(
        `scrollbar disable-default-transition apply-long-soft-transition duration-700! max-md:h-full`,
        !nav
          ? cn(
              isCollapsed
                ? "w-12 max-w-12 min-w-12 p-1"
                : "w-48 max-w-48 min-w-48 p-2",
              `relative flex h-screen flex-col gap-2 pt-20 max-md:hidden`
            )
          : "flex w-full flex-col gap-2 md:hidden"
      )}
    >
      <div className="max-h-[calc(100%-64px)] w-full max-md:-mb-1">
        <AnimatePresence mode="popLayout">
          <ScrollShadow
            className="flex max-h-full w-full flex-col"
            style={{ scrollbarWidth: "none" }}
          >
            <FrozenRoute>
              <motion.main
                variants={variants}
                initial="hidden"
                exit="exit"
                animate="enter"
                transition={{ type: "tween", duration: 0.12 }}
                className="flex min-h-max flex-col gap-1"
                key={`menu-${inGuild}-${sidebarCollapsed}`}
              >
                {!inGuild ? (
                  <>
                    <ActivationLink
                      iconOnly={canCollapsed && sidebarCollapsed}
                      onClick={handlePushLocation}
                      href="/app"
                      icon={HouseIcon}
                    >
                      {language.data.app.home.name}
                    </ActivationLink>
                    <ActivationLink
                      iconOnly={canCollapsed && sidebarCollapsed}
                      onClick={handlePushLocation}
                      href="/app/guilds"
                      icon={ConfettiIcon}
                    >
                      {language.data.app.guilds.name}
                    </ActivationLink>
                    <ActivationLink
                      iconOnly={canCollapsed && sidebarCollapsed}
                      onClick={handlePushLocation}
                      href="/updates"
                      icon={WrenchIcon}
                      isActive={pathname.includes("/updates")}
                      className={cn(!sidebarCollapsed && "h-max")}
                    >
                      <div className="flex flex-wrap items-center gap-x-1">
                        {language.data.app.updates.name}
                        <Badge
                          color="primary"
                          className="m-1 rounded-full bg-primary/20"
                        >
                          <span className="font-bold">
                            v
                            {process.env["NEXT_PUBLIC_APP_VERSION"] ||
                              "unknown"}
                          </span>
                        </Badge>
                      </div>
                    </ActivationLink>
                  </>
                ) : (
                  guild && (
                    <>
                      <ActivationLink
                        iconOnly={canCollapsed && sidebarCollapsed}
                        onClick={handlePushLocation}
                        href="/app/guilds"
                        icon={CaretLeftIcon}
                        className="h-fit gap-0 p-2"
                      >
                        <div className="flex min-w-0 flex-1 items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage
                              src={`https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`}
                            />
                            <AvatarFallback>
                              {guild.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <Tooltip>
                            <TooltipTrigger
                              delay={300}
                              render={
                                <h1 className="min-w-0 flex-1 overflow-hidden text-sm overflow-ellipsis whitespace-nowrap" />
                              }
                            >
                              {guild.name}
                            </TooltipTrigger>
                            <TooltipContent>{guild.name}</TooltipContent>
                          </Tooltip>
                        </div>
                      </ActivationLink>
                      <ActivationLink
                        iconOnly={canCollapsed && sidebarCollapsed}
                        onClick={handlePushLocation}
                        href={`/app/g/${guild.id}`}
                        icon={ChartPieSliceIcon}
                      >
                        {language.data.app.overview.name}
                      </ActivationLink>
                      {!(
                        ponaCommonState &&
                        ponaCommonState.pona.voiceChannel &&
                        isSameVC
                      ) ? (
                        <ActivationLink
                          iconOnly={canCollapsed && sidebarCollapsed}
                          onClick={handlePushLocation}
                          href={`/app/g/${guild.id}/player`}
                          icon={MusicNoteSimpleIcon}
                        >
                          {language.data.app.guilds.player.name}
                        </ActivationLink>
                      ) : (
                        <div
                          className={`group-menu ${canCollapsed && sidebarCollapsed ? "collapsed" : ""}`}
                          aria-label={`/app/g/${guild.id}/player`}
                        >
                          <div className="group-title">
                            <ActivationLink
                              iconOnly={canCollapsed && sidebarCollapsed}
                              onClick={handlePushLocation}
                              href={`/app/g/${guild.id}/player`}
                              icon={MusicNoteSimpleIcon}
                            >
                              {language.data.app.guilds.player.name}{" "}
                              <Badge>{language.data.extensions.beta}</Badge>
                            </ActivationLink>
                          </div>
                          <div className="group-content">
                            <ActivationLink
                              iconOnly={canCollapsed && sidebarCollapsed}
                              onClick={handlePushLocation}
                              href={`/app/g/${guild.id}/player`}
                              icon={HouseSimpleIcon}
                            >
                              {language.data.app.guilds.player.home.title}
                            </ActivationLink>
                            <ActivationLink
                              iconOnly={canCollapsed && sidebarCollapsed}
                              onClick={handlePushLocation}
                              href={`/app/g/${guild.id}/player/browse`}
                              icon={CompassIcon}
                            >
                              {language.data.app.guilds.player.browse.title}
                            </ActivationLink>
                            <ActivationLink
                              iconOnly={canCollapsed && sidebarCollapsed}
                              onClick={handlePushLocation}
                              href={`/app/g/${guild.id}/player/favorite`}
                              icon={HeartIcon}
                            >
                              {language.data.app.guilds.player.favorite.title}
                            </ActivationLink>
                            <ActivationLink
                              iconOnly={canCollapsed && sidebarCollapsed}
                              onClick={handlePushLocation}
                              href={`/app/g/${guild.id}/player/history`}
                              icon={ClockCounterClockwiseIcon}
                            >
                              {language.data.app.guilds.player.history.title}
                            </ActivationLink>
                            <ActivationLink
                              iconOnly={canCollapsed && sidebarCollapsed}
                              onClick={handlePushLocation}
                              href={`/app/g/${guild.id}/player/playlists`}
                              icon={PlaylistIcon}
                            >
                              {language.data.app.playlist.name}
                            </ActivationLink>
                          </div>
                        </div>
                      )}
                      <Collapsible
                        defaultOpen={true}
                        className={"group/collapsible"}
                      >
                        <CollapsibleTrigger
                          className={
                            "mb-1 flex w-full items-center justify-between rounded-lg px-2 py-1 text-xs group-data-open/collapsible:bg-foreground/10 hover:bg-foreground/10 dark:hover:bg-foreground/5"
                          }
                          data-smooth-interaction="true"
                        >
                          Permissions
                          <CaretDownIcon
                            weight="bold"
                            className="size-3 group-data-open/collapsible:rotate-180"
                          />
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <div className="flex">
                            <div className="flex min-h-0 w-3 flex-col items-center justify-center">
                              <div className="min-h-0 w-0.5 flex-1 bg-foreground/10" />
                            </div>
                            <div className="flex min-h-0 min-w-0 flex-1 flex-col">
                              <ActivationLink
                                iconOnly={canCollapsed && sidebarCollapsed}
                                onClick={handlePushLocation}
                                href={`/app/g/${guild.id}/live-notify`}
                                isDisabled={true}
                                icon={BroadcastIcon}
                              >
                                {language.data.app.guilds.live_notify.name}
                              </ActivationLink>
                            </div>
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                      <ActivationLink
                        iconOnly={canCollapsed && sidebarCollapsed}
                        onClick={handlePushLocation}
                        href={`/app/g/${guild.id}/setting`}
                        icon={GearIcon}
                      >
                        {language.data.app.guilds.setting.name}
                      </ActivationLink>
                    </>
                  )
                )}
              </motion.main>
            </FrozenRoute>
            <div className="max-md:hidden md:p-2"></div>
          </ScrollShadow>
        </AnimatePresence>
      </div>

      {!nav && <div className="mt-auto"></div>}

      <div
        className={clsx(
          "flex gap-0.5!",
          !sidebarCollapsed ? "flex-row!" : "flex-col"
        )}
      >
        <AnimatePresence mode="wait">
          <motion.main
            variants={variants}
            initial="hidden"
            exit="exit"
            animate="enter"
            transition={{ type: "tween", duration: 0.12 }}
            key={"Bottom-Menu" + sidebarCollapsed}
          >
            <motion.div
              layoutId={
                "setting-modal-by-app-sidebar-iscollapsed-" + sidebarCollapsed
              }
            >
              <ActivationLink
                className={cn("w-full", isSettingModalOpen && "invisible")}
                iconOnly={canCollapsed && sidebarCollapsed}
                onClick={() => {
                  ;(setSettingLayoutId(
                    "setting-modal-by-app-sidebar-iscollapsed-" +
                      sidebarCollapsed
                  ),
                    setIsSettingModalOpen(true),
                    setNavActive?.(false))
                }}
                icon={GearIcon}
              >
                {language.data.app.setting.name}
              </ActivationLink>
            </motion.div>
          </motion.main>
        </AnimatePresence>

        {canCollapsed && (
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  className={cn(
                    "flex items-center justify-center! rounded-lg bg-transparent hover:bg-foreground/10 dark:hover:bg-foreground/5",
                    sidebarCollapsed && "size-10"
                  )}
                  size="icon-lg"
                  onClick={() => {
                    setSidebarCollapsed((prev) => {
                      const newState = !prev
                      if (onCollapsed) onCollapsed(newState)
                      return newState
                    })
                    setUserSetting({
                      ...userSetting,
                      isSidebarCollapsed: !sidebarCollapsed,
                    })
                  }}
                  data-smooth-interaction="true"
                />
              }
            >
              <CaretLineLeftIcon
                className={clsx(
                  "block",
                  sidebarCollapsed
                    ? "rotate-180 text-foreground"
                    : "rotate-0 text-foreground"
                )}
                size={16}
                weight="bold"
              />
            </TooltipTrigger>
            <TooltipContent>
              <p>Collapse sidebar</p>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </main>
  )
}

export default Sidebar
