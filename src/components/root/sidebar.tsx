"use client"
import { useDiscordGuildInfo } from "@/contexts/discordGuildInfo"
import { UserInfo } from "@/lib/server-side-api/discord/fetchUser"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  BroadcastIcon,
  CaretDownIcon,
  CaretLeftIcon,
  CaretLineLeftIcon,
  ChartPieSliceIcon,
  ChatCircleIcon,
  ClockCounterClockwiseIcon,
  CompassIcon,
  ConfettiIcon,
  DiscoBallIcon,
  FingerprintSimpleIcon,
  GearIcon,
  HeartIcon,
  HouseIcon,
  HouseSimpleIcon,
  IdentificationBadgeIcon,
  MusicNoteSimpleIcon,
  PlaylistIcon,
  ShieldCheckIcon,
  TerminalIcon,
  WrenchIcon,
} from "@phosphor-icons/react"
import clsx from "clsx"
import { cn } from "@/lib/utils"
import { useState, useEffect, useMemo } from "react"
import { usePathname, useRouter } from "next/navigation"
import { AnimatePresence, motion } from "motion/react"
import ActivationLink from "@/components/activationLink"
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "../ui/collapsible"
import CustomScrollArea from "../ui/custom/scroll-area"
import { useAppStore } from "@/store/coreStore"
import { useAtomValue, useSetAtom } from "jotai"
import {
  isSameVCAtom,
  isSettingModalOpenAtom,
  settingLayoutIdAtom,
} from "@/store/uiAtoms"
import { ponaCommonStateAtom } from "@/store/musicAtoms"
import { PanelLeftOpenIcon } from "../animate-ui/icons/panel-left-open"
import { PanelLeftCloseIcon } from "../animate-ui/icons/panel-left-close"
import { AnimateIcon } from "../animate-ui/icons/icon"

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
  const router = useRouter()
  const { guild } = useDiscordGuildInfo()
  const language = useAppStore((state) => state.language)
  const userSetting = useAppStore((state) => state.userSetting)
  const setUserSetting = useAppStore((state) => state.setUserSetting)
  const ponaCommonState = useAtomValue(ponaCommonStateAtom)
  const isSameVC = useAtomValue(isSameVCAtom)
  const isSettingModalOpen = useAtomValue(isSettingModalOpenAtom)
  const setIsSettingModalOpen = useSetAtom(isSettingModalOpenAtom)
  const setSettingLayoutId = useSetAtom(settingLayoutIdAtom)
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(
    userSetting.isSidebarCollapsed
  )

  const inGuild = pathname.startsWith("/app/g/")
  const inPlayer = inGuild && pathname.includes("/player")
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

  const collapsibleSections = useMemo(() => {
    if (!guild?.id) return []

    return [
      {
        title: language.data.app.guilds.security.title,
        icon: ShieldCheckIcon,
        items: [
          {
            href: `/app/g/${guild.id}/security/multi-factor-auth`,
            name: language.data.app.guilds.security.multi_factor_auth.title,
            icon: FingerprintSimpleIcon,
            isDisabled: false,
          },
          {
            href: `/app/g/${guild.id}/security/message`,
            name: language.data.app.guilds.security.message.title,
            icon: ChatCircleIcon,
            isDisabled: false,
          },
        ],
      },
      {
        title: language.data.app.guilds.permissions.title,
        icon: IdentificationBadgeIcon,
        items: [
          {
            href: `/app/g/${guild.id}/permissions/music`,
            name: language.data.app.guilds.permissions.music.title,
            icon: MusicNoteSimpleIcon,
            isDisabled: false,
          },
          {
            href: `/app/g/${guild.id}/permissions/commands`,
            name: language.data.app.guilds.permissions.commands.title,
            icon: TerminalIcon,
            isDisabled: false,
          },
        ],
      },
      {
        title: language.data.app.guilds.utilities.title,
        icon: DiscoBallIcon,
        items: [
          {
            href: `/app/g/${guild.id}/utilities/live-notify`,
            name: language.data.app.guilds.utilities.live_notify.name,
            icon: BroadcastIcon,
            isDisabled: false,
          },
        ],
      },
    ]
  }, [guild?.id, language])

  return (
    <main
      className={cn(
        `disable-default-transition apply-long-soft-transition scrollbar duration-700! max-md:h-full`,
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
      <div className="w-full max-md:-mb-1 max-md:min-h-0 max-md:flex-1 md:max-h-[calc(100%-64px)]">
        <CustomScrollArea
          className="max-h-full"
          classNames={{
            viewport: "flex max-h-full w-full flex-col",
            scrollbar: "translate-x-4",
          }}
        >
          <AnimatePresence mode="wait" initial={false}>
            {!inGuild ? (
              <motion.div
                key={`main-menu-${sidebarCollapsed}`}
                initial={{ opacity: 0, filter: "blur(6px)" }}
                animate={{ opacity: 1, filter: "blur(0px)" }}
                exit={{ opacity: 0, filter: "blur(6px)" }}
                transition={{ duration: 0.16 }}
                className="flex min-h-max flex-col gap-1"
              >
                <motion.div
                  initial={{ opacity: 0, filter: "blur(6px)" }}
                  animate={{ opacity: 1, filter: "blur(0px)" }}
                  transition={{ duration: 0.14, delay: 0.0 }}
                >
                  <ActivationLink
                    iconOnly={canCollapsed && sidebarCollapsed}
                    onClick={handlePushLocation}
                    href="/app"
                    icon={HouseIcon}
                  >
                    {language.data.app.home.name}
                  </ActivationLink>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, filter: "blur(6px)" }}
                  animate={{ opacity: 1, filter: "blur(0px)" }}
                  transition={{ duration: 0.14, delay: 0.04 }}
                >
                  <ActivationLink
                    iconOnly={canCollapsed && sidebarCollapsed}
                    onClick={handlePushLocation}
                    href="/app/guilds"
                    icon={ConfettiIcon}
                  >
                    {language.data.app.guilds.name}
                  </ActivationLink>
                </motion.div>
              </motion.div>
            ) : inPlayer ? (
              guild && (
                <motion.div
                  key={`guild-player-menu-${guild.id}-${sidebarCollapsed}`}
                  initial={{ opacity: 0, filter: "blur(6px)" }}
                  animate={{ opacity: 1, filter: "blur(0px)" }}
                  exit={{ opacity: 0, filter: "blur(6px)" }}
                  transition={{ duration: 0.16 }}
                  className="flex min-h-max flex-col gap-1"
                >
                  <motion.div
                    initial={{ opacity: 0, filter: "blur(6px)" }}
                    animate={{ opacity: 1, filter: "blur(0px)" }}
                    transition={{ duration: 0.14, delay: 0.0 }}
                  >
                    <ActivationLink
                      iconOnly={canCollapsed && sidebarCollapsed}
                      onClick={handlePushLocation}
                      href={`/app/g/${guild.id}`}
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
                              <h1 className="min-w-0 flex-1 overflow-hidden text-start text-sm text-ellipsis whitespace-nowrap max-md:pl-1" />
                            }
                          >
                            {guild.name}
                          </TooltipTrigger>
                          <TooltipContent>{guild.name}</TooltipContent>
                        </Tooltip>
                      </div>
                    </ActivationLink>
                  </motion.div>

                  {[
                    {
                      href: `/app/g/${guild.id}/player`,
                      name: language.data.app.guilds.player.home.title,
                      icon: HouseSimpleIcon,
                      delay: 0.08,
                    },
                    {
                      href: `/app/g/${guild.id}/player/browse`,
                      name: language.data.app.guilds.player.browse.title,
                      icon: CompassIcon,
                      delay: 0.12,
                    },
                    {
                      href: `/app/g/${guild.id}/player/favorite`,
                      name: language.data.app.guilds.player.favorite.title,
                      icon: HeartIcon,
                      delay: 0.16,
                    },
                    {
                      href: `/app/g/${guild.id}/player/history`,
                      name: language.data.app.guilds.player.history.title,
                      icon: ClockCounterClockwiseIcon,
                      delay: 0.2,
                    },
                    {
                      href: `/app/g/${guild.id}/player/playlists`,
                      name: language.data.app.playlist.name,
                      icon: PlaylistIcon,
                      delay: 0.24,
                    },
                  ].map((subItem) => (
                    <motion.div
                      key={`player-nav-${subItem.href}`}
                      initial={{ opacity: 0, filter: "blur(6px)" }}
                      animate={{ opacity: 1, filter: "blur(0px)" }}
                      transition={{ duration: 0.14, delay: subItem.delay }}
                    >
                      <ActivationLink
                        iconOnly={canCollapsed && sidebarCollapsed}
                        onClick={handlePushLocation}
                        href={subItem.href}
                        icon={subItem.icon}
                        className={cn(!sidebarCollapsed && "pl-4")}
                      >
                        {subItem.name}
                      </ActivationLink>
                    </motion.div>
                  ))}
                </motion.div>
              )
            ) : (
              guild && (
                <motion.div
                  key={`guild-menu-${guild.id}-${sidebarCollapsed}`}
                  initial={{ opacity: 0, filter: "blur(6px)" }}
                  animate={{ opacity: 1, filter: "blur(0px)" }}
                  exit={{ opacity: 0, filter: "blur(6px)" }}
                  transition={{ duration: 0.16 }}
                  className="flex min-h-max flex-col gap-1"
                >
                  <motion.div
                    initial={{ opacity: 0, filter: "blur(6px)" }}
                    animate={{ opacity: 1, filter: "blur(0px)" }}
                    transition={{ duration: 0.14, delay: 0.0 }}
                  >
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
                              <h1 className="min-w-0 flex-1 overflow-hidden text-start text-sm text-ellipsis whitespace-nowrap max-md:pl-1" />
                            }
                          >
                            {guild.name}
                          </TooltipTrigger>
                          <TooltipContent>{guild.name}</TooltipContent>
                        </Tooltip>
                      </div>
                    </ActivationLink>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, filter: "blur(6px)" }}
                    animate={{ opacity: 1, filter: "blur(0px)" }}
                    transition={{ duration: 0.14, delay: 0.04 }}
                  >
                    <ActivationLink
                      iconOnly={canCollapsed && sidebarCollapsed}
                      onClick={handlePushLocation}
                      href={`/app/g/${guild.id}`}
                      icon={ChartPieSliceIcon}
                    >
                      {language.data.app.overview.name}
                    </ActivationLink>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, filter: "blur(6px)" }}
                    animate={{ opacity: 1, filter: "blur(0px)" }}
                    transition={{ duration: 0.14, delay: 0.08 }}
                  >
                    <ActivationLink
                      iconOnly={canCollapsed && sidebarCollapsed}
                      onClick={handlePushLocation}
                      href={`/app/g/${guild.id}/player`}
                      icon={MusicNoteSimpleIcon}
                    >
                      {language.data.app.guilds.player.name}
                    </ActivationLink>
                  </motion.div>

                  {collapsibleSections.map((section, sIndex) => (
                    <motion.div
                      key={`collapsible-${section.title}`}
                      initial={{ opacity: 0, filter: "blur(6px)" }}
                      animate={{ opacity: 1, filter: "blur(0px)" }}
                      transition={{
                        duration: 0.14,
                        delay: 0.12 + sIndex * 0.04,
                      }}
                    >
                      <Collapsible className={"group/collapsible"}>
                        <CollapsibleTrigger
                          render={<ActivationLink />}
                          className={cn(
                            "group-data-open/collapsible:bg-foreground/5"
                          )}
                        >
                          <section.icon
                            weight="bold"
                            className={cn(!sidebarCollapsed && "mr-2")}
                            size={16}
                          />
                          <div
                            className={cn(
                              "ml-2 flex min-w-0 flex-1 items-center justify-between text-start",
                              sidebarCollapsed && "md:hidden"
                            )}
                          >
                            {section.title}
                            <CaretDownIcon
                              weight="bold"
                              className="size-3 transition-transform duration-200 group-data-open/collapsible:rotate-180"
                            />
                          </div>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <div className="flex flex-col gap-1 overflow-hidden pt-1">
                            {section.items.map((subItem) => (
                              <div
                                className="group flex min-w-0 flex-1 gap-1"
                                key={`sub-${subItem.href}`}
                              >
                                <div
                                  className={cn(
                                    "relative flex w-8 flex-col items-end justify-center",
                                    sidebarCollapsed && "hidden"
                                  )}
                                >
                                  <div
                                    className={cn(
                                      "absolute w-3 border-l-2 border-border",
                                      "h-full -translate-y-2/3",
                                      "max-md:h-12.75 max-md:-translate-y-8.75",
                                      "max-md:group-first:h-5.5 max-md:group-first:-translate-y-5.25"
                                    )}
                                  />
                                  <div className="size-3 -translate-y-1/3 rounded-bl-md border-b-2 border-l-2 border-border" />
                                </div>
                                <ActivationLink
                                  iconOnly={canCollapsed && sidebarCollapsed}
                                  onClick={handlePushLocation}
                                  href={subItem.href}
                                  icon={subItem.icon}
                                  isDisabled={subItem.isDisabled}
                                  className="h-max flex-1 text-start"
                                >
                                  {subItem.name}
                                </ActivationLink>
                              </div>
                            ))}
                          </div>
                        </CollapsibleContent>
                      </Collapsible>
                    </motion.div>
                  ))}

                  <motion.div
                    initial={{ opacity: 0, filter: "blur(6px)" }}
                    animate={{ opacity: 1, filter: "blur(0px)" }}
                    transition={{
                      duration: 0.14,
                      delay: 0.12 + collapsibleSections.length * 0.04,
                    }}
                  >
                    <ActivationLink
                      iconOnly={canCollapsed && sidebarCollapsed}
                      onClick={handlePushLocation}
                      href={`/app/g/${guild.id}/setting`}
                      icon={WrenchIcon}
                    >
                      {language.data.app.guilds.setting.name}
                    </ActivationLink>
                  </motion.div>
                </motion.div>
              )
            )}
          </AnimatePresence>
        </CustomScrollArea>
      </div>

      {!nav && <div className="mt-auto"></div>}

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={"bottom-menu-" + sidebarCollapsed}
          initial={{ opacity: 0, filter: "blur(6px)" }}
          animate={{ opacity: 1, filter: "blur(0px)" }}
          exit={{ opacity: 0, filter: "blur(6px)" }}
          transition={{ duration: 0.16 }}
          className={clsx(
            "flex gap-0.5!",
            !sidebarCollapsed ? "flex-row!" : "flex-col"
          )}
        >
          <motion.div
            className="w-full"
            layoutId={
              "setting-modal-by-app-sidebar-iscollapsed-" + sidebarCollapsed
            }
          >
            <ActivationLink
              className={cn("w-full hover:*:first:rotate-15 *:apply-long-soft-transition *:duration-1000", isSettingModalOpen && "invisible")}
              iconOnly={canCollapsed && sidebarCollapsed}
              onClick={() => {
                setSettingLayoutId(
                  "setting-modal-by-app-sidebar-iscollapsed-" +
                    sidebarCollapsed
                )
                setIsSettingModalOpen(true)
                setNavActive?.(false)
              }}
              icon={GearIcon}
            >
              {language.data.app.setting.name}
            </ActivationLink>
          </motion.div>

          {canCollapsed && (
            <Tooltip>
              <AnimateIcon animateOnHover>
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
                  {sidebarCollapsed ? (
                    <PanelLeftOpenIcon />
                  ) : (
                    <PanelLeftCloseIcon />
                  )}
                </TooltipTrigger>
              </AnimateIcon>
              <TooltipContent>
                <p>Collapse sidebar</p>
              </TooltipContent>
            </Tooltip>
          )}
        </motion.div>
      </AnimatePresence>
    </main>
  )
}

export default Sidebar
