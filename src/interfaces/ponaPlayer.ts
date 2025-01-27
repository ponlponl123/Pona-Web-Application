import { TextBasedChannel, VoiceBasedChannel, GuildMember } from 'discord.js'

export interface Band {
  band: number;
  gain: number;
}

export type PlayerState = "CONNECTED" | "CONNECTING" | "DISCONNECTED" | "DISCONNECTING" | "DESTROYING";

export interface Track {
  "message": string,
  "state": PlayerState,
  "volume": number,
  "paused": boolean,
  "playing": boolean,
  "isAutoplay": boolean,
  "equalizer": Band[],
  "track": {
    "position": number,
    "length": number,
    "percentage": number
  },
  "repeat": {
    "track": boolean,
    "queue": boolean
  },
  "textChannel": TextBasedChannel,
  "voiceChannel": VoiceBasedChannel,
  "current": {
      "track": string,
      "timestamp": 1737987673770,
      "uniqueId": string,
      "title": string,
      "identifier": string,
      "author": string,
      "duration": number,
      "isrc": string,
      "isSeekable": true,
      "isStream": false,
      "uri": string,
      "artworkUrl": string,
      "sourceName": string,
      "thumbnail": string,
      "requester": GuildMember
  }
}