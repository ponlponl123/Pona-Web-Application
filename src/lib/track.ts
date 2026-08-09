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

export async function makeTrack(
  track: Track | UnresolvedTrack
): Promise<Track | UnresolvedTrack> {
  if (!track?.identifier) return track

  try {
    const accentColor = await getAccentHEXColorFromUrl(
      "/api/proxy/watch?v=" + track.identifier + "&s=sm"
    )
    const colorPalette = generatePalette(accentColor)
    for (const [key, [h, s, l]] of Object.entries(colorPalette)) {
      document.documentElement.style.setProperty(
        `--pona-app-music-accent-color-${key}`,
        `${h} ${s}% ${l}%`
      )
    }
  } catch {}

  document.body.setAttribute("playing", track.identifier)
  track = proxyArtwork(track)

  return track
}
