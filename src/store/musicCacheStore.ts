import { create } from "zustand"
import { getCookie } from "cookies-next"
import { IsSubscribed, SubscribedChannelsResult } from "@/lib/server-side-api/internal/channel"
import { SongRelated, WatchPlaylist } from "@/types/youtube/ytmusic-api"
import type { HomeFeedResult, ExploreResult, ChartsResult } from "@/lib/server-side-api/internal/browse"

export interface RelatedInfo {
  videoId: string
  watch_playlist?: WatchPlaylist
  related?: SongRelated
}

export interface FeedCacheEntry<T> {
  data: T
  fetchedAt: number
}

const FEED_STALE_MS = 5 * 60 * 1000

function isStale(fetchedAt: number | null | undefined): boolean {
  if (!fetchedAt) return true
  return Date.now() - fetchedAt > FEED_STALE_MS
}

function readSessionCache<T>(key: string): FeedCacheEntry<T> | null {
  if (typeof window === "undefined") return null
  try {
    const raw = sessionStorage.getItem(key)
    if (!raw) return null
    return JSON.parse(raw) as FeedCacheEntry<T>
  } catch {
    return null
  }
}

function writeSessionCache<T>(key: string, entry: FeedCacheEntry<T>): void {
  if (typeof window === "undefined") return
  try {
    sessionStorage.setItem(key, JSON.stringify(entry))
  } catch {
  }
}

const SESSION_KEYS = {
  homeFeed: "pona:feed:home",
  explore: "pona:feed:explore",
  charts: "pona:feed:charts",
}

interface MusicCacheState {
  subscribeCache: Record<string, boolean>
  favoriteCache: Record<string, boolean>
  relatedInfoCache: Record<string, RelatedInfo>
  subscribedChannels: SubscribedChannelsResult[] | null

  homeFeed: FeedCacheEntry<HomeFeedResult> | null
  explore: FeedCacheEntry<ExploreResult> | null
  charts: FeedCacheEntry<ChartsResult> | null

  getSubscribeState: (channelId: string) => Promise<boolean>
  setSubscribedChannels: (channels: SubscribedChannelsResult[]) => void
  addSubscribedChannel: (channel: SubscribedChannelsResult) => void
  removeSubscribedChannel: (channelId: string) => void
  setFavoriteState: (videoId: string, state: boolean) => void
  setRelatedInfo: (videoId: string, info: Omit<RelatedInfo, "videoId">) => void

  setHomeFeed: (data: HomeFeedResult) => void
  setExplore: (data: ExploreResult) => void
  setCharts: (data: ChartsResult) => void

  isHomeFeedStale: () => boolean
  isExploreStale: () => boolean
  isChartsStale: () => boolean

  hydrateFromSession: () => void
}

export const useMusicCacheStore = create<MusicCacheState>((set, get) => ({
  subscribeCache: {},
  favoriteCache: {},
  relatedInfoCache: {},
  subscribedChannels: null,

  homeFeed: null,
  explore: null,
  charts: null,

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

  setHomeFeed: (data: HomeFeedResult) => {
    const entry: FeedCacheEntry<HomeFeedResult> = { data, fetchedAt: Date.now() }
    writeSessionCache(SESSION_KEYS.homeFeed, entry)
    set({ homeFeed: entry })
  },

  setExplore: (data: ExploreResult) => {
    const entry: FeedCacheEntry<ExploreResult> = { data, fetchedAt: Date.now() }
    writeSessionCache(SESSION_KEYS.explore, entry)
    set({ explore: entry })
  },

  setCharts: (data: ChartsResult) => {
    const entry: FeedCacheEntry<ChartsResult> = { data, fetchedAt: Date.now() }
    writeSessionCache(SESSION_KEYS.charts, entry)
    set({ charts: entry })
  },

  isHomeFeedStale: () => isStale(get().homeFeed?.fetchedAt),
  isExploreStale: () => isStale(get().explore?.fetchedAt),
  isChartsStale: () => isStale(get().charts?.fetchedAt),

  hydrateFromSession: () => {
    const homeFeed = readSessionCache<HomeFeedResult>(SESSION_KEYS.homeFeed)
    const explore = readSessionCache<ExploreResult>(SESSION_KEYS.explore)
    const charts = readSessionCache<ChartsResult>(SESSION_KEYS.charts)
    set({
      homeFeed: homeFeed ?? null,
      explore: explore ?? null,
      charts: charts ?? null,
    })
  },
}))
