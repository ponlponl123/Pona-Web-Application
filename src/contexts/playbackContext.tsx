"use client";
import React, { createContext, Dispatch, SetStateAction, useContext, useState } from 'react';

const PlaybackContext = createContext<{
  playback: number;
  setPlayback: Dispatch<SetStateAction<number>>;
}>({
  playback: 0,
  setPlayback: () => {},
});

export const PlaybackProvider = ({ children }: { children: React.ReactNode; }) => {
  const [playback, setPlayback] = useState<number>(0);

  return (
    <PlaybackContext.Provider value={{playback, setPlayback}}>
      {children}
    </PlaybackContext.Provider>
  );
};

export const usePlaybackContext = () => useContext(PlaybackContext);

export default PlaybackContext;
