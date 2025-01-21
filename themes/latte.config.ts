import { PonaConfigThemes, PonaThemeColors } from "../themes.config";
import nextuiColorPalette from "./utils/nextui-color-palette-gen";

const colorPalette: Partial<PonaThemeColors> = {
  ...nextuiColorPalette({name: "default", baseColor: "#d4d4d8"}),
  ...nextuiColorPalette({name: "primary", baseColor: "#5d8736"}),
  ...nextuiColorPalette({name: "secondary", baseColor: "#819f3c"}),
  ...nextuiColorPalette({name: "success", baseColor: "#16c57f"}),
  ...nextuiColorPalette({name: "warning", baseColor: "#a9b899"}),
  ...nextuiColorPalette({name: "danger", baseColor: "#123524"}),
  focus: "#5d8736",
}

const latte: PonaConfigThemes = {
  "latte-light": {
    extend: "light",
    colors: {
      ...colorPalette,
      ...nextuiColorPalette({name: "foreground", baseColor: "#3c5c1f"}),
      ...nextuiColorPalette({name: "playground-background", baseColor: "#eafbea"}),
    },
  },
  "latte-dark": {
    extend: "dark",
    colors: {
      ...colorPalette,
      ...nextuiColorPalette({name: "foreground", baseColor: "#ccffe0"}),
      ...nextuiColorPalette({name: "background", baseColor: "#142418"}),
      ...nextuiColorPalette({name: "playground-background", baseColor: "#001409"}),
    },
  },
}

export default latte;