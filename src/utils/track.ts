import { Track, UnresolvedTrack } from "@/interfaces/ponaPlayer";
import { getAccentHEXColorFromUrl } from "./colorUtils";
import nextuiColorPalette from "../../themes/utils/nextui-color-palette-gen";
import DynamicNextUIThemeUpdate from "../../themes/utils/dynamic-nextui-theme-update";

export async function makeTrack(track: Track | UnresolvedTrack): Promise<Track | UnresolvedTrack> {
  if ( !track.identifier ) return track;
  const accentColor = await getAccentHEXColorFromUrl('/api/proxy/watch?v='+track.identifier);
  const colorPalette = nextuiColorPalette({name: 'content1', baseColor: accentColor});
  DynamicNextUIThemeUpdate('--pona-app-music-accent-color', colorPalette.content1);
  document.body.setAttribute('playing', track.identifier);
  
  return track;
}