"use client"
import React from "react"
import { useAtom, useAtomValue } from "jotai"
import { AnimatePresence, HTMLMotionProps, motion } from "framer-motion"

import { msToTime } from "@/utils/time"

import LyricsDisplay from "@/components/music/lyricsDisplay"
import { Track, UnresolvedTrack } from "@/types/ponaPlayer"
import {
  DotsThreeVertical,
  Heart,
  MonitorPlay,
  PersonSimple,
  PictureInPicture,
  Pause,
  Play,
  Trash,
} from "@phosphor-icons/react/dist/ssr"

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuTrigger,
} from "@/components/ui/context-menu"
import { combineArtistName } from "@/components/music/searchResult/track"
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import Related from "./related"
import { useAppStore } from "@/store/coreStore"
import { playbackAtom, ponaCommonStateAtom, queueAtom } from "@/store/musicAtoms"
import { isFullscreenModeAtom, playerPopupAtom } from "@/store/uiAtoms"
import { useSocket } from "@/contexts/ponaMusicContext"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

function DesktopPonaPlayerPanel() {
  const language = useAppStore((state) => state.language)
  const userSetting = useAppStore((state) => state.userSetting)
  const ponaCommonState = useAtomValue(ponaCommonStateAtom)
  const [ponaTrackQueue, setPonaTrackQueue] = useAtom(queueAtom)
  const [isFullscreenMode, setIsFullscreenMode] = useAtom(isFullscreenModeAtom)
  const playback = useAtomValue(playbackAtom)
  const playerPopup = useAtomValue(playerPopupAtom)
  const { socket } = useSocket()

  const currentTrack = ponaCommonState?.current
  const videoId = currentTrack?.identifier
  const lyricsContainerRef = React.useRef<HTMLDivElement>(null)
  const playerPos = playback
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  function handleDragEnd(event: DragEndEvent) {
    if (!ponaTrackQueue) return
    const { active, over } = event
    if (over && active.id !== over.id) {
      setPonaTrackQueue((value) => {
        if (!value.queue) return value
        const oldIndex = value.queue.findIndex(
          (track) => track.uniqueId === active.id
        )
        const newIndex = value.queue.findIndex(
          (track) => track.uniqueId === over.id
        )
        socket?.emit("move", oldIndex, newIndex)
        return {
          queue: arrayMove(value.queue, oldIndex, newIndex),
          updating: true,
        }
      })
    }
  }

  return (
    <>
      <AnimatePresence>
        {currentTrack && playerPopup && (
          <motion.div
            className={
              (userSetting.dev_pona_player_style === "modern"
                ? "absolute bottom-[6.1rem] left-2 z-40 h-[calc(100vh_-_6.6rem)] w-[calc(100%_-_1rem)] overflow-hidden rounded-3xl p-8 transition-all duration-250 ease-out max-lg:bottom-[5.3rem] max-lg:h-[calc(100vh_-_5.8rem)] max-md:rounded-lg"
                : "absolute bottom-[6.4rem] left-2 z-40 h-[calc(100vh_-_6.8rem)] w-[calc(100%_-_1rem)] overflow-hidden rounded-3xl p-8 transition-all duration-250 ease-out max-lg:bottom-[5.3rem] max-lg:h-[calc(100vh_-_6rem)] max-md:rounded-lg") +
              (userSetting.transparency
                ? " to-playground-background/100"
                : " [html.dark_&]:!from-[hsl(var(--pona-app-music-accent-color-400))] [html.dark_&]:!to-[hsl(var(--pona-app-music-accent-color-800))] [html.light_&]:!from-[hsl(var(--pona-app-music-accent-color-200))] [html.light_&]:!to-[hsl(var(--pona-app-music-accent-color-50))]")
            }
            id="pona=player-panel"
            transition={{
              duration: 0.12,
            }}
            initial={{ opacity: 0, pointerEvents: "none", translateY: 32 }}
            animate={{ opacity: 1, pointerEvents: "auto", translateY: 0 }}
            exit={{ opacity: 0, pointerEvents: "none", translateY: 64 }}
          >
            {userSetting.transparency && (
              <img
                src={
                  `/api/proxy/image?r=` +
                  encodeURIComponent(
                    currentTrack?.proxyArtworkUrl ||
                      "/static/Ponlponl123 (1459).png"
                  ) +
                  "&s=512&blur=16&saturation=96&contrast=12"
                }
                alt={currentTrack ? currentTrack?.title : "Backdrop"}
                className="absolute top-0 left-0 -z-10 h-full w-full scale-[2] object-cover [html.dark_&]:brightness-50 [html.dark_&]:saturate-150 [html.light_&]:brightness-200"
              />
            )}
            <div
              className={
                "absolute top-0 left-0 -z-10 h-full w-full " +
                (userSetting.transparency
                  ? " bg-gradient-to-t [html.dark_&]:!from-[hsl(var(--pona-app-music-accent-color-900))] [html.light_&]:!from-[hsl(var(--pona-app-music-accent-color-50))]"
                  : "[html.dark_&]:!bg-[hsl(var(--pona-app-music-accent-color-900))] [html.light_&]:!bg-[hsl(var(--pona-app-music-accent-color-50))]")
              }
            ></div>
            <div className="flex h-full w-full items-center justify-between gap-12 pt-16">
              <motion.div
                layoutId="pona-music-panel-artwork"
                className="m-auto flex flex-col items-center gap-6 max-lg:[body:not(.sidebar-collapsed)_&]:hidden"
              >
                <div className="-mt-12 flex flex-wrap items-center justify-center gap-4 max-xl:flex-col">
                  <Button
                    variant="ghost"
                    className="w-fit rounded-full"
                    disabled
                    onClick={() => {
                      setIsFullscreenMode((value) => !value)
                    }}
                  >
                    {!isFullscreenMode ? (
                      <>
                        <MonitorPlay className="mr-2" />
                        {language.data.app.guilds.player.full_screen_mode.enter}
                      </>
                    ) : (
                      <Spinner size="sm" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-fit rounded-full"
                    disabled
                  >
                    <PictureInPicture className="mr-2" />
                    {language.data.app.guilds.player.picinpic_mode.enter}
                  </Button>
                </div>
                <div className="group relative flex aspect-square w-[56vh] hover:scale-[1.032] active:scale-[1.016] max-2xl:w-[42vh] max-xl:w-[28vh] max-lg:w-[12vh] max-xl:[body:not(.sidebar-collapsed)_&]:w-[20vh]">
                  <img
                    src={
                      currentTrack
                        ? currentTrack?.proxyHighResArtworkUrl ||
                          currentTrack?.proxyArtworkUrl
                        : "/static/Ponlponl123 (1459).png"
                    }
                    alt={currentTrack ? currentTrack?.title : "Artwork"}
                    className={
                      "h-full w-full rounded-2xl object-cover select-none shadow-lg"
                    }
                    loading="lazy"
                    id="pona-music-artwork"
                  />
                  <div className="pointer-events-none absolute top-0 left-0 z-14 h-full w-full rounded-2xl bg-gradient-to-t to-transparent opacity-0 group-hover:opacity-100 [html.dark_&]:from-black/40 [html.light_&]:from-white/40"></div>
                </div>
              </motion.div>
              <div
                className="h-full max-w-3xl min-w-0 flex-1"
                id="pona-music-queue"
              >
                <Tabs defaultValue="next" className="flex flex-col h-full w-full">
                  <TabsList className="w-full justify-start rounded-full bg-transparent border-b">
                    <TabsTrigger value="next" className="text-lg">
                      {language.data.app.guilds.player.tabs.next}
                    </TabsTrigger>
                    <TabsTrigger
                      value="lyrics"
                      className="text-lg flex items-center gap-2"
                      disabled={
                        !(
                          currentTrack?.lyrics &&
                          currentTrack?.lyrics?.lyrics?.length > 0
                        )
                      }
                    >
                      {language.data.app.guilds.player.tabs.lyrics}
                      <Badge variant="secondary">
                        {language.data.extensions.beta}
                      </Badge>
                    </TabsTrigger>
                    <TabsTrigger value="related" className="text-lg">
                      {language.data.app.guilds.player.tabs.related}
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="next" className="flex-1 overflow-y-auto pr-2 pb-4">
                    <div className="flex flex-col gap-2 px-3 py-1">
                      {ponaTrackQueue &&
                        ponaTrackQueue.queue &&
                        ponaTrackQueue.queue[0] && (
                          <TrackQueue
                            active={
                              currentTrack?.uniqueId ===
                              ponaTrackQueue.queue[0].uniqueId
                            }
                            index={0}
                            track={ponaTrackQueue.queue[0]}
                          />
                        )}
                      {ponaTrackQueue && ponaTrackQueue.queue && (
                        <DndContext
                          sensors={sensors}
                          collisionDetection={closestCenter}
                          onDragEnd={handleDragEnd}
                          autoScroll
                        >
                          <SortableContext
                            items={ponaTrackQueue.queue
                              .filter((track) => track.uniqueId !== undefined)
                              .map((track) => track.uniqueId as string)}
                            strategy={verticalListSortingStrategy}
                          >
                            {ponaTrackQueue.queue
                              .slice(1)
                              .map((track, index) => {
                                const isThisTrack =
                                  currentTrack?.uniqueId === track.uniqueId
                                return (
                                  <DraggableTrack
                                    isLoading={ponaTrackQueue.updating}
                                    active={isThisTrack}
                                    index={index + 1}
                                    key={track.uniqueId}
                                    track={track}
                                  />
                                )
                              })}
                          </SortableContext>
                        </DndContext>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="lyrics" className="flex-1 overflow-y-auto pt-4 pr-2 pb-12" ref={lyricsContainerRef}>
                    {lyricsContainerRef.current &&
                      (currentTrack?.lyrics?.isTimestamp ? (
                        <LyricsDisplay
                          playerPosition={playerPos}
                          currentTrack={currentTrack as Track}
                          lyricsProvider={lyricsContainerRef.current}
                        />
                      ) : (
                        currentTrack?.lyrics?.lyrics &&
                        currentTrack?.lyrics?.lyrics?.length > 0 &&
                        (currentTrack?.lyrics?.lyrics as string[]).map(
                          (lyric, index) => (
                            <div
                              key={index}
                              className="flex items-center gap-2"
                            >
                              <span className="my-4 text-2xl text-[hsl(var(--pona-app-music-accent-color-500))] [html.dark_&]:brightness-125">
                                {lyric}
                              </span>
                            </div>
                          )
                        )
                      ))}
                  </TabsContent>

                  <TabsContent value="related" className="flex-1 overflow-y-auto pr-2">
                    <Related videoId={videoId} />
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export function DraggableTrack({
  index,
  track,
  active,
  isLoading,
}: {
  index: number
  track: Track | UnresolvedTrack
  active: boolean
  isLoading?: boolean
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: track.uniqueId as string })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }
  return (
    <TrackQueue
      ref={setNodeRef}
      active={active}
      index={index}
      track={track}
      isLoading={isLoading}
      params={{
        layout: true,
        initial: false,
        whileTap: {
          outline: "2px hsl(var(--pona-app-music-accent-color-500)) solid",
          userSelect: "none",
          zIndex: 24,
        },
        style,
        ...attributes,
        ...listeners,
      }}
      key={index}
    />
  )
}

export function TrackQueueContextFunction({
  track,
}: {
  track: Track | UnresolvedTrack
}) {
  const router = useRouter()
  const language = useAppStore((state) => state.language)
  const ponaCommonState = useAtomValue(ponaCommonStateAtom)
  const { socket } = useSocket()
  return (
    <>
      <ContextMenuLabel>{track.title}</ContextMenuLabel>
      <ContextMenuItem disabled>
        <div className="flex items-center gap-2 w-full text-muted-foreground">
          <Heart weight="bold" />{" "}
          {language.data.app.guilds.player.context_menu.add_to_favorite}
        </div>
      </ContextMenuItem>
      {ponaCommonState?.current?.uniqueId !== track.uniqueId && (
        <ContextMenuItem
          onClick={() => {
            toast.promise(
              new Promise<void>((resolve, reject) => {
                socket?.emit("rm", track.uniqueId, (error: unknown) => {
                  if (error && (error as { status?: string }).status !== "ok") {
                    reject(error)
                  } else {
                    resolve()
                  }
                })
              }),
              {
                loading: language.data.app.guilds.player.toast.rm_track.loading
                  .replace("[track_name]", track.title)
                  .replace("[artist]", String(track.author)),
                success: language.data.app.guilds.player.toast.rm_track.success
                  .replace("[track_name]", track.title)
                  .replace("[artist]", String(track.author)),
                error: language.data.app.guilds.player.toast.rm_track.error,
                position: "top-center",
              }
            )
          }}
        >
          <div className="flex items-center gap-2 w-full">
            <Trash weight="bold" />{" "}
            {language.data.app.guilds.player.context_menu.rm_from_queue}
          </div>
        </ContextMenuItem>
      )}
      <ContextMenuItem
        disabled={!track?.artist}
        onClick={() => {
          if (track?.artist && track?.artist[0])
            router.push("player/c?c=" + track?.artist[0].id)
        }}
      >
        <div className="flex items-center gap-2 w-full">
          <PersonSimple weight="bold" />{" "}
          {language.data.app.guilds.player.context_menu.goto_artist}
        </div>
      </ContextMenuItem>
    </>
  )
}

export function TrackQueue({
  index,
  track,
  active,
  isLoading,
  ref,
  params,
}: {
  index: number
  track: Track | UnresolvedTrack
  active: boolean
  isLoading?: boolean
  ref?: React.LegacyRef<HTMLDivElement>
  params?: HTMLMotionProps<"div">
}) {
  const router = useRouter()
  const ponaCommonState = useAtomValue(ponaCommonStateAtom)
  const { socket } = useSocket()
  const paused = ponaCommonState?.pona?.paused || false
  const language = useAppStore((state) => state.language)

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <motion.div
          ref={ref}
          className={`group flex w-full items-center gap-4 rounded-3xl px-2.5 py-2 ${
            active
              ? "active [.dark_&]:bg-[hsl(var(--pona-app-music-accent-color-800))] [.light_&]:bg-[hsl(var(--pona-app-music-accent-color-100))]"
              : ""
          } ${isLoading ? "pointer-events-none" : ""}`}
          key={index}
          {...params}
        >
          <div className="flex-[0_1_auto] relative h-11 w-11 overflow-hidden rounded-2xl select-none">
            {isLoading ? (
              <Skeleton className="h-11 w-11 rounded-lg" />
            ) : (
              <img
                src={track?.proxyArtworkUrl}
                alt={track.title}
                height={44}
                width={44}
                className={
                  "z-0 rounded-lg object-cover " +
                  (!paused && active
                    ? "brightness-50 saturate-0"
                    : "group-hover:brightness-50 group-hover:saturate-0")
                }
              />
            )}
            <div
              className={
                "absolute top-0 left-0 z-[5] h-full w-full bg-background/35 " +
                (!paused && active
                  ? "opacity-100"
                  : "opacity-0 group-hover:opacity-100")
              }
            ></div>
            {!paused && active ? (
              <Button
                className="absolute top-0 left-0 z-10 h-full w-full opacity-100 p-0"
                variant="ghost"
                size="icon"
                onClick={() => {
                  socket?.emit("pause")
                }}
              >
                <Pause className="text-white" weight="fill" />
              </Button>
            ) : (
              <Button
                className="absolute top-0 left-0 z-10 h-full w-full opacity-0 group-hover:opacity-100 p-0"
                variant="ghost"
                size="icon"
                onClick={() => {
                  if (active) socket?.emit("play")
                  else if (index - 1 === 0) socket?.emit("next")
                  else socket?.emit("skipto", index - 1)
                }}
              >
                <Play className="text-white" weight="fill" />
              </Button>
            )}
          </div>
          <div
            className={`w-0 min-w-0 flex-1 ${isLoading ? "flex flex-col gap-1" : ""}`}
          >
            {isLoading ? (
              <>
                <Skeleton className="h-5 w-3/4 rounded-full" />
                <Skeleton className="h-3 w-2/5 rounded-full" />
              </>
            ) : (
              <>
                <h1 className="max-w-full truncate [div.active_&]:text-[hsl(var(--pona-app-music-accent-color-500))]">
                  {track.title}
                </h1>
                {track.artist ? (
                  <div className="max-w-full text-xs text-foreground/40 [div.active_&]:text-[hsl(var(--pona-app-music-accent-color-500)/0.4)] truncate">
                    {combineArtistName(track.artist, true, router, {
                      className:
                        "text-foreground/40 [div.active_&]:text-[hsl(var(--pona-app-music-accent-color-500)/0.4)] text-sm",
                    })}{" "}
                    <span className="text-xs text-foreground/40 [div.active_&]:text-[hsl(var(--pona-app-music-accent-color-500)/0.4)]">
                      (
                      {track.requester?.displayName ||
                        "@" + track.requester?.username}
                      )
                    </span>
                  </div>
                ) : (
                  <span className="max-w-full text-xs text-foreground/40 [div.active_&]:text-[hsl(var(--pona-app-music-accent-color-500)/0.4)] truncate">
                    {track.author} (
                    {track.requester?.displayName ||
                      "@" + track.requester?.username}
                    )
                  </span>
                )}
              </>
            )}
          </div>
          <div
            className={`flex-[0_1_auto] relative ml-auto flex h-12 w-12 items-center justify-center ${isLoading ? "pointer-events-none opacity-0" : ""}`}
          >
            <span className="pointer-events-none opacity-100 group-hover:opacity-0 [div.active_&]:text-[hsl(var(--pona-app-music-accent-color-500)/0.64)] text-xs">
              {msToTime(track.duration || 0)}
            </span>
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Button
                  className="absolute top-0 left-0 z-10 h-full w-full opacity-0 group-hover:opacity-100 p-0"
                  variant="ghost"
                  size="icon"
                >
                  <DotsThreeVertical weight="bold" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64">
                <DropdownMenuLabel className="truncate">
                  {track.title}
                </DropdownMenuLabel>
                <DropdownMenuItem disabled>
                  <div className="flex items-center gap-2">
                    <Heart weight="bold" />{" "}
                    {
                      language.data.app.guilds.player.context_menu
                        .add_to_favorite
                    }
                  </div>
                </DropdownMenuItem>
                {!active ? (
                  <DropdownMenuItem
                    onClick={() => {
                      toast.promise(
                        new Promise<void>((resolve, reject) => {
                          socket?.emit(
                            "rm",
                            track.uniqueId,
                            (error: unknown) => {
                              if (
                                error &&
                                (error as { status?: string }).status !==
                                  "ok"
                              ) {
                                reject(error)
                              } else {
                                resolve()
                              }
                            }
                          )
                        }),
                        {
                          loading:
                            language.data.app.guilds.player.toast.rm_track.loading
                              .replace("[track_name]", track.title)
                              .replace("[artist]", String(track.author)),
                          success:
                            language.data.app.guilds.player.toast.rm_track.success
                              .replace("[track_name]", track.title)
                              .replace("[artist]", String(track.author)),
                          error:
                            language.data.app.guilds.player.toast.rm_track
                              .error,
                          position: "top-center",
                        }
                      )
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <Trash weight="bold" />{" "}
                      {
                        language.data.app.guilds.player.context_menu
                          .rm_from_queue
                      }
                    </div>
                  </DropdownMenuItem>
                ) : null}
                <DropdownMenuItem
                  disabled={!track.artist}
                  onClick={() => {
                    if (track?.artist && track?.artist[0])
                      router.push("player/c?c=" + track?.artist[0].id)
                  }}
                >
                  <div className="flex items-center gap-2">
                    <PersonSimple weight="bold" />{" "}
                    {language.data.app.guilds.player.context_menu.goto_artist}
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </motion.div>
      </ContextMenuTrigger>
      <ContextMenuContent className="z-50 w-64">
        <TrackQueueContextFunction track={track} />
      </ContextMenuContent>
    </ContextMenu>
  )
}

export default DesktopPonaPlayerPanel
