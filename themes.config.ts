import { BaseColors, ConfigTheme, ConfigThemes, ThemeColors } from "@nextui-org/react";
import { NextUIPalette } from "./themes/utils/nextui-color-palette-gen";

import _default from "./themes/default.config";
import chocolate from "./themes/chocolate.config";
import latte from "./themes/latte.config";
import winter from "./themes/winter.config";
import violet from "./themes/violet.config";
import cupcake from "./themes/cupcake.config";
import nextui from "./themes/nextui.config";
import hopeful from "./themes/hopeful.config";
import redrose from "./themes/redrose.config";

export type PonaThemeColors = ThemeColors & BaseColors & {
  "playground-background": NextUIPalette;
  "music-accent-color": NextUIPalette;
}

export type PoanConfigTheme = ConfigTheme & {
  colors: Partial<PonaThemeColors>;
}

export type PonaConfigThemes = ConfigThemes & {
  [x: string]: PoanConfigTheme;
}

const themes: PonaConfigThemes = {
  ..._default,
  ...chocolate,
  ...latte,
  ...winter,
  ...violet,
  ...cupcake,
  ...nextui,
  ...hopeful,
  ...redrose
}

export default themes;