"use client";
import { Track } from '@/interfaces/ponaPlayer';
import React, { createContext, useContext } from 'react';
import { Manager, Socket } from 'socket.io-client';

const ws_manager = new Manager(`${window.location.origin}`, {
  protocols: 'http',
  reconnectionDelayMax: 10000
});

const PonaMusicContext = createContext<{
  socket: Socket | null;
  setSocket: React.Dispatch<React.SetStateAction<Socket | null>>;

  manager: Manager;
  setManager: React.Dispatch<React.SetStateAction<Manager>>;

  isConnected: boolean;
  setIsConnected: React.Dispatch<React.SetStateAction<boolean>>;

  currentTrack: Track | null;
  setCurrentTrack: React.Dispatch<React.SetStateAction<Track | null>>;

  transport: string;
  setTransport: React.Dispatch<React.SetStateAction<string>>;
  
}>({
  socket: null,
  setSocket: () => {},
  
  manager: ws_manager,
  setManager: () => {},

  isConnected: false,
  setIsConnected: () => {},

  currentTrack: null,
  setCurrentTrack: () => {},

  transport: "N/A",
  setTransport: () => {}
});

export const PonaMusicProvider = ({ children }: { children: React.ReactNode }) => {
  const [ socket, setSocket ] = React.useState<Socket | null>(null);
  const [ manager, setManager ] = React.useState<Manager>(ws_manager);
  const [ isConnected, setIsConnected ] = React.useState<boolean>(false);
  const [ currentTrack, setCurrentTrack ] = React.useState<Track | null>(null);
  const [ transport, setTransport ] = React.useState("N/A");

  return (
    <PonaMusicContext.Provider value={{
      socket, setSocket,
      manager, setManager,
      isConnected, setIsConnected,
      currentTrack, setCurrentTrack,
      transport, setTransport
    }}>
      {children}
    </PonaMusicContext.Provider>
  );
};

export const usePonaMusicContext = () => useContext(PonaMusicContext);

export default PonaMusicContext;
