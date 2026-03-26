import { Variants } from 'framer-motion';

export const motion_card: Variants = {
  offscreen: {
    x: -100,
    opacity: 0,
  },
  onscreen: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 150,
      damping: 15,
    },
  },
};
