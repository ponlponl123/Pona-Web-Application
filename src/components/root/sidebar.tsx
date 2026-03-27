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
  BugIcon,
  CaretLeftIcon,
  CaretLineLeftIcon,
  ChartPieSliceIcon,
  ClockCounterClockwiseIcon,
  CompassIcon,
  ConfettiIcon,
  CubeTransparentIcon,
  GearIcon,
  HandHeartIcon,
  HeartIcon,
  HouseIcon,
  HouseSimpleIcon,
  KeyboardIcon,
  MapPinAreaIcon,
  MonitorPlayIcon,
  MusicNoteSimpleIcon,
  PaintBrushIcon,
  PaletteIcon,
  PersonSimpleRunIcon,
  PlaylistIcon,
  ShieldCheckeredIcon,
  StarAndCrescentIcon,
  SunHorizonIcon,
  ThermometerIcon,
  WrenchIcon,
} from "@phosphor-icons/react/dist/ssr"
import clsx from "clsx"
import { cn } from "@/lib/utils"
import FrozenRoute from "../HOC/FrozenRoute"
import React, { useState, useEffect } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { usePathname, useRouter } from "next/navigation"
import ActivationLink from "@/components/activationLink"
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip"

const variants = {
  hidden: { opacity: 0, x: -12, y: 0 },
  enter: { opacity: 1, x: 0, y: 0 },
  exit: { opacity: 0, x: 12, y: 0 },
}

interface SidebarProps {
  userInfo: UserInfo
  nav?: boolean
  onPushLocation?: () => void
  canCollapsed?: boolean
  onCollapsed?: (value: boolean) => void
  setNavActive?: (value: boolean) => void
}

function Sidebar({
  userInfo,
  nav = false,
  onPushLocation,
  canCollapsed,
  onCollapsed,
  setNavActive,
}: SidebarProps) {
  const pathname = usePathname() || ""
  const ownerId = process.env["NEXT_PUBLIC_DISCORD_OWNER_ID"]
  const isOwner = userInfo.id === ownerId
  const { guild } = useDiscordGuildInfo()
  const { language } = useLanguageContext()
  const { ponaCommonState, isSameVC } = useGlobalContext()
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false)
  const router = useRouter()

  const inGuild = pathname.startsWith("/app/g/")
  const inSetting = pathname.startsWith("/app/setting")
  const isCollapsed = Boolean(canCollapsed && sidebarCollapsed)

  const handlePushLocation = () => {
    if (onPushLocation) onPushLocation()
  }

  const handleBackNavigation = () => {
    const previousPath = document.referrer
    if (previousPath && previousPath.includes(window.location.origin)) {
      router.back()
    } else {
      router.push("/app")
    }
  }

  useEffect(() => {
    if (!isCollapsed) {
      document.body.classList.remove("sidebar-collapsed")
    } else {
      document.body.classList.add("sidebar-collapsed")
    }

    return () => {
      document.body.classList.remove("sidebar-collapsed")
    }
  }, [isCollapsed])

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
      <AnimatePresence mode="popLayout">
        <motion.div
          className="max-h-[calc(100%-64px)] w-full max-md:-mb-1"
          key={`${inGuild}-${inSetting}-${sidebarCollapsed}`}
        >
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
                key="Menu"
              >
                {inSetting ? (
                  <>
                    <span
                      className={`px-4 text-lg font-bold ${canCollapsed && sidebarCollapsed ? "hidden" : ""}`}
                    >
                      {language.data.app.setting.name}
                    </span>
                    <ActivationLink
                      iconOnly={canCollapsed && sidebarCollapsed}
                      onClick={handlePushLocation}
                      href={`#account`}
                      icon={StarAndCrescentIcon}
                    >
                      {language.data.app.setting.account.title}
                    </ActivationLink>
                    <div
                      className={`group-menu ${canCollapsed && sidebarCollapsed ? "collapsed" : ""}`}
                    >
                      <div className="group-title">
                        <ActivationLink
                          iconOnly={canCollapsed && sidebarCollapsed}
                          onClick={handlePushLocation}
                          href={`#layout`}
                          icon={PaletteIcon}
                        >
                          {language.data.app.setting.layout.title}
                        </ActivationLink>
                      </div>
                      <div className="group-content">
                        <ActivationLink
                          iconOnly={canCollapsed && sidebarCollapsed}
                          onClick={handlePushLocation}
                          href={`#layout-theme`}
                          icon={PaintBrushIcon}
                        >
                          {language.data.app.setting.layout.theme.title}
                        </ActivationLink>
                        <ActivationLink
                          iconOnly={canCollapsed && sidebarCollapsed}
                          onClick={handlePushLocation}
                          href={`#layout-player`}
                          icon={MonitorPlayIcon}
                        >
                          {language.data.app.setting.layout.player.title}
                        </ActivationLink>
                        <ActivationLink
                          iconOnly={canCollapsed && sidebarCollapsed}
                          onClick={handlePushLocation}
                          href={`#layout-transparency`}
                          icon={CubeTransparentIcon}
                        >
                          {language.data.app.setting.layout.transparency.title}
                        </ActivationLink>
                        <ActivationLink
                          iconOnly={canCollapsed && sidebarCollapsed}
                          onClick={handlePushLocation}
                          href={`#layout-timeformat`}
                          icon={SunHorizonIcon}
                        >
                          {language.data.app.setting.layout.time_format.title}
                        </ActivationLink>
                        <ActivationLink
                          iconOnly={canCollapsed && sidebarCollapsed}
                          onClick={handlePushLocation}
                          href={`#layout-thermometer`}
                          icon={ThermometerIcon}
                        >
                          {language.data.app.setting.layout.thermometer.title}
                        </ActivationLink>
                        <ActivationLink
                          iconOnly={canCollapsed && sidebarCollapsed}
                          onClick={handlePushLocation}
                          href={`#layout-animations`}
                          icon={PersonSimpleRunIcon}
                        >
                          {language.data.app.setting.layout.animation.title}
                        </ActivationLink>
                      </div>
                    </div>
                    <div
                      className={`group-menu ${canCollapsed && sidebarCollapsed ? "collapsed" : ""}`}
                    >
                      <div className="group-title">
                        <ActivationLink
                          iconOnly={canCollapsed && sidebarCollapsed}
                          onClick={handlePushLocation}
                          href={`#privacy`}
                          icon={ShieldCheckeredIcon}
                        >
                          {language.data.app.setting.privacy.title}
                        </ActivationLink>
                      </div>
                      <div className="group-content">
                        <ActivationLink
                          iconOnly={canCollapsed && sidebarCollapsed}
                          onClick={handlePushLocation}
                          href={`#privacy-location`}
                          icon={MapPinAreaIcon}
                        >
                          {language.data.app.setting.privacy.location.title}
                        </ActivationLink>
                      </div>
                    </div>
                    <ActivationLink
                      iconOnly={canCollapsed && sidebarCollapsed}
                      onClick={handlePushLocation}
                      href={`#keybinds`}
                      icon={KeyboardIcon}
                    >
                      {language.data.app.setting.keybinds.title}
                    </ActivationLink>
                    <ActivationLink
                      iconOnly={canCollapsed && sidebarCollapsed}
                      onClick={handlePushLocation}
                      href={`#devzone`}
                      icon={BugIcon}
                    >
                      {language.data.app.setting.dev_mode.title}
                    </ActivationLink>
                  </>
                ) : !inGuild ? (
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
                      href="/app/playlists"
                      icon={PlaylistIcon}
                    >
                      {language.data.app.playlist.name}
                    </ActivationLink>
                    <ActivationLink
                      iconOnly={canCollapsed && sidebarCollapsed}
                      onClick={handlePushLocation}
                      href="/updates"
                      icon={WrenchIcon}
                      isActive={pathname.includes("/updates")}
                    >
                      {language.data.app.updates.name}{" "}
                      <Badge
                        color="primary"
                        className="m-1 rounded-full bg-primary/20"
                      >
                        <span className="font-bold">
                          v{process.env["NEXT_PUBLIC_APP_VERSION"] || "unknown"}
                        </span>
                      </Badge>
                    </ActivationLink>
                    <ActivationLink
                      iconOnly={canCollapsed && sidebarCollapsed}
                      onClick={handlePushLocation}
                      href="/app/feedback"
                      icon={HandHeartIcon}
                    >
                      Feedback
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
                        className="h-fit p-2"
                      >
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage
                              src={`https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`}
                            />
                            <AvatarFallback>
                              {guild.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <h1 className="text-base">{guild.name}</h1>
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
                      <ActivationLink
                        iconOnly={canCollapsed && sidebarCollapsed}
                        onClick={handlePushLocation}
                        href={`/app/g/${guild.id}/live-notify`}
                        isDisabled={true}
                        icon={BroadcastIcon}
                      >
                        {language.data.app.guilds.live_notify.name}{" "}
                        <Badge>{language.data.extensions.comingsoon}</Badge>
                      </ActivationLink>
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
        </motion.div>
      </AnimatePresence>

      {!nav && <div className="mt-auto"></div>}

      <div
        className={clsx(
          "flex gap-0.5!",
          !sidebarCollapsed ? "flex-row!" : "flex-col"
        )}
      >
        <AnimatePresence mode="popLayout">
          <motion.div
            className="min-w-0 flex-1"
            key={String(`${inSetting} ${sidebarCollapsed}`)}
          >
            <FrozenRoute>
              <motion.main
                variants={variants}
                initial="hidden"
                exit="exit"
                animate="enter"
                transition={{ type: "tween", duration: 0.12 }}
                key="Bottom-Menu"
              >
                {inSetting ? (
                  <>
                    <ActivationLink
                      className="w-full"
                      iconOnly={canCollapsed && sidebarCollapsed}
                      onClick={handleBackNavigation}
                      icon={CaretLeftIcon}
                    >
                      {language.data.app.setting.back}
                    </ActivationLink>
                  </>
                ) : (
                  <>
                    <ActivationLink
                      className="w-full"
                      iconOnly={canCollapsed && sidebarCollapsed}
                      onClick={() => {
                        ;(handlePushLocation(), setNavActive?.(false))
                      }}
                      icon={GearIcon}
                    >
                      {language.data.app.setting.name}
                    </ActivationLink>
                  </>
                )}
              </motion.main>
            </FrozenRoute>
          </motion.div>
        </AnimatePresence>

        {canCollapsed && (
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  className={cn(
                    "flex items-center justify-center! rounded-lg",
                    sidebarCollapsed && "size-10"
                  )}
                  variant="ghost"
                  size="icon-lg"
                  onClick={() => {
                    setSidebarCollapsed((prev) => {
                      const newState = !prev
                      if (onCollapsed) onCollapsed(newState)
                      return newState
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
