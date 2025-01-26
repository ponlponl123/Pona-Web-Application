import { PonaConfigThemes, PonaThemeColors } from "../themes.config";
import nextuiColorPalette from "./utils/nextui-color-palette-gen";

const colorPalette: Partial<PonaThemeColors> = {
  // ...nextuiColorPalette({name: "default", baseColor: "#bcccdc"}),
  ...nextuiColorPalette({name: "primary", baseColor: "#618dc2"}),
  ...nextuiColorPalette({name: "secondary", baseColor: "#90c2f4"}),
  ...nextuiColorPalette({name: "success", baseColor: "#85a88f"}),
  ...nextuiColorPalette({name: "warning", baseColor: "#d8c4b6"}),
  ...nextuiColorPalette({name: "danger", baseColor: "#474f94"}),
  focus: "#618dc2",
}

const winter: PonaConfigThemes = {
  "winter-light": {
    extend: "light",
    colors: {
      ...colorPalette,
      ...nextuiColorPalette({name: "foreground", baseColor: "#32424e"}),
      ...nextuiColorPalette({name: "playground-background", baseColor: "#eafcff"}),
    },
  },
  "winter-dark": {
    extend: "dark",
    colors: {
      ...colorPalette,
      ...nextuiColorPalette({name: "foreground", baseColor: "#eafcff"}),
      ...nextuiColorPalette({name: "background", baseColor: "#12181C"}),
      ...nextuiColorPalette({name: "playground-background", baseColor: "#27343D"}),
    },
  },
  'amoled-winter-dark': {
    extend: 'dark',
    colors: {
      ...colorPalette,
      ...nextuiColorPalette({name: "foreground", baseColor: "#eafcff"}),
      ...nextuiColorPalette({name: "background", baseColor: "#000000"}),
      ...nextuiColorPalette({name: "playground-background", baseColor: "#000000"}),
    },
  },
}

export default winter;