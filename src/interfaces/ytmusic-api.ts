export interface ThumbnailFull {
	url: string;
	width: number;
	height: number;
}

export interface ArtistBasic {
	id: string | null;
	name: string;
}

export interface AlbumBasic {
	id: string;
	name: string;
}

export interface TopResult {
	category: "Top result";
	resultType: "artist" | "video" | "song" | "album";
}

export interface TopResult_Artist extends TopResult {
	resultType: "artist";
    artists: ArtistBasic[];
    subscribers: string;
	thumbnails: ThumbnailFull[];
}

export interface TopResult_Album extends TopResult {
	resultType: "album";
	videoId: string | null;
	videoType: string | null;
	title: string;
    artists: ArtistBasic[];
	browseId: string;
	playlistId: string;
	thumbnails: ThumbnailFull[];
}

export interface TopResult_Song extends TopResult {
	resultType: "song";
	videoId: string | null;
	videoType: string | null;
	title: string;
    artists: ArtistBasic[];
	duration: string;
	duration_seconds: number | null;
	thumbnails: ThumbnailFull[];
}

export interface TopResult_Video extends TopResult {
	resultType: "video";
	videoId: string | null;
	videoType: string | null;
	title: string;
	view: string;
    artists: ArtistBasic[];
	duration: string;
	duration_seconds: number | null;
	thumbnails: ThumbnailFull[];
}

export type TopResults = TopResult_Album |
	TopResult_Artist |
	TopResult_Song |
	TopResult_Video;

export interface SongDetailed {
	category: "Songs";
	resultType: "song";
	videoId: string;
	videoType: string;
	title: string;
	artists: ArtistBasic[];
	album: AlbumBasic | string | null;
	year: number | null;
	isExplicit: boolean;
	duration: string;
	duration_seconds: number | null;
	thumbnails: ThumbnailFull[] | null;
}

export interface VideoDetailed {
	category: "Videos" | "Episodes";
	resultType: "video";
	videoId: string;
	videoType: string;
	title: string;
	artists: ArtistBasic[];
	view: string;
	year: number | null;
	isExplicit: boolean;
	duration: string;
	duration_seconds: number | null;
	thumbnails: ThumbnailFull[];
}

export interface ArtistDetailed {
	category: "Artists";
	resultType: "artist";
	shuffleId: string;
	radioId: string;
	browseId: string;
	artist: string;
	thumbnails: ThumbnailFull[];
}

export interface ProfileDetailed {
	category: "Profiles";
	resultType: "artist";
	browseId: string;
	artist: string;
	thumbnails: ThumbnailFull[];
}

export interface PodcastDetailed {
	category: "Podcasts";
	resultType: "podcast";
	browseId: string;
	title: string;
	thumbnails: ThumbnailFull[];
}

export interface EpisodeDetailed extends VideoDetailed {
    category: "Episodes";
}

export interface AlbumDetailed {
	category: "Albums";
	resultType: "album";
	type: string | "Single";
	browseId: string;
	playlistId: string;
	title: string;
	artists: ArtistBasic[];
	year: number | null;
	isExplicit: boolean;
	duration: string | null;
	thumbnails: ThumbnailFull[];
}

export interface PlaylistDetailed {
	category: "Community playlists";
	type: "playlist";
	browseId: string;
	title: string;
	author: string;
	itemCount: number;
	thumbnails: ThumbnailFull[];
}

export interface SongFull extends SongDetailed {
	formats: unknown[];
	adaptiveFormats: unknown[];
}

export interface VideoFull extends VideoDetailed {
	unlisted: boolean;
	familySafe: boolean;
	paid: boolean;
	tags: string[];
}

export interface AlbumTrack extends SongDetailed {
	likeStatus: string;
    inLibrary: boolean | null,
    isAvailable: boolean,
    isExplicit: boolean,
	view: string;
    trackNumber: number;
    album: string;
}

export interface AlbumFull extends AlbumDetailed {
	year: number | null;
	thumbnails: ThumbnailFull[];
	tracks: AlbumTrack[];
    trackCount: number;
	likeStatus: string;
	description: string;
}

export interface PlaylistFull extends PlaylistDetailed {
    videos?: VideoDetailed[];
	playlistId: string;
}

export type SearchResult =
    TopResults |
    SongDetailed |
    VideoDetailed |
    AlbumDetailed |
    ArtistDetailed |
    PlaylistDetailed |
    ProfileDetailed |
    PodcastDetailed |
    EpisodeDetailed;