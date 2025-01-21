import { PonaConfigThemes, PonaThemeColors } from "../themes.config";
import nextuiColorPalette from "./utils/nextui-color-palette-gen";

const colorPalette: Partial<PonaThemeColors> = {
  ...nextuiColorPalette({name: "default", baseColor: "#8a8a8a"}),
  ...nextuiColorPalette({name: "primary", baseColor: "#feb9e7"}),
  ...nextuiColorPalette({name: "secondary", baseColor: "#00a2ff"}),
  ...nextuiColorPalette({name: "success", baseColor: "#47ff9d"}),
  ...nextuiColorPalette({name: "warning", baseColor: "#ffb647"}),
  ...nextuiColorPalette({name: "danger", baseColor: "#d77979"}),
  ...nextuiColorPalette({name: "divider", baseColor: "#12121226"}),
  focus: "#0070f0",
}

const _default: PonaConfigThemes = {
  light: {
    colors: {
      ...colorPalette,
      ...nextuiColorPalette({name: "foreground", baseColor: "#171717"}),
      ...nextuiColorPalette({name: "background", baseColor: "#ffffff"}),
      ...nextuiColorPalette({name: "playground-background", baseColor: "#f2f2f2"}),
    },
  },
  dark: {
    colors: {
      ...colorPalette,
      ...nextuiColorPalette({name: "foreground", baseColor: "#ededed"}),
      ...nextuiColorPalette({name: "background", baseColor: "#0a0a0a"}),
      ...nextuiColorPalette({name: "playground-background", baseColor: "#171717"}),
    },
  },
}

export default _default;