"use client";
import { VoiceBasedChannel } from 'discord.js';
import { HTTP_PonaCommonStateWithTracks } from '@/interfaces/ponaPlayer';
import React, { createContext, Dispatch, SetStateAction, useContext, useState } from 'react';

const GlobalContext = createContext<{
  isMobile: boolean;

  ponaCommonState: HTTP_PonaCommonStateWithTracks | null;
  setPonaCommonState: Dispatch<SetStateAction<HTTP_PonaCommonStateWithTracks | null>>;

  isMemberInVC: VoiceBasedChannel | null;
  setIsMemberInVC: Dispatch<SetStateAction<VoiceBasedChannel | null>>;

  isSameVC: boolean;
  setIsSameVC: Dispatch<SetStateAction<boolean>>;

  socketRequesting: boolean;
  setSocketRequesting: Dispatch<SetStateAction<boolean>>;
}>({
  isMobile: false,

  ponaCommonState: null,
  setPonaCommonState: () => {},

  isMemberInVC: null,
  setIsMemberInVC: () => {},

  isSameVC: false,
  setIsSameVC: () => {},

  socketRequesting: false,
  setSocketRequesting: () => {},
});

export const GlobalProvider = ({ children, isMobile }: { children: React.ReactNode; isMobile: boolean; }) => {
  const [ponaCommonState, setPonaCommonState] = useState<HTTP_PonaCommonStateWithTracks | null>(null);
  const [isMemberInVC, setIsMemberInVC] = useState<VoiceBasedChannel | null>(null);
  const [socketRequesting, setSocketRequesting] = useState<boolean>(false);
  const [isSameVC, setIsSameVC] = useState<boolean>(false);

  React.useEffect(()=>{
    if ( ponaCommonState?.pona.voiceChannel && isMemberInVC?.id )
      setIsSameVC((ponaCommonState.pona.voiceChannel === isMemberInVC.id));
  }, [isMemberInVC, ponaCommonState])

  return (
    <GlobalContext.Provider value={{
      isMobile,
      ponaCommonState, setPonaCommonState,
      socketRequesting, setSocketRequesting,
      isMemberInVC, setIsMemberInVC,
      isSameVC, setIsSameVC,
    }}>
      {children}
    </GlobalContext.Provider>
  );
};

export const useGlobalContext = () => useContext(GlobalContext);

export default GlobalContext;
