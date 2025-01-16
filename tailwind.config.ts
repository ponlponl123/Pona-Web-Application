import type { Config } from "tailwindcss";
import { nextui } from "@nextui-org/react";
import generateColorPalette, { Palette } from "@euax/color-palette-generator";

interface NextUIPalette extends Palette {
  [key: string]: {
    DEFAULT?: string;
    foreground?: string;
    50: string;
    100: string;
    200: string;
    300: string;
    400: string;
    500: string;
    600: string;
    700: string;
    800: string;
    900: string;
  };
}

const nextuiColorPalette = ({name, baseColor}: {name: string, baseColor: string}) => {
  const colorPalette = generateColorPalette({name, baseColor}) as NextUIPalette;
  // add DEFAULT and foreground to colorPalette
  colorPalette[name].DEFAULT = baseColor;
  colorPalette[name].foreground = colorPalette[name][900];

  return colorPalette;
}

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/styles/themes.css",
    "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        "app-background": "var(--app-background)",
        // default: "var(--default)",
        // primary: "var(--primary)",
        secondary: "var(--secondary)",
        success: "var(--success)",
        warning: "var(--warning)",
        danger: "var(--danger)",
        divider: "var(--divider)",
        focus: "var(--focus)",
      },
      screens: {
        'miniscreen': '480px',
        'tablet': '640px',
        'laptop': '1024px',
        'desktop': '1280px',
      },
    },
  },
  darkMode: "class",
  plugins: [
    nextui({
      prefix: "pona-app",
      addCommonColors: true,
      themes: {
        light: {
          colors: {
            ...nextuiColorPalette({name: "primary", baseColor: "#feb9e7"}),
            ...nextuiColorPalette({name: "danger", baseColor: "#f31260"}),
            ...nextuiColorPalette({name: "foreground", baseColor: "#5c1f41"}),
            focus: "#F182F6",
          }
        },
        dark: {
          colors: {
            ...nextuiColorPalette({name: "primary", baseColor: "#feb9e7"}),
            ...nextuiColorPalette({name: "foreground", baseColor: "#3b212d"}),
            focus: "#feb9e7",
          }
        },
        "chocolate-light": {
          extend: "light",
          colors: {
            ...nextuiColorPalette({name: "primary", baseColor: "#705C53"}),
            ...nextuiColorPalette({name: "foreground", baseColor: "#4f3b32"}),
            focus: "#705C53",
          },
        },
        "chocolate-dark": {
          extend: "dark",
          colors: {
            ...nextuiColorPalette({name: "primary", baseColor: "#826b5e"}),
            ...nextuiColorPalette({name: "foreground", baseColor: "#4f3b32"}),
            focus: "#705C53",
          },
        },
        "latte-light": {
          extend: "light",
          colors: {
            ...nextuiColorPalette({name: "primary", baseColor: "#5D8736"}),
            ...nextuiColorPalette({name: "foreground", baseColor: "#A9C46C"}),
            focus: "#5D8736",
          },
        },
        "latte-dark": {
          extend: "dark",
          colors: {
            ...nextuiColorPalette({name: "primary", baseColor: "#5D8736"}),
            ...nextuiColorPalette({name: "foreground", baseColor: "#A9C46C"}),
            focus: "#5D8736",
          },
        },
        "winter-light": {
          extend: "light",
          colors: {
            ...nextuiColorPalette({name: "primary", baseColor: "#618dc2"}),
            ...nextuiColorPalette({name: "foreground", baseColor: "#32424e"}),
            focus: "#618dc2",
          },
        },
        "violet-light": {
          extend: "light",
          colors: {
            ...nextuiColorPalette({name: "primary", baseColor: "#A294F9"}),
            ...nextuiColorPalette({name: "foreground", baseColor: "#7F669D"}),
            focus: "#A294F9",
          },
        },
        "cupcake-light": {
          extend: "light",
          colors: {
            ...nextuiColorPalette({name: "primary", baseColor: "#f2bfd2"}),
            ...nextuiColorPalette({name: "foreground", baseColor: "#41343e"}),
            focus: "#f2bfd2",
          },
        },
        "cupcake-dark": {
          extend: "dark",
          colors: {
            ...nextuiColorPalette({name: "primary", baseColor: "#f2bfd2"}),
            ...nextuiColorPalette({name: "foreground", baseColor: "#ffeef4"}),
            focus: "#f2bfd2",
          },
        },
        "nextui-light": {
          extend: "light",
          colors: {
            // ...nextuiColorPalette({name: "foreground", baseColor: "#006FEE"}),
            focus: "#5D8736",
          },
        },
        "nextui-dark": {
          extend: "dark",
          colors: {
            // ...nextuiColorPalette({name: "foreground", baseColor: "#006FEE"}),
            focus: "#5D8736",
          },
        }
      }
    })
  ],
};
export default config;
