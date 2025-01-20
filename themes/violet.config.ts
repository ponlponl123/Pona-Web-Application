import { PoanConfigThemes, PonaThemeColors } from "../themes.config";
import nextuiColorPalette from "./utils/nextui-color-palette-gen";

const colorPalette: Partial<PonaThemeColors> = {
  ...nextuiColorPalette({name: "default", baseColor: "#dbbdff"}),
  ...nextuiColorPalette({name: "primary", baseColor: "#a295f9"}),
  ...nextuiColorPalette({name: "secondary", baseColor: "#cec2ff"}),
  ...nextuiColorPalette({name: "success", baseColor: "#aac8a7"}),
  ...nextuiColorPalette({name: "warning", baseColor: "#edceb6"}),
  ...nextuiColorPalette({name: "danger", baseColor: "#d14d72"}),
  focus: "#A294F9",
}

const violet: PoanConfigThemes = {
  "violet-light": {
    extend: "light",
    colors: {
      ...colorPalette,
      ...nextuiColorPalette({name: "foreground", baseColor: "#3c324e"}),
      ...nextuiColorPalette({name: "playground-background", baseColor: "#f2eaff"}),
    },
  },
  "violet-dark": {
    extend: "dark",
    colors: {
      ...colorPalette,
      ...nextuiColorPalette({name: "foreground", baseColor: "#DBCBEB"}),
      ...nextuiColorPalette({name: "background", baseColor: "#16121C"}),
      ...nextuiColorPalette({name: "playground-background", baseColor: "#292236"}),
    },
  },
}

export default violet;