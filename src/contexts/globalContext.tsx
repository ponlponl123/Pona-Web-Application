"use client";
import { VoiceBasedChannel } from 'discord.js';
import { HTTP_PonaCommonStateWithTracks } from '@/interfaces/ponaPlayer';
import { createContext, Dispatch, SetStateAction, useContext, useState } from 'react';

const GlobalContext = createContext<{
  ponaCommonState: HTTP_PonaCommonStateWithTracks | null;
  setPonaCommonState: Dispatch<SetStateAction<HTTP_PonaCommonStateWithTracks | null>>;

  isMemberInVC: VoiceBasedChannel | null;
  setIsMemberInVC: Dispatch<SetStateAction<VoiceBasedChannel | null>>;
}>({
    ponaCommonState: null,
    setPonaCommonState: () => {},

    isMemberInVC: null,
    setIsMemberInVC: () => {},
});

export const GlobalProvider = ({ children }: { children: React.ReactNode }) => {
  const [ponaCommonState, setPonaCommonState] = useState<HTTP_PonaCommonStateWithTracks | null>(null);
  const [isMemberInVC, setIsMemberInVC] = useState<VoiceBasedChannel | null>(null);

  return (
    <GlobalContext.Provider value={{
        ponaCommonState, setPonaCommonState,
        isMemberInVC, setIsMemberInVC,
    }}>
      {children}
    </GlobalContext.Provider>
  );
};

export const useGlobalContext = () => useContext(GlobalContext);

export default GlobalContext;
