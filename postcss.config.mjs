/** @type {import('postcss-load-config').Config} */
const config = {
  plugins: {
    "@tailwindcss/postcss": {},
    "@csstools/postcss-color-mix-function": {
      preserve: true,
    },
    "@csstools/postcss-oklab-function": {
      preserve: true,
    },
  },
}

export default config
