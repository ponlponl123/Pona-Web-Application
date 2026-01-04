import { nextui } from "@nextui-org/react";
import Typography from "@tailwindcss/typography";
import type { Config } from "tailwindcss";
import themes from "./themes.config.ts";

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
        "app-background": "var(--app-background)",
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
    Typography,
    nextui({
      prefix: "pona-app",
      addCommonColors: true,
      themes: themes,
    })
  ],
};
export default config;
