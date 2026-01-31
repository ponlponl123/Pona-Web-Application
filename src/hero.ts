import plugin from 'tailwindcss/plugin';
import { heroui } from '@heroui/theme';
import themes from '../themes.config';

// Wrap HeroUI for Tailwind v4 compatibility
const heroUIPlugin = plugin(
  function ({ addBase, addUtilities, addComponents }) {
    // HeroUI will inject its styles through the original plugin
  },
  {
    // Pass through HeroUI's config
    ...heroui({
      prefix: 'pona-app',
      addCommonColors: true,
      themes: themes,
    }).config,
  }
);

// Re-export the original heroui for direct use
export default heroui({
  prefix: 'pona-app',
  addCommonColors: true,
  themes: themes,
});
