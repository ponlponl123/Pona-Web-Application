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

export async function applyTrackAccentColor(
  track: Track | UnresolvedTrack | null | undefined
): Promise<void> {
  if (typeof window === "undefined") return
  if (!track?.identifier) {
    document.body.removeAttribute("playing")
    return
  }

  document.body.setAttribute("playing", track.identifier)

  const candidateUrls: string[] = [
    "/api/proxy/watch?v=" + track.identifier + "&s=sm",
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

  const colorPalette = generatePalette(accentColor)
  for (const [key, [h, s, l]] of Object.entries(colorPalette)) {
    document.documentElement.style.setProperty(
      `--pona-app-music-accent-color-${key}`,
      `${h} ${s}% ${l}%`
    )
  }
}

export async function makeTrack(
  track: Track | UnresolvedTrack
): Promise<Track | UnresolvedTrack> {
  if (!track?.identifier) return track

  await applyTrackAccentColor(track)
  track = proxyArtwork(track)

  return track
}
