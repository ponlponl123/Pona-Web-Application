export interface Theme {
  name: string
  light?: string
  dark?: string
}

export type Themes = Record<string, string>

export type AppThemes = Theme

export type ThemeType = "light" | "dark" | "system"

export interface ThemeSetting {
  name: string
  type: ThemeType
}

export interface DynamicTheme {
  sync: boolean
  isAmoled: boolean
  single: ThemeSetting
  day: ThemeSetting
  night: ThemeSetting
}
