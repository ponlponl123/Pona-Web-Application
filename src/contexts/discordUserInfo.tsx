"use client"
import {
  UserInfo as UserInfoType,
  fetchByAccessToken,
  revokeUserAccessToken as removeAccessToken,
} from "@/lib/server-side-api/discord/fetchUser"
import { deleteCookie, getCookie, setCookie } from "cookies-next"
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react"
import { useRouter } from "next/navigation"

interface UserContextType {
  userInfo: UserInfoType | null
  setUserAccessToken: (key: string, type: string) => Promise<void>
  revokeUserAccessToken: () => Promise<void>
  loading: boolean
}

const DiscordUserInfoContext = createContext<UserContextType | undefined>(
  undefined
)

export const DiscordUserInfoProvider = ({
  children,
}: {
  children: React.ReactNode
}) => {
  const [userInfo, setUserInfo] = useState<UserInfoType | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const setUserAccInfo = useCallback(async (key: string, keyType: string) => {
    try {
      const fetchUser = await fetchByAccessToken(key, keyType)
      if (fetchUser) setUserInfo(fetchUser)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const init = async () => {
      const token = getCookie("LOGIN_")
      const type = getCookie("LOGIN_TYPE_")
      if (token && type && token !== "false") {
        await setUserAccInfo(String(token), String(type))
      } else {
        setLoading(false)
      }
    }
    init()
  }, [setUserAccInfo])

  const setUserAccessToken = useCallback(
    async (key: string, type: string) => {
      setCookie("LOGIN_", key, { maxAge: 60 * 60 * 24 })
      setCookie("LOGIN_TYPE_", type, { maxAge: 60 * 60 * 24 })
      await setUserAccInfo(key, type)
    },
    [setUserAccInfo]
  )

  const revokeUserAccessToken = useCallback(async () => {
    const currentAccessToken = getCookie("LOGIN_")
    if (currentAccessToken) {
      await removeAccessToken(String(currentAccessToken))
    }
    deleteCookie("LOGIN_")
    deleteCookie("LOGIN_TYPE_")
    setUserInfo(null)
    router.replace("/")
  }, [router])

  const value = useMemo(
    () => ({
      userInfo,
      setUserAccessToken,
      revokeUserAccessToken,
      loading,
    }),
    [userInfo, loading, setUserAccessToken, revokeUserAccessToken]
  )

  return (
    <DiscordUserInfoContext.Provider value={value}>
      {children}
    </DiscordUserInfoContext.Provider>
  )
}

export const useDiscordUserInfo = () => {
  const context = useContext(DiscordUserInfoContext)
  if (!context)
    throw new Error("useDiscordUserInfo must be used within Provider")
  return context
}
