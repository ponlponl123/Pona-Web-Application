"use client";
import { IsSubscribed } from '@/server-side-api/internal/channel';
import { getCookie } from 'cookies-next';
import React, { createContext, Dispatch, SetStateAction, useContext, useState } from 'react';

export interface subscribeState {
  channelId: string;
  state: boolean;
}

export interface favoriteState {
  videoId: string;
  state: boolean;
}

const PonaMusicCacheContext = createContext<{
  subscribe_state_cache: subscribeState[];
  GetSubscribeStateFromChannelId: (channelId: string) => Promise<subscribeState>;
  SetSubscribeStateCache: Dispatch<SetStateAction<subscribeState[]>>;
  favorite_state_cache: favoriteState[];
  SetFavoriteStateCache: Dispatch<SetStateAction<favoriteState[]>>;
}>({
  subscribe_state_cache: [],
  SetSubscribeStateCache: () => {},
  GetSubscribeStateFromChannelId: async () => ({ channelId: '', state: false }),
  favorite_state_cache: [],
  SetFavoriteStateCache: () => {},
});

export const PonaMusicCacheContextProvider = ({ children }: { children: React.ReactNode; }) => {
  const [subscribe_state_cache, SetSubscribeStateCache] = useState<subscribeState[]>([]);
  const [favorite_state_cache, SetFavoriteStateCache] = useState<favoriteState[]>([]);

  const FetchSubscibeStateFromChannelId = async (channelId: string) => {
    const accessToken = getCookie('LOGIN_');
    const accessTokenType = getCookie('LOGIN_TYPE_');
    if (!accessToken || !accessTokenType) return { channelId, state: false };
    const state = await IsSubscribed(accessTokenType, accessToken, channelId);
    if (state) return { channelId, state: state.state===1 };
    return { channelId, state: false };
  }
  const GetSubscribeStateFromChannelId = async (channelId: string) => {
    const state = subscribe_state_cache.find((item) => item.channelId === channelId);
    if (state) return state;
    const newState = await FetchSubscibeStateFromChannelId(channelId);
    if ( newState )
    {
      SetSubscribeStateCache((value) => {
        const newValue = value.filter((item) => item.channelId !== channelId);
        return newValue.concat(newState);
      });
      return newState;
    }
    return { channelId, state: false };
  }

  return (
    <PonaMusicCacheContext.Provider value={{
      subscribe_state_cache, SetSubscribeStateCache, GetSubscribeStateFromChannelId,
      favorite_state_cache, SetFavoriteStateCache,
    }}>
      {children}
    </PonaMusicCacheContext.Provider>
  );
};

export const usePonaMusicCacheContext = () => useContext(PonaMusicCacheContext);

export default PonaMusicCacheContext;
