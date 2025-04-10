"use client";
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
  SetSubscribeStateCache: Dispatch<SetStateAction<subscribeState[]>>;
  favorite_state_cache: favoriteState[];
  SetFavoriteStateCache: Dispatch<SetStateAction<favoriteState[]>>;
}>({
  subscribe_state_cache: [],
  SetSubscribeStateCache: () => {},
  favorite_state_cache: [],
  SetFavoriteStateCache: () => {},
});

export const PonaMusicCacheContextProvider = ({ children }: { children: React.ReactNode; }) => {
  const [subscribe_state_cache, SetSubscribeStateCache] = useState<subscribeState[]>([]);
  const [favorite_state_cache, SetFavoriteStateCache] = useState<favoriteState[]>([]);

  return (
    <PonaMusicCacheContext.Provider value={{
      subscribe_state_cache, SetSubscribeStateCache,
      favorite_state_cache, SetFavoriteStateCache,
    }}>
      {children}
    </PonaMusicCacheContext.Provider>
  );
};

export const usePonaMusicCacheContext = () => useContext(PonaMusicCacheContext);

export default PonaMusicCacheContext;
