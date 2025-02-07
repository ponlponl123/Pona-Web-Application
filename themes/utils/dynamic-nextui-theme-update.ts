import { hexToHSL } from "@/utils/colorUtils";
import { ColorScale } from "@nextui-org/theme";

function DynamicNextUIThemeUpdate(theme: ColorScale): void {
  "use client";
  Object.entries(theme).forEach(([key, value]) => {
    const hsl = hexToHSL(value);
    if ( !hsl ) return;
    hsl.s = hsl.s*100;
    hsl.s = Math.round(hsl.s);
    hsl.l = hsl.l*100;
    hsl.l = Math.round(hsl.l);
    hsl.h = Math.round(360*hsl.h);
    const colorKey = `--pona-app-pona-music-accent-color${key === 'DEFAULT' ? '' : '-'+key}`;
    document.documentElement.style.setProperty(colorKey, hsl.h + ', ' + hsl.s + '%, ' + hsl.l + '%');
  });
}

export default DynamicNextUIThemeUpdate