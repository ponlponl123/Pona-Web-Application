import { BaseColors, ConfigTheme, ConfigThemes, ThemeColors } from "@heroui/react";
import { NextUIPalette } from "./themes/utils/nextui-color-palette-gen.ts";

import chocolate from "./themes/chocolate.config.ts";
import cupcake from "./themes/cupcake.config.ts";
import _default from "./themes/default.config.ts";
import hopeful from "./themes/hopeful.config.ts";
import latte from "./themes/latte.config.ts";
import nextui from "./themes/nextui.config.ts";
import redrose from "./themes/redrose.config.ts";
import violet from "./themes/violet.config.ts";
import winter from "./themes/winter.config.ts";

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