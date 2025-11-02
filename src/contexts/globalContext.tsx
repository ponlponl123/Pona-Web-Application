'use client';
import { VoiceBasedChannel } from 'discord.js';
import { HTTP_PonaCommonStateWithTracks, Queue } from '@/interfaces/ponaPlayer';
import React, {
  createContext,
  Dispatch,
  SetStateAction,
  useContext,
  useState,
} from 'react';

export type FullScreenMode = boolean | 'changing';
export interface PonaQueue {
  queue: Queue | null;
  updating: boolean;
}

const GlobalContext = createContext<{
  isMobile: boolean;

  ponaCommonState: HTTP_PonaCommonStateWithTracks | null;
  setPonaCommonState: Dispatch<
    SetStateAction<HTTP_PonaCommonStateWithTracks | null>
  >;

  ponaTrackQueue: PonaQueue;
  setPonaTrackQueue: Dispatch<SetStateAction<PonaQueue>>;

  isMemberInVC: VoiceBasedChannel | null;
  setIsMemberInVC: Dispatch<SetStateAction<VoiceBasedChannel | null>>;

  isFullscreenMode: FullScreenMode;
  setIsFullscreenMode: Dispatch<SetStateAction<FullScreenMode>>;

  isSameVC: boolean;
  setIsSameVC: Dispatch<SetStateAction<boolean>>;

  socketRequesting: boolean;
  setSocketRequesting: Dispatch<SetStateAction<boolean>>;
}>({
  isMobile: false,

  ponaCommonState: null,
  setPonaCommonState: () => {},

  ponaTrackQueue: { queue: null, updating: false },
  setPonaTrackQueue: () => {},

  isMemberInVC: null,
  setIsMemberInVC: () => {},

  isFullscreenMode: false,
  setIsFullscreenMode: () => {},

  isSameVC: false,
  setIsSameVC: () => {},

  socketRequesting: false,
  setSocketRequesting: () => {},
});

export const GlobalProvider = ({
  children,
  isMobile,
}: {
  children: React.ReactNode;
  isMobile: boolean;
}) => {
  const [ponaCommonState, setPonaCommonState] =
    useState<HTTP_PonaCommonStateWithTracks | null>(null);
  const [isMemberInVC, setIsMemberInVC] = useState<VoiceBasedChannel | null>(
    null
  );
  const [socketRequesting, setSocketRequesting] = useState<boolean>(false);
  const [ponaTrackQueue, setPonaTrackQueue] = useState<PonaQueue>({
    queue: null,
    updating: false,
  });
  const [isSameVC, setIsSameVC] = useState<boolean>(false);
  const [isFullscreenMode, setIsFullscreenMode] =
    useState<FullScreenMode>(false);

  React.useEffect(() => {
    if (ponaCommonState?.pona.voiceChannel && isMemberInVC?.id)
      setIsSameVC(ponaCommonState.pona.voiceChannel === isMemberInVC.id);
  }, [isMemberInVC, ponaCommonState]);

  return (
    <GlobalContext.Provider
      value={{
        isMobile,
        ponaCommonState,
        setPonaCommonState,
        ponaTrackQueue,
        setPonaTrackQueue,
        socketRequesting,
        setSocketRequesting,
        isMemberInVC,
        setIsMemberInVC,
        isSameVC,
        setIsSameVC,
        isFullscreenMode,
        setIsFullscreenMode,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

export const useGlobalContext = () => useContext(GlobalContext);

export default GlobalContext;
