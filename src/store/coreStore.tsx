"use client"
import { createStore } from "zustand/vanilla"
import { useStore } from "zustand"
import { getCookie, setCookie } from "cookies-next"
import { createContext, useContext, useState } from "react"
import lang, { Language, languageKeys } from "@/lib/i18n"
import { defaultUserSetting } from "@/consts/settings"
import { UserSetting } from "@/types/settings"

interface AppStoreProps {
  isMobile: boolean
  initialLang: languageKeys
}

interface AppState extends AppStoreProps {
  language: Language
  userSetting: UserSetting

  setLanguage: (key: languageKeys) => void
  setUserSetting: (setting: Partial<UserSetting>) => void
  initClientSettings: () => void
}

type AppStore = ReturnType<typeof createAppStore>

const createAppStore = (initProps: AppStoreProps) => {
  return createStore<AppState>()((set, get) => ({
    ...initProps,
    language: lang(initProps.initialLang),
    userSetting: defaultUserSetting,

    setLanguage: (key) => {
      setCookie("lang", key)
      set({ language: lang(key), initialLang: key })
    },

    setUserSetting: (setting) => {
      const newSettings = { ...get().userSetting, ...setting }
      setCookie("USR", btoa(JSON.stringify(newSettings)), {
        expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      })
      set({ userSetting: newSettings })
    },

    initClientSettings: () => {
      const cookieData = getCookie("USR")
      if (cookieData && typeof cookieData === "string") {
        try {
          const parsed = JSON.parse(atob(cookieData)) as UserSetting
          set({ userSetting: { ...defaultUserSetting, ...parsed } })

          if (parsed.animation === "30 fps")
            document.documentElement.classList.add("animation-30fps")
          else if (parsed.animation === false)
            document.documentElement.classList.remove("animation-disabled")
        } catch (e) {
          console.error("Failed to parse settings", e)
        }
      }
    },
  }))
}

const AppStoreContext = createContext<AppStore | null>(null)

export function AppStoreProvider({
  children,
  isMobile,
  initialLang = "en-US",
}: React.PropsWithChildren<Partial<AppStoreProps>>) {
  const [store] = useState(() =>
    createAppStore({ isMobile: !!isMobile, initialLang })
  )

  return (
    <AppStoreContext.Provider value={store}>
      {children}
    </AppStoreContext.Provider>
  )
}

export function useAppStore<T>(selector: (state: AppState) => T): T {
  const store = useContext(AppStoreContext)
  if (!store) throw new Error("Missing AppStoreProvider")
  return useStore(store, selector)
}
