import { PonaConfigThemes, PonaThemeColors } from "../themes.config";
import nextuiColorPalette from "./utils/nextui-color-palette-gen.ts";

const colorPalette: Partial<PonaThemeColors> = {
  // ...nextuiColorPalette({name: "default", baseColor: "#e3cece"}),
  ...nextuiColorPalette({name: "primary", baseColor: "#f2c0d2"}),
  ...nextuiColorPalette({name: "secondary", baseColor: "#d5b4b4"}),
  ...nextuiColorPalette({name: "success", baseColor: "#e3f2c0"}),
  ...nextuiColorPalette({name: "warning", baseColor: "#f8caa5"}),
  ...nextuiColorPalette({name: "danger", baseColor: "#ff8585"}),
  focus: "#f2bfd2",
}

const cupcake: PonaConfigThemes = {
  "cupcake-light": {
    extend: "light",
    colors: {
      ...colorPalette,
      ...nextuiColorPalette({name: "foreground", baseColor: "#41343e"}),
      ...nextuiColorPalette({name: "playground-background", baseColor: "#ffeafa"}),
    },
  },
  "cupcake-dark": {
    extend: "dark",
    colors: {
      ...colorPalette,
      ...nextuiColorPalette({name: "foreground", baseColor: "#e3acbf"}),
      ...nextuiColorPalette({name: "background", baseColor: "#20131a"}),
      ...nextuiColorPalette({name: "playground-background", baseColor: "#2c2028"}),
    },
  },
  'amoled-cupcake-dark': {
    extend: 'dark',
    colors: {
      ...colorPalette,
      ...nextuiColorPalette({name: "foreground", baseColor: "#e3acbf"}),
      ...nextuiColorPalette({name: "background", baseColor: "#000000"}),
      ...nextuiColorPalette({name: "playground-background", baseColor: "#000000"}),
    },
  },
}

export default cupcake;