"use client"

import React, { useCallback, useEffect, useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import {
  motion,
  MotionValue,
  useMotionValue,
  useTransform,
  useMotionTemplate,
  animate,
} from "framer-motion"
import { useAtom, useAtomValue } from "jotai"
import {
  CaretDownIcon,
  CaretLineLeftIcon,
  CaretLineRightIcon,
  CaretRightIcon,
  DotsThreeVerticalIcon,
  EqualizerIcon,
  MusicNotesIcon,
  PauseIcon,
  PersonSimpleIcon,
  PlayIcon,
  QuotesIcon,
  RepeatIcon,
  RepeatOnceIcon,
  SpinnerIcon,
} from "@phosphor-icons/react/dist/ssr"
import { Bot } from "lucide-react"

import { combineArtistName } from "@/components/music/searchResult/track"
import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"

import { useSocket } from "@/contexts/ponaMusicContext"
import { useAppStore } from "@/store/coreStore"
import { playbackAtom, ponaCommonStateAtom } from "@/store/musicAtoms"
import { playerPopupAtom, isQueueReorderingAtom } from "@/store/uiAtoms"
import { AnimateIcon } from "@/components/animate-ui/icons/icon"
import CustomScrollArea from "@/components/ui/custom/scroll-area"
import LyricsDisplay from "@/components/music/lyricsDisplay"
import Related from "./related"
import { Track } from "@/types/ponaPlayer"
import { MobilePonaPlayerPanelAnimationState, PlayerSeekBar, PlayerControls } from "../index"
import MobileQueueView from "./mobileQueue"
import { toast } from "sonner"
import { emitWithTimeout } from "@/lib/promiseWithTimeout"
import { msToTime } from "@/lib/utils"

const MobileTimeDisplay = React.memo(function MobileTimeDisplay({ maxLength }: { maxLength: number }) {
  const playback = useAtomValue(playbackAtom)
  return (
    <div className="mt-1 flex w-full flex-row items-center justify-between gap-2">
      <span className="text-xs text-default-foreground/60">
        {msToTime(playback)}
      </span>
      <span className="text-xs text-default-foreground/60">
        {msToTime(maxLength)}
      </span>
    </div>
  )
})

const MobilePonaPlayerPanel = React.memo(function MobilePonaPlayerPanel({
  dragProgress,
  snapStage = 0,
  setSnapStage,
  onTogglePanel,
  onDismissPanel,
}: {
  trackFocus?: boolean
  setTrackFocus?: React.Dispatch<React.SetStateAction<boolean>>
  beforeState?: MobilePonaPlayerPanelAnimationState
  setBeforeState?: React.Dispatch<
    React.SetStateAction<MobilePonaPlayerPanelAnimationState>
  >
  afterState?: MobilePonaPlayerPanelAnimationState
  setAfterState?: React.Dispatch<
    React.SetStateAction<MobilePonaPlayerPanelAnimationState>
  >
  dragProgress: MotionValue<number>
  snapStage?: 0 | 1 | 1.5 | 2
  setSnapStage?: React.Dispatch<React.SetStateAction<0 | 1 | 1.5 | 2>>
  onTogglePanel?: () => void
  onDismissPanel?: () => void
}) {
  const router = useRouter()
  const language = useAppStore((state) => state.language)

  const ponaCommonState = useAtomValue(ponaCommonStateAtom)
  const isQueueReordering = useAtomValue(isQueueReorderingAtom)
  const [playerPopup, setPlayerPopup] = useAtom(playerPopupAtom)
  const { socket } = useSocket()

  const currentTrack = ponaCommonState?.current

  const [dimensions, setDimensions] = useState({ width: 480, height: 800 })
  const [activeMobileTab, setActiveMobileTab] = useState<'queue' | 'lyrics' | 'related'>('queue')
  const [lyricsContainer, setLyricsContainer] = useState<HTMLDivElement | null>(null)
  const [isTrackActionDrawerOpen, setIsTrackActionDrawerOpen] = useState(false)
  const [isRepeatModalOpen, setIsRepeatModalOpen] = useState(false)
  const [isEqualizerDrawerOpen, setIsEqualizerDrawerOpen] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined") return
    const updateDims = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }
    updateDims()
    window.addEventListener("resize", updateDims)
    return () => window.removeEventListener("resize", updateDims)
  }, [])

  const fallbackProgress = useMotionValue(playerPopup ? 1 : 0)
  const progress = dragProgress || fallbackProgress

  const maxArtworkByHeight = Math.max(160, dimensions.height - 410)
  const fullArtworkSize = Math.max(160, Math.min(dimensions.width - 48, maxArtworkByHeight))
  const totalContentH = fullArtworkSize + 308
  const startContentTop = Math.max(48, (dimensions.height - totalContentH) / 2)
  const fullArtworkTop = startContentTop
  const fullArtworkLeft = (dimensions.width - fullArtworkSize) / 2

  const initialArtworkScale = fullArtworkSize > 0 ? 48 / fullArtworkSize : 0.1
  const fullWidthScale = fullArtworkSize > 0 ? dimensions.width / fullArtworkSize : 1.2

  const artworkScale = useTransform(progress, [0, 1, 1.5, 2], [initialArtworkScale, 1, fullWidthScale, initialArtworkScale])
  const artworkX = useTransform(progress, [0, 1, 1.5, 2], [8, fullArtworkLeft, 0, 8])
  const artworkY = useTransform(progress, [0, 1, 1.5, 2], [8, fullArtworkTop, 0, 8])
  const artworkRadius = useTransform(progress, [0, 1, 1.3, 1.5, 1.7, 2], [8 / Math.max(0.01, initialArtworkScale), 16, 6, 0, 6, 8 / Math.max(0.01, initialArtworkScale)])

  const topMask = useTransform(progress, [1.0, 1.35, 1.5, 1.65, 2.0], [0, 10, 10, 10, 0])
  const botMask = useTransform(progress, [1.0, 1.35, 1.5, 1.65, 2.0], [100, 40, 40, 40, 100])
  const artworkMaskImage = useMotionTemplate`linear-gradient(to bottom, transparent 0%, black ${topMask}%, black ${botMask}%, transparent 100%)`

  const topActionsOpacity = useTransform(progress, [0.35, 0.8, 1.6, 1.85], [0, 1, 1, 0])
  const topActionsVisibility = useTransform(progress, (v) => v < 0.3 || v > 1.8 ? 'hidden' : 'visible')

  const miniLayerOpacity = useTransform(progress, [0, 0.2, 0.8, 1.6, 2], [1, 0, 0, 0, 1])
  const miniLayerVisibility = useTransform(progress, (v) => v < 0.25 || v > 1.6 ? 'visible' : 'hidden')

  const titleArtistY = useTransform(
    progress,
    [0.35, 1, 1.5, 2],
    [
      fullArtworkTop + fullArtworkSize + 16,
      fullArtworkTop + fullArtworkSize + 16,
      dimensions.width - 48,
      -80,
    ]
  )
  const titleArtistOpacity = useTransform(progress, [0.35, 0.85, 1.5, 1.75, 2], [0, 1, 1, 0, 0])
  const titleArtistVisibility = useTransform(progress, (v) => v < 0.25 || v > 1.8 ? 'hidden' : 'visible')

  const actionsRowY = useTransform(
    progress,
    [0.35, 1, 1.25, 1.5, 2],
    [
      fullArtworkTop + fullArtworkSize + 76,
      fullArtworkTop + fullArtworkSize + 76,
      fullArtworkTop + fullArtworkSize + 56,
      -80,
      -80,
    ]
  )
  const actionsRowOpacity = useTransform(progress, [0.75, 1, 1.15, 1.3], [0, 1, 0, 0])
  const actionsRowVisibility = useTransform(progress, (v) => v < 0.7 || v > 1.2 ? 'hidden' : 'visible')

  const controlsTargetY15 = dimensions.width - fullArtworkTop - fullArtworkSize - 120
  const controlsY = useTransform(progress, [0.35, 1, 1.5, 2], [24, 0, controlsTargetY15, controlsTargetY15 - 100])
  const controlsOpacity = useTransform(progress, [0.35, 0.85, 1.5, 1.75, 2], [0, 1, 1, 0, 0])
  const controlsVisibility = useTransform(progress, (v) => v < 0.25 || v > 1.8 ? 'hidden' : 'visible')
  const buttonsY = useTransform(progress, [1.0, 1.5, 2.0], [0, -12, 0])

  const openQueueOpacity = useTransform(progress, [0.8, 1, 1.15, 2], [0, 1, 0, 0])
  const openQueueVisibility = useTransform(progress, (v) => v > 1.15 || v < 0.7 ? 'hidden' : 'visible')

  const queueMidY = Math.max(0, dimensions.width + 56)
  const queueY = useTransform(progress, [1.0, 1.5, 2.0], [dimensions.height, queueMidY, 0])
  const queueOpacity = useTransform(progress, [1.05, 1.3, 2], [0, 1, 1])
  const queueVisibility = useTransform(progress, (v) => v < 1.05 ? 'hidden' : 'visible')

  useEffect(() => {
    if (!currentTrack) {
      setPlayerPopup(false)
      document.body.classList.remove("pona-player-focused")
    }
    if (!playerPopup || !currentTrack) {
      document.body.classList.remove("pona-player-focused")
    }
  }, [currentTrack, playerPopup, setPlayerPopup])

  const maxLength = ponaCommonState?.pona.length || 100

  const handleSeek = useCallback(
    (val: number) => {
      socket?.emit("seek", val)
    },
    [socket]
  )

  const handlePause = useCallback(() => socket?.emit("pause"), [socket])
  const handlePlay = useCallback(() => socket?.emit("play"), [socket])
  const handlePrevious = useCallback(() => {
    toast.promise(
      emitWithTimeout((resolve, reject) => {
        socket?.emit("previous", (error: unknown) => {
          if (error && (error as { status?: string }).status !== "ok") {
            reject(error)
          } else {
            resolve()
          }
        })
      }),
      {
        loading:
          language.data.app.guilds.player.toast["previous"]?.loading ||
          "Loading...",
        success:
          language.data.app.guilds.player.toast["previous"]?.success || "Done",
        error:
          language.data.app.guilds.player.toast["previous"]?.error || "Error",
      }
    )
  }, [socket, language])

  const handleNext = useCallback(() => {
    toast.promise(
      emitWithTimeout((resolve, reject) => {
        socket?.emit("next", (error: unknown) => {
          if (error && (error as { status?: string }).status !== "ok") {
            reject(error)
          } else {
            resolve()
          }
        })
      }),
      {
        loading:
          language.data.app.guilds.player.toast["next"]?.loading ||
          "Loading...",
        success:
          language.data.app.guilds.player.toast["next"]?.success || "Done",
        error: language.data.app.guilds.player.toast["next"]?.error || "Error",
      }
    )
  }, [socket, language])

  const handleOpenRepeat = useCallback(() => {
    setIsRepeatModalOpen(true)
  }, [])

  useEffect(() => {
    if (snapStage !== undefined) {
      animate(progress, snapStage, {
        type: "spring",
        bounce: 0,
        stiffness: 400,
        damping: 40,
        mass: 1,
        restDelta: 0.001,
      })
    }
  }, [snapStage, progress])

  const resetTabTimeoutRef = React.useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    return () => {
      if (resetTabTimeoutRef.current) {
        clearTimeout(resetTabTimeoutRef.current)
      }
    }
  }, [])

  const snapToStage = useCallback((target: 0 | 1 | 1.5 | 2) => {
    if (resetTabTimeoutRef.current) {
      clearTimeout(resetTabTimeoutRef.current)
      resetTabTimeoutRef.current = null
    }

    if (target <= 1.0) {
      // Delay resetting to 'queue' until the panel has fully slid down out of view (smooth exit)
      resetTabTimeoutRef.current = setTimeout(() => {
        setActiveMobileTab('queue')
      }, 450)
    }

    if (target === 0) {
      if (onDismissPanel) onDismissPanel()
      else if (setSnapStage) setSnapStage(0)
      return
    }
    if (setSnapStage) setSnapStage(target)
    animate(progress, target, {
      type: "spring",
      bounce: 0,
      stiffness: 400,
      damping: 40,
      mass: 1,
      restDelta: 0.001,
    })
  }, [onDismissPanel, setSnapStage, progress])

  const handleOpenQueueStep = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation()
    setActiveMobileTab('queue')
    snapToStage(1.5)
  }, [snapToStage])

  const handleCollapseStep = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation()
    const cur = progress.get()
    if (cur > 1.7) {
      snapToStage(1.5)
    } else {
      snapToStage(1)
    }
  }, [progress, snapToStage])

  const handleTopLeftCaret = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation()
    const cur = progress.get()
    if (cur > 1.25) {
      snapToStage(1.0)
    } else {
      snapToStage(0)
    }
  }, [progress, snapToStage])

  const dismissTravelDist = Math.max(200, dimensions.height - 64)
  const queueToMidDist = Math.max(150, dimensions.height - queueMidY)
  const queueToFullDist = Math.max(150, queueMidY)

  const handlePanelDrag = useCallback(
    (_: unknown, info: { offset: { x: number; y: number } }) => {
      if (isQueueReordering) return
      if (Math.abs(info.offset.x) > 12 && Math.abs(info.offset.x) > Math.abs(info.offset.y)) {
        return
      }
      if (info.offset.y > 0) {
        progress.set(Math.max(0, 1 - info.offset.y / dismissTravelDist))
      } else {
        progress.set(Math.min(1.5, 1 - info.offset.y / (queueToMidDist * 2)))
      }
    },
    [isQueueReordering, progress, dismissTravelDist, queueToMidDist]
  )

  const handlePanelDragEnd = useCallback(
    (
      _: unknown,
      info: { offset: { x: number; y: number }; velocity: { x: number; y: number } }
    ) => {
      if (isQueueReordering) {
        snapToStage(snapStage)
        return
      }
      if (
        Math.abs(info.offset.x) > 20 &&
        Math.abs(info.offset.x) > Math.abs(info.offset.y) * 0.75
      ) {
        snapToStage(snapStage)
        return
      }
      if (info.offset.y > 80 || info.velocity.y > 350) {
        snapToStage(0)
      } else if (info.offset.y < -45 || info.velocity.y < -200) {
        snapToStage(1.5)
      } else {
        snapToStage(1)
      }
    },
    [isQueueReordering, snapStage, snapToStage]
  )

  const handleQueueHandleDrag = useCallback(
    (_: unknown, info: { offset: { x: number; y: number } }) => {
      if (isQueueReordering) return
      if (Math.abs(info.offset.x) > 12 && Math.abs(info.offset.x) > Math.abs(info.offset.y)) {
        return
      }
      const cur = progress.get()
      if (snapStage === 1.5 || cur < 1.75) {
        if (info.offset.y > 0) {
          progress.set(Math.max(1, 1.5 - info.offset.y / (queueToMidDist * 2)))
        } else {
          progress.set(Math.min(2, 1.5 - info.offset.y / (queueToFullDist * 2)))
        }
      } else {
        if (info.offset.y > 0) {
          progress.set(Math.max(1, 2 - info.offset.y / (queueToFullDist * 2)))
        }
      }
    },
    [isQueueReordering, progress, snapStage, queueToMidDist, queueToFullDist]
  )

  const handleQueueHandleDragEnd = useCallback(
    (
      _: unknown,
      info: { offset: { x: number; y: number }; velocity: { x: number; y: number } }
    ) => {
      if (isQueueReordering) {
        snapToStage(snapStage)
        return
      }
      if (
        Math.abs(info.offset.x) > 20 &&
        Math.abs(info.offset.x) > Math.abs(info.offset.y) * 0.75
      ) {
        snapToStage(snapStage)
        return
      }
      if (snapStage === 1.5) {
        if (info.offset.y > 50 || info.velocity.y > 250) {
          snapToStage(1)
        } else if (info.offset.y < -45 || info.velocity.y < -200) {
          snapToStage(2)
        } else {
          snapToStage(1.5)
        }
      } else {
        if (info.offset.y > 160 || info.velocity.y > 600) {
          snapToStage(1)
        } else if (info.offset.y > 50 || info.velocity.y > 250) {
          snapToStage(1.5)
        } else {
          snapToStage(2)
        }
      }
    },
    [isQueueReordering, snapStage, snapToStage]
  )

  return (
    <>
      {currentTrack && (
        <motion.div
          className="relative size-full overflow-hidden select-none"
          drag={playerPopup && !isQueueReordering ? "y" : false}
          dragDirectionLock
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={0}
          dragMomentum={false}
          onDrag={snapStage >= 1.5 ? handleQueueHandleDrag : handlePanelDrag}
          onDragEnd={snapStage >= 1.5 ? handleQueueHandleDragEnd : handlePanelDragEnd}
          onClick={!playerPopup ? onTogglePanel : undefined}
        >
          <motion.div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              x: artworkX,
              y: artworkY,
              width: fullArtworkSize,
              height: fullArtworkSize,
              scale: artworkScale,
              borderRadius: artworkRadius,
              maskImage: artworkMaskImage,
              WebkitMaskImage: artworkMaskImage,
              transformOrigin: "top left",
              zIndex: 30,
              willChange: "transform, border-radius",
            }}
            className="overflow-hidden shadow-2xl bg-overlay transform-gpu touch-none"
            onClick={snapStage === 2 ? handleCollapseStep : (!playerPopup ? onTogglePanel : undefined)}
          >
            <Image
              src={
                currentTrack.proxyHighResArtworkUrl ||
                currentTrack.proxyArtworkUrl ||
                "/static/Ponlponl123 (1459).png"
              }
              alt={currentTrack.title || "Artwork"}
              fill
              unoptimized
              className="size-full object-cover pointer-events-none"
              id="pona-music-artwork"
            />
          </motion.div>

          <motion.div
            style={{
              position: "absolute",
              top: 12,
              left: 12,
              right: 12,
              opacity: topActionsOpacity,
              visibility: topActionsVisibility,
              pointerEvents: playerPopup && (snapStage === 1 || snapStage === 1.5) ? "auto" : "none",
              zIndex: 40,
            }}
            onPointerDown={(e) => e.stopPropagation()}
            className="flex items-center justify-between transform-gpu"
          >
            <Button
              variant="ghost"
              size="icon"
              className="size-10 rounded-full text-default-foreground/90 hover:text-default-foreground hover:backdrop-blur-xs"
              onClick={handleTopLeftCaret}
            >
              <CaretDownIcon weight="bold" className="size-6" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="size-10 rounded-full text-default-foreground/90 hover:text-default-foreground hover:backdrop-blur-xs"
              onClick={(e) => {
                e.stopPropagation()
                setIsTrackActionDrawerOpen(true)
              }}
            >
              <DotsThreeVerticalIcon weight="bold" className="size-6" />
            </Button>
          </motion.div>

          <motion.div
            style={{
              position: "absolute",
              top: 0,
              left: 64,
              right: 0,
              height: 64,
              opacity: miniLayerOpacity,
              visibility: miniLayerVisibility,
              pointerEvents: playerPopup && snapStage !== 2 ? "none" : "auto",
              zIndex: 35,
            }}
            className="flex items-center justify-between pr-2 transform-gpu cursor-pointer select-none"
            onClick={snapStage === 2 ? handleCollapseStep : (!playerPopup ? onTogglePanel : undefined)}
          >
            <div className="min-w-0 flex-1 pr-2">
              <h4 className="text-sm font-bold text-default-foreground truncate">
                {currentTrack.title}
              </h4>
              <p className="text-xs text-default-foreground/60 truncate">
                {currentTrack.artist ? (
                  combineArtistName(currentTrack.artist, true, router, {
                    className: "text-xs text-default-foreground/60 hover:underline",
                  })
                ) : (
                  currentTrack.cleanAuthor || currentTrack.author || ""
                )}
              </p>
            </div>
            <div onClick={(e) => e.stopPropagation()}>
              <PlayerControls
                socket={socket}
                language={language}
                isPaused={Boolean(ponaCommonState?.pona.paused)}
                maxLength={maxLength}
                isMobile
              />
            </div>
          </motion.div>

          <motion.div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              y: titleArtistY,
              opacity: titleArtistOpacity,
              visibility: titleArtistVisibility,
              pointerEvents: playerPopup && (snapStage === 1 || snapStage === 1.5) ? "auto" : "none",
              zIndex: 32,
              willChange: "transform, opacity",
            }}
            className="px-6 flex flex-col min-w-0 transform-gpu"
          >
            <div
              className="flex items-center gap-0.5 cursor-pointer group select-none"
              onClick={(e) => {
                e.stopPropagation()
                setActiveMobileTab('related')
                snapToStage(2)
              }}
            >
              <h1 className="text-xl font-bold text-default-foreground truncate drop-shadow-sm">
                {currentTrack.title}
              </h1>
              <Button
                size={"icon-sm"}
                variant={"ghost"}
                className="text-default-foreground/60 hover:text-default-foreground rounded-lg shrink-0"
                onClick={(e) => {
                  e.stopPropagation()
                  setActiveMobileTab('related')
                  snapToStage(2)
                }}
              >
                <CaretRightIcon weight="bold" size={12} />
              </Button>
            </div>
            <p className="text-sm text-default-foreground/75 truncate mt-0.5 drop-shadow-sm">
              {currentTrack.artist ? (
                combineArtistName(currentTrack.artist, true, router, {
                  className:
                    "text-sm text-default-foreground/75 hover:underline cursor-pointer",
                })
              ) : (
                <span>
                  {currentTrack.cleanAuthor || currentTrack.author || ""}
                </span>
              )}
            </p>
          </motion.div>

          <motion.div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              y: actionsRowY,
              opacity: actionsRowOpacity,
              visibility: actionsRowVisibility,
              pointerEvents: playerPopup && snapStage === 1 ? "auto" : "none",
              zIndex: 30,
              willChange: "transform, opacity",
            }}
            onPointerDown={(e) => e.stopPropagation()}
            className="px-6 flex items-center gap-1.5 min-w-0 transform-gpu"
          >
            <Button
              size="sm"
              variant="ghost"
              data-smooth-interaction="true"
              className="text-default-foreground bg-default-foreground/10 hover:bg-default-foreground/15 rounded-full h-8 px-3 gap-1.5 text-xs font-semibold"
              onClick={(e) => {
                e.stopPropagation()
                setActiveMobileTab('lyrics')
                snapToStage(2)
              }}
            >
              <QuotesIcon weight="bold" size={14} />
              {(language.data.app.guilds.player.tabs as Record<string, string>)?.lyrics || "Lyrics"}
            </Button>
          </motion.div>

          <motion.div
            style={{
              position: "absolute",
              top: fullArtworkTop + fullArtworkSize + 116,
              left: 0,
              right: 0,
              opacity: controlsOpacity,
              visibility: controlsVisibility,
              y: controlsY,
              pointerEvents:
                playerPopup && (snapStage === 1 || snapStage === 1.5)
                  ? "auto"
                  : "none",
              zIndex: 25,
              willChange: "transform, opacity",
            }}
            className="px-6 flex flex-col gap-4 transform-gpu"
          >
            <motion.div
              style={{
                marginTop: playerPopup && snapStage === 1.5 ? 24 : 8,
                marginBottom: playerPopup && snapStage === 1.5 ? -24 : 8,
              }}
              className="relative"
              id="mobile-pona-music-player-controller-track-slider"
              onPointerDown={(e) => e.stopPropagation()}
            >
              <PlayerSeekBar
                maxLength={maxLength}
                onSeek={handleSeek}
                isMobile
                className="w-full mb-2.5 h-2 relative top-0 left-0 flex items-center group"
              />
              <MobileTimeDisplay maxLength={maxLength} />
            </motion.div>

            <motion.div
              style={{ y: buttonsY }}
              className="my-2 flex w-full items-center justify-evenly transform-gpu"
              id="mobile-pona-music-player-controller-track-action"
              onPointerDown={(e) => e.stopPropagation()}
            >
              <Button
                variant="ghost"
                data-smooth-interaction="true"
                size="icon"
                className="mr-auto rounded-lg"
                onClick={() => setIsEqualizerDrawerOpen(true)}
              >
                <EqualizerIcon weight="fill" className="size-5 text-default-foreground" />
              </Button>
              <Button
                variant="ghost"
                data-smooth-interaction="true"
                size="icon"
                className="size-14 rounded-full"
                onClick={handlePrevious}
              >
                <CaretLineLeftIcon weight="fill" className="size-6 text-default-foreground" />
              </Button>
              {!ponaCommonState?.pona.paused ? (
                <Button
                  size="icon"
                  data-smooth-interaction="true"
                  className="mx-auto size-18 rounded-full bg-default-foreground hover:bg-default-foreground"
                  onClick={handlePause}
                >
                  <PauseIcon weight="fill" className="size-8 text-default" />
                </Button>
              ) : (
                <Button
                  size="icon"
                  data-smooth-interaction="true"
                  className="mx-auto size-18 rounded-full bg-default-foreground hover:bg-default-foreground"
                  onClick={handlePlay}
                >
                  <PlayIcon weight="fill" className="size-8 text-default" />
                </Button>
              )}
              <Button
                variant="ghost"
                data-smooth-interaction="true"
                size="icon"
                className="size-14 rounded-full"
                onClick={handleNext}
              >
                <CaretLineRightIcon weight="fill" className="size-6 text-default-foreground" />
              </Button>
              <Button
                variant="ghost"
                data-smooth-interaction="true"
                size="icon"
                className="ml-auto rounded-lg"
                onClick={handleOpenRepeat}
              >
                <RepeatIcon weight="fill" className="size-5 text-default-foreground" />
              </Button>
            </motion.div>

            <motion.div
              style={{
                opacity: openQueueOpacity,
                visibility: openQueueVisibility,
              }}
              className="flex flex-col items-center mt-2 cursor-pointer touch-none select-none"
              onClick={handleOpenQueueStep}
            >
              <div className="p-1.5">
                <div className="w-16 h-1.25 rounded-full bg-default-foreground/25 hover:bg-default-foreground/45" />
              </div>
              <Button
                variant="ghost"
                data-smooth-interaction="true"
                className="mx-auto text-default-foreground hover:text-default-foreground hover:bg-default-foreground/10 rounded-xl"
                onClick={handleOpenQueueStep}
              >
                {language.data.app.guilds.player.tabs.open_queue}
              </Button>
            </motion.div>
          </motion.div>

          <motion.div
            style={{
              position: "absolute",
              top: 64,
              left: 0,
              right: 0,
              bottom: 0,
              y: queueY,
              opacity: queueOpacity,
              visibility: queueVisibility,
              zIndex: 28,
              willChange: "transform, opacity",
            }}
            className="transform-gpu flex flex-col min-h-0 rounded-t-3xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="w-full absolute top-0 z-50 left-1/2 -translate-x-1/2 flex items-center justify-center py-2.5 cursor-grab active:cursor-grabbing touch-none select-none"
              onClick={handleCollapseStep}
            >
              <div className="w-12 h-1.25 rounded-full bg-default-foreground/25 hover:bg-default-foreground/45" />
            </div>

            {activeMobileTab === 'queue' && (
              <MobileQueueView className="flex-1 min-h-0" snapStage={snapStage} />
            )}

            {activeMobileTab === 'lyrics' && (
              <CustomScrollArea
                className="flex-1 min-h-0 border-0 outline-0"
                classNames={{
                  viewport: "relative rounded-none bg-linear-to-b from-[hsl(var(--pona-app-music-accent-color-500))] dark:from-[hsl(var(--pona-app-music-accent-color-900))] to-transparent",
                }}
                ref={setLyricsContainer}
              >
                <div className="w-full border-b border-default-foreground/10 p-4 pt-6 flex bg-[hsl(var(--pona-app-music-accent-color-500))] dark:bg-[hsl(var(--pona-app-music-accent-color-900))] sticky top-0 z-40">
                  <div className="w-full min-w-0 flex-1 pr-4">
                    <span className="text-default-foreground text-xl font-bold truncate block">
                      {language.data.app.guilds.player.tabs.lyrics}
                    </span>
                  </div>
                </div>
                <div className="w-full pt-8 pb-20 mask-t-from-90% mask-b-from-90%">
                  {lyricsContainer && (
                    <>
                      {!currentTrack?.lyrics ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-3 text-muted-foreground">
                          <SpinnerIcon className="size-8 animate-spin text-[hsl(var(--pona-app-music-accent-color-500))]" />
                          <span className="text-sm font-medium">
                            {(language.data.app.guilds.player.tabs as Record<string, string>)?.fetching_lyrics || 'Loading lyrics...'}
                          </span>
                        </div>
                      ) : currentTrack.lyrics.error || !currentTrack.lyrics.lyrics || currentTrack.lyrics.lyrics.length === 0 ? (
                        <div className="text-center py-16 flex flex-col justify-center items-center gap-3 text-[hsl(var(--pona-app-music-accent-color-800))] dark:text-[hsl(var(--pona-app-music-accent-color-500))]">
                          <AnimateIcon animate loop loopDelay={1200}>
                            <Bot size={48} />
                          </AnimateIcon>
                          <strong>
                            {(language.data.app.guilds.player.tabs as Record<string, string>)?.no_lyrics_available || 'No lyrics available'}
                          </strong>
                        </div>
                      ) : currentTrack.lyrics.isTimestamp ? (
                        <LyricsDisplay
                          currentTrack={currentTrack as Track}
                          lyricsProvider={lyricsContainer}
                          isPlaying={!ponaCommonState?.pona.paused}
                        />
                      ) : (
                        <div className="w-full text-center pb-16">
                          {(currentTrack.lyrics.lyrics as string[]).map((lyric, index) => (
                            <div key={index} className="flex items-center justify-center gap-2">
                              <span className="text-xl my-3 text-[hsl(var(--pona-app-music-accent-color-800))] dark:text-[hsl(var(--pona-app-music-accent-color-500))] font-medium">
                                {lyric}
                              </span>
                            </div>
                          ))}
                          {currentTrack.lyrics.source && (
                            <div className="mt-8 mb-4 text-xs text-[hsl(var(--pona-app-music-accent-color-500)/0.5)] font-semibold tracking-wider uppercase text-center">
                              {(
                                (language.data.app.guilds.player.tabs as Record<string, string>)?.lyrics_provided_by ||
                                'Lyrics provided by [provider]'
                              ).replace('[provider]', currentTrack.lyrics.source)}
                            </div>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </CustomScrollArea>
            )}

            {activeMobileTab === 'related' && (
              <CustomScrollArea
                className="flex-1 min-h-0 border-0 outline-0"
                classNames={{
                  viewport: "pb-8 bg-linear-to-b from-[hsl(var(--pona-app-music-accent-color-500))] dark:from-[hsl(var(--pona-app-music-accent-color-900))] to-transparent",
                }}
              >
                <div className="w-full border-b border-default-foreground/10 p-4 pt-6 flex bg-[hsl(var(--pona-app-music-accent-color-500))] dark:bg-[hsl(var(--pona-app-music-accent-color-900))] sticky top-0 z-40">
                  <div className="w-full min-w-0 flex-1 pr-4">
                    <span className="text-default-foreground text-xl font-bold truncate block">
                      {language.data.app.guilds.player.tabs.related}
                    </span>
                  </div>
                </div>
                <Related videoId={currentTrack?.identifier} />
              </CustomScrollArea>
            )}
          </motion.div>
        </motion.div>
      )}

      <Drawer
        open={isTrackActionDrawerOpen}
        onOpenChange={setIsTrackActionDrawerOpen}
        modal
        showSwipeHandle
        swipeDirection="down"
      >
        <DrawerContent className="border-none bg-overlay backdrop-blur-xl">
          <DrawerHeader className="py-4 px-4 mb-2 border-b border-default-foreground/10 text-left flex items-center gap-3">
            {currentTrack && (
              <>
                <div className="size-14 shrink-0 relative overflow-hidden rounded-xl bg-default/60">
                  <Image
                    src={
                      currentTrack.proxyArtworkUrl ||
                      currentTrack.artworkUrl ||
                      "/static/Ponlponl123 (1459).png"
                    }
                    alt={currentTrack.title}
                    fill
                    unoptimized
                    className="object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <DrawerTitle className="text-base font-bold text-default-foreground truncate">
                    {currentTrack.title}
                  </DrawerTitle>
                  <p className="text-xs text-default-foreground/60 truncate mt-0.5">
                    {currentTrack.cleanAuthor || currentTrack.author || ""}
                  </p>
                </div>
              </>
            )}
          </DrawerHeader>

          {currentTrack && (
            <div className="flex flex-col pb-6">
              {currentTrack.artist && currentTrack.artist[0] && (
                <Button
                  variant="ghost"
                  size="lg"
                  className="justify-start p-3 h-max border-0 text-default-foreground gap-3"
                  onClick={() => {
                    const artistId = currentTrack.artist![0].id
                    setIsTrackActionDrawerOpen(false)
                    const currentPath = window.location.pathname
                    const basePath = currentPath.includes("/player")
                      ? currentPath.split("/player")[0] + "/player"
                      : currentPath
                    router.push(`${basePath}/c?c=${artistId}`)
                  }}
                >
                  <PersonSimpleIcon weight="bold" className="size-5" />
                  <span className="font-medium">
                    {language.data.app.guilds.player.context_menu.goto_artist}
                  </span>
                </Button>
              )}
            </div>
          )}
        </DrawerContent>
      </Drawer>

      <Drawer
        open={isRepeatModalOpen}
        onOpenChange={setIsRepeatModalOpen}
        modal
        showSwipeHandle
        swipeDirection="down"
      >
        <DrawerContent className="border-none bg-overlay backdrop-blur-xl">
          <DrawerHeader className="py-4 mb-2 border-b border-default-foreground/10">
            <DrawerTitle>
              {language.data.app.guilds.player.repeat.title}
            </DrawerTitle>
          </DrawerHeader>
          <div className="flex flex-col pb-6">
            <Button
              variant={
                !ponaCommonState?.pona.repeat.track &&
                  !ponaCommonState?.pona.repeat.queue
                  ? "outline"
                  : "ghost"
              }
              size={"lg"}
              className="justify-start p-3 h-max border-0"
              onClick={() => {
                socket?.emit("repeat", "none")
                setIsRepeatModalOpen(false)
              }}
            >
              <MusicNotesIcon className="mr-2 size-4" />
              {language.data.app.guilds.player.repeat.off}
            </Button>
            <Button
              variant={
                ponaCommonState?.pona.repeat.queue ? "outline" : "ghost"
              }
              size={"lg"}
              className="justify-start p-3 h-max border-0"
              onClick={() => {
                socket?.emit("repeat", "queue")
                setIsRepeatModalOpen(false)
              }}
            >
              <RepeatIcon className="mr-2 size-4" />
              {language.data.app.guilds.player.repeat.queue}
            </Button>
            <Button
              variant={
                ponaCommonState?.pona.repeat.track ? "outline" : "ghost"
              }
              size={"lg"}
              className="justify-start p-3 h-max border-0"
              onClick={() => {
                socket?.emit("repeat", "track")
                setIsRepeatModalOpen(false)
              }}
            >
              <RepeatOnceIcon className="mr-2 size-4" />
              {language.data.app.guilds.player.repeat.track}
            </Button>
          </div>
        </DrawerContent>
      </Drawer>

      <Drawer
        open={isEqualizerDrawerOpen}
        onOpenChange={setIsEqualizerDrawerOpen}
        modal
        showSwipeHandle
        swipeDirection="down"
      >
        <DrawerContent className="border-none bg-overlay backdrop-blur-xl">
          <DrawerHeader className="py-4 mb-2 border-b border-default-foreground/10">
            <DrawerTitle>
              {language.data.app.guilds.player.equalizer.title}
            </DrawerTitle>
          </DrawerHeader>
          <div className="flex flex-col items-center justify-center p-6 text-center text-sm text-muted-foreground pb-8">
            {language.data.extensions.comingsoon}
          </div>
        </DrawerContent>
      </Drawer>
    </>
  )
})

export default MobilePonaPlayerPanel
