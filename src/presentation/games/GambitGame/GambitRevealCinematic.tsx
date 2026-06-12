import { AnimatePresence, motion } from 'framer-motion';
import { getGambitEffectPresentationFromViewModel } from './gambitEffectPresentation';
import { classifyGambitRevealNature } from './gambitRevealNature';
import type { GambitVisualCard } from './gambitTypes';

type GambitRevealCinematicProps = {
  card: GambitVisualCard | null;
  onComplete: () => void;
};

type RevealPalette = {
  badgeTextColor: string;
  borderColor: string;
  buttonBackground: string;
  buttonTextColor: string;
  glowColor: string;
  headingColor: string;
  innerBorderColor: string;
  panelBackground: string;
};

const REVEAL_PALETTES: RevealPalette[] = [
  {
    badgeTextColor: '#ffd8cc',
    borderColor: '#f06a3d',
    buttonBackground: 'rgba(118, 28, 22, 0.96)',
    buttonTextColor: '#fff0ea',
    glowColor: 'rgba(240, 106, 61, 0.34)',
    headingColor: '#ffd9cf',
    innerBorderColor: 'rgba(255, 220, 210, 0.32)',
    panelBackground:
      'linear-gradient(180deg, rgba(106, 24, 18, 0.96) 0%, rgba(46, 10, 8, 0.99) 100%)',
  },
  {
    badgeTextColor: '#fff1b6',
    borderColor: '#e9d79f',
    buttonBackground: 'rgba(110, 88, 22, 0.96)',
    buttonTextColor: '#fff6d8',
    glowColor: 'rgba(233, 215, 159, 0.3)',
    headingColor: '#fff3c8',
    innerBorderColor: 'rgba(255, 244, 206, 0.28)',
    panelBackground:
      'linear-gradient(180deg, rgba(108, 86, 18, 0.96) 0%, rgba(52, 40, 9, 0.99) 100%)',
  },
  {
    badgeTextColor: '#cffff1',
    borderColor: '#55d879',
    buttonBackground: 'rgba(16, 86, 44, 0.96)',
    buttonTextColor: '#e5fff0',
    glowColor: 'rgba(85, 216, 121, 0.3)',
    headingColor: '#d8ffe3',
    innerBorderColor: 'rgba(217, 255, 228, 0.28)',
    panelBackground:
      'linear-gradient(180deg, rgba(18, 92, 48, 0.96) 0%, rgba(8, 38, 20, 0.99) 100%)',
  },
  {
    badgeTextColor: '#d9f8ff',
    borderColor: '#77d9ff',
    buttonBackground: 'rgba(18, 92, 118, 0.96)',
    buttonTextColor: '#ebfbff',
    glowColor: 'rgba(119, 217, 255, 0.3)',
    headingColor: '#def8ff',
    innerBorderColor: 'rgba(220, 248, 255, 0.28)',
    panelBackground:
      'linear-gradient(180deg, rgba(17, 90, 116, 0.96) 0%, rgba(7, 38, 50, 0.99) 100%)',
  },
  {
    badgeTextColor: '#d9e2ff',
    borderColor: '#4a72ff',
    buttonBackground: 'rgba(21, 37, 112, 0.96)',
    buttonTextColor: '#eef2ff',
    glowColor: 'rgba(74, 114, 255, 0.3)',
    headingColor: '#dfe7ff',
    innerBorderColor: 'rgba(219, 228, 255, 0.26)',
    panelBackground:
      'linear-gradient(180deg, rgba(18, 29, 104, 0.97) 0%, rgba(9, 14, 44, 0.99) 100%)',
  },
  {
    badgeTextColor: '#eed9ff',
    borderColor: '#b26dff',
    buttonBackground: 'rgba(76, 26, 116, 0.96)',
    buttonTextColor: '#f7ecff',
    glowColor: 'rgba(178, 109, 255, 0.3)',
    headingColor: '#f0dcff',
    innerBorderColor: 'rgba(241, 220, 255, 0.26)',
    panelBackground:
      'linear-gradient(180deg, rgba(78, 25, 122, 0.97) 0%, rgba(31, 11, 49, 0.99) 100%)',
  },
  {
    badgeTextColor: '#ffe4c9',
    borderColor: '#ff9c41',
    buttonBackground: 'rgba(122, 50, 14, 0.96)',
    buttonTextColor: '#fff1e3',
    glowColor: 'rgba(255, 156, 65, 0.3)',
    headingColor: '#ffe6cb',
    innerBorderColor: 'rgba(255, 230, 205, 0.26)',
    panelBackground:
      'linear-gradient(180deg, rgba(124, 51, 12, 0.97) 0%, rgba(52, 21, 6, 0.99) 100%)',
  },
  {
    badgeTextColor: '#f4f4f5',
    borderColor: '#2f2f35',
    buttonBackground: 'rgba(36, 36, 42, 0.96)',
    buttonTextColor: '#f6f6f7',
    glowColor: 'rgba(255, 255, 255, 0.12)',
    headingColor: '#f5f5f5',
    innerBorderColor: 'rgba(255, 255, 255, 0.14)',
    panelBackground:
      'linear-gradient(180deg, rgba(34, 34, 38, 0.98) 0%, rgba(10, 10, 12, 0.99) 100%)',
  },
];

const formatPoints = (points: number | null) => {
  if (points == null) {
    return 'EFEITO';
  }

  if (points > 0) {
    return `+${points}`;
  }

  return String(points);
};

const getRevealPaletteKey = (card: GambitVisualCard | null) =>
  card
    ? `${card.id}:${card.effect ?? 'none'}:${card.points ?? 'none'}:${card.position}`
    : 'gambit-default';

const getRevealPaletteForCard = (card: GambitVisualCard | null) => {
  const paletteKey = getRevealPaletteKey(card);
  let hash = 0;

  for (let index = 0; index < paletteKey.length; index += 1) {
    hash = (hash * 31 + paletteKey.charCodeAt(index)) >>> 0;
  }

  return REVEAL_PALETTES[hash % REVEAL_PALETTES.length] ?? REVEAL_PALETTES[0];
};

export const GambitRevealCinematic = ({
  card,
  onComplete,
}: GambitRevealCinematicProps) => {
  const nature = classifyGambitRevealNature(card);
  const effectPresentation = card?.effect
    ? getGambitEffectPresentationFromViewModel(card.effect)
    : null;
  const isVisible = Boolean(card && effectPresentation);
  const revealPalette = getRevealPaletteForCard(card);

  return (
    <AnimatePresence>
      {isVisible && card && effectPresentation ? (
        <motion.div
          animate={{ opacity: 1 }}
          aria-label={`Carta revelada ${effectPresentation.title}`}
          aria-modal="true"
          className="fixed inset-0 z-[90] flex items-center justify-center overflow-hidden bg-[rgba(4,8,7,0.9)] px-5 py-10"
          data-nature={nature}
          data-testid="gambit-reveal-cinematic"
          exit={{ opacity: 0 }}
          initial={{ opacity: 0 }}
          role="dialog"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.06)_0%,transparent_42%),linear-gradient(to_bottom,rgba(255,255,255,0.03)_0%,rgba(0,0,0,0.3)_100%)]" />

          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="relative z-10 flex w-full max-w-md flex-col items-center text-center"
            initial={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            <span
              className="font-display text-[11px] font-bold uppercase tracking-[0.34em]"
              data-nature={nature}
              style={{
                color: revealPalette.headingColor,
                textShadow: '2px 2px 0 rgba(18,12,5,0.85)',
              }}
            >
              Carta Revelada
            </span>

            <motion.div
              animate={{ opacity: 1, scale: 1, y: 0, rotate: 0 }}
              className="relative mt-6 w-[min(82vw,320px)] rounded-[20px] border-[4px] px-4 py-4"
              initial={{ opacity: 0, scale: 0.82, y: 34, rotate: -2.5 }}
              style={{
                background: revealPalette.panelBackground,
                borderColor: revealPalette.borderColor,
                boxShadow: `0 0 42px ${revealPalette.glowColor}, 8px 8px 0 rgba(0,0,0,0.48)`,
              }}
              transition={{ duration: 0.36, ease: [0.2, 0.9, 0.26, 1] }}
            >
              <motion.div
                animate={{
                  opacity: [0.34, 0.56, 0.42],
                  scale: [0.94, 1.05, 0.98],
                }}
                className="absolute inset-[-10%] rounded-full blur-3xl"
                style={{ backgroundColor: revealPalette.glowColor }}
                transition={{
                  duration: 2.6,
                  ease: 'easeInOut',
                  repeat: Number.POSITIVE_INFINITY,
                  repeatType: 'mirror',
                }}
              />

              <div
                className="relative z-[1] rounded-[14px] border-[3px] bg-black/18 px-3 py-3"
                style={{ borderColor: revealPalette.innerBorderColor }}
              >
                <span
                  className="absolute right-5 top-5 z-10 font-mono text-[11px] font-bold tracking-[0.12em]"
                  data-testid="gambit-reveal-points"
                  style={{
                    color: revealPalette.badgeTextColor,
                    textShadow: '2px 2px 0 rgba(8,6,3,0.78)',
                  }}
                >
                  {formatPoints(card.points)}
                </span>

                <motion.img
                  alt={effectPresentation.title}
                  animate={{ y: [0, -8, -3, 0] }}
                  className="relative z-[1] block h-auto w-full select-none object-contain drop-shadow-[10px_14px_0_rgba(10,8,4,0.5)]"
                  draggable={false}
                  src={effectPresentation.spritePath}
                  style={{ imageRendering: 'pixelated' }}
                  transition={{
                    duration: 3.4,
                    ease: 'easeInOut',
                    repeat: Number.POSITIVE_INFINITY,
                    repeatType: 'mirror',
                  }}
                />
              </div>
            </motion.div>

            <button
              className="mt-6 w-full max-w-[220px] border-[3px] px-4 py-3 font-display text-xs font-bold uppercase tracking-[0.24em] pixel-border shadow-[4px_4px_0_rgba(0,0,0,0.55)] transition-all hover:translate-y-[-2px] hover:brightness-110 hover:shadow-[6px_6px_0_rgba(0,0,0,0.55)]"
              onClick={onComplete}
              style={{
                backgroundColor: revealPalette.buttonBackground,
                borderColor: revealPalette.borderColor,
                color: revealPalette.buttonTextColor,
              }}
              type="button"
            >
              Pular
            </button>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};
