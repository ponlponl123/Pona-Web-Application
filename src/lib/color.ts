export type ColorPalette = Record<number, [number, number, number]>

function hexToRgb(hex: string): [number, number, number] {
  if (!hex || typeof hex !== "string") return [99, 102, 241]
  let clean = hex.replace(/^#/, "").trim()
  if (clean.length === 3) {
    clean = clean.split("").map((c) => c + c).join("")
  }
  const num = parseInt(clean, 16)
  if (isNaN(num) || clean.length !== 6) {
    return [99, 102, 241] // #6366f1
  }
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255]
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  const rNorm = r / 255
  const gNorm = g / 255
  const bNorm = b / 255
  const max = Math.max(rNorm, gNorm, bNorm)
  const min = Math.min(rNorm, gNorm, bNorm)
  const d = max - min
  let h = 0
  let s = 0
  const l = (max + min) / 2

  if (d !== 0) {
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case rNorm:
        h = (gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0)
        break
      case gNorm:
        h = (bNorm - rNorm) / d + 2
        break
      case bNorm:
        h = (rNorm - gNorm) / d + 4
        break
    }
    h *= 60
  }

  return [Math.round(h), s, l]
}

function rgbToHex(r: number, g: number, b: number): string {
  return (
    "#" +
    [r, g, b]
      .map((x) => Math.max(0, Math.min(255, Math.round(x))).toString(16).padStart(2, "0"))
      .join("")
  )
}

/**
 * Generate Tailwind-like HSL color palette from single Hex string.
 * @param hex - Hex string (e.g. '#3b82f6')
 * @returns ColorPalette object with HSL [h, s, l] tuples (s, l in 0..100%)
 */
export function generatePalette(hex: string): ColorPalette {
  const [r, g, b] = hexToRgb(hex)
  let [h, s, l] = rgbToHsl(r, g, b)

  if (isNaN(h)) h = 230

  // Boost saturation and normalize lightness for a vibrant UI accent
  s = Math.max(s, 0.45)
  l = Math.min(Math.max(l, 0.4), 0.62)

  const lightnessMap: Record<number, number> = {
    50: 0.95,
    100: 0.88,
    200: 0.78,
    300: 0.68,
    400: 0.58,
    500: l,
    600: l * 0.84,
    700: l * 0.68,
    800: l * 0.5,
    900: l * 0.32,
    950: l * 0.18,
  }

  const palette: ColorPalette = {}

  Object.entries(lightnessMap).forEach(([keyStr, targetL]) => {
    const key = Number(keyStr)
    const stepSat = key < 500 ? s * (0.65 + (key / 500) * 0.35) : s
    palette[key] = [
      Math.round(h),
      Math.round((stepSat || 0) * 100),
      Math.round((targetL || 0) * 100),
    ]
  })

  return palette
}

/**
 * Extract dominant accent color in HEX format from image buffer or base64 string.
 */
export async function getAccentHEXColor(
  input: string | Buffer
): Promise<string> {
  if (typeof window !== "undefined") {
    return "#6366f1"
  }

  try {
    const { dominantColors } = await import("imgkit")
    const buf = typeof input === "string" ? Buffer.from(input, "base64") : input
    const { primary } = await dominantColors(buf, 1)
    return primary?.hex || "#6366f1"
  } catch {
    return "#6366f1"
  }
}

/**
 * Extract vibrant accent HEX color from an image URL.
 */
const accentColorCache = new Map<string, string>()

export async function getAccentHEXColorFromUrl(url: string): Promise<string> {
  if (!url) return "#6366f1"
  if (accentColorCache.has(url)) {
    return accentColorCache.get(url)!
  }

  if (typeof window !== "undefined") {
    const hex = await new Promise<string>((resolve) => {
      const img = new Image()
      if (!url.startsWith("/") && !url.startsWith("data:")) {
        img.crossOrigin = "Anonymous"
      }
      img.src = url

      img.onload = () => {
        try {
          const canvas = document.createElement("canvas")
          const ctx = canvas.getContext("2d", { willReadFrequently: true })
          if (!ctx) return resolve("#6366f1")

          const size = 32
          canvas.width = size
          canvas.height = size
          ctx.drawImage(img, 0, 0, size, size)

          const imgData = ctx.getImageData(0, 0, size, size).data
          let bestHex = "#6366f1"
          let maxScore = -1

          for (let i = 0; i < imgData.length; i += 4) {
            const r = imgData[i]
            const g = imgData[i + 1]
            const b = imgData[i + 2]
            const a = imgData[i + 3]

            if (a < 128) continue

            const [h, s, l] = rgbToHsl(r, g, b)

            if (isNaN(h)) continue
            if (l < 0.12 || l > 0.88) continue

            const score = s * 3.5 + (1 - Math.abs(l - 0.5)) * 2

            if (score > maxScore) {
              maxScore = score
              bestHex = rgbToHex(r, g, b)
            }
          }

          resolve(bestHex)
        } catch {
          resolve("#6366f1")
        }
      }

      img.onerror = () => resolve("#6366f1")
    })

    accentColorCache.set(url, hex)
    return hex
  }

  try {
    const response = await fetch(url)
    if (!response.ok) return "#6366f1"

    const arrayBuffer = await response.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const hex = await getAccentHEXColor(buffer)
    accentColorCache.set(url, hex)
    return hex
  } catch {
    return "#6366f1"
  }
}
