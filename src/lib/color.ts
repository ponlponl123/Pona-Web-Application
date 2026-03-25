import { fileURLToPath } from "bun"
import chroma from "chroma-js"

/**
 * Generate Tailwind-like color palette from single Hex string
 * @param hex - Hex (e.g. '#3b82f6')
 * @returns Object with key 50-950
 */
export function generatePalette(hex: string) {
  if (!chroma.valid(hex)) {
    throw new Error("Invalid hex color provided")
  }

  const positions = [0.05, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 0.95]
  const keys = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950]

  const colorScale = chroma
    .scale(["#fff", hex, "#000"])
    .mode("lch")
    .domain([0, 0.5, 1])

  const palette: Record<number, string> = {}

  keys.forEach((key, index) => {
    palette[key] = colorScale(positions[index]).hex()
  })

  return palette
}

// For generate color palette while dev
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const hex = process.argv[2]

  if (!hex) {
    throw new Error("No hex color provided")
  }
  if (!chroma.valid(hex)) {
    throw new Error("Invalid hex color provided")
  }

  console.log("Generating palette for", hex)

  const palette = generatePalette(hex)
  console.log(palette)
}
