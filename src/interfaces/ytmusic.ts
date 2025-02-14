export interface ThumbnailFull {
	url: string;
	width: number;
	height: number;
}

export interface ArtistBasic {
	artistId: string | null;
	name: string;
}

export interface AlbumBasic {
	albumId: string;
	name: string;
}

export interface SongDetailed {
	type: "SONG";
	videoId: string;
	name: string;
	artist: ArtistBasic;
	album: AlbumBasic | null;
	duration: number | null;
	thumbnails: ThumbnailFull[];
}

export interface VideoDetailed {
	type: "VIDEO";
	videoId: string;
	name: string;
	artist: ArtistBasic;
	duration: number | null;
	thumbnails: ThumbnailFull[];
}

export interface ArtistDetailed {
	artistId: string;
	name: string;
	type: "ARTIST";
	thumbnails: ThumbnailFull[];
}

export interface AlbumDetailed {
	type: "ALBUM";
	albumId: string;
	playlistId: string;
	name: string;
	artist: ArtistBasic;
	year: number | null;
	thumbnails: ThumbnailFull[];
}

export interface PlaylistDetailed {
	type: "PLAYLIST";
	playlistId: string;
	name: string;
	artist: ArtistBasic;
	thumbnails: ThumbnailFull[];
}

export interface SongFull {
	type: "SONG";
	videoId: string;
	name: string;
	artist: ArtistBasic;
	duration: number;
	thumbnails: ThumbnailFull[];
	formats: unknown[];
	adaptiveFormats: unknown[];
}

export interface VideoFull {
	type: "VIDEO";
	videoId: string;
	name: string;
	artist: ArtistBasic;
	duration: number;
	thumbnails: ThumbnailFull[];
	unlisted: boolean;
	familySafe: boolean;
	paid: boolean;
	tags: string[];
}

export interface UpNextsDetails {
	type: "SONG";
	videoId: string;
	title: string;
	artists: ArtistBasic;
	duration: number;
	thumbnails: ThumbnailFull[];
}

export interface ArtistFull {
	artistId: string;
	name: string;
	type: "ARTIST";
	thumbnails: ThumbnailFull[];
	topSongs: SongDetailed[];
	topAlbums: AlbumDetailed[];
	topSingles: AlbumDetailed[];
	topVideos: VideoDetailed[];
	featuredOn: PlaylistDetailed[];
	similarArtists: ArtistDetailed[];
}

export interface AlbumFull {
	type: "ALBUM";
	albumId: string;
	playlistId: string;
	name: string;
	artist: ArtistBasic;
	year: number | null;
	thumbnails: ThumbnailFull[];
	songs: SongDetailed[];
}

export interface PlaylistFull {
  	videos?: VideoDetailed[];
	type: "PLAYLIST";
	playlistId: string;
	name: string;
	artist: ArtistBasic;
	videoCount: number;
	thumbnails: ThumbnailFull[];
}

export type SearchResult = SongDetailed | VideoDetailed | AlbumDetailed | ArtistDetailed | PlaylistDetailed;

export interface TimedLyricsData {
	lyricLine: string;
	cueRange: {
		startTimeMilliseconds: string;
		endTimeMilliseconds: string;
		metadata: {
			id: number;
		};
	};
}

export interface TimedLyricsRes {
	timedLyricsData: TimedLyricsData[];
	sourceMessage: string;
}

export interface HomeSection {
	title: string;
	contents: (AlbumDetailed | PlaylistDetailed | SongDetailed)[];
}