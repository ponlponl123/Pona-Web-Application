import { PonaConfigThemes, PonaThemeColors } from "../themes.config";
import nextuiColorPalette from "./utils/nextui-color-palette-gen";

const colorPalette: Partial<PonaThemeColors> = {
  ...nextuiColorPalette({name: "primary", baseColor: "#FF640B"}),
  ...nextuiColorPalette({name: "secondary", baseColor: "#F0A04B"}),
  ...nextuiColorPalette({name: "success", baseColor: "#16C47F"}),
  ...nextuiColorPalette({name: "warning", baseColor: "#FFD65A"}),
  ...nextuiColorPalette({name: "danger", baseColor: "#F93827"}),
  focus: "#f2bfd2",
}

const hopeful: PonaConfigThemes = {
  "hopeful-light": {
    extend: "light",
    colors: {
      ...colorPalette,
      ...nextuiColorPalette({name: "foreground", baseColor: "#FF8900"}),
      ...nextuiColorPalette({name: "playground-background", baseColor: "#FFECDE"}),
    },
  },
  "hopeful-dark": {
    extend: "dark",
    colors: {
      ...colorPalette,
      ...nextuiColorPalette({name: "foreground", baseColor: "#FFB794"}),
      ...nextuiColorPalette({name: "background", baseColor: "#24160A"}),
      ...nextuiColorPalette({name: "playground-background", baseColor: "#381E02"}),
    },
  },
  'amoled-hopeful-dark': {
    extend: 'dark',
    colors: {
      ...colorPalette,
      ...nextuiColorPalette({name: "foreground", baseColor: "#FFB794"}),
      ...nextuiColorPalette({name: "background", baseColor: "#000000"}),
      ...nextuiColorPalette({name: "playground-background", baseColor: "#000000"}),
    },
  },
}

export default hopeful;