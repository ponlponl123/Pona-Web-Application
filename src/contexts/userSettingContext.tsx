"use client"
import { LatLngExpression } from "leaflet"
import { getCookie, setCookie } from "cookies-next"
import React, { createContext, useContext, useState } from "react"

export type TimeFormat = "auto" | 12 | 24
export type Thermometer = "c" | "f"
export type Animation = boolean | "30 fps"
export type Location = "auto" | "surprise" | LatLngExpression
export type PonaPlayerStyle = "modern" | "compact"
export interface UserSetting {
  // Layout Settings
  transparency: boolean
  timeformat: TimeFormat
  thermometer: Thermometer
  animation: Animation
  isSidebarCollapsed: boolean
  // Privacy Settings
  location: Location
  dev_pona_player_style: PonaPlayerStyle
}
export const defaultUserSetting: UserSetting = {
  transparency: true,
  timeformat: "auto",
  thermometer: "c",
  animation: true,
  isSidebarCollapsed: false,
  location: "auto",
  dev_pona_player_style: "compact",
}

const UserSettingContext = createContext<{
  userSetting: UserSetting
  setUserSetting: (setting: Partial<UserSetting>) => void
}>({
  userSetting: defaultUserSetting,
  setUserSetting: () => {},
})

export const UserSettingProvider = ({
  children,
}: {
  children: React.ReactNode
}) => {
  const [userSetting, setUserSettingState] =
    useState<UserSetting>(defaultUserSetting)

  React.useEffect(() => {
    const userSettingFromCookie = getCookie("USR")
    if (userSettingFromCookie) {
      const cookieValue =
        typeof userSettingFromCookie === "string" ? userSettingFromCookie : ""
      const decodedSetting = atob(cookieValue)
      if (decodedSetting) {
        const parsedUserSetting = JSON.parse(decodedSetting) as UserSetting
        setUserSettingState(parsedUserSetting)
        if (parsedUserSetting.animation === "30 fps")
          document.documentElement.classList.add("animation-30fps")
        else if (parsedUserSetting.animation === false)
          document.documentElement.classList.remove("animation-disabled")
      }
    } else setUserSettingState(defaultUserSetting)
  }, [setUserSettingState])

  const setUserSetting = (setting: Partial<UserSetting>) => {
    const buildSetting = { ...userSetting, ...setting }
    const encodedSetting = btoa(JSON.stringify(buildSetting))
    setCookie("USR", encodedSetting, {
      expires: new Date(new Date().getTime() + 90 * 24 * 60 * 60 * 1000), // expires in 90 days
    })
    setUserSettingState(buildSetting)
  }

  return (
    <UserSettingContext.Provider value={{ userSetting, setUserSetting }}>
      {children}
    </UserSettingContext.Provider>
  )
}

export const useUserSettingContext = () => useContext(UserSettingContext)

export default UserSettingContext
