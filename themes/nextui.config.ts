import { PoanConfigThemes, PonaThemeColors } from "../themes.config";
import nextuiColorPalette from "./utils/nextui-color-palette-gen";

const colorPalette: Partial<PonaThemeColors> = {
  ...nextuiColorPalette({name: "default", baseColor: "#3f3f46"}),
  ...nextuiColorPalette({name: "primary", baseColor: "#006FEE"}),
  ...nextuiColorPalette({name: "secondary", baseColor: "#9353d3"}),
  ...nextuiColorPalette({name: "success", baseColor: "#17c964"}),
  ...nextuiColorPalette({name: "warning", baseColor: "#f5a524"}),
  ...nextuiColorPalette({name: "danger", baseColor: "#f31260"}),
  focus: "#006FEE",
}

const nextui: PoanConfigThemes = {
  "nextui-light": {
    extend: "light",
    colors: {
      ...colorPalette,
      ...nextuiColorPalette({name: "foreground", baseColor: "#11181C"}),
      ...nextuiColorPalette({name: "background", baseColor: "#ffffff"}),
      ...nextuiColorPalette({name: "playground-background", baseColor: "#fafafa"}),
    },
  },
  "nextui-dark": {
    extend: "dark",
    colors: {
      ...colorPalette,
      ...nextuiColorPalette({name: "foreground", baseColor: "#ECEDEE"}),
      ...nextuiColorPalette({name: "background", baseColor: "#000000"}),
      ...nextuiColorPalette({name: "playground-background", baseColor: "#18181b"}),
    },
  },
}

export default nextui;