import type { Config } from "tailwindcss";
import { nextui } from "@nextui-org/react";
import generateColorPalette from "@euax/color-palette-generator";

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
        // default: "var(--default)",
        primary: "var(--primary)",
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
            ...generateColorPalette({name: "primary", baseColor: "#feb9e7"}),
            ...generateColorPalette({name: "danger", baseColor: "#f31260"}),
            ...generateColorPalette({name: "foreground", baseColor: "#5c1f41"}),
          }
        },
        dark: {
          colors: {
            ...generateColorPalette({name: "primary", baseColor: "#feb9e7"}),
            ...generateColorPalette({name: "foreground", baseColor: "#3b212d"}),
          }
        },
        "chocolate-light": {
          extend: "light",
          colors: {
            ...generateColorPalette({name: "primary", baseColor: "#705C53"}),
            ...generateColorPalette({name: "foreground", baseColor: "#4f3b32"}),
          },
        },
        "chocolate-dark": {
          extend: "dark",
          colors: {
            ...generateColorPalette({name: "primary", baseColor: "#705C53"}),
            ...generateColorPalette({name: "foreground", baseColor: "#4f3b32"}),
          },
        },
        "latte-light": {
          extend: "light",
          colors: {
            ...generateColorPalette({name: "primary", baseColor: "#5D8736"}),
            ...generateColorPalette({name: "foreground", baseColor: "#A9C46C"}),
          },
        },
        "latte-dark": {
          extend: "dark",
          colors: {
            ...generateColorPalette({name: "primary", baseColor: "#5D8736"}),
            ...generateColorPalette({name: "foreground", baseColor: "#A9C46C"}),
          },
        },
        "nextui-light": {
          extend: "light",
          colors: {
            ...generateColorPalette({name: "foreground", baseColor: "#000000"}),
          },
        },
        "nextui-dark": {
          extend: "dark",
          colors: {
            ...generateColorPalette({name: "foreground", baseColor: "#ffffff"}),
          },
        }
      }
    })
  ],
};
export default config;
