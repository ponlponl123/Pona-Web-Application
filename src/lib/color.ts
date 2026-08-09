import chroma from "chroma-js"

export type ColorPalette = Record<number, [number, number, number]>

/**
 * Generate Tailwind-like HSL color palette from single Hex string.
 * @param hex - Hex string (e.g. '#3b82f6')
 * @returns ColorPalette object with HSL [h, s, l] tuples (s, l in 0..100%)
 */
export function generatePalette(hex: string): ColorPalette {
  const validHex = chroma.valid(hex) ? hex : "#6366f1"
  const color = chroma(validHex)

  let [h, s, l] = color.hsl()
  if (isNaN(h)) h = 230

  // Boost saturation and normalize lightness for a vibrant UI accent
  s = Math.max(s, 0.45)
  l = Math.min(Math.max(l, 0.40), 0.62)

  const lightnessMap: Record<number, number> = {
    50: 0.95,
    100: 0.88,
    200: 0.78,
    300: 0.68,
    400: 0.58,
    500: l,
    600: l * 0.84,
    700: l * 0.68,
    800: l * 0.50,
    900: l * 0.32,
    950: l * 0.18,
  }

  const palette: ColorPalette = {}

  Object.entries(lightnessMap).forEach(([keyStr, targetL]) => {
    const key = Number(keyStr)
    const stepSat = key < 500 ? s * (0.65 + (key / 500) * 0.35) : s
    const stepColor = chroma.hsl(h, stepSat, targetL)
    const [stepH, stepS, stepL] = stepColor.hsl()
    palette[key] = [
      isNaN(stepH) ? Math.round(h) : Math.round(stepH),
      Math.round((stepS || 0) * 100),
      Math.round((stepL || 0) * 100),
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
  } catch (error) {
    return "#6366f1"
  }
}

/**
 * Extract vibrant accent HEX color from an image URL.
 */
export async function getAccentHEXColorFromUrl(url: string): Promise<string> {
  if (!url) return "#6366f1"

  if (typeof window !== "undefined") {
    return new Promise((resolve) => {
      const img = new Image()
      img.crossOrigin = "Anonymous"
      img.src = url

      img.onload = () => {
        try {
          const canvas = document.createElement("canvas")
          const ctx = canvas.getContext("2d")
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

            const color = chroma(r, g, b)
            const [h, s, l] = color.hsl()

            if (isNaN(h)) continue
            if (l < 0.12 || l > 0.88) continue

            const score = s * 3.5 + (1 - Math.abs(l - 0.5)) * 2

            if (score > maxScore) {
              maxScore = score
              bestHex = color.hex()
            }
          }

          resolve(bestHex)
        } catch {
          resolve("#6366f1")
        }
      }

      img.onerror = () => resolve("#6366f1")
    })
  }

  try {
    const response = await fetch(url)
    if (!response.ok) return "#6366f1"

    const arrayBuffer = await response.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    return await getAccentHEXColor(buffer)
  } catch {
    return "#6366f1"
  }
}
