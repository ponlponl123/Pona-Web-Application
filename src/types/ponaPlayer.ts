import {
  ClientUser,
  TextBasedChannel,
  User,
  VoiceBasedChannel,
} from "discord.js"
import { ColorPalette } from "@/lib/color"

export interface Band {
  band: number
  gain: number
}

export type PlayerState =
  | "CONNECTED"
  | "CONNECTING"
  | "DISCONNECTED"
  | "DISCONNECTING"
  | "DESTROYING"

export interface ArtistBasic {
  id: string
  name: string
}

export interface Track {
  track: string
  cleanTitle: string
  timestamp: number
  uniqueId: string
  title: string
  identifier: string
  author: string
  artist?: ArtistBasic[]
  cleanAuthor: string
  duration: number
  isrc: string
  isSeekable: true
  isStream: false
  uri: string
  artworkUrl: string
  highResArtworkUrl?: string
  proxyThumbnail?: string
  proxyArtworkUrl?: string
  proxyHighResArtworkUrl?: string
  lyrics?: Lyric
  sourceName: string
  thumbnail: string
  requester: User | ClientUser
  accentColor?: string
  _isPNPT?: boolean
}

export interface HTTP_PonaFetchState {
  message: string
  state: PlayerState
  volume: number
  paused: boolean
  playing: boolean
  isAutoplay: boolean
  equalizer: Band[]
  track: {
    position: number
    length: number
    percentage: number
  }
  repeat: {
    track: boolean
    queue: boolean
  }
  textChannel: TextBasedChannel
  voiceChannel: VoiceBasedChannel
  current: Track
}

export interface UnresolvedTrack extends Partial<Track> {
  [key: string]: unknown
  title: string
  author?: string
  duration?: number
  artist?: ArtistBasic[]
  resolve(): Promise<void>
}

export interface Queue extends Array<Track | UnresolvedTrack> {
  current?: Track | UnresolvedTrack | null
}

export interface HTTP_PonaRepeatState {
  track: boolean
  queue: boolean
  dynamic: boolean
}

export interface HTTP_PonaCommonState {
  // position: number;
  length: number
  repeat: HTTP_PonaRepeatState
  volume: number
  paused: boolean
  isAutoplay: boolean
  isPNPTEnabled?: boolean
  voiceChannel: string
}

export interface PonaMusic_AccentColor {
  default: string
  palette: ColorPalette
}

export interface HTTP_PonaCommonStateWithTracks {
  pona: HTTP_PonaCommonState
  current: Track | UnresolvedTrack | null
  queue: Queue
  queuePNPT?: Queue
}

export interface TimestampLyrics {
  seconds: number
  lyrics: string
}

export type NonTimestampLyrics = string

export interface Lyric {
  isTimestamp: boolean
  lyrics: TimestampLyrics[] | NonTimestampLyrics[]
  source?: string
  error?: string
}

export interface PlayDetail {
  title: string
  author: string
  uri: string
  resultType?: string
  sourceName: string
  identifier: string
}

export interface PlaylistDetail {
  title: string
  author: string
  thumbnails: string[]
  tracks: PlayDetail[]
}

export interface PlayButtonClassNames {
  wrapper?: string
  button?: string
  icon?: string
  playpause?: string
}

export interface PlayButtonProps<T extends 'song' | 'playlist' = 'song'> {
  s?: number
  type?: T
  iconSize?: number
  className?: string
  classNames?: PlayButtonClassNames
  detail: T extends 'playlist' ? PlaylistDetail : PlayDetail
  children?: React.ReactNode
  style?: React.CSSProperties
  playPause?: boolean
}
