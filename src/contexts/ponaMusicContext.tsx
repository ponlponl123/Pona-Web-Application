"use client"
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react"
import { Manager, Socket } from "socket.io-client"
import { useAtomValue, useSetAtom } from "jotai"
import { usePathname } from "next/navigation"
import { getCookie } from "cookies-next"

import {
  playbackAtom,
  ponaCommonStateAtom,
  queueAtom,
} from "@/store/musicAtoms"
import { isMemberInVCAtom, isSameVCAtom } from "@/store/uiAtoms"
import { destroySocket, ws_manager } from "@/app/app/g/[guildId]/player/socket"
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

  const isMemberInVC = useAtomValue(isMemberInVCAtom)
  const ponaCommonState = useAtomValue(ponaCommonStateAtom)

  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState<boolean>(false)

  // Reactively synchronize isSameVC whenever ponaCommonState or isMemberInVC changes
  useEffect(() => {
    const rawPonaVc = ponaCommonState?.pona?.voiceChannel
    const ponaVcId =
      typeof rawPonaVc === "object" && rawPonaVc !== null
        ? String((rawPonaVc as unknown as { id: string })?.id || "")
        : String(rawPonaVc || "")

    const rawMemberVc = isMemberInVC
    const memberVcId =
      typeof rawMemberVc === "object" && rawMemberVc !== null
        ? String((rawMemberVc as unknown as { id: string })?.id || "")
        : String(rawMemberVc || "")

    if (ponaVcId && memberVcId && ponaVcId === memberVcId) {
      setIsSameVC(true)
    } else {
      setIsSameVC(false)
    }
  }, [ponaCommonState?.pona?.voiceChannel, isMemberInVC, setIsSameVC])

  useEffect(() => {
    if (!guild?.id) return

    const oauth_type = getCookie("LOGIN_TYPE_")
    const oauth_token = getCookie("LOGIN_")

    const authObj: Record<string, string> = {}
    if (oauth_type && String(oauth_type) !== "undefined" && String(oauth_type) !== "null") {
      authObj.type = String(oauth_type)
    }
    if (oauth_token && String(oauth_token) !== "undefined" && String(oauth_token) !== "null") {
      authObj.key = String(oauth_token)
    }

    const iosocket = ws_manager.socket(`/guild/${guild.id}`, {
      auth: authObj,
    })

    if (!iosocket.connected) {
      iosocket.connect()
    }

    queueMicrotask(() => {
      setSocket(iosocket)
      setIsConnected(iosocket.connected)
    })
    document.documentElement.classList.add("pona-music-ready")

    const handlePonaStateUpdate = async (
      ponaStatePayload: string | HTTP_PonaCommonStateWithTracks | null
    ) => {
      if (!ponaStatePayload) {
        document.body.removeAttribute("playing")
        setPonaCommonState(null)
        setQueue({ queue: [], updating: false })
        setIsSameVC(false)
        return
      }

      try {
        let decodedState: HTTP_PonaCommonStateWithTracks | null = null
        if (typeof ponaStatePayload === "string") {
          decodedState = JSON.parse(
            Buffer.from(ponaStatePayload, "base64").toString("utf-8")
          ) as HTTP_PonaCommonStateWithTracks | null
        } else {
          decodedState = ponaStatePayload
        }

        if (!decodedState || !decodedState.pona || !decodedState.pona.voiceChannel) {
          document.body.removeAttribute("playing")
          setPonaCommonState(null)
          setQueue({ queue: [], updating: false })
          setIsSameVC(false)
          return
        }

        if (decodedState.current?.identifier) {
          const newTrack = await makeTrack(decodedState.current)
          decodedState.current = newTrack
        }
        if (decodedState.queue && decodedState.queue.length > 0) {
          decodedState.queue.map((track) => {
            return proxyArtwork(track)
          })
        }

        setPonaCommonState(decodedState)
        setQueue({
          queue: decodedState.queue || [],
          updating: false,
        })
      } catch (err) {
        console.error("Error decoding pona state update:", err)
      }
    }

    iosocket.on("handshake", async (ponaState: string) => {
      const decodedPonaState = JSON.parse(
        Buffer.from(ponaState, "base64").toString("utf-8")
      ) as {
        pona?: HTTP_PonaCommonStateWithTracks | null
        isMemberInVC?: VoiceBasedChannel | null
      }
      setIsMemberInVC(decodedPonaState.isMemberInVC || null)
      handlePonaStateUpdate(decodedPonaState.pona || null)
    })

    iosocket.on("state_updated", (pona: string | null) => {
      handlePonaStateUpdate(pona)
    })

    iosocket.on("player_created", (pona: string | null) => {
      handlePonaStateUpdate(pona)
    })

    iosocket.on("player_destroyed", () => {
      handlePonaStateUpdate(null)
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
        iosocket.emit("sync")
      })
      .on("disconnect", () => {
        setIsConnected(false)
      })
      .on("connect_error", (error) => {
        setIsConnected(false)
        if (
          error.message?.includes("Session ID unknown") ||
          error.message?.includes("xhr poll error")
        ) {
          iosocket.io.opts.transports = ["websocket", "polling"]
        }
      })

    return () => {
      document.documentElement.classList.remove("pona-music-ready")
      setPonaCommonState(null)
      setIsConnected(false)
      setSocket(null)
      destroySocket(`/guild/${guild.id}`)
    }
  }, [
    guild?.id,
    pathname,
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
