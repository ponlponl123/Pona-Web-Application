import { CollectedTheme, Theme } from "@/types/theme"

export const DefaultTheme: Theme = {
  name: "default",
  light: "light",
  dark: "dark",
}

export const ChocolateTheme: Theme = {
  name: "chocolate",
  light: "milk-tea",
  dark: "dark-chocolate",
}

export const MatchaTheme: Theme = {
  name: "matcha",
  light: "Matcha Latte",
  dark: "Roasted Matcha",
}

export const HopefulTheme: Theme = {
  name: "hopeful",
  light: "Daybreak",
  dark: "Nightfall",
}

export const NextUITheme: Theme = {
  name: "nextui",
  light: "Modern Light",
  dark: "Modern Dark",
}

export const RedRoseTheme: Theme = {
  name: "red_rose",
  light: "Rose Petal",
  dark: "Crimson Velvet",
}

export const VioletTheme: Theme = {
  name: "violet",
  light: "Soft Lavender",
  dark: "Deep Plum",
}

export const WinterTheme: Theme = {
  name: "winter",
  light: "Fresh Snow",
  dark: "Polar Night",
}

export const CupcakeTheme: Theme = {
  name: "cupcake",
  light: "Vanilla Frosting",
  dark: "Devil's Food",
}

export const themes: Theme[] = [
  DefaultTheme,
  ChocolateTheme,
  MatchaTheme,
  HopefulTheme,
  NextUITheme,
  RedRoseTheme,
  VioletTheme,
  WinterTheme,
  CupcakeTheme,
]

export const validThemes = themes.filter((theme) => theme.light && theme.dark)

export const themeCollections = validThemes.reduce(
  (acc, theme) => {
    acc.names.push(theme.name)
    acc.lights.push(theme.light!)
    acc.darks.push(theme.dark!)
    return acc
  },
  { names: [] as string[], lights: [] as string[], darks: [] as string[] }
)

export const lightThemes: CollectedTheme[] = validThemes.map((theme) => ({
  name: theme.name,
  value: theme.light!,
}))

export const darkThemes: CollectedTheme[] = validThemes.map((theme) => ({
  name: theme.name,
  value: theme.dark!,
}))
