"use client"
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react"
import { Manager, Socket } from "socket.io-client"
import { useSetAtom } from "jotai"
import { usePathname } from "next/navigation"
import { getCookie } from "cookies-next"

import {
  playbackAtom,
  ponaCommonStateAtom,
  queueAtom,
} from "@/store/musicAtoms"
import { isMemberInVCAtom, isSameVCAtom } from "@/store/uiAtoms"
import { ws_manager } from "@/app/app/g/[guildId]/player/socket"
import { useDiscordGuildInfo } from "./discordGuildInfo"
import {
  HTTP_PonaCommonStateWithTracks,
  HTTP_PonaRepeatState,
  Queue,
  Track,
} from "@/types/ponaPlayer"
import { makeTrack, proxyArtwork } from "@/lib/track"
import { MemberVoiceChangedState } from "@/types/member"
import { VoiceBasedChannel } from "discord.js"

const PonaMusicContext = createContext<{
  socket: Socket | null
  isConnected: boolean
}>({
  socket: null,
  isConnected: false,
})

export const PonaMusicProvider = ({
  children,
}: {
  children: React.ReactNode
}) => {
  const { guild } = useDiscordGuildInfo()
  const pathname = usePathname() || ""

  const setPlayback = useSetAtom(playbackAtom)
  const setPonaCommonState = useSetAtom(ponaCommonStateAtom)
  const setQueue = useSetAtom(queueAtom)
  const setIsMemberInVC = useSetAtom(isMemberInVCAtom)
  const setIsSameVC = useSetAtom(isSameVCAtom)

  const initialized = useRef(false)
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState<boolean>(false)

  useEffect(() => {
    if (guild?.id && pathname.includes("player") && !initialized.current) {
      const oauth_type = getCookie("LOGIN_TYPE_")
      const oauth_token = getCookie("LOGIN_")

      const iosocket = ws_manager.socket(`/guild/${guild.id}`, {
        auth: { type: String(oauth_type), key: String(oauth_token) },
      })

      initialized.current = true

      iosocket.on("handshake", async (ponaState: string) => {
        const decodedPonaState = JSON.parse(
          Buffer.from(ponaState, "base64").toString("utf-8")
        ) as {
          pona?: HTTP_PonaCommonStateWithTracks
          isMemberInVC?: VoiceBasedChannel | null
        }
        if (decodedPonaState.pona?.current?.identifier) {
          const newTrack = await makeTrack(decodedPonaState.pona.current)
          decodedPonaState.pona.current = newTrack
        }
        if (
          decodedPonaState.pona?.queue &&
          decodedPonaState.pona.queue.length > 0
        ) {
          decodedPonaState.pona?.queue.map((track) => {
            return proxyArtwork(track)
          })
        }
        setPonaCommonState(decodedPonaState.pona || null)
        setIsMemberInVC(decodedPonaState.isMemberInVC || null)
        setQueue({
          queue: decodedPonaState?.pona?.queue || [],
          updating: false,
        })
        if (
          decodedPonaState.pona?.pona.voiceChannel &&
          decodedPonaState.isMemberInVC?.id &&
          decodedPonaState.pona.pona.voiceChannel ===
            decodedPonaState.isMemberInVC.id
        )
          setIsSameVC(true)
        else setIsSameVC(false)
      })

      iosocket.on("queue_ended", () => {
        document.body.removeAttribute("playing")
        setPonaCommonState((value) => {
          if (!value) return value
          return {
            ...value,
            queue: [],
            current: null,
            accentColor: null,
          }
        })
        setQueue({
          queue: [],
          updating: false,
        })
      })

      iosocket.on("pause_updated", (paused: number) => {
        setPonaCommonState((value) => {
          if (!value) return value
          return {
            ...value,
            pona: { ...value.pona, paused: paused === 1 ? true : false },
          }
        })
      })

      iosocket.on("volume_updated", (volume: number) => {
        setPonaCommonState((value) => {
          if (!value) return value
          return { ...value, pona: { ...value.pona, volume: volume } }
        })
      })

      iosocket.on("repeat_updated", (repeatState: string) => {
        const decodedRepeatState = JSON.parse(
          Buffer.from(repeatState, "base64").toString("utf-8")
        ) as HTTP_PonaRepeatState
        setPonaCommonState((value) => {
          if (!value) return value
          return {
            ...value,
            pona: { ...value.pona, repeat: decodedRepeatState },
          }
        })
      })

      iosocket.on("track_started", async (track: string) => {
        let decodedTrack = JSON.parse(
          Buffer.from(track, "base64").toString("utf-8")
        ) as Track
        if (decodedTrack.identifier) {
          const newTrack = await makeTrack(decodedTrack)
          decodedTrack = newTrack as Track
        }
        setPonaCommonState((value) => {
          if (!value) return value
          return {
            ...value,
            current: decodedTrack,
            pona: {
              ...value.pona,
              position: 0,
              length: decodedTrack.duration,
            },
          }
        })
      })

      iosocket.on("track_updated", async (track: string) => {
        let decodedTrack = JSON.parse(
          Buffer.from(track, "base64").toString("utf-8")
        ) as Track
        if (decodedTrack?.identifier) {
          const newTrack = await makeTrack(decodedTrack)
          decodedTrack = newTrack as Track
        }
        setPonaCommonState((value) => {
          if (!value) return value
          return {
            ...value,
            current: decodedTrack || null,
            pona: { ...value.pona, length: decodedTrack?.duration || 0 },
          }
        })
      })

      iosocket.on("track_pos_updated", (position: number) => {
        setPlayback(position)
      })

      iosocket.on("track_updated", async (track: string) => {
        let decodedTrack = JSON.parse(
          Buffer.from(track, "base64").toString("utf-8")
        ) as Track
        if (decodedTrack?.identifier) {
          const newTrack = await makeTrack(decodedTrack)
          decodedTrack = newTrack as Track
        }
        setPonaCommonState((value) => {
          if (!value) return value
          return {
            ...value,
            current: decodedTrack || null,
            pona: { ...value.pona, length: decodedTrack?.duration || 0 },
          }
        })
      })

      iosocket.on("queue_updated", async (queueStr: string) => {
        const decodedQueue = JSON.parse(
          Buffer.from(queueStr, "base64").toString("utf-8")
        ) as Queue
        setQueue({ queue: decodedQueue, updating: false })
      })

      iosocket.on("queue_updating", () => {
        setQueue((prev) => {
          return { ...prev, updating: true }
        })
      })

      iosocket.on("volume_updated", (volume: number) => {
        setPonaCommonState((prev) => {
          if (!prev) return prev
          return { ...prev, pona: { ...prev.pona, volume } }
        })
      })

      iosocket.on("player_created", (pona: string) => {
        const decodedPona = JSON.parse(
          Buffer.from(pona, "base64").toString("utf-8")
        ) as HTTP_PonaCommonStateWithTracks | null
        setPonaCommonState(decodedPona)
      })

      iosocket.on("player_destroyed", () => {
        document.body.removeAttribute("playing")
        setPonaCommonState(null)
      })

      iosocket.on("member_state_updated", (memberVoiceState: string) => {
        const decodedMemberVoiceState = JSON.parse(
          Buffer.from(memberVoiceState, "base64").toString("utf-8")
        ) as MemberVoiceChangedState
        if (
          decodedMemberVoiceState.isUserJoined &&
          decodedMemberVoiceState.newVC
        )
          setIsMemberInVC(decodedMemberVoiceState.newVC)
        else if (
          decodedMemberVoiceState.isUserSwitched ||
          (decodedMemberVoiceState.oldVC && decodedMemberVoiceState.newVC)
        )
          setIsMemberInVC(decodedMemberVoiceState.newVC)
        else if (
          decodedMemberVoiceState.isUserLeaved ||
          !decodedMemberVoiceState.newVC
        )
          setIsMemberInVC(null)
      })

      iosocket
        .on("connect", () => {
          setIsConnected(true)
        })
        .on("disconnect", () => {
          setIsConnected(false)
        })
        .on("connect_error", (error) => {
          setIsConnected(false)
          if (error.message?.includes("Session ID unknown") || error.message?.includes("xhr poll error")) {
            // Force clean transport reconnect if session was invalidated
            iosocket.io.opts.transports = ["websocket", "polling"]
          }
        })

      setSocket(iosocket)
      document.documentElement.classList.add("pona-music-ready")
    }

    return () => {
      if (socket && !pathname.includes("player")) {
        document.documentElement.classList.remove("pona-music-ready")
        setPonaCommonState(null)
        socket.off()
        socket.close()
      }
    }
  }, [
    guild,
    pathname,
    socket,
    setPlayback,
    setPonaCommonState,
    setQueue,
    setIsMemberInVC,
    setIsSameVC,
  ])

  return (
    <PonaMusicContext.Provider value={{ socket, isConnected }}>
      {children}
    </PonaMusicContext.Provider>
  )
}

export const useSocket = () => useContext(PonaMusicContext)
