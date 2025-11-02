import { NextUIPalette } from '@/../themes/utils/nextui-color-palette-gen';

export interface ThumbnailFull {
  url: string;
  width: number;
  height: number;
}

export interface ArtistBasic {
  id: string | null;
  name: string;
}

export interface SpecificArtistBasic {
  artistId: string | null;
  name: string;
}

export interface AlbumBasic {
  id: string;
  name: string;
}

export type ResultType =
  | 'artist'
  | 'artist-detail'
  | 'profile'
  | 'video'
  | 'song'
  | 'album'
  | 'single'
  | 'playlist';

export interface TopResult {
  category: 'Top result';
  resultType: ResultType;
  accentColor?: string;
  colorPalette?: NextUIPalette;
}

export interface TopResult_Artist extends TopResult {
  resultType: 'artist';
  artists: ArtistBasic[];
  subscribers: string;
  thumbnails: ThumbnailFull[];
}

export interface TopResult_ArtistDetail extends ArtistDetailed {
  resultType: 'artist-detail';
}

export interface TopResult_Album extends TopResult {
  resultType: 'album';
  videoId: string | null;
  videoType: string | null;
  title: string;
  artists: ArtistBasic[];
  browseId: string;
  playlistId: string;
  thumbnails: ThumbnailFull[];
}

export interface TopResult_Song extends TopResult {
  resultType: 'song';
  videoId: string | null;
  videoType: string | null;
  title: string;
  artists: ArtistBasic[];
  duration: string;
  duration_seconds: number | null;
  thumbnails: ThumbnailFull[];
}

export interface TopResult_Video extends TopResult {
  resultType: 'video';
  videoId: string | null;
  videoType: string | null;
  title: string;
  view: string;
  artists: ArtistBasic[];
  duration: string;
  duration_seconds: number | null;
  thumbnails: ThumbnailFull[];
}

export type TopResults =
  | TopResult_Album
  | TopResult_Artist
  | TopResult_ArtistDetail
  | TopResult_Song
  | TopResult_Video;

export interface WatchPlaylistTrack {
  videoId: string;
  title: string;
  artists: ArtistBasic[];
  length: string;
  thumbnail: ThumbnailFull[];
  feedbackTokens: unknown;
  likeStatus: string;
  inLibrary: boolean;
  videoType: string;
  views: string;
}
export interface WatchPlaylist {
  tracks: WatchPlaylistTrack[];
  playlistId: string;
  lyrics: string;
  related: string;
}

export type RelatedType =
  | 'You might also like'
  | 'Recommended playlists'
  | 'Similar artists'
  | 'About the artist';

export interface SongRelated_Dummy {
  title: RelatedType | string;
  contents: unknown;
}
export interface SongRelated_YouMightAlsoLike extends SongRelated_Dummy {
  title: 'You might also like';
  contents: SongBasic[];
}
export interface SongRelated_RecommendedPlaylists extends SongRelated_Dummy {
  title: 'Recommended playlists';
  contents: PlaylistBasic[];
}
export interface SongRelated_SimilarArtists extends SongRelated_Dummy {
  title: 'Similar artists';
  contents: ArtistRelated[];
}
export interface SongRelated_AboutTheArtist extends SongRelated_Dummy {
  title: 'About the artist';
  contents: string;
}
export type SongRelated = Array<
  | SongRelated_YouMightAlsoLike
  | SongRelated_RecommendedPlaylists
  | SongRelated_SimilarArtists
  | SongRelated_AboutTheArtist
>;

export interface SongBasic {
  title: string;
  videoId: string;
  artists: ArtistBasic[];
  album: AlbumBasic | string | null;
  isExplicit: boolean;
  thumbnails: ThumbnailFull[] | null;
}

export interface SongDetailed {
  category: 'Songs';
  resultType: 'song';
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
  category: 'Videos' | 'Episodes';
  resultType: 'video';
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

export interface ExtendedVideoDetailed extends VideoDetailed {
  likeStatus: string;
  inLibrary: boolean;
  isAvailable: boolean;
  isExplicit: boolean;
}

export interface ArtistDetailed {
  category: 'Artists';
  resultType: 'artist' | string;
  shuffleId: string;
  radioId: string;
  browseId: string;
  artist: string;
  thumbnails: ThumbnailFull[];
}

export interface RelatedArtist {
  title: string;
  browseId: string;
  subscribers: string;
  thumbnails: ThumbnailFull[];
}

export interface ArtistSong {
  videoId: string;
  title: string;
  artists: ArtistBasic[];
  album: AlbumBasic[];
  views: string | null;
  videoType: string;
  likeStatus: string;
  isExplicit: boolean;
  isAvailable: boolean;
  inLibrary: boolean;
  thumbnails: ThumbnailFull[];
}

export interface ArtistSingle {
  title: string;
  browseId: string;
  year: string;
  thumbnails: ThumbnailFull[];
}

export interface ArtistVideo {
  title: string;
  playlistId: string;
  views: string;
  videoId: string;
  artists: ArtistBasic[];
  thumbnails: ThumbnailFull[];
}

export interface ArtistRelated {
  title: string;
  browseId: string;
  subscribers: string;
  thumbnails: ThumbnailFull[];
}

export interface ArtistFull {
  name: string;
  description: string | null;
  view: string | null;
  channelId: string;
  shuffleId: string;
  radioId: string;
  browseId: string;
  subscribers: string;
  subscribed: boolean;
  thumbnails: ThumbnailFull[];
  songs: {
    browseId: string | null;
    params: string | null;
    results: ArtistSong[];
  };
  singles: {
    browseId: string | null;
    params: string | null;
    results: ArtistSingle[];
  };
  albums: {
    browseId: string | null;
    params: string | null;
    results: ArtistSingle[];
  };
  videos: {
    browseId: string | null;
    params: string | null;
    results: ArtistVideo[];
  };
  related: {
    browseId: string | null;
    params: string | null;
    results: ArtistRelated[];
  };
}

export interface ProfileDetailed {
  category: 'Profiles';
  resultType: 'profile';
  browseId: string;
  artist: string;
  thumbnails: ThumbnailFull[];
}

export interface ProfilePlaylist {
  title: string;
  playlistId: string;
  thumbnails: ThumbnailFull[];
}

export interface ProfileFull {
  name: string;
  videos: {
    browseId: string | null;
    results: ArtistVideo[];
  };
  playlists: {
    browseId: string | null;
    results: ProfilePlaylist[];
  };
}

export interface PodcastDetailed {
  category: 'Podcasts';
  resultType: 'podcast';
  browseId: string;
  title: string;
  thumbnails: ThumbnailFull[];
}

export interface EpisodeDetailed extends VideoDetailed {
  category: 'Episodes';
}

export interface AlbumDetailed {
  category: 'Albums';
  resultType: 'single' | 'album';
  type: string | 'Single' | 'Album';
  browseId: string;
  playlistId: string;
  title: string;
  artists: ArtistBasic[];
  year: number | null;
  isExplicit: boolean;
  duration: string | null;
  thumbnails: ThumbnailFull[];
}

export interface PlaylistBasic {
  title: string;
  playlistId: string;
  thumbnails: ThumbnailFull[];
  description: string;
}

export interface PlaylistDetailed {
  category: 'Community playlists';
  resultType: 'playlist';
  type: 'playlist';
  browseId: string;
  name: string;
  author: string;
  itemCount: number;
  thumbnails: ThumbnailFull[];
}

export interface PlaylistFull extends PlaylistDetailed {
  owned: boolean;
  privacy: string;
  description: string | null;
  views: string | null;
  duration: string | null;
  tracks: ExtendedVideoDetailed[];
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
  inLibrary: boolean | null;
  isAvailable: boolean;
  isExplicit: boolean;
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

export type SearchResult =
  | TopResults
  | SongDetailed
  | VideoDetailed
  | AlbumDetailed
  | ArtistDetailed
  | PlaylistDetailed
  | ProfileDetailed
  | PodcastDetailed
  | EpisodeDetailed;
