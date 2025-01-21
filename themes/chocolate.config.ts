import { PonaConfigThemes } from "../themes.config";
import nextuiColorPalette from "./utils/nextui-color-palette-gen";
import { PonaThemeColors } from "../themes.config";

const colorPalette: Partial<PonaThemeColors> = {
  ...nextuiColorPalette({name: "default", baseColor: "#d4d4d8"}),
  ...nextuiColorPalette({name: "primary", baseColor: "#826b5e"}),
  ...nextuiColorPalette({name: "secondary", baseColor: "#ab886d"}),
  ...nextuiColorPalette({name: "success", baseColor: "#f0cccf"}),
  ...nextuiColorPalette({name: "warning", baseColor: "#a86e38"}),
  ...nextuiColorPalette({name: "danger", baseColor: "#8d493a"}),
  focus: "#705C53",
}

const chocolate: PonaConfigThemes = {
  "chocolate-light": {
    extend: "light",
    colors: {
      ...colorPalette,
      ...nextuiColorPalette({name: "foreground", baseColor: "#4e3b32"}),
      ...nextuiColorPalette({name: "playground-background", baseColor: "#fffbea"}),
    },
  },
  "chocolate-dark": {
    extend: "dark",
    colors: {
      ...colorPalette,
      ...nextuiColorPalette({name: "foreground", baseColor: "#c3a28e"}),
      ...nextuiColorPalette({name: "background", baseColor: "#4e3b32"}),
      ...nextuiColorPalette({name: "playground-background", baseColor: "#20140e"}),
    },
  },
}

export default chocolate;