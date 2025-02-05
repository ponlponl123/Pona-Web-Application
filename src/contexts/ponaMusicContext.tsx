"use client"
import React, { createContext, Dispatch, SetStateAction, useContext, useState } from 'react'
import { Manager, Socket } from 'socket.io-client'
import { HTTP_PonaCommonStateWithTracks } from '@/interfaces/ponaPlayer'
import { ws_manager } from '@/app/app/g/[guildId]/player/socket';
import { useDiscordGuildInfo } from './discordGuildInfo';
import { getCookie } from 'cookies-next';

const PonaMusicContext = createContext<{
  socket: Socket | null;

  manager: Manager;
  setManager: Dispatch<SetStateAction<Manager>>;

  isConnected: boolean;
  setIsConnected: Dispatch<SetStateAction<boolean>>;

  ponaCommonState: HTTP_PonaCommonStateWithTracks | null;

  transport: string;
  setTransport: Dispatch<SetStateAction<string>>;
}>({
  socket: null,

  manager: ws_manager,
  setManager: () => {},

  isConnected: false,
  setIsConnected: () => {},

  ponaCommonState: null,

  transport: "N/A",
  setTransport: () => {}
});

export const PonaMusicProvider = ({ children }: { children: React.ReactNode }) => {
  const { guild } = useDiscordGuildInfo();

  const [socket, setSocket] = useState<Socket | null>(null);
  const [manager, setManager] = useState<Manager>(ws_manager);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [ponaCommonState, setPonaCommonState] = useState<HTTP_PonaCommonStateWithTracks | null>(null);
  const [transport, setTransport] = useState("N/A");

  const oauth_type = getCookie('LOGIN_TYPE_');
  const oauth_token = getCookie('LOGIN_');

  React.useEffect(() => {
    if ( guild?.id ) {
      const iosocket = manager.socket(`/guild/${guild.id}`, {
        auth: {
          type: String(oauth_type),
          key: String(oauth_token)
        }
      });

      if ( !isConnected )
      {
        if ( socket && socket.connected ) {
          setIsConnected(true);
          return;
        }
        let retryCount = 0;
        const maxRetries = 5;

        const connectSocket = () => {
          if (retryCount >= maxRetries) {
            console.error('Max retry attempts reached. Could not connect to socket.');
            return;
          }
          retryCount++;
          iosocket.connect();
          iosocket.on('handshake', (ponaState: HTTP_PonaCommonStateWithTracks | null) => {
            setPonaCommonState(ponaState);
            console.log('ponaState', ponaState);
          });
          iosocket.on('connect', () => {
            setIsConnected(true);
          }).once('connect_error', (error) => {
            console.error('Socket connection error:', error);
            setTimeout(connectSocket, 5000);
          });
        };
        connectSocket();
        setSocket(iosocket);
      }
    }
    return () => {
      if (socket && !window.location.pathname.includes('player')) {
        socket.off();
        socket.close();
      }
    }
  }, [guild, manager, isConnected, socket, oauth_type, oauth_token])

  return (
    <PonaMusicContext.Provider value={{
      socket: socket,
      manager, setManager,
      isConnected, setIsConnected,
      ponaCommonState,
      transport, setTransport
    }}>
      {children}
    </PonaMusicContext.Provider>
  );
};

export const usePonaMusicContext = () => useContext(PonaMusicContext);

export default PonaMusicContext;