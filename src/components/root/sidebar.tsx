"use client"
import { useDiscordGuildInfo } from "@/contexts/discordGuildInfo"
import { useGlobalContext } from "@/contexts/globalContext"
import { useLanguageContext } from "@/contexts/languageContext"
import { UserInfo } from "@/lib/server-side-api/discord/fetchUser"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Broadcast,
  Bug,
  CaretLeft,
  CaretLineLeftIcon,
  ChartPieSlice,
  ClockCounterClockwise,
  Compass,
  Confetti,
  CubeTransparent,
  Gear,
  HandHeartIcon,
  Heart,
  House,
  HouseSimple,
  Keyboard,
  MapPinArea,
  MonitorPlayIcon,
  MusicNoteSimple,
  PaintBrush,
  Palette,
  PersonSimpleRun,
  Planet,
  Playlist,
  ShieldCheckered,
  StarAndCrescent,
  SunHorizon,
  Thermometer,
  Wrench,
} from "@phosphor-icons/react/dist/ssr"
import clsx from "clsx"
import { AnimatePresence, motion } from "framer-motion"
import { usePathname, useRouter } from "next/navigation"
import ActivationLink from "@/components/activationLink"
import FrozenRoute from "../HOC/FrozenRoute"
import React, { useState } from "react"

const variants = {
  hidden: { opacity: 0, x: -12, y: 0 },
  enter: { opacity: 1, x: 0, y: 0 },
  exit: { opacity: 0, x: 12, y: 0 },
}

function Sidebar({
  userInfo,
  nav = false,
  onPushLocation,
  canCollapsed,
  onCollapsed,
}: {
  userInfo: UserInfo
  nav?: boolean
  onPushLocation?: () => void
  canCollapsed?: true | undefined
  onCollapsed?: (value: boolean) => void
}) {
  const pathname = usePathname() || ""
  const ownerId = process.env["NEXT_PUBLIC_DISCORD_OWNER_ID"]
  const isOwner = userInfo.id === ownerId
  const { guild } = useDiscordGuildInfo()
  const { language } = useLanguageContext()
  const { ponaCommonState, isSameVC } = useGlobalContext()
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false)
  const inGuild = pathname.startsWith("/app/g/")
  const inSetting = pathname.startsWith("/app/setting")
  const router = useRouter()
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

  React.useState(() => {
    if (!(canCollapsed && sidebarCollapsed))
      document.body.classList.remove("sidebar-collapsed")
  })

  return (
    <main
      className={`scrollbar disable-default-transition apply-long-soft-transition duration-700! ${!nav ? `${canCollapsed && sidebarCollapsed ? "w-16 max-w-16 min-w-16 p-2" : "w-64 max-w-64 min-w-64 p-4"} relative flex h-screen flex-col gap-2 pt-24 max-md:hidden` : "flex w-full flex-col gap-2 md:hidden"}`}
    >
      <AnimatePresence mode="popLayout">
        <motion.div
          className="max-h-[calc(100%-64px)] w-full"
          key={String(`${inGuild} ${inSetting} ${sidebarCollapsed}`)}
        >
          <ScrollArea
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
                      icon={StarAndCrescent}
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
                          icon={Palette}
                        >
                          {language.data.app.setting.layout.title}
                        </ActivationLink>
                      </div>
                      <div className="group-content">
                        <ActivationLink
                          iconOnly={canCollapsed && sidebarCollapsed}
                          onClick={handlePushLocation}
                          href={`#layout-theme`}
                          icon={PaintBrush}
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
                          icon={CubeTransparent}
                        >
                          {language.data.app.setting.layout.transparency.title}
                        </ActivationLink>
                        <ActivationLink
                          iconOnly={canCollapsed && sidebarCollapsed}
                          onClick={handlePushLocation}
                          href={`#layout-timeformat`}
                          icon={SunHorizon}
                        >
                          {language.data.app.setting.layout.time_format.title}
                        </ActivationLink>
                        <ActivationLink
                          iconOnly={canCollapsed && sidebarCollapsed}
                          onClick={handlePushLocation}
                          href={`#layout-thermometer`}
                          icon={Thermometer}
                        >
                          {language.data.app.setting.layout.thermometer.title}
                        </ActivationLink>
                        <ActivationLink
                          iconOnly={canCollapsed && sidebarCollapsed}
                          onClick={handlePushLocation}
                          href={`#layout-animations`}
                          icon={PersonSimpleRun}
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
                          icon={ShieldCheckered}
                        >
                          {language.data.app.setting.privacy.title}
                        </ActivationLink>
                      </div>
                      <div className="group-content">
                        <ActivationLink
                          iconOnly={canCollapsed && sidebarCollapsed}
                          onClick={handlePushLocation}
                          href={`#privacy-location`}
                          icon={MapPinArea}
                        >
                          {language.data.app.setting.privacy.location.title}
                        </ActivationLink>
                      </div>
                    </div>
                    <ActivationLink
                      iconOnly={canCollapsed && sidebarCollapsed}
                      onClick={handlePushLocation}
                      href={`#keybinds`}
                      icon={Keyboard}
                    >
                      {language.data.app.setting.keybinds.title}
                    </ActivationLink>
                    <ActivationLink
                      iconOnly={canCollapsed && sidebarCollapsed}
                      onClick={handlePushLocation}
                      href={`#devzone`}
                      icon={Bug}
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
                      icon={House}
                    >
                      {language.data.app.home.name}
                    </ActivationLink>
                    <ActivationLink
                      iconOnly={canCollapsed && sidebarCollapsed}
                      onClick={handlePushLocation}
                      href="/app/guilds"
                      icon={Confetti}
                    >
                      {language.data.app.guilds.name}
                    </ActivationLink>
                    <ActivationLink
                      iconOnly={canCollapsed && sidebarCollapsed}
                      onClick={handlePushLocation}
                      href="/app/playlists"
                      icon={Playlist}
                    >
                      {language.data.app.playlist.name}
                    </ActivationLink>
                    <ActivationLink
                      iconOnly={canCollapsed && sidebarCollapsed}
                      onClick={handlePushLocation}
                      href="/app/updates"
                      icon={Wrench}
                      isActive={pathname.includes("/app/updates")}
                    >
                      {language.data.app.updates.name}{" "}
                      <Badge color="primary" className="bg-primary/20">
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
                        icon={CaretLeft}
                        className="h-fit p-2"
                      >
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={guild.iconURL as string} />
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
                        icon={ChartPieSlice}
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
                          icon={MusicNoteSimple}
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
                              icon={MusicNoteSimple}
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
                              icon={HouseSimple}
                            >
                              {language.data.app.guilds.player.home.title}
                            </ActivationLink>
                            <ActivationLink
                              iconOnly={canCollapsed && sidebarCollapsed}
                              onClick={handlePushLocation}
                              href={`/app/g/${guild.id}/player/browse`}
                              icon={Compass}
                            >
                              {language.data.app.guilds.player.browse.title}
                            </ActivationLink>
                            <ActivationLink
                              iconOnly={canCollapsed && sidebarCollapsed}
                              onClick={handlePushLocation}
                              href={`/app/g/${guild.id}/player/favorite`}
                              icon={Heart}
                            >
                              {language.data.app.guilds.player.favorite.title}
                            </ActivationLink>
                            <ActivationLink
                              iconOnly={canCollapsed && sidebarCollapsed}
                              onClick={handlePushLocation}
                              href={`/app/g/${guild.id}/player/history`}
                              icon={ClockCounterClockwise}
                            >
                              {language.data.app.guilds.player.history.title}
                            </ActivationLink>
                            <ActivationLink
                              iconOnly={canCollapsed && sidebarCollapsed}
                              onClick={handlePushLocation}
                              href={`/app/g/${guild.id}/player/playlists`}
                              icon={Playlist}
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
                        icon={Broadcast}
                      >
                        {language.data.app.guilds.live_notify.name}{" "}
                        <Badge>{language.data.extensions.comingsoon}</Badge>
                      </ActivationLink>
                      <ActivationLink
                        iconOnly={canCollapsed && sidebarCollapsed}
                        onClick={handlePushLocation}
                        href={`/app/g/${guild.id}/setting`}
                        icon={Gear}
                      >
                        {language.data.app.guilds.setting.name}
                      </ActivationLink>
                    </>
                  )
                )}
              </motion.main>
            </FrozenRoute>
            <div className="p-2"></div>
          </ScrollArea>
        </motion.div>
      </AnimatePresence>
      {!nav && <div className="mt-auto"></div>}
      {false && isOwner && (
        <>
          <ActivationLink
            iconOnly={canCollapsed && sidebarCollapsed}
            onClick={handlePushLocation}
            href="/app/stats"
            icon={Planet}
          >
            Stats
          </ActivationLink>
        </>
      )}
      <div
        className={clsx(
          "flex gap-1!",
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
                      icon={CaretLeft}
                    >
                      {language.data.app.setting.back}
                    </ActivationLink>
                  </>
                ) : (
                  <>
                    <ActivationLink
                      className="w-full"
                      iconOnly={canCollapsed && sidebarCollapsed}
                      onClick={handlePushLocation}
                      href="/app/setting"
                      icon={Gear}
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
          <Button
            className={"flex items-center justify-center!"}
            variant={"ghost"}
            size="icon-lg"
            onClick={() => {
              setSidebarCollapsed((value) => {
                if (onCollapsed) onCollapsed(!value)
                if (!value) document.body.classList.add("sidebar-collapsed")
                else document.body.classList.remove("sidebar-collapsed")
                return !value
              })
            }}
          >
            <CaretLineLeftIcon
              className={clsx(
                "block",
                sidebarCollapsed && "rotate-180",
                sidebarCollapsed && "text-foreground",
                !sidebarCollapsed && "text-primary"
              )}
              size={16}
              weight="bold"
            />
          </Button>
        )}
      </div>
    </main>
  )
}

export default Sidebar
