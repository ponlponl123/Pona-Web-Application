import { create } from "zustand"
import { getCookie } from "cookies-next"
import { IsSubscribed, SubscribedChannelsResult } from "@/lib/server-side-api/internal/channel"
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
  subscribedChannels: SubscribedChannelsResult[] | null

  getSubscribeState: (channelId: string) => Promise<boolean>
  setSubscribedChannels: (channels: SubscribedChannelsResult[]) => void
  addSubscribedChannel: (channel: SubscribedChannelsResult) => void
  removeSubscribedChannel: (channelId: string) => void
  setFavoriteState: (videoId: string, state: boolean) => void
  setRelatedInfo: (videoId: string, info: Omit<RelatedInfo, "videoId">) => void
}

export const useMusicCacheStore = create<MusicCacheState>((set, get) => ({
  subscribeCache: {},
  favoriteCache: {},
  relatedInfoCache: {},
  subscribedChannels: null,

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

  setSubscribedChannels: (channels: SubscribedChannelsResult[]) =>
    set(() => {
      const cache: Record<string, boolean> = {}
      channels.forEach((c) => {
        if (c.artistId) cache[c.artistId] = true
      })
      return {
        subscribedChannels: channels,
        subscribeCache: { ...get().subscribeCache, ...cache },
      }
    }),

  addSubscribedChannel: (channel: SubscribedChannelsResult) =>
    set((state) => {
      const channelId = channel.artistId
      const existing = state.subscribedChannels || []
      const updatedCache = { ...state.subscribeCache, [channelId]: true }
      if (existing.some((c) => c.artistId === channelId)) {
        return { subscribeCache: updatedCache }
      }
      return {
        subscribeCache: updatedCache,
        subscribedChannels: [channel, ...existing],
      }
    }),

  removeSubscribedChannel: (channelId: string) =>
    set((state) => ({
      subscribeCache: { ...state.subscribeCache, [channelId]: false },
      subscribedChannels: state.subscribedChannels
        ? state.subscribedChannels.filter((c) => c.artistId !== channelId)
        : null,
    })),

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
