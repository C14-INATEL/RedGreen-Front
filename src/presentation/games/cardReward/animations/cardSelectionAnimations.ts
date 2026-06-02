import type { Variants } from 'framer-motion';

export const rewardCardSelectionVariants: Variants = {
  idle: {
    opacity: 1,
    scale: 1,
    y: 0,
    rotate: 0,
    transition: {
      duration: 0.22,
      ease: 'easeOut',
    },
  },
  dimmed: {
    opacity: 0.24,
    scale: 0.94,
    y: 0,
    rotate: 0,
    transition: {
      duration: 0.22,
      ease: 'easeOut',
    },
  },
  active: {
    opacity: 1,
    scale: 1.04,
    y: -4,
    rotate: 0,
    transition: {
      duration: 0.18,
      ease: [0.22, 1, 0.36, 1],
    },
  },
  hidden: {
    opacity: 0,
    scale: 0.98,
    transition: {
      duration: 0.16,
      ease: 'easeOut',
    },
  },
};

export const selectedCardOverlayTransition = {
  duration: 0.68,
  ease: [0.22, 1, 0.36, 1],
};

export const selectedCardOverlaySpring = {
  type: 'spring',
  stiffness: 220,
  damping: 24,
};
