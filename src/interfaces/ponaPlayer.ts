import { TextBasedChannel, VoiceBasedChannel, GuildMember } from 'discord.js'

export interface Band {
  band: number;
  gain: number;
}

export type PlayerState = "CONNECTED" | "CONNECTING" | "DISCONNECTED" | "DISCONNECTING" | "DESTROYING";

export interface Track {
  "track": string,
  "timestamp": number,
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

export interface HTTP_PonaFetchState {
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
  "current": Track
}

export interface UnresolvedTrack extends Partial<Track> {
	[key: string]: unknown;
	title: string;
	author?: string;
	duration?: number;
	resolve(): Promise<void>;
}

export interface HTTP_PonaRepeatState {
	track: boolean;
	queue: boolean;
	dynamic: boolean;
}

export interface HTTP_PonaCommonState {
	repeat: HTTP_PonaRepeatState;
	volume: number;
	paused: boolean;
	isAutoplay: boolean;
	voiceChannel: string;
}

export interface HTTP_PonaCommonStateWithTracks {
	pona: HTTP_PonaCommonState;
	current: Track | UnresolvedTrack | null;
	queue: Array<Track | UnresolvedTrack>;
}