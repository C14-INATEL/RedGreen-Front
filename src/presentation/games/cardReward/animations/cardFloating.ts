type FloatingCardAnimation = {
  transition:
    | {
        duration: number;
        ease: 'easeInOut';
        repeat: number;
        repeatType: 'mirror';
      }
    | {
        duration: number;
        ease: 'easeOut';
      };
  y: number | number[];
};

const FLOATING_AMPLITUDES = [5, 8, 6] as const;
const FLOATING_DURATIONS = [3.2, 3.8, 2.9] as const;
const FLOATING_DRIFT_OFFSETS = [0, -1, 1] as const;

export const getFloatingCardAnimation = (
  index: number,
  isFloatingEnabled: boolean
): FloatingCardAnimation => {
  if (!isFloatingEnabled) {
    return {
      transition: {
        duration: 0.24,
        ease: 'easeOut',
      },
      y: 0,
    };
  }

  const normalizedIndex =
    ((index % FLOATING_AMPLITUDES.length) + FLOATING_AMPLITUDES.length) %
    FLOATING_AMPLITUDES.length;
  const amplitude = FLOATING_AMPLITUDES[normalizedIndex] ?? 6;
  const duration = FLOATING_DURATIONS[normalizedIndex] ?? 3.4;
  const driftOffset = FLOATING_DRIFT_OFFSETS[normalizedIndex] ?? 0;

  return {
    transition: {
      duration,
      ease: 'easeInOut',
      repeat: Number.POSITIVE_INFINITY,
      repeatType: 'mirror',
    },
    y: [0, -amplitude, driftOffset, amplitude * 0.5, 0],
  };
};
