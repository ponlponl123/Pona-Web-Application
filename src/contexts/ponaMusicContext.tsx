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
import { makeTrack, proxyArtwork } from '@/utils/track';
import { usePlaybackContext } from './playbackContext';

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
    setIsSameVC,
    setPonaTrackQueue,
  } = useGlobalContext();
  const { setPlayback } = usePlaybackContext();
  const pathname = usePathname() || '';

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
          iosocket.on('handshake', async (ponaState: string) => {
            const decodedPonaState = JSON.parse(Buffer.from(ponaState, 'base64').toString('utf-8')) as {
              pona?: HTTP_PonaCommonStateWithTracks,
              isMemberInVC?: VoiceBasedChannel | null
            };
            if ( decodedPonaState.pona?.current?.identifier ) {
              const newTrack = await makeTrack(decodedPonaState.pona.current);
              decodedPonaState.pona.current = newTrack;
            }
            if ( decodedPonaState.pona?.queue && decodedPonaState.pona.queue.length > 0 ) {
              decodedPonaState.pona?.queue.map(track => {return proxyArtwork(track)})
            }
            setPonaCommonState(decodedPonaState.pona || null);
            setIsMemberInVC(decodedPonaState.isMemberInVC || null);
            setPonaTrackQueue({
              queue: decodedPonaState?.pona?.queue || [],
              updating: false
            });
            if (
              decodedPonaState.pona?.pona.voiceChannel && decodedPonaState.isMemberInVC?.id &&
              decodedPonaState.pona.pona.voiceChannel === decodedPonaState.isMemberInVC.id
            ) setIsSameVC(true);
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
            setPonaTrackQueue({
              queue: [],
              updating: false
            });
          });
          iosocket.on('track_pos_updated', (position: number) => {
            setPlayback(position);
          });
          iosocket.on('pause_updated', (paused: number) => {
            setPonaCommonState((value) => {
              if (value) {
                return { ...value, pona: { ...value.pona, paused: paused===1?true:false } };
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
          iosocket.on('repeat_updated', (repeatState: string) => {
            const decodedRepeatState = JSON.parse(Buffer.from(repeatState, 'base64').toString('utf-8')) as HTTP_PonaRepeatState;
            setPonaCommonState((value) => {
              if (value) {
                return { ...value, pona: { ...value.pona, repeat: decodedRepeatState } };
              }
              return value;
            });
          });
          iosocket.on('track_started', async (track: string) => {
            let decodedTrack = JSON.parse(Buffer.from(track, 'base64').toString('utf-8')) as Track;
            if ( decodedTrack.identifier ) {
              const newTrack = await makeTrack(decodedTrack);
              decodedTrack = newTrack as Track;
            }
            setPonaCommonState((value) => {
              if (value) {
                return { ...value, current: decodedTrack, pona: { ...value.pona, position: 0, length: decodedTrack.duration }};
              }
              return value;
            });
          });
          iosocket.on('track_updated', async (track: string) => {
            let decodedTrack = JSON.parse(Buffer.from(track, 'base64').toString('utf-8')) as Track;
            if ( decodedTrack?.identifier ) {
              const newTrack = await makeTrack(decodedTrack);
              decodedTrack = newTrack as Track;
            }
            setPonaCommonState((value) => {
              if (value) {
                return { ...value, current: decodedTrack || null, pona: { ...value.pona, length: decodedTrack?.duration || 0 }};
              }
              return value;
            });
          });
          iosocket.on('queue_updated', async (queue: string) => {
            const decodedQueue = JSON.parse(Buffer.from(queue, 'base64').toString('utf-8')) as Queue;
            if ( decodedQueue.current?.identifier ) {
              const newTrack = await makeTrack(decodedQueue.current);
              decodedQueue.current = newTrack;
            }
            if ( decodedQueue && decodedQueue.length > 0 ) {
              decodedQueue.map(track => {return proxyArtwork(track)});
            }
            setPonaCommonState((value) => {
              if (value) {
                return { ...value, queue: decodedQueue};
              }
              return value;
            });
            setPonaTrackQueue({
              queue: decodedQueue,
              updating: false
            });
          });
          iosocket.on('queue_updating', () => {
            setPonaTrackQueue((value)=>({
              ...value,
              updating: true
            }));
          });
          iosocket.on('player_created', (pona: string) => {
            const decodedPona = JSON.parse(Buffer.from(pona, 'base64').toString('utf-8')) as HTTP_PonaCommonStateWithTracks | null;
            setPonaCommonState(decodedPona);
          });
          iosocket.on('player_destroyed', () => {
            document.body.removeAttribute('playing');
            setPonaCommonState(null);
          });
          iosocket.on('member_state_updated', (memberVoiceState: string) => {
            const decodedMemberVoiceState = JSON.parse(Buffer.from(memberVoiceState, 'base64').toString('utf-8')) as MemberVoiceChangedState;
            if ( decodedMemberVoiceState.isUserJoined && decodedMemberVoiceState.newVC ) setIsMemberInVC(decodedMemberVoiceState.newVC);
            else if ( decodedMemberVoiceState.isUserSwitched || (decodedMemberVoiceState.oldVC && decodedMemberVoiceState.newVC) ) setIsMemberInVC(decodedMemberVoiceState.newVC);
            else if ( decodedMemberVoiceState.isUserLeaved || !decodedMemberVoiceState.newVC ) setIsMemberInVC(null);
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
  }, [guild, manager, isConnected, socket, oauth_type, oauth_token, pathname, setPonaCommonState, setIsMemberInVC, setIsSameVC, setPonaTrackQueue, setPlayback])

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