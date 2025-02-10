import { TextBasedChannel, VoiceBasedChannel, GuildMember } from 'discord.js'
import { NextUIPalette } from '../../themes/utils/nextui-color-palette-gen';

export interface Band {
  band: number;
  gain: number;
}

export type PlayerState = "CONNECTED" | "CONNECTING" | "DISCONNECTED" | "DISCONNECTING" | "DESTROYING";

export interface Track {
  "track": string,
	"cleanTitle": string;
  "timestamp": number,
  "uniqueId": string,
  "title": string,
  "identifier": string,
  "author": string,
	"cleanAuthor": string;
  "duration": number,
  "isrc": string,
  "isSeekable": true,
  "isStream": false,
  "uri": string,
  "artworkUrl": string,
  "highResArtworkUrl"?: string,
  "lyrics"?: LyricsFormat[],
  "sourceName": string,
  "thumbnail": string,
  "requester": GuildMember,
	accentColor?: string;
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

export interface Queue extends Array<Track | UnresolvedTrack>{
  current?: Track | UnresolvedTrack | null;
};

export interface HTTP_PonaRepeatState {
	track: boolean;
	queue: boolean;
	dynamic: boolean;
}

export interface HTTP_PonaCommonState {
  position: number;
  length: number;
	repeat: HTTP_PonaRepeatState;
	volume: number;
	paused: boolean;
	isAutoplay: boolean;
	voiceChannel: string;
}

export interface PonaMusic_AccentColor {
  default: string;
  palette: NextUIPalette;
}

export interface HTTP_PonaCommonStateWithTracks {
	pona: HTTP_PonaCommonState;
	current: Track | UnresolvedTrack | null;
	queue: Queue;
}

export interface LyricsFormat {
  seconds: number;
  lyrics: string;
}