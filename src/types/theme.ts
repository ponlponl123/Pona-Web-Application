export interface Theme {
  name: string
  light?: string
  dark?: string
}

export interface CollectedTheme {
  name: string
  value: string
}

export type Themes = Record<string, string>

export type AppThemes = Theme

export type ResolvedThemeType = "light" | "dark" | "system" | "custom"

export interface ThemeSetting {
  name: string
  type: ResolvedThemeType
}

export interface DynamicTheme {
  sync: boolean
  isAmoled: boolean
  single: ThemeSetting
  day: ThemeSetting
  night: ThemeSetting
}
