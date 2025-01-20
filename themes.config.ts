import { BaseColors, ConfigTheme, ConfigThemes, ThemeColors } from "@nextui-org/react";
import { NextUIPalette } from "./themes/utils/nextui-color-palette-gen";

import _default from "./themes/default.config";
import chocolate from "./themes/chocolate.config";
import latte from "./themes/latte.config";
import winter from "./themes/winter.config";
import violet from "./themes/violet.config";
import cupcake from "./themes/cupcake.config";
import nextui from "./themes/nextui.config";

export type PonaThemeColors = ThemeColors & BaseColors & {
  "playground-background": NextUIPalette;
}

export type PoanConfigTheme = ConfigTheme & {
  colors: Partial<PonaThemeColors>;
}

export type PoanConfigThemes = ConfigThemes & {
  [x: string]: PoanConfigTheme;
}

const themes: PoanConfigThemes = {
  ..._default,
  ...chocolate,
  ...latte,
  ...winter,
  ...violet,
  ...cupcake,
  ...nextui
}

export default themes;