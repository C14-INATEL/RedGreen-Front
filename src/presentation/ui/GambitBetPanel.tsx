import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type GambitBetPanelProps = {
  IsActive: boolean;
  CardPrice: number;
  TableMultiplier: number;
  MinimumCardsPurchased: number;
  MaxCardsPurchased: number;
};

export const GambitBetPanel = ({
  IsActive,
  CardPrice,
  TableMultiplier,
  MinimumCardsPurchased,
  MaxCardsPurchased,
}: GambitBetPanelProps) => {
  const [SelectedCards, SetSelectedCards] = useState(MinimumCardsPurchased);

  const TotalBet = SelectedCards * CardPrice;
  const Multiplier = (TableMultiplier * SelectedCards).toFixed(1);

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
                SetSelectedCards((prev) =>
                  Math.max(MinimumCardsPurchased, prev - 1)
                )
              }
              className="w-8 h-8 border border-white/20 text-white/60 hover:border-white/40 hover:text-white transition-colors text-lg"
            >
              -
            </button>
            <div
              className="w-32 bg-card border border-white/20 text-foreground text-[10px] px-3 py-2 text-center whitespace-nowrap overflow-hidden"
              style={{ fontFamily: '"Press Start 2P", monospace' }}
            >
              {SelectedCards} {SelectedCards === 1 ? 'carta' : 'cartas'}
            </div>
            <button
              onClick={() =>
                SetSelectedCards((prev) =>
                  Math.min(MaxCardsPurchased, prev + 1)
                )
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
