"use client"

import React, { useCallback, useEffect, useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { motion, MotionValue, useMotionValue, useTransform } from "framer-motion"
import { useAtom, useAtomValue } from "jotai"
import {
  CaretLineLeftIcon,
  CaretLineRightIcon,
  EqualizerIcon,
  MusicNotesIcon,
  PauseIcon,
  PlayIcon,
  RepeatIcon,
  RepeatOnceIcon,
} from "@phosphor-icons/react/dist/ssr"

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
import { playerPopupAtom } from "@/store/uiAtoms"
import { cn, msToTime } from "@/lib/utils"
import { MobilePonaPlayerPanelAnimationState, PlayerSeekBar, PlayerControls } from "../index"

export default function MobilePonaPlayerPanel({
  trackFocus,
  setTrackFocus,
  setBeforeState,
  setAfterState,
  dragProgress,
  onTogglePanel,
  onDismissPanel,
}: {
  trackFocus: boolean
  setTrackFocus: React.Dispatch<React.SetStateAction<boolean>>
  beforeState?: MobilePonaPlayerPanelAnimationState
  setBeforeState?: React.Dispatch<
    React.SetStateAction<MobilePonaPlayerPanelAnimationState>
  >
  afterState?: MobilePonaPlayerPanelAnimationState
  setAfterState?: React.Dispatch<
    React.SetStateAction<MobilePonaPlayerPanelAnimationState>
  >
  dragProgress?: MotionValue<number>
  onTogglePanel?: (e?: React.MouseEvent) => void
  onDismissPanel?: () => void
}) {
  const router = useRouter()
  const language = useAppStore((state) => state.language)

  const ponaCommonState = useAtomValue(ponaCommonStateAtom)
  const playback = useAtomValue(playbackAtom)
  const [playerPopup, setPlayerPopup] = useAtom(playerPopupAtom)
  const { socket } = useSocket()

  const currentTrack = ponaCommonState?.current

  const [dimensions, setDimensions] = useState({ width: 480, height: 800 })

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

  const maxArtworkByHeight = Math.max(160, dimensions.height - 388)
  const fullArtworkSize = Math.max(160, Math.min(dimensions.width - 48, maxArtworkByHeight))
  const totalContentH = fullArtworkSize + 276
  const startContentTop = Math.max(48, (dimensions.height - totalContentH) / 2)
  const fullArtworkTop = startContentTop
  const fullArtworkLeft = (dimensions.width - fullArtworkSize) / 2

  const initialArtworkScale = fullArtworkSize > 0 ? 48 / fullArtworkSize : 0.1
  const artworkScale = useTransform(progress, [0, 1], [initialArtworkScale, 1])
  const artworkX = useTransform(progress, [0, 1], [8, fullArtworkLeft])
  const artworkY = useTransform(progress, [0, 1], [8, fullArtworkTop])
  const artworkRadius = useTransform(progress, [0, 1], [8 / Math.max(0.01, initialArtworkScale), 16])

  const fullTitleY = fullArtworkTop + fullArtworkSize + 18
  const fullArtistY = fullTitleY + 30
  const fullControlsTop = fullArtistY + 24

  const titleX = useTransform(progress, [0, 1], [64, 24])
  const titleY = useTransform(progress, [0, 1], [11, fullTitleY])
  const titleScale = useTransform(progress, [0, 1], [1, 1.45])

  const artistX = useTransform(progress, [0, 1], [64, 24])
  const artistY = useTransform(progress, [0, 1], [33, fullArtistY])
  const artistScale = useTransform(progress, [0, 1], [1, 1.15])

  const fullControlsOpacity = useTransform(progress, [0.35, 0.85], [0, 1])
  const fullControlsVisibility = useTransform(progress, (v) => v < 0.15 ? 'hidden' : 'visible')
  const fullControlsY = useTransform(progress, [0.35, 1], [24, 0])
  const miniControlsOpacity = useTransform(progress, [0, 0.25], [1, 0])
  const miniControlsVisibility = useTransform(progress, (v) => v > 0.4 ? 'hidden' : 'visible')


  const [isRepeatModalOpen, setIsRepeatModalOpen] = useState(false)
  const [isEqualizerModalOpen, setIsEqualizerModalOpen] = useState(false)
  const [sliderValue, setSliderValue] = useState<number>(playback)

  useEffect(() => {
    setSliderValue(playback)
  }, [playback])

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

  const handlePrevious = useCallback(() => socket?.emit("previous"), [socket])
  const handlePause = useCallback(() => socket?.emit("pause"), [socket])
  const handlePlay = useCallback(() => socket?.emit("play"), [socket])
  const handleNext = useCallback(() => socket?.emit("next"), [socket])
  const handleOpenEqualizer = useCallback(
    () => setIsEqualizerModalOpen(true),
    []
  )
  const handleOpenRepeat = useCallback(() => setIsRepeatModalOpen(true), [])

  return (
    <>
      {currentTrack && (
        <div
          className={cn(
            "absolute inset-0 z-20 overflow-hidden select-none",
            !trackFocus ? "pointer-events-none" : ""
          )}
        >
          <div
            className="absolute inset-0 z-0 cursor-pointer"
            onClick={playerPopup ? onDismissPanel : onTogglePanel}
            id="pona-music-panel-trigger"
          />

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
              transformOrigin: "top left",
              borderRadius: artworkRadius,
              opacity: trackFocus ? 1 : 0,
              pointerEvents: "none",
              zIndex: 25,
              willChange: "transform",
            }}
            className="overflow-hidden shadow-xl transform-gpu"
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
              className="size-full object-cover"
              id="pona-music-artwork"
            />
          </motion.div>

          <motion.div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              x: titleX,
              y: titleY,
              width: dimensions.width - 48,
              scale: titleScale,
              transformOrigin: "left center",
              opacity: trackFocus ? 1 : 0,
              pointerEvents: playerPopup ? "auto" : "none",
              zIndex: 25,
              willChange: "transform",
            }}
            className="overflow-hidden text-ellipsis whitespace-nowrap select-none transform-gpu"
          >
            <h1 className="text-base font-bold text-default-foreground overflow-hidden text-ellipsis whitespace-nowrap">
              {currentTrack.title}
            </h1>
          </motion.div>

          <motion.div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              x: artistX,
              y: artistY,
              width: dimensions.width - 48,
              scale: artistScale,
              transformOrigin: "left center",
              opacity: trackFocus ? 1 : 0,
              pointerEvents: playerPopup ? "auto" : "none",
              zIndex: 25,
              willChange: "transform",
            }}
            className="overflow-hidden text-ellipsis whitespace-nowrap select-none transform-gpu"
          >
            {currentTrack.artist ? (
              combineArtistName(currentTrack.artist, true, router, {
                className:
                  "text-xs text-default-foreground/60 hover:underline cursor-pointer",
              })
            ) : (
              <span className="text-xs text-default-foreground/60">
                {currentTrack.cleanAuthor || currentTrack.author || ""}
              </span>
            )}
          </motion.div>

          <motion.div
            style={{
              position: "absolute",
              right: 8,
              top: 0,
              height: 64,
              opacity: miniControlsOpacity,
              visibility: miniControlsVisibility,
              pointerEvents: playerPopup ? "none" : "auto",
              zIndex: 25,
            }}
            className="flex items-center justify-end px-2 transform-gpu"
            onClick={(e) => e.stopPropagation()}
          >
            <PlayerControls
              socket={socket}
              language={language}
              isPaused={Boolean(ponaCommonState?.pona.paused)}
              playback={playback}
              maxLength={maxLength}
              isMobile
            />
          </motion.div>

          <motion.div
            style={{
              position: "absolute",
              top: fullControlsTop,
              left: 0,
              right: 0,
              opacity: trackFocus ? fullControlsOpacity : 0,
              visibility: fullControlsVisibility,
              y: fullControlsY,
              pointerEvents: playerPopup && trackFocus ? "auto" : "none",
              zIndex: 25,
              willChange: "transform, opacity",
            }}
            className="px-6 flex flex-col gap-4 transform-gpu"
          >
            <div
              className="relative my-2"
              id="mobile-pona-music-player-controller-track-slider"
            >
              <PlayerSeekBar
                sliderValue={sliderValue}
                maxLength={maxLength}
                setSliderValue={setSliderValue}
                onSeek={handleSeek}
                isMobile
                className="w-full mb-2.5 group"
              />
              <div className="mt-1 flex w-full flex-row items-center justify-between gap-2">
                <span className="text-xs text-default-foreground/60">
                  {msToTime(playback)}
                </span>
                <span className="text-xs text-default-foreground/60">
                  {msToTime(ponaCommonState?.pona.length || 0)}
                </span>
              </div>
            </div>

            <div
              className="my-2 flex w-full items-center justify-evenly"
              id="mobile-pona-music-player-controller-track-action"
            >
              <Button
                variant="ghost"
                data-smooth-interaction="true"
                size="icon"
                className="mr-auto rounded-lg"
                onClick={handleOpenEqualizer}
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
            </div>

            <Button
              variant="ghost"
              data-smooth-interaction="true"
              className="mt-4 mx-auto text-default-foreground hover:text-default-foreground hover:bg-default-foreground/10 rounded-xl"
              onClick={() => setTrackFocus(false)}
            >
              {language.data.app.guilds.player.tabs.open_queue}
            </Button>
          </motion.div>
        </div>
      )}

      <Drawer
        open={isRepeatModalOpen}
        onOpenChange={setIsRepeatModalOpen}
        modal
        swipeDirection="down"
      >
        <DrawerContent className="rounded-t-3xl border-t border-border bg-background/95 backdrop-blur-xl">
          <DrawerHeader className="pt-4">
            <DrawerTitle>
              {language.data.app.guilds.player.repeat.title}
            </DrawerTitle>
          </DrawerHeader>
          <div className="flex flex-col gap-2 p-4 pb-6">
            <Button
              variant={
                !ponaCommonState?.pona.repeat.track &&
                  !ponaCommonState?.pona.repeat.queue
                  ? "default"
                  : "outline"
              }
              className="justify-start"
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
                ponaCommonState?.pona.repeat.track ? "default" : "outline"
              }
              className="justify-start"
              onClick={() => {
                socket?.emit("repeat", "track")
                setIsRepeatModalOpen(false)
              }}
            >
              <RepeatOnceIcon className="mr-2 size-4" />
              {language.data.app.guilds.player.repeat.track}
            </Button>
            <Button
              variant={
                ponaCommonState?.pona.repeat.queue ? "default" : "outline"
              }
              className="justify-start"
              onClick={() => {
                socket?.emit("repeat", "queue")
                setIsRepeatModalOpen(false)
              }}
            >
              <RepeatIcon className="mr-2 size-4" />
              {language.data.app.guilds.player.repeat.queue}
            </Button>
          </div>
        </DrawerContent>
      </Drawer>

      <Drawer
        open={isEqualizerModalOpen}
        onOpenChange={setIsEqualizerModalOpen}
        modal
        swipeDirection="down"
      >
        <DrawerContent className="rounded-t-3xl border-t border-border bg-background/95 backdrop-blur-xl">
          <DrawerHeader className="pt-4">
            <DrawerTitle>
              {language.data.app.guilds.player.equalizer.title}
            </DrawerTitle>
          </DrawerHeader>
          <div className="px-4 pb-6 pt-2 text-center text-muted-foreground">
            {language.data.extensions.comingsoon}
          </div>
        </DrawerContent>
      </Drawer>
    </>
  )
}
