import { DynamicTheme, Theme, Themes } from "@/types/theme"

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

const themes: Theme[] = [DefaultTheme, ChocolateTheme]

const themeNames = themes.map((theme) => theme.name)
const lightThemes = themes.map((theme) => theme.light!)
const darkThemes = themes.map((theme) => theme.dark!)

const defaultDynamicTheme: DynamicTheme = {
  sync: true,
  isAmoled: false,
  single: {
    name: "default",
    type: "system",
  },
  day: {
    name: "default",
    type: "light",
  },
  night: {
    name: "default",
    type: "dark",
  },
}

export { themes, themeNames, lightThemes, darkThemes, defaultDynamicTheme }
