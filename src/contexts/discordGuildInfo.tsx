"use client"
import { usePathname, useRouter } from "next/navigation"
import {
  BasicGuildInfo,
  fetchBasicGuildInfo,
} from "@/lib/server-side-api/discord/fetchGuild"
import {
  useContext,
  createContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
} from "react"
import { getCookie } from "cookies-next"

interface GuildContextType {
  guild: BasicGuildInfo | undefined
  setCurrentGuild: (guild: BasicGuildInfo | undefined) => void
}

const DiscordGuildInfoContext = createContext<GuildContextType | undefined>(
  undefined
)

export const DiscordGuildInfoProvider = ({
  children,
}: {
  children: React.ReactNode
}) => {
  const [guild, setGuild] = useState<BasicGuildInfo | undefined>(undefined)
  const pathname = usePathname()
  const router = useRouter()

  const updateGuild = useCallback((newGuild: BasicGuildInfo | undefined) => {
    setGuild(newGuild)
  }, [])

  useEffect(() => {
    const currentAccessToken = getCookie("LOGIN_")
    const currentAccessTokenType = getCookie("LOGIN_TYPE_")

    const match = pathname?.match(/\/app\/g\/([^/]+)/)
    const guildIdFromUrl = match ? match[1] : null

    if (!guildIdFromUrl) {
      if (guild !== undefined) {
        requestAnimationFrame(() => setGuild(undefined))
      }
      return
    }

    if (guildIdFromUrl && guild?.id !== guildIdFromUrl) {
      fetchBasicGuildInfo(
        String(currentAccessToken),
        String(currentAccessTokenType),
        guildIdFromUrl
      )
        .then((value) => {
          if (!value) {
            router.replace("/app/guilds")
            return
          }
          setGuild(value)
        })
        .catch(console.error)
    }
  }, [pathname, guild?.id, router, guild])

  const value = useMemo(
    () => ({
      guild,
      setCurrentGuild: updateGuild,
    }),
    [guild, updateGuild]
  )

  return (
    <DiscordGuildInfoContext.Provider value={value}>
      {children}
    </DiscordGuildInfoContext.Provider>
  )
}

export const useDiscordGuildInfo = () => {
  const context = useContext(DiscordGuildInfoContext)
  if (!context)
    throw new Error("useDiscordGuildInfo must be used within Provider")
  return context
}
