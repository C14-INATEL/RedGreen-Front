import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

interface DayReward {
  day: number;
  chips: number;
  claimed: boolean;
}

const rewards: DayReward[] = [
  { day: 1, chips: 500, claimed: false },
  { day: 2, chips: 1000, claimed: false },
  { day: 3, chips: 2000, claimed: false },
  { day: 4, chips: 3000, claimed: false },
  { day: 5, chips: 5000, claimed: false },
  { day: 6, chips: 8000, claimed: false },
  { day: 7, chips: 15000, claimed: false },
];

interface DailyBonusPanelProps {
  IsOpen: boolean;
  OnClose: () => void;
}

const DailyBonusPanel = ({ IsOpen, OnClose }: DailyBonusPanelProps) => {
  const [Days, SetDays] = useState(rewards);
  const CurrentDay = Days.findIndex((d) => !d.claimed);
  const CanClaim = CurrentDay !== -1;

  const HandleClaim = () => {
    if (!CanClaim) return;
    SetDays((Prev) =>
      Prev.map((D, I) => (I === CurrentDay ? { ...D, claimed: true } : D))
    );
  };

  const PixelChip = ({ size = 20 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <rect x="4" y="2" width="8" height="2" fill="hsl(var(--cassino-gold))" />
      <rect x="2" y="4" width="12" height="8" fill="hsl(var(--cassino-gold))" />
      <rect x="4" y="12" width="8" height="2" fill="hsl(var(--cassino-gold))" />
      <rect
        x="7"
        y="5"
        width="2"
        height="6"
        fill="hsl(var(--accent-foreground) / 0.3)"
      />
    </svg>
  );

  return (
    <AnimatePresence>
      {IsOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50"
            onClick={OnClose}
          />

          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
              className="w-[92vw] max-w-2xl pointer-events-auto"
              style={{ zIndex: 60 }}
            >
              <div className="bg-secondary/95 border-2 border-casino-gold/40 shadow-[6px_6px_0px_rgba(0,0,0,0.5)]">
                <div className="flex items-center gap-2 px-5 py-3 border-b-2 border-border/30 bg-[hsl(var(--accent))]/10">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <rect
                      x="2"
                      y="6"
                      width="12"
                      height="2"
                      fill="hsl(var(--cassino-red))"
                    />
                    <rect
                      x="7"
                      y="2"
                      width="2"
                      height="4"
                      fill="hsl(var(--cassino-red))"
                    />
                    <rect
                      x="5"
                      y="3"
                      width="2"
                      height="2"
                      fill="hsl(var(--cassino-red))"
                    />
                    <rect
                      x="9"
                      y="3"
                      width="2"
                      height="2"
                      fill="hsl(var(--cassino-red))"
                    />
                    <rect
                      x="3"
                      y="8"
                      width="10"
                      height="6"
                      fill="hsl(var(--cassino-gold))"
                    />
                    <rect
                      x="7"
                      y="8"
                      width="2"
                      height="6"
                      fill="hsl(var(--cassino-red))"
                    />
                  </svg>
                  <span className="font-display text-xs uppercase tracking-[0.2em] text-foreground/80 flex-1">
                    Bônus Diário
                  </span>
                  <span className="text-[8px] text-accent font-display tracking-wider">
                    Dia {CurrentDay !== -1 ? CurrentDay + 1 : 7}/7
                  </span>
                  <button
                    onClick={OnClose}
                    className="text-muted-foreground/50 hover:text-foreground/70 transition-colors ml-2"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-4 grid grid-cols-7 gap-2.5">
                  {Days.map((Day, I) => {
                    const IsCurrent = I === CurrentDay;
                    const IsClaimed = Day.claimed;

                    return (
                      <motion.div
                        key={Day.day}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05 * I }}
                        className={`
                        flex flex-col items-center py-4 px-2 border-2 transition-all relative
                        ${
                          IsCurrent
                            ? 'border-accent bg-accent/15 shadow-[0_0_12px_hsl(var(--accent)/0.3)]'
                            : IsClaimed
                              ? 'border-casino-gold/30 bg-casino-gold/10'
                              : 'border-border/20 bg-secondary/40 opacity-50'
                        }
                      `}
                      >
                        <span
                          className={`text-[11px] font-display font-bold mb-2 ${
                            IsCurrent
                              ? 'text-accent'
                              : IsClaimed
                                ? 'text-casino-gold'
                                : 'text-muted-foreground/40'
                          }`}
                        >
                          {String(Day.day).padStart(2, '0')}
                        </span>

                        <div className="mb-2">
                          {IsClaimed ? (
                            <svg
                              width="28"
                              height="28"
                              viewBox="0 0 16 16"
                              fill="none"
                            >
                              <rect
                                x="3"
                                y="6"
                                width="2"
                                height="2"
                                fill="hsl(var(--accent))"
                              />
                              <rect
                                x="5"
                                y="8"
                                width="2"
                                height="2"
                                fill="hsl(var(--accent))"
                              />
                              <rect
                                x="7"
                                y="6"
                                width="2"
                                height="2"
                                fill="hsl(var(--accent))"
                              />
                              <rect
                                x="9"
                                y="4"
                                width="2"
                                height="2"
                                fill="hsl(var(--accent))"
                              />
                              <rect
                                x="11"
                                y="2"
                                width="2"
                                height="2"
                                fill="hsl(var(--accent))"
                              />
                            </svg>
                          ) : (
                            <PixelChip size={28} />
                          )}
                        </div>

                        <span
                          className={`text-[9px] font-display ${
                            IsCurrent
                              ? 'text-accent'
                              : IsClaimed
                                ? 'text-casino-gold/70'
                                : 'text-muted-foreground/40'
                          }`}
                        >
                          {Day.chips >= 1000
                            ? (Day.chips / 1000).toFixed(
                                Day.chips % 1000 === 0 ? 0 : 1
                              ) + 'k'
                            : Day.chips}
                        </span>

                        {IsCurrent && (
                          <div className="absolute -top-1 -right-1 w-2 h-2 bg-accent animate-pulse" />
                        )}
                      </motion.div>
                    );
                  })}
                </div>

                <div className="px-4 pb-4">
                  <button
                    onClick={HandleClaim}
                    disabled={!CanClaim}
                    className={`
                    w-full py-3 font-display text-xs uppercase tracking-[0.2em] border-2 transition-all
                    shadow-[3px_3px_0px_rgba(0,0,0,0.4)]
                    ${
                      CanClaim
                        ? 'bg-accent/20 border-accent text-accent hover:bg-accent/30 active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_rgba(0,0,0,0.4)]'
                        : 'bg-secondary/40 border-border/20 text-muted-foreground/30 cursor-not-allowed'
                    }
                  `}
                  >
                    {CanClaim
                      ? `Resgatar ${Days[CurrentDay].chips.toLocaleString('pt-BR')} fichas`
                      : 'Todos os bônus resgatados!'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default DailyBonusPanel;
