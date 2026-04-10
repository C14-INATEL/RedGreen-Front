import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDailyLogin } from '@application/hooks/useDailyLogin';

interface DayReward {
  day: number;
  chips: number;
}

const rewards: DayReward[] = [
  { day: 1, chips: 50 },
  { day: 2, chips: 100 },
  { day: 3, chips: 150 },
  { day: 4, chips: 200 },
  { day: 5, chips: 250 },
  { day: 6, chips: 300 },
  { day: 7, chips: 350 },
];

interface DailyBonusPanelProps {
  IsOpen: boolean;
  IsLoggedIn: boolean;
  OnClose: () => void;
  MutateChips?: () => void;
}

const DailyBonusPanel = ({
  IsOpen,
  IsLoggedIn,
  OnClose,
  MutateChips,
}: DailyBonusPanelProps) => {
  const {
    ClaimDailyReward,
    IsLoading,
    Error,
    LastReward,
    DailyState,
    CanClaimToday,
    CurrentDay,
    CurrentDayIndex,
    ClaimedDays,
  } = useDailyLogin(IsLoggedIn);

  const HandleClaim = async () => {
    if (!CanClaimToday || IsLoading) return;

    const Reward = await ClaimDailyReward();

    if (Reward && MutateChips) {
      MutateChips();
    }
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

  const SafeCurrentIndex = Math.min(
    Math.max(CurrentDayIndex, 0),
    rewards.length - 1
  );
  const CurrentReward = rewards[SafeCurrentIndex];

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
              className="w-[92vw] max-w-5xl pointer-events-auto"
              style={{ zIndex: 60 }}
            >
              <div className="bg-secondary border-2 border-casino-gold/40 shadow-[6px_6px_0px_rgba(0,0,0,0.5)]">
                <div className="flex items-center gap-3 px-6 py-4 border-b-2 border-border/30 bg-[hsl(var(--accent))]/10">
                  <svg width="20" height="20" viewBox="0 0 16 16" fill="none">
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
                  <span className="font-display text-sm uppercase tracking-[0.2em] text-foreground/80 flex-1">
                    Bonus Diario
                  </span>
                  <span className="text-[10px] text-accent font-mono tracking-wider">
                    Dia {CurrentDay}/7
                  </span>
                  <button
                    onClick={OnClose}
                    className="text-muted-foreground/50 hover:text-foreground/70 transition-colors ml-2"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="p-6 grid grid-cols-7 gap-4">
                  {rewards.map((Day, I) => {
                    const IsClaimed = I < ClaimedDays;
                    const IsCurrent =
                      CanClaimToday === true
                        ? I === SafeCurrentIndex
                        : IsClaimed && I === SafeCurrentIndex;

                    return (
                      <motion.div
                        key={Day.day}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05 * I }}
                        className={`
                        flex flex-col items-center py-6 px-3 border-2 transition-all relative
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
                          className={`text-[18px] font-mono font-bold mb-3 ${
                            IsCurrent
                              ? 'text-accent'
                              : IsClaimed
                                ? 'text-casino-gold'
                                : 'text-muted-foreground/40'
                          }`}
                        >
                          {String(Day.day).padStart(2, '0')}
                        </span>

                        <div className="mb-3">
                          {IsClaimed ? (
                            <svg
                              width="32"
                              height="32"
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
                            <PixelChip size={32} />
                          )}
                        </div>

                        <span
                          className={`text-[13px] font-mono font-semibold ${
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

                <div className="px-6 pb-6">
                  {Error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mb-3 p-3 bg-red-500/20 border-2 border-red-500/40 text-red-400 text-sm font-mono"
                    >
                      {Error}
                    </motion.div>
                  )}

                  {LastReward !== null && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mb-3 p-3 bg-accent/20 border-2 border-accent/40 text-accent text-sm font-mono"
                    >
                      +{LastReward.toLocaleString('pt-BR')} fichas! Sequencia:{' '}
                      {DailyState?.DailyStreak ?? 0} dias
                    </motion.div>
                  )}

                  <button
                    onClick={HandleClaim}
                    disabled={
                      !DailyState || CanClaimToday === false || IsLoading
                    }
                    className={`
                    w-full py-4 font-display text-sm uppercase tracking-[0.2em] border-2 transition-all
                    shadow-[3px_3px_0px_rgba(0,0,0,0.4)]
                    ${
                      DailyState && CanClaimToday !== false && !IsLoading
                        ? 'bg-accent/20 border-accent text-accent hover:bg-accent/30 active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_rgba(0,0,0,0.4)]'
                        : 'bg-secondary/40 border-border/20 text-muted-foreground/30 cursor-not-allowed'
                    }
                  `}
                  >
                    {IsLoading ? (
                      'Resgatando...'
                    ) : !DailyState ? (
                      'Carregando bonus diario...'
                    ) : CanClaimToday === false ? (
                      'Bonus diario ja resgatado hoje'
                    ) : (
                      <>
                        Resgatar{' '}
                        <span className="font-mono font-semibold text-[13px] normal-case tracking-normal">
                          {CurrentReward.chips.toLocaleString('pt-BR')}
                        </span>{' '}
                        fichas
                      </>
                    )}
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
