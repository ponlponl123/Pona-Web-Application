import generateColorPalette, { Palette } from "@euax/color-palette-generator";
import { PonaThemeColors } from "../../themes.config";

export interface NextUIPalette extends Palette {
  [key: string]: {
    DEFAULT?: string;
    foreground?: string;
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
  };
}

function nextuiColorPalette ({name, baseColor, _default, foreground}: {name: keyof PonaThemeColors, baseColor: string, _default?: string | null, foreground?: string | null}): NextUIPalette {
  const colorPalette = generateColorPalette({name, baseColor}) as NextUIPalette;
  if ( _default !== null )
    colorPalette[name].DEFAULT = _default ? _default : baseColor;
  if ( foreground !== null )
    colorPalette[name].foreground = foreground ? foreground : colorPalette[name][900];
  return colorPalette;
}

export default nextuiColorPalette;