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

export const themes: Theme[] = [DefaultTheme, ChocolateTheme]

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
