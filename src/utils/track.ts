import { Track, UnresolvedTrack } from '@/interfaces/ponaPlayer';
import DynamicNextUIThemeUpdate from '../../themes/utils/dynamic-nextui-theme-update.ts';
import nextuiColorPalette from '../../themes/utils/nextui-color-palette-gen.ts';
import { getAccentHEXColorFromUrl } from './colorUtils';

export function proxyArtwork(
  track: Track | UnresolvedTrack
): Track | UnresolvedTrack {
  if (!track?.identifier) return track;

  track.proxyArtworkUrl = '/api/proxy/watch?v=' + track.identifier + '&s=md';
  track.proxyHighResArtworkUrl =
    '/api/proxy/watch?v=' + track.identifier + '&s=lg';
  track.proxyThumbnail = '/api/proxy/watch?v=' + track.identifier + '&s=sm';

  return track;
}

export async function makeTrack(
  track: Track | UnresolvedTrack
): Promise<Track | UnresolvedTrack> {
  if (!track?.identifier) return track;
  const accentColor = await getAccentHEXColorFromUrl(
    '/api/proxy/watch?v=' + track.identifier
  );
  const colorPalette = nextuiColorPalette({
    name: 'content1',
    baseColor: accentColor,
  });
  DynamicNextUIThemeUpdate(
    '--pona-app-music-accent-color',
    colorPalette.content1
  );
  document.body.setAttribute('playing', track.identifier);

  track = proxyArtwork(track);

  return track;
}
