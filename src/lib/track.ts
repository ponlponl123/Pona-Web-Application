import { generatePalette, getAccentHEXColorFromUrl } from "./color"
import { Track, UnresolvedTrack } from "@/types/ponaPlayer"

export function proxyArtwork(
  track: Track | UnresolvedTrack
): Track | UnresolvedTrack {
  if (!track?.identifier) return track

  track.proxyArtworkUrl = "/api/proxy/watch?v=" + track.identifier + "&s=md"
  track.proxyHighResArtworkUrl =
    "/api/proxy/watch?v=" + track.identifier + "&s=lg"
  track.proxyThumbnail = "/api/proxy/watch?v=" + track.identifier + "&s=sm"

  return track
}

let lastAppliedTrackId: string | null = null
let pendingTrackId: string | null = null
const trackPaletteCache = new Map<string, Record<string, string>>()

export async function applyTrackAccentColor(
  track: Track | UnresolvedTrack | null | undefined
): Promise<void> {
  if (typeof window === "undefined") return
  if (!track?.identifier) {
    if (lastAppliedTrackId !== null) {
      lastAppliedTrackId = null
      pendingTrackId = null
      document.body.removeAttribute("playing")
    }
    return
  }

  const trackId = track.identifier
  if (lastAppliedTrackId === trackId || pendingTrackId === trackId) {
    return
  }

  pendingTrackId = trackId
  document.body.setAttribute("playing", trackId)

  let cssVars = trackPaletteCache.get(trackId)
  if (!cssVars) {
    const candidateUrls: string[] = [
      "/api/proxy/watch?v=" + trackId + "&s=sm",
    ]
    if (track.thumbnail) candidateUrls.push(track.thumbnail)
    if (track.artworkUrl) candidateUrls.push(track.artworkUrl)

    let accentColor = "#6366f1"
    for (const url of candidateUrls) {
      try {
        const color = await getAccentHEXColorFromUrl(url)
        if (color && color !== "#6366f1") {
          accentColor = color
          break
        }
      } catch {}
    }

    if (pendingTrackId !== trackId) return

    const colorPalette = generatePalette(accentColor)
    cssVars = {}
    for (const [key, [h, s, l]] of Object.entries(colorPalette)) {
      cssVars[`--pona-app-music-accent-color-${key}`] = `${h} ${s}% ${l}%`
    }
    trackPaletteCache.set(trackId, cssVars)
  }

  lastAppliedTrackId = trackId
  pendingTrackId = null

  const docStyle = document.documentElement.style
  for (const [prop, val] of Object.entries(cssVars)) {
    docStyle.setProperty(prop, val)
  }
}

export function makeTrack(
  track: Track | UnresolvedTrack
): Track | UnresolvedTrack {
  if (!track?.identifier) return track
  return proxyArtwork(track)
}
