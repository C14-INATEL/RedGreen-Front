import { AnimatePresence, motion } from 'framer-motion';
import { useEffect } from 'react';
import { getGambitEffectPresentationFromViewModel } from './gambitEffectPresentation';
import type { GambitRevealNature } from './gambitRevealNature';
import { classifyGambitRevealNature } from './gambitRevealNature';
import type { GambitVisualCard } from './gambitTypes';

type GambitRevealCinematicProps = {
  card: GambitVisualCard | null;
  durationMs?: number;
  onComplete: () => void;
};

const natureStyles: Record<
  GambitRevealNature,
  {
    accentClassName: string;
    label: string;
    panelClassName: string;
    pointsClassName: string;
  }
> = {
  bad: {
    accentClassName: 'bg-[#f06a3d]',
    label: 'Carta Ruim',
    panelClassName:
      'border-[#f06a3d] bg-[rgba(64,14,16,0.92)] shadow-[0_0_38px_rgba(240,106,61,0.42)]',
    pointsClassName: 'text-[#ffb19a]',
  },
  good: {
    accentClassName: 'bg-[#55d879]',
    label: 'Carta Boa',
    panelClassName:
      'border-[#55d879] bg-[rgba(10,47,28,0.92)] shadow-[0_0_38px_rgba(85,216,121,0.38)]',
    pointsClassName: 'text-[#abffc0]',
  },
  neutral: {
    accentClassName: 'bg-[#e9d79f]',
    label: 'Carta Neutra',
    panelClassName:
      'border-[#e9d79f] bg-[rgba(34,31,21,0.92)] shadow-[0_0_34px_rgba(233,215,159,0.32)]',
    pointsClassName: 'text-[#fff2c4]',
  },
};

const formatPoints = (points: number | null) => {
  if (points == null) {
    return 'EFEITO';
  }

  if (points > 0) {
    return `+${points}`;
  }

  return String(points);
};

export const GambitRevealCinematic = ({
  card,
  durationMs = 1100,
  onComplete,
}: GambitRevealCinematicProps) => {
  const nature = classifyGambitRevealNature(card);
  const styles = natureStyles[nature];
  const effectPresentation = card?.effect
    ? getGambitEffectPresentationFromViewModel(card.effect)
    : null;

  useEffect(() => {
    if (!card) {
      return undefined;
    }

    const timeoutId = window.setTimeout(onComplete, durationMs);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [card, durationMs, onComplete]);

  return (
    <AnimatePresence>
      {card ? (
        <motion.div
          animate={{ opacity: 1, scale: 1 }}
          aria-live="polite"
          className="pointer-events-none fixed inset-0 z-[90] flex items-center justify-center bg-black/30 px-5"
          data-nature={nature}
          data-testid="gambit-reveal-cinematic"
          exit={{ opacity: 0, scale: 0.98 }}
          initial={{ opacity: 0, scale: 0.96 }}
          role="status"
        >
          <motion.div
            animate={{ y: 0, rotate: 0 }}
            className={`relative w-[min(82vw,320px)] border-4 px-5 py-5 text-center pixel-shadow ${styles.panelClassName}`}
            initial={{ y: 16, rotate: -1.5 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
          >
            <span
              className={`absolute left-3 top-3 h-3 w-3 ${styles.accentClassName}`}
            />
            <span
              className={`absolute right-3 top-3 h-3 w-3 ${styles.accentClassName}`}
            />

            <p className="font-display text-xs font-bold uppercase tracking-widest text-[#fff6d8]">
              {styles.label}
            </p>

            <strong
              className={`mt-4 block font-mono text-4xl font-bold leading-none ${styles.pointsClassName}`}
            >
              {formatPoints(card.points)}
            </strong>

            {effectPresentation ? (
              <div className="mt-4 flex flex-col items-center gap-2">
                <img
                  alt={effectPresentation.title}
                  className="h-24 w-24 object-contain drop-shadow-[4px_4px_0_rgba(0,0,0,0.5)]"
                  src={effectPresentation.spritePath}
                  style={{ imageRendering: 'pixelated' }}
                />
                <span className="font-display text-sm font-bold uppercase leading-4 text-[#fff6d8]">
                  {effectPresentation.title}
                </span>
              </div>
            ) : null}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};
