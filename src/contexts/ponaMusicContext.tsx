"use client"
import React, { createContext, Dispatch, SetStateAction, useContext, useRef, useState } from 'react'
import { Manager, Socket } from 'socket.io-client'
import { HTTP_PonaCommonStateWithTracks, HTTP_PonaRepeatState, Queue, Track } from '@/interfaces/ponaPlayer'
import { ws_manager } from '@/app/app/g/[guildId]/player/socket';
import { useDiscordGuildInfo } from './discordGuildInfo';
import { getCookie } from 'cookies-next';
import { VoiceBasedChannel } from 'discord.js';
import { MemberVoiceChangedState } from '@/interfaces/member';
import { usePathname } from 'next/navigation';
import { useGlobalContext } from './globalContext';
import { makeTrack } from '@/utils/track';

const PonaMusicContext = createContext<{
  socket: Socket | null;

  manager: Manager;
  setManager: Dispatch<SetStateAction<Manager>>;

  isConnected: boolean;
  setIsConnected: Dispatch<SetStateAction<boolean>>;

  playerPopup: boolean;
  setPlayerPopup: Dispatch<SetStateAction<boolean>>;

  transport: string;
  setTransport: Dispatch<SetStateAction<string>>;
}>({
  socket: null,

  manager: ws_manager,
  setManager: () => {},

  isConnected: false,
  setIsConnected: () => {},

  playerPopup: false,
  setPlayerPopup: () => {},

  transport: "N/A",
  setTransport: () => {}
});

export const PonaMusicProvider = ({ children }: { children: React.ReactNode }) => {
  const { guild } = useDiscordGuildInfo();
  const {
    setIsMemberInVC,
    setPonaCommonState,
    setIsSameVC
  } = useGlobalContext();
  const pathname = usePathname();

  const initialized = useRef(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [manager, setManager] = useState<Manager>(ws_manager);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [ playerPopup, setPlayerPopup ] = useState<boolean>(false);
  const [transport, setTransport] = useState("N/A");

  const oauth_type = getCookie('LOGIN_TYPE_');
  const oauth_token = getCookie('LOGIN_');

  React.useEffect(() => {
    if ( guild && guild.id && pathname.includes('player') && !initialized.current ) {
      const iosocket = manager.socket(`/guild/${guild.id}`, {
        auth: {
          type: String(oauth_type),
          key: String(oauth_token)
        }
      });
      initialized.current = true;

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
          iosocket.on('handshake', async (ponaState: {
            pona?: HTTP_PonaCommonStateWithTracks,
            isMemberInVC?: VoiceBasedChannel | null
          }) => {
            if ( ponaState.pona?.current?.identifier ) {
              const newTrack = await makeTrack(ponaState.pona.current);
              ponaState.pona.current = newTrack;
            }
            setPonaCommonState(ponaState.pona || null);
            setIsMemberInVC(ponaState.isMemberInVC || null);
            if ( ponaState.pona?.pona.voiceChannel && ponaState.isMemberInVC?.id )
              setIsSameVC(true);
            else setIsSameVC(false);
          });
          iosocket.on('queue_ended', () => {
            document.body.removeAttribute('playing');
            setPonaCommonState((value) => {
              if (value) {
                return { ...value, queue: [], current: null, accentColor: null };
              }
              return value;
            });
          });
          iosocket.on('track_pos_updated', (position: number) => {
            setPonaCommonState((value) => {
              if (value) {
                return { ...value, pona: { ...value.pona, position: position } };
              }
              return value;
            });
          });
          iosocket.on('pause_updated', (paused: boolean) => {
            setPonaCommonState((value) => {
              if (value) {
                return { ...value, pona: { ...value.pona, paused: paused } };
              }
              return value;
            });
          });
          iosocket.on('volume_updated', (volume: number) => {
            setPonaCommonState((value) => {
              if (value) {
                return { ...value, pona: { ...value.pona, volume: volume } };
              }
              return value;
            });
          });
          iosocket.on('repeat_updated', (repeatState: HTTP_PonaRepeatState) => {
            setPonaCommonState((value) => {
              if (value) {
                return { ...value, pona: { ...value.pona, repeat: repeatState } };
              }
              return value;
            });
          });
          iosocket.on('track_started', async (track: Track) => {
            if ( track.identifier ) {
              const newTrack = await makeTrack(track);
              track = newTrack as Track;
            }
            setPonaCommonState((value) => {
              if (value) {
                return { ...value, current: track, pona: { ...value.pona, position: 0, length: track.duration }};
              }
              return value;
            });
          });
          iosocket.on('track_updated', async (track: Track) => {
            if ( track.identifier ) {
              const newTrack = await makeTrack(track);
              track = newTrack as Track;
            }
            setPonaCommonState((value) => {
              if (value) {
                return { ...value, current: track, pona: { ...value.pona, length: track.duration }};
              }
              return value;
            });
          });
          iosocket.on('queue_updated', async (queue: Queue) => {
            if ( queue.current?.identifier ) {
              const newTrack = await makeTrack(queue.current);
              queue.current = newTrack;
            }
            setPonaCommonState((value) => {
              if (value) {
                return { ...value, queue: queue};
              }
              return value;
            });
          });
          iosocket.on('player_created', (pona: HTTP_PonaCommonStateWithTracks | null) => {
            setPonaCommonState(pona);
          });
          iosocket.on('player_destroyed', () => {
            document.body.removeAttribute('playing');
            setPonaCommonState(null);
          });
          iosocket.on('member_state_updated', (memberVoiceState: MemberVoiceChangedState) => {
            if ( memberVoiceState.isUserJoined && memberVoiceState.newVC ) setIsMemberInVC(memberVoiceState.newVC);
            else if ( memberVoiceState.isUserSwitched || (memberVoiceState.oldVC && memberVoiceState.newVC) ) setIsMemberInVC(memberVoiceState.newVC);
            else if ( memberVoiceState.isUserLeaved || !memberVoiceState.newVC ) setIsMemberInVC(null);
            setIsSameVC(memberVoiceState.isSameVC);
          });
          iosocket.on('connect', () => {
            setIsConnected(true);
          }).once('connect_error', (error) => {
            console.error('Socket connection error:', error);
            setTimeout(connectSocket, 5000);
          });
        };

        if (!socket || !socket.connected) {
          connectSocket();
          setSocket(iosocket);
          document.documentElement.classList.add('pona-music-ready');
        }
      }
    }
    return () => {
      if (socket && !pathname.includes('player')) {
        document.documentElement.classList.remove('pona-music-ready');
        setPonaCommonState(null);
        setIsMemberInVC(null);
        socket.off();
        socket.close();
      }
    }
  }, [guild, manager, isConnected, socket, oauth_type, oauth_token, pathname, setPonaCommonState, setIsMemberInVC])

  return (
    <PonaMusicContext.Provider value={{
      socket: socket,
      manager, setManager,
      isConnected, setIsConnected,
      playerPopup, setPlayerPopup,
      transport, setTransport
    }}>
      {children}
    </PonaMusicContext.Provider>
  );
};

export const usePonaMusicContext = () => useContext(PonaMusicContext);

export default PonaMusicContext;