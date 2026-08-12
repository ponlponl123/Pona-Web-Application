"use client"
import { motion } from "motion/react"
import { useDiscordUserInfo } from "@/contexts/discordUserInfo"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import ImageWithSkeleton from "@/components/ui/custom/image"
import { SealCheckIcon } from "@phosphor-icons/react"
import { numberToHexColor } from "@/lib/color-client"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useAppStore } from "@/store/coreStore"

function Account() {
  const { userInfo } = useDiscordUserInfo()

  const language = useAppStore((state) => state.language)
  const userSetting = useAppStore((state) => state.userSetting)

  return (
    <section
      className="flex min-h-full w-full flex-col gap-6 p-6 pb-12"
      id="account"
      data-section
    >
      <motion.div className="flex flex-col gap-6">
        <div className="rounded-4xl overflow-hidden">
          {userInfo?.banner ? (
            <ImageWithSkeleton
              alt={`${userInfo && userInfo.global_name} Banner`}
              src={
                userInfo
                  ? `https://cdn.discordapp.com/banners/${userInfo.id}/${userInfo.banner}.${userInfo.banner.startsWith("a_") ? "gif" : "png"}?size=1024`
                  : ""
              }
              className="h-48 w-full rounded-4xl bg-primary object-cover object-center select-none pointer-events-none"
              width="100%"
              height="12rem"
              classNames={{
                wrapper: "h-48 w-full",
                image: "h-48 w-full object-cover",
              }}
            />
          ) : (
            <div className="relative h-48 w-full overflow-hidden rounded-3xl bg-primary/40">
              {userSetting.transparency && (
                <ImageWithSkeleton
                  alt={`${userInfo && userInfo.global_name} Banner`}
                  src={
                    userInfo
                      ? `https://cdn.discordapp.com/avatars/${userInfo.id}/${userInfo.avatar}.png?size=256`
                      : "/static/Ponlponl123 (1459).png"
                  }
                  className="h-full w-full scale-110 rounded-4xl object-cover object-center blur-2xl"
                  width="100%"
                  height="100%"
                  classNames={{
                    wrapper: "w-full h-full",
                  }}
                />
              )}
            </div>
          )}
        </div>
        <div className="relative z-10 flex gap-6 max-md:-mt-12 md:px-12">
          <div className="flex flex-col items-center max-md:absolute max-md:left-12">
            <div className="block h-24 w-24 min-w-24 -translate-y-1/2 rounded-full bg-card outline-3 outline-card max-md:h-24 max-md:w-24 max-md:min-w-24 max-md:outline-4">
              <motion.div
                layoutId="setting-modal-user-avatar"
                transition={{ duration: 0.25, ease: "easeOut" }}
              >
                <motion.div
                  initial={{ opacity: 0, filter: "blur(3px)" }}
                  animate={{ opacity: 1, filter: "blur(0px)" }}
                  exit={{ opacity: 0, filter: "blur(3px)" }}
                  transition={{ duration: 1, ease: "easeOut" }}
                >
                  <Avatar className="h-24 w-24 bg-primary object-cover object-center max-md:h-24 max-md:w-24">
                    <AvatarImage
                      alt={`${userInfo && userInfo.global_name} Avatar`}
                      src={
                        userInfo
                          ? `https://cdn.discordapp.com/avatars/${userInfo.id}/${userInfo.avatar}.png?size=128`
                          : "/static/Ponlponl123 (1459).png"
                      }
                    />
                    <AvatarFallback>
                      {userInfo
                        ? userInfo.global_name.charAt(0).toUpperCase()
                        : "M"}
                    </AvatarFallback>
                  </Avatar>
                </motion.div>
              </motion.div>
            </div>
            <motion.div className="z-10 -mt-8 flex gap-4 max-md:hidden">
              <Tooltip>
                <TooltipTrigger>
                  {userInfo ? (
                    userInfo.accent_color ? (
                      <div
                        className="size-3 rounded-full outline-2 outline-offset-2 outline-foreground/10 outline-solid"
                        style={{
                          backgroundColor: numberToHexColor(
                            userInfo.accent_color
                          ),
                        }}
                      ></div>
                    ) : (
                      userInfo.banner_color && (
                        <div
                          className="size-3 rounded-full outline-2 outline-offset-2 outline-foreground/10 outline-solid"
                          style={{ backgroundColor: userInfo.banner_color }}
                        ></div>
                      )
                    )
                  ) : (
                    <></>
                  )}
                </TooltipTrigger>
                <TooltipContent>
                  {language.data.app.setting.account.accent_color_tooltip}
                </TooltipContent>
              </Tooltip>
            </motion.div>
          </div>
          <motion.div className="flex w-full flex-col gap-1 rounded-3xl max-md:pt-16 md:gap-4 md:rounded-ss-lg md:bg-foreground/5 md:p-6">
            <div className="flex flex-col rounded-lg max-md:bg-foreground/5 max-md:p-2">
              <label className="block text-sm font-medium text-foreground/40 max-md:m-1 max-md:text-xs">
                {language.data.app.setting.account.display_name}
              </label>
              <div className="flex items-center gap-1">
                <motion.div
                  layoutId="setting-modal-user-global-name"
                  transition={{ duration: 0.25, ease: "easeOut" }}
                >
                  <motion.span
                    initial={{ opacity: 0, filter: "blur(3px)" }}
                    animate={{ opacity: 1, filter: "blur(0px)" }}
                    exit={{ opacity: 0, filter: "blur(3px)" }}
                    transition={{ duration: 0.46, ease: "easeOut" }}
                    className="text-xl"
                  >
                    {userInfo && userInfo.global_name}
                  </motion.span>
                </motion.div>
              </div>
            </div>
            <div className="flex flex-col rounded-lg max-md:bg-foreground/5 max-md:p-2">
              <label className="block text-sm font-medium text-foreground/40 max-md:m-1 max-md:text-xs">
                {language.data.app.setting.account.username}
              </label>
              <div className="flex items-center gap-1">
                <motion.div
                  layoutId="setting-modal-user-name"
                  transition={{ duration: 0.25, ease: "easeOut" }}
                >
                  <motion.strong
                    initial={{ opacity: 0, filter: "blur(3px)" }}
                    animate={{ opacity: 1, filter: "blur(0px)" }}
                    exit={{ opacity: 0, filter: "blur(3px)" }}
                    transition={{ duration: 0.46, ease: "easeOut" }}
                    className="text-xl"
                  >
                    @{userInfo && userInfo.username}
                  </motion.strong>
                </motion.div>
                <Tooltip>
                  <TooltipTrigger delay={0}>
                    <SealCheckIcon
                      weight="fill"
                      className="size-3.5 text-primary"
                    />
                  </TooltipTrigger>
                  <TooltipContent>
                    {language.data.app.setting.account.announcement}
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  )
}

export default Account
