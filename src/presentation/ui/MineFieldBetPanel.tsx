import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const CARDS_TO_MULTIPLIER: Record<number, number> = {
  1: 1.1,
  2: 1.2,
  3: 1.5,
  4: 1.7,
  5: 2.0,
  6: 2.3,
  7: 3.0,
  8: 3.5,
  9: 4.0,
  10: 5.0,
  11: 6.0,
  12: 7.0,
  13: 8.0,
  14: 9.0,
  15: 10.0,
  16: 12.0,
  17: 15.0,
  18: 20.0,
  19: 30.0,
  20: 50.0,
};

const CHIPS_PER_CARD = 5;
const MIN_CARDS = 1;
const MAX_CARDS = 20;

type MinefieldBetPanelProps = {
  IsActive: boolean;
};

export const MinefieldBetPanel = ({ IsActive }: MinefieldBetPanelProps) => {
  const [SelectedCards, SetSelectedCards] = useState(1);

  const TotalBet = SelectedCards * CHIPS_PER_CARD;
  const Multiplier = CARDS_TO_MULTIPLIER[SelectedCards];

  return (
    <AnimatePresence>
      {IsActive && (
        <motion.div
          initial={{ opacity: 0, x: -60 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -60 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col gap-4 bg-card/60 backdrop-blur-sm pixel-border px-5 py-4 w-58"
        >
          <p
            className="text-[8px] uppercase text-white/50 tracking-widest"
            style={{ fontFamily: '"Press Start 2P", monospace' }}
          >
            Quantidade
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                SetSelectedCards((prev) => Math.max(MIN_CARDS, prev - 1))
              }
              className="w-8 h-8 border border-white/20 text-white/60 hover:border-white/40 hover:text-white transition-colors text-lg"
            >
              −
            </button>
            <div
              className="w-32 bg-card border border-white/20 text-foreground text-[10px] px-3 py-2 text-center whitespace-nowrap overflow-hidden"
              style={{ fontFamily: '"Press Start 2P", monospace' }}
            >
              {SelectedCards} {SelectedCards === 1 ? 'carta' : 'cartas'}
            </div>
            <button
              onClick={() =>
                SetSelectedCards((prev) => Math.min(MAX_CARDS, prev + 1))
              }
              className="w-8 h-8 border border-white/20 text-white/60 hover:border-white/40 hover:text-white transition-colors text-lg"
            >
              +
            </button>
          </div>

          <div className="border-t border-white/10 pt-3 flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <span
                className="text-[8px] uppercase text-white/50"
                style={{ fontFamily: '"Press Start 2P", monospace' }}
              >
                Aposta
              </span>
              <span
                className="text-[10px] text-cassino-gold"
                style={{ fontFamily: '"Press Start 2P", monospace' }}
              >
                {TotalBet}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span
                className="text-[8px] uppercase text-white/50"
                style={{ fontFamily: '"Press Start 2P", monospace' }}
              >
                Multi
              </span>
              <span
                className="text-[10px] text-[hsl(120,50%,45%)]"
                style={{ fontFamily: '"Press Start 2P", monospace' }}
              >
                {Multiplier}×
              </span>
            </div>
          </div>

          <button
            className="w-full border-2 border-[hsl(120,50%,35%)] bg-[hsl(120,50%,35%)]/20 py-3 text-[9px] uppercase text-[hsl(120,50%,45%)] hover:bg-[hsl(120,50%,35%)]/30 transition-colors mt-2"
            style={{ fontFamily: '"Press Start 2P", monospace' }}
          >
            Confirmar
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
