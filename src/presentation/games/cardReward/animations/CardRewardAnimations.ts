import type { Variants } from 'framer-motion';

export const rewardCardEntranceVariants: Variants = {
  enter: (index: number) => ({
    opacity: 1,
    rotate: 0,
    y: 0,
    transition: {
      delay: index * 0.06,
      duration: 0.34,
      ease: 'easeOut',
    },
  }),
  exit: {
    opacity: 0,
    rotate: 0,
    y: 8,
    transition: {
      duration: 0.14,
      ease: 'easeInOut',
    },
  },
  initial: (index: number) => ({
    opacity: 0,
    rotate: index % 2 === 0 ? -2 : 2,
    y: 20,
  }),
};

export const rewardCardHoverAnimation = {
  scale: 1.018,
  y: -4,
};

export const rewardCardTapAnimation = {
  scale: 0.995,
};

export const rewardSelectionFocusVariants: Variants = {
  idle: {
    opacity: 1,
    scale: 1,
    y: 0,
  },
  resolvingFaded: {
    opacity: 0,
    scale: 0.97,
    transition: {
      duration: 0.18,
      ease: 'easeOut',
    },
  },
  resolvingSelected: {
    opacity: 1,
    scale: 1.02,
    y: -6,
    transition: {
      duration: 0.22,
      ease: 'easeOut',
    },
  },
};
