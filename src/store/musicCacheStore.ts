import { create } from "zustand"
import { getCookie } from "cookies-next"
import { IsSubscribed } from "@/lib/server-side-api/internal/channel"
import { SongRelated, WatchPlaylist } from "@/types/youtube/ytmusic-api"

export interface RelatedInfo {
  videoId: string
  watch_playlist?: WatchPlaylist
  related?: SongRelated
}

interface MusicCacheState {
  subscribeCache: Record<string, boolean>
  favoriteCache: Record<string, boolean>
  relatedInfoCache: Record<string, RelatedInfo>

  getSubscribeState: (channelId: string) => Promise<boolean>
  setFavoriteState: (videoId: string, state: boolean) => void
  setRelatedInfo: (videoId: string, info: Omit<RelatedInfo, "videoId">) => void
}

export const useMusicCacheStore = create<MusicCacheState>((set, get) => ({
  subscribeCache: {},
  favoriteCache: {},
  relatedInfoCache: {},

  getSubscribeState: async (channelId: string) => {
    const cache = get().subscribeCache
    if (channelId in cache) return cache[channelId]

    const accessToken = getCookie("LOGIN_")
    const accessTokenType = getCookie("LOGIN_TYPE_")

    if (!accessToken || !accessTokenType) {
      set((state) => ({
        subscribeCache: { ...state.subscribeCache, [channelId]: false },
      }))
      return false
    }

    try {
      const response = await IsSubscribed(
        String(accessTokenType),
        String(accessToken),
        channelId
      )
      const isSubbed = response && response?.state === 1

      set((state) => ({
        subscribeCache: { ...state.subscribeCache, [channelId]: isSubbed },
      }))

      return isSubbed
    } catch (error) {
      console.error("Failed to fetch subscribe state:", error)
      return false
    }
  },

  setFavoriteState: (videoId: string, isFavorite: boolean) =>
    set((prev) => ({
      favoriteCache: { ...prev.favoriteCache, [videoId]: isFavorite },
    })),

  setRelatedInfo: (videoId: string, info: Omit<RelatedInfo, "videoId">) =>
    set((prev) => ({
      relatedInfoCache: {
        ...prev.relatedInfoCache,
        [videoId]: { videoId, ...info },
      },
    })),
}))
