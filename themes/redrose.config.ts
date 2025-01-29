import { PonaConfigThemes, PonaThemeColors } from "../themes.config";
import nextuiColorPalette from "./utils/nextui-color-palette-gen";

const colorPalette: Partial<PonaThemeColors> = {
  ...nextuiColorPalette({name: "primary", baseColor: "#FF2B65"}),
  ...nextuiColorPalette({name: "secondary", baseColor: "#FF748B"}),
  ...nextuiColorPalette({name: "success", baseColor: "#5CB338"}),
  ...nextuiColorPalette({name: "warning", baseColor: "#FAB12F"}),
  ...nextuiColorPalette({name: "danger", baseColor: "#C62E2E"}),
  focus: "#FF2B65",
}

const redrose: PonaConfigThemes = {
  "red_rose-light": {
    extend: "light",
    colors: {
      ...colorPalette,
      ...nextuiColorPalette({name: "foreground", baseColor: "#FF0D5B"}),
      ...nextuiColorPalette({name: "playground-background", baseColor: "#FFD9DA"}),
    },
  },
  "red_rose-dark": {
    extend: "dark",
    colors: {
      ...colorPalette,
      ...nextuiColorPalette({name: "foreground", baseColor: "#FF899C"}),
      ...nextuiColorPalette({name: "background", baseColor: "#0D0307"}),
      ...nextuiColorPalette({name: "playground-background", baseColor: "#1F0610"}),
    },
  },
  'amoled-red_rose-dark': {
    extend: 'dark',
    colors: {
      ...colorPalette,
      ...nextuiColorPalette({name: "foreground", baseColor: "#FF899C"}),
      ...nextuiColorPalette({name: "background", baseColor: "#000000"}),
      ...nextuiColorPalette({name: "playground-background", baseColor: "#000000"}),
    },
  },
}

export default redrose;