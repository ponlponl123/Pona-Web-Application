import chroma from "chroma-js"

export type ColorPalette = Record<number, chroma.ColorFormats["oklch"]>

/**
 * Generate Tailwind-like color palette from single Hex string.
 * @param hex - Hex string (e.g. '#3b82f6' or '3b82f6')
 * @returns ColorPalette object with OKLCH values for keys 50-950
 */
export function generatePalette(hex: string): ColorPalette {
  if (!chroma.valid(hex)) {
    throw new Error("Invalid hex color provided")
  }

  const positions = [0.05, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 0.95]
  const keys = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950]

  const colorScale = chroma
    .scale(["#fff", hex, "#000"])
    .mode("lch")
    .domain([0, 0.5, 1])

  const palette: ColorPalette = {}

  keys.forEach((key, index) => {
    palette[key] = colorScale(positions[index]).oklch()
  })

  return palette
}

/**
 * Extract dominant accent color in HEX format from image buffer or base64 string.
 * Uses dynamic server-side import for imgkit or canvas fallback on client.
 * @param input - Base64 string or image Buffer
 * @returns Promise resolving to HEX color string (e.g. "#18181b")
 */
export async function getAccentHEXColor(
  input: string | Buffer
): Promise<string> {
  if (typeof window !== "undefined") {
    // Client-side fallback accent color
    return "#18181b"
  }

  try {
    const { dominantColors } = await import("imgkit")
    const buf = typeof input === "string" ? Buffer.from(input, "base64") : input
    const { primary } = await dominantColors(buf, 1)
    return primary?.hex || "#18181b"
  } catch (error) {
    return "#18181b"
  }
}

/**
 * Extract accent HEX color from an image URL.
 * Works seamlessly across both client and server environments.
 * @param url - Image URL
 * @returns Promise resolving to HEX color string
 */
export async function getAccentHEXColorFromUrl(url: string): Promise<string> {
  if (!url) return "#18181b"

  if (typeof window !== "undefined") {
    return new Promise((resolve) => {
      const img = new Image()
      img.crossOrigin = "Anonymous"
      img.src = url

      img.onload = () => {
        try {
          const canvas = document.createElement("canvas")
          const ctx = canvas.getContext("2d")
          if (!ctx) return resolve("#18181b")

          canvas.width = 1
          canvas.height = 1
          ctx.drawImage(img, 0, 0, 1, 1)

          const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data
          const hex = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`
          resolve(hex)
        } catch {
          resolve("#18181b")
        }
      }

      img.onerror = () => resolve("#18181b")
    })
  }

  try {
    const response = await fetch(url)
    if (!response.ok) return "#18181b"

    const arrayBuffer = await response.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    return await getAccentHEXColor(buffer)
  } catch {
    return "#18181b"
  }
}
