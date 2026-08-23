import { useEffect, useRef } from "react"

export function useWakeLock(enabled: boolean) {
  const wakeLockRef = useRef<WakeLockSentinel | null>(null)

  useEffect(() => {
    if (!enabled || typeof window === "undefined" || !("wakeLock" in navigator)) {
      return
    }

    const requestLock = async () => {
      try {
        if (document.visibilityState === "visible" && !wakeLockRef.current) {
          wakeLockRef.current = await navigator.wakeLock.request("screen")
        }
      } catch {
        // Permission denied or battery saver active
      }
    }

    requestLock()

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        requestLock()
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange)
      if (wakeLockRef.current) {
        wakeLockRef.current.release().catch(() => {})
        wakeLockRef.current = null
      }
    }
  }, [enabled])
}
