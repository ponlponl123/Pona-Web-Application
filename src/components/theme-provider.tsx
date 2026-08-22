"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes"
import { AppFont } from "@/types/settings"

interface ThemeContextType {
  appTheme: string
  appDayTheme: string
  appNightTheme: string
  isAppDayThemeDark: boolean
  isAppNightThemeDark: boolean
  isAmoled: boolean
  isCurrentlyDark: boolean
  isPointerClickSpark: boolean
  appFont: AppFont
  setAppTheme: React.Dispatch<React.SetStateAction<string>>
  setDayTheme: React.Dispatch<React.SetStateAction<string>>
  setNightTheme: React.Dispatch<React.SetStateAction<string>>
  setIsAppDayThemeDark: React.Dispatch<React.SetStateAction<boolean>>
  setIsAppNightThemeDark: React.Dispatch<React.SetStateAction<boolean>>
  setAmoled: React.Dispatch<React.SetStateAction<boolean>>
  setIsPointerClickSpark: React.Dispatch<React.SetStateAction<boolean>>
  setAppFont: React.Dispatch<React.SetStateAction<AppFont>>
}

const ThemeContext = React.createContext<ThemeContextType>({
  appTheme: "default",
  appDayTheme: "default",
  appNightTheme: "default",
  isAppDayThemeDark: false,
  isAppNightThemeDark: false,
  isAmoled: false,
  isCurrentlyDark: false,
  isPointerClickSpark: true,
  appFont: "friendly",
  setAppTheme: () => { },
  setDayTheme: () => { },
  setNightTheme: () => { },
  setIsAppDayThemeDark: () => { },
  setIsAppNightThemeDark: () => { },
  setAmoled: () => { },
  setIsPointerClickSpark: () => { },
  setAppFont: () => { },
})

function appDarkToggle(isDark: boolean) {
  if (isDark) {
    document.documentElement.classList.add("dark")
    document.documentElement.classList.remove("light")
  } else {
    document.documentElement.classList.remove("dark")
    document.documentElement.classList.add("light")
  }
}

function updateThemeAttributes(
  resolvedTheme: string,
  appTheme: string,
  appDayTheme: string,
  appNightTheme: string,
  isAppDayThemeDark: boolean,
  isAppNightThemeDark: boolean
): boolean {
  const isDarkMode = window.matchMedia("(prefers-color-scheme: dark)").matches
  if (resolvedTheme === "custom") {
    if (isDarkMode) {
      document.documentElement.setAttribute("data-theme", appNightTheme)
      appDarkToggle(isAppNightThemeDark)
      return true
    } else {
      document.documentElement.setAttribute("data-theme", appDayTheme)
      appDarkToggle(isAppDayThemeDark)
      return false
    }
  } else {
    document.documentElement.setAttribute("data-theme", appTheme)
  }
  return resolvedTheme === "system" ? isDarkMode : resolvedTheme === "dark"
}

export function useThemeContext() {
  return React.useContext(ThemeContext)
}

function getLocalStorageValue(
  key: string,
  defaultValue: string | boolean
): string | boolean {
  if (typeof window === "undefined") {
    return defaultValue
  }
  const value = localStorage.getItem(key)
  if (value === null) return defaultValue
  if (typeof defaultValue === "boolean") {
    return value === "true"
  }
  return value
}

function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  const { resolvedTheme } = useTheme()

  const [appTheme, setAppTheme] = React.useState<string>(
    () => getLocalStorageValue("app-theme", "default") as string
  )
  const [appDayTheme, setDayTheme] = React.useState<string>(
    () => getLocalStorageValue("app-day-theme", "default") as string
  )
  const [appNightTheme, setNightTheme] = React.useState<string>(
    () => getLocalStorageValue("app-night-theme", "default") as string
  )
  const [isAppDayThemeDark, setIsAppDayThemeDark] = React.useState<boolean>(
    () => getLocalStorageValue("is-app-day-theme-dark", false) as boolean
  )
  const [isAppNightThemeDark, setIsAppNightThemeDark] = React.useState<boolean>(
    () => getLocalStorageValue("is-app-night-theme-dark", false) as boolean
  )
  const [isAmoled, setAmoled] = React.useState<boolean>(
    () => getLocalStorageValue("is-amoled", false) as boolean
  )
  const [isCurrentlyDark, setIsCurrentlyDark] = React.useState<boolean>(false)
  const [isPointerClickSpark, setIsPointerClickSpark] = React.useState<boolean>(
    () => getLocalStorageValue("is-pointer-click-spark", true) as boolean
  )
  const [appFont, setAppFont] = React.useState<AppFont>(
    () => getLocalStorageValue("app-font", "friendly") as AppFont
  )

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("app-theme", appTheme)
      localStorage.setItem("app-day-theme", appDayTheme)
      localStorage.setItem("app-night-theme", appNightTheme)
      localStorage.setItem(
        "is-app-day-theme-dark",
        isAppDayThemeDark.toString()
      )
      localStorage.setItem(
        "is-app-night-theme-dark",
        isAppNightThemeDark.toString()
      )
      localStorage.setItem("is-amoled", isAmoled.toString())
      localStorage.setItem("is-pointer-click-spark", isPointerClickSpark.toString())
      localStorage.setItem("app-font", appFont)
    }
  }, [
    appTheme,
    appDayTheme,
    appNightTheme,
    isAppDayThemeDark,
    isAppNightThemeDark,
    isAmoled,
    isPointerClickSpark,
    appFont,
  ])

  React.useEffect(() => {
    const isDark = updateThemeAttributes(
      resolvedTheme || "system",
      appTheme,
      appDayTheme,
      appNightTheme,
      isAppDayThemeDark,
      isAppNightThemeDark
    )
    setIsCurrentlyDark(isDark)
  }, [
    resolvedTheme,
    appTheme,
    appDayTheme,
    appNightTheme,
    isAppDayThemeDark,
    isAppNightThemeDark,
  ])

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      if (isAmoled) {
        document.documentElement.classList.add("amoled")
      } else {
        document.documentElement.classList.remove("amoled")
      }
    }
  }, [isAmoled])

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      document.documentElement.setAttribute("data-font", appFont)
      if (appFont === "friendly") {
        document.documentElement.classList.add("little-font")
      } else {
        document.documentElement.classList.remove("little-font")
      }
    }
  }, [appFont])

  return (
    <ThemeContext.Provider
      value={{
        appTheme,
        appDayTheme,
        appNightTheme,
        isAppDayThemeDark,
        isAppNightThemeDark,
        isAmoled,
        isCurrentlyDark,
        isPointerClickSpark,
        appFont,
        setAppTheme,
        setDayTheme,
        setNightTheme,
        setIsAppDayThemeDark,
        setIsAppNightThemeDark,
        setAmoled,
        setIsPointerClickSpark,
        setAppFont,
      }}
    >
      {children}
    </ThemeContext.Provider>
  )
}

export function NextThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      themes={["light", "dark", "system", "custom"]}
      {...props}
    >
      <ThemeHotkey />
      <ThemeProvider>{children}</ThemeProvider>
    </NextThemesProvider>
  )
}

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) {
    return false
  }

  return (
    target.isContentEditable ||
    target.tagName === "INPUT" ||
    target.tagName === "TEXTAREA" ||
    target.tagName === "SELECT"
  )
}

function ThemeHotkey() {
  const { resolvedTheme, setTheme } = useTheme()

  React.useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.defaultPrevented || event.repeat) {
        return
      }

      if (event.metaKey || event.ctrlKey || event.altKey) {
        return
      }

      if (event.key.toLowerCase() !== "d") {
        return
      }

      if (isTypingTarget(event.target)) {
        return
      }

      setTheme(resolvedTheme === "dark" ? "light" : "dark")
    }

    window.addEventListener("keydown", onKeyDown)

    return () => {
      window.removeEventListener("keydown", onKeyDown)
    }
  }, [resolvedTheme, setTheme])

  return null
}

export { ThemeProvider }
