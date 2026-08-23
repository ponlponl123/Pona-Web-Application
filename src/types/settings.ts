import { LatLngExpression } from "leaflet"

export type FullscreenMode = boolean | "changing"
export type TimeFormat = "auto" | 12 | 24
export type Thermometer = "c" | "f"
export type BlurEffect = false | "acrylics" | "blur"
export type Animation = boolean | "30 fps"
export type Location = "auto" | "surprise" | LatLngExpression
export type PonaPlayerStyle = "modern" | "compact"
export type AppFont = "friendly" | "business" | "modern"
export interface UserSetting {
  // Layout Settings
  transparency: boolean
  blurEffect: BlurEffect
  timeformat: TimeFormat
  thermometer: Thermometer
  animation: Animation
  isSidebarCollapsed: boolean
  appFont?: AppFont
  // Privacy Settings
  location: Location
  dev_pona_player_style: PonaPlayerStyle
}
