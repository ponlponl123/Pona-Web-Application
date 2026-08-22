"use client"
import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
  useMemo,
  useDeferredValue,
} from "react"
import { AnimatePresence, motion } from "motion/react"
import { ArrowsDownUpIcon } from "@phosphor-icons/react/dist/ssr"
import { Lyric, TimestampLyrics } from "@/types/ponaPlayer"
import { useAppStore } from "@/store/coreStore"
import { useSocket } from "@/contexts/ponaMusicContext"
import { useAtomValue } from "jotai"
import { playbackAtom } from "@/store/musicAtoms"
import { Button } from "@/components/ui/button"
import { clsx } from "clsx"
import { cn } from "@/lib/utils"

interface Track {
  lyrics?: Lyric
}

interface LyricsDisplayProps {
  currentTrack?: Track
  playerPosition?: number
  lyricsProvider?: HTMLElement | null
  isPlaying?: boolean
  playbackLatencyMs?: number
}

// Memoized lyric item component for performance
const LyricItem = React.memo(
  ({
    lyrics,
    index,
    onSeek,
    className,
    isActive,
    durationMs,
  }: {
    lyrics: TimestampLyrics
    index: number
    onSeek: (seconds: number) => void
    className: string
    isActive: boolean
    durationMs: number
  }) => {
    const characters = useMemo(() => Array.from(lyrics.lyrics), [lyrics.lyrics])
    const stagger = ((durationMs / 1000) * 0.7) / Math.max(characters.length, 1)
    const characterDuration = Math.min(
      0.45,
      Math.max(0.16, (durationMs / 1000) * 0.35)
    )

    return (
      <div
        key={index}
        id={`lyrics-index-${index}`}
        onClick={() => onSeek(lyrics.seconds)}
        aria-current={isActive ? "true" : undefined}
        className={cn(
          className,
          "group relative overflow-visible rounded-lg px-3 py-1.5 animation-disabled apply-long-soft-transition duration-1000",
          isActive && "md:scale-[1.015]"
        )}
        style={{ contentVisibility: "auto" }}
      >
        {isActive && (
          <span
            key={`lyrics-highlight-${index}`}
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 max-w-full px-3 py-1.5 text-start whitespace-pre-wrap wrap-break-word tracking-[1.019] animation-disabled apply-long-soft-transition duration-1000"
          >
            {characters.map((character, characterIndex) => (
              <motion.span
                key={`${character}-${characterIndex}`}
                initial={{
                  opacity: 0.15,
                  filter: "blur(0.18em)",
                  textShadow: "0 0 0 transparent",
                }}
                animate={{
                  opacity: 1,
                  filter: "blur(0)",
                  textShadow:
                    "0 0 0.1rem currentColor, 0 0 0.48rem currentColor",
                }}
                transition={{
                  duration: characterDuration,
                  delay: characterIndex * stagger,
                }}
                className="will-change-[opacity,filter,text-shadow]"
              >
                {character}
              </motion.span>
            ))}
          </span>
        )}
        <span className={cn("tracking-[1.019] animation-disabled apply-long-soft-transition duration-1000", isActive ? "opacity-35" : "opacity-100")}>
          {lyrics.lyrics}
        </span>
      </div>
    )
  }
)

LyricItem.displayName = "LyricItem"

const LyricsDisplay: React.FC<LyricsDisplayProps> = ({
  currentTrack,
  playerPosition,
  lyricsProvider,
  isPlaying = true,
  playbackLatencyMs = 500,
}) => {
  const livePlayback = useAtomValue(playbackAtom)
  const effectivePosition =
    playerPosition !== undefined ? playerPosition : livePlayback

  const [activeIndex, setActiveIndex] = useState<number>(0)
  const [autoScrollEnabled, setAutoScrollEnabled] = useState<boolean>(true)
  const [accuratePosition, setAccuratePosition] =
    useState<number>(effectivePosition)
  const deferredActiveIndex = useDeferredValue(activeIndex)

  const isProgrammaticScrollRef = useRef<boolean>(false)
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lyricsContainerRef = useRef<HTMLElement | null>(lyricsProvider || null)
  const millisecondCounterRef = useRef<NodeJS.Timeout | null>(null)
  const lastServerPositionRef = useRef<number>(effectivePosition)
  const lastCounterTimeRef = useRef<number | null>(null)
  const activeLyricElementRef = useRef<HTMLElement | null>(null)
  const lastEmittedIndexRef = useRef<number>(-1)
  const HYSTERESIS_MS = 100 // 100ms buffer to prevent bouncing at boundaries

  const language = useAppStore((state) => state.language)
  const { socket } = useSocket()

  // Memoize language strings
  const noLyricsText = useMemo(
    () =>
      language.data.app.guilds.player.tabs.no_lyrics_available ||
      "No lyrics available",
    [language.data.app.guilds.player.tabs.no_lyrics_available]
  )

  const syncLyricsText = useMemo(
    () => language.data.app.guilds.player.tabs.sync_lyrics || "Sync lyrics",
    [language.data.app.guilds.player.tabs.sync_lyrics]
  )

  // Memoize lyrics array
  const lyricsArray = useMemo(
    () => (currentTrack?.lyrics?.lyrics as TimestampLyrics[]) || [],
    [currentTrack?.lyrics?.lyrics]
  )

  // Binary search for efficient lyric index lookup - O(log n) instead of O(n)
  const findActiveLyricIndex = useCallback(
    (position: number): number => {
      if (lyricsArray.length === 0) return -1

      let left = 0
      let right = lyricsArray.length - 1

      while (left <= right) {
        const mid = Math.floor((left + right) / 2)
        const currentSecMs = lyricsArray[mid].seconds * 1000 + playbackLatencyMs
        const nextSecMs =
          lyricsArray[mid + 1]?.seconds * 1000 + playbackLatencyMs

        // Apply hysteresis: if we're at the currently active line, require moving significantly past the next line to switch
        if (
          position >= currentSecMs &&
          (!nextSecMs ||
            position <
            nextSecMs +
            (mid === lastEmittedIndexRef.current ? HYSTERESIS_MS : 0))
        ) {
          return mid
        }

        if (position < currentSecMs) {
          right = mid - 1
        } else {
          left = mid + 1
        }
      }

      return -1
    },
    [lyricsArray, playbackLatencyMs]
  )

  useEffect(() => {
    lyricsContainerRef.current = lyricsProvider || null
  }, [lyricsProvider])

  // Millisecond counter for accurate position tracking between server updates
  useEffect(() => {
    const now = Date.now()

    lastServerPositionRef.current = effectivePosition
    // This sync intentionally updates the live clock state from the prop-driven playback position.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAccuratePosition(effectivePosition)
    lastCounterTimeRef.current = now

    // Destroy existing counter
    if (millisecondCounterRef.current) {
      clearInterval(millisecondCounterRef.current)
      millisecondCounterRef.current = null
    }

    // Start counter only if playing
    if (!isPlaying) return

    millisecondCounterRef.current = setInterval(() => {
      const previousTime = lastCounterTimeRef.current ?? Date.now()
      const now = Date.now()
      const elapsedMs = now - previousTime

      lastCounterTimeRef.current = now
      const newPosition = lastServerPositionRef.current + elapsedMs
      lastServerPositionRef.current = newPosition
      setAccuratePosition(newPosition)
    }, 100) // Update every 100ms for smooth tracking

    return () => {
      if (millisecondCounterRef.current) {
        clearInterval(millisecondCounterRef.current)
        millisecondCounterRef.current = null
      }
    }
  }, [effectivePosition, isPlaying, playbackLatencyMs])

  // Listen to manual user scroll/touch/wheel events to pause auto-scrolling
  useEffect(() => {
    const container = lyricsContainerRef.current
    if (!container) return

    const handleUserInteraction = (event: Event) => {
      if (event.type === "scroll" && isProgrammaticScrollRef.current) return

      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
        scrollTimeoutRef.current = null
      }
      isProgrammaticScrollRef.current = false
      setAutoScrollEnabled(false)
    }

    const handleScrollEnd = () => {
      if (isProgrammaticScrollRef.current) {
        isProgrammaticScrollRef.current = false
      }
    }

    // Use passive listeners for better scroll performance
    container.addEventListener("wheel", handleUserInteraction, {
      passive: true,
    })
    container.addEventListener("touchmove", handleUserInteraction, {
      passive: true,
    })
    container.addEventListener("scroll", handleUserInteraction, {
      passive: true,
    })
    container.addEventListener("scrollend", handleScrollEnd)

    return () => {
      container.removeEventListener("wheel", handleUserInteraction)
      container.removeEventListener("touchmove", handleUserInteraction)
      container.removeEventListener("scroll", handleUserInteraction)
      container.removeEventListener("scrollend", handleScrollEnd)
    }
  }, [])

  // Update current active lyric line index based on accurate playback position
  useEffect(() => {
    if (lyricsArray.length === 0) return

    const newIndex = findActiveLyricIndex(accuratePosition)

    // Only update if there's a genuine change (not just noise)
    if (newIndex !== -1 && newIndex !== activeIndex) {
      // The lyric index is derived from the live playback clock, so this sync is intentional.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setActiveIndex(newIndex)
      lastEmittedIndexRef.current = newIndex
    }
  }, [accuratePosition, lyricsArray.length, activeIndex, findActiveLyricIndex])

  // Smooth scroll container to active lyric line
  const scrollToActiveLine = useCallback(
    (smooth = true) => {
      const container = lyricsContainerRef.current
      if (!container) return

      // Use cached element reference or get new one
      if (
        !activeLyricElementRef.current ||
        activeLyricElementRef.current.id !==
        `lyrics-index-${deferredActiveIndex}`
      ) {
        activeLyricElementRef.current = document.getElementById(
          `lyrics-index-${deferredActiveIndex}`
        )
      }

      const activeLyric = activeLyricElementRef.current
      if (activeLyric) {
        isProgrammaticScrollRef.current = true
        if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current)

        const scrollTop =
          activeLyric.offsetTop -
          container.clientHeight / 2 +
          activeLyric.clientHeight / 2

        container.scrollTo({
          top: scrollTop,
          behavior: smooth ? "smooth" : "auto",
        })

        scrollTimeoutRef.current = setTimeout(() => {
          isProgrammaticScrollRef.current = false
          scrollTimeoutRef.current = null
        }, smooth ? 1500 : 100)
      }
    },
    [deferredActiveIndex]
  )

  useEffect(() => {
    if (autoScrollEnabled) {
      scrollToActiveLine(true)
    }
  }, [activeIndex, autoScrollEnabled, scrollToActiveLine])

  const handleResumeAutoScroll = useCallback(() => {
    setAutoScrollEnabled(true)
    scrollToActiveLine(true)
  }, [scrollToActiveLine])

  const handleLineClick = useCallback(
    (seconds: number) => {
      socket?.emit("seek", Math.floor(seconds * 1000))
      setAutoScrollEnabled(true)
    },
    [socket]
  )

  const lyricsProvidedText = (
    language.data.app.guilds.player.tabs.lyrics_provided_by ||
    "Lyrics provided by [provider]"
  ).replace("[provider]", currentTrack?.lyrics?.source || "")

  if (
    !currentTrack?.lyrics ||
    !currentTrack?.lyrics.isTimestamp ||
    currentTrack.lyrics.error ||
    !lyricsArray.length
  ) {
    return (
      <div className="py-8 text-center">
        <p className="text-[hsl(var(--pona-app-music-accent-color-800))] dark:text-[hsl(var(--pona-app-music-accent-color-500))]">
          {noLyricsText}
        </p>
      </div>
    )
  }

  const getLyricsClassName = (index: number): string => {
    const baseClasses =
      "w-full h-max flex items-center text-start px-2.5 my-8 cursor-pointer disable-default-transition transition-all ease-out duration-400 tracking-wide select-none hover:opacity-90"

    const isActive = index === deferredActiveIndex
    const isNearActive =
      index === deferredActiveIndex + 1 || index === deferredActiveIndex - 1
    const isPast = index < deferredActiveIndex

    const conditions = {
      "md:text-3xl text-default-foreground md:text-[hsl(var(--pona-app-music-accent-color-800))]! md:dark:text-[hsl(var(--pona-app-music-accent-color-500))]! font-bold [html.dark_&]:brightness-150 [html.light_&]:brightness-50":
        isActive,
      "md:text-xl text-default-foreground/60 md:text-[hsl(var(--pona-app-music-accent-color-800))]! md:dark:text-[hsl(var(--pona-app-music-accent-color-800))]! md:dark:text-[hsl(var(--pona-app-music-accent-color-500)/0.4)]! [html.light_&]:brightness-90 [html.dark_&]:brightness-125":
        isNearActive,
      "text-base text-default-foreground/30 md:text-[hsl(var(--pona-app-music-accent-color-800))]! md:dark:text-[hsl(var(--pona-app-music-accent-color-500)/0.48)]!":
        isPast,
      "text-base text-default-foreground/10 md:text-[hsl(var(--pona-app-music-accent-color-800))]! md:dark:text-[hsl(var(--pona-app-music-accent-color-500)/0.16)]!":
        !isActive && !isNearActive && !isPast,
    }

    return clsx(baseClasses, conditions)
  }
  return (
    <div className="relative w-full max-lg:p-4 max-lg:pt-[12vh] max-lg:pb-[32vh] pb-[42vh] text-center">
      {lyricsArray.map((lyrics, index) => (
        <LyricItem
          key={index}
          lyrics={lyrics}
          index={index}
          isActive={index === deferredActiveIndex}
          durationMs={Math.max(
            250,
            ((lyricsArray[index + 1]?.seconds ?? lyrics.seconds + 2) -
              lyrics.seconds) *
            1000
          )}
          onSeek={handleLineClick}
          className={getLyricsClassName(index)}
        />
      ))}

      {currentTrack?.lyrics?.source && (
        <div className="mt-12 mb-4 text-center text-xs font-semibold tracking-wider text-[hsl(var(--pona-app-music-accent-color-500)/0.5)] uppercase">
          {lyricsProvidedText}
        </div>
      )}

      <AnimatePresence>
        {!autoScrollEnabled && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="pointer-events-auto sticky bottom-6 left-1/2 mx-auto w-max -translate-x-1/2"
          >
            <Button
              onClick={handleResumeAutoScroll}
              size="sm"
              data-smooth-interaction="true"
              className="flex items-center gap-2 rounded-full border-2 max-md:bg-default-foreground max-md:text-default md:border-[hsl(var(--pona-app-music-accent-color-500)/0.24)] md:bg-[hsl(var(--pona-app-music-accent-color-200)/0.64)] p-4 md:text-[hsl(var(--pona-app-music-accent-color-800))] shadow-xl md:dark:bg-[hsl(var(--pona-app-music-accent-color-800)/0.64)] md:dark:text-[hsl(var(--pona-app-music-accent-color-500))]"
            >
              <ArrowsDownUpIcon className="size-4 animate-pulse" />
              <span className="text-sm font-bold tracking-wide">
                {syncLyricsText}
              </span>
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default LyricsDisplay
