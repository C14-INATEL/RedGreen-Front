import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { UseDailyLogin } from '@application/hooks/useDailyLogin';

interface DayReward {
  Day: number;
  Chips: number;
}

const Rewards: DayReward[] = [
  { Day: 1, Chips: 50 },
  { Day: 2, Chips: 100 },
  { Day: 3, Chips: 150 },
  { Day: 4, Chips: 200 },
  { Day: 5, Chips: 250 },
  { Day: 6, Chips: 300 },
  { Day: 7, Chips: 350 },
];

interface DailyBonusPanelProps {
  IsOpen: boolean;
  IsLoggedIn?: boolean;
  OnClose: () => void;
  MutateChips?: () => void;
}

const PixelChip = ({ Size = 20 }: { Size?: number }) => (
  <svg width={Size} height={Size} viewBox="0 0 16 16" fill="none">
    <rect x="4" y="2" width="8" height="2" fill="hsl(var(--cassino-gold))" />
    <rect x="2" y="4" width="12" height="8" fill="hsl(var(--cassino-gold))" />
    <rect x="4" y="12" width="8" height="2" fill="hsl(var(--cassino-gold))" />
    <rect x="7" y="5" width="2" height="6" fill="hsl(var(--accent-foreground) / 0.3)" />
  </svg>
);

const PixelCheck = () => (
  <svg width="32" height="32" viewBox="0 0 16 16" fill="none">
    <rect x="3" y="6" width="2" height="2" fill="hsl(var(--accent))" />
    <rect x="5" y="8" width="2" height="2" fill="hsl(var(--accent))" />
    <rect x="7" y="6" width="2" height="2" fill="hsl(var(--accent))" />
    <rect x="9" y="4" width="2" height="2" fill="hsl(var(--accent))" />
    <rect x="11" y="2" width="2" height="2" fill="hsl(var(--accent))" />
  </svg>
);

const DailyBonusPanel = ({
  IsOpen,
  IsLoggedIn = false,
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
  } = UseDailyLogin(IsLoggedIn);

  const HandleClaim = async () => {
    if (!CanClaimToday || IsLoading) return;
    const Reward = await ClaimDailyReward();
    if (Reward && MutateChips) MutateChips();
  };

  const SafeCurrentIndex = Math.min(Math.max(CurrentDayIndex, 0), Rewards.length - 1);
  const CurrentReward = Rewards[SafeCurrentIndex];

  return (
    <AnimatePresence>
      {IsOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60"
            onClick={OnClose}
          />

          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
              className="pointer-events-auto w-[92vw] max-w-5xl"
              style={{ zIndex: 60 }}
            >
              <div className="border-2 border-casino-gold/40 bg-secondary shadow-[6px_6px_0px_rgba(0,0,0,0.5)]">
                <div className="flex items-center gap-3 border-b-2 border-border/30 bg-[hsl(var(--accent))]/10 px-6 py-4">
                  <svg width="20" height="20" viewBox="0 0 16 16" fill="none">
                    <rect x="2" y="6" width="12" height="2" fill="hsl(var(--cassino-red))" />
                    <rect x="7" y="2" width="2" height="4" fill="hsl(var(--cassino-red))" />
                    <rect x="5" y="3" width="2" height="2" fill="hsl(var(--cassino-red))" />
                    <rect x="9" y="3" width="2" height="2" fill="hsl(var(--cassino-red))" />
                    <rect x="3" y="8" width="10" height="6" fill="hsl(var(--cassino-gold))" />
                    <rect x="7" y="8" width="2" height="6" fill="hsl(var(--cassino-red))" />
                  </svg>
                  <span className="flex-1 font-display text-sm uppercase tracking-[0.2em] text-foreground/80">
                    Bônus Diário
                  </span>
                  <span className="font-mono text-[10px] tracking-wider text-accent">
                    Dia {CurrentDay}/7
                  </span>
                  <button
                    onClick={OnClose}
                    className="ml-2 text-muted-foreground/50 transition-colors hover:text-foreground/70"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="grid grid-cols-7 gap-4 p-6">
                  {Rewards.map((DayReward, I) => {
                    const IsClaimed = I < ClaimedDays;
                    const IsCurrent = CanClaimToday
                      ? I === SafeCurrentIndex
                      : IsClaimed && I === SafeCurrentIndex;

                    return (
                      <motion.div
                        key={DayReward.Day}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05 * I }}
                        className={`
                          relative flex flex-col items-center border-2 px-3 py-6 transition-all
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
                          className={`mb-3 font-mono text-[18px] font-bold ${
                            IsCurrent
                              ? 'text-accent'
                              : IsClaimed
                                ? 'text-casino-gold'
                                : 'text-muted-foreground/40'
                          }`}
                        >
                          {String(DayReward.Day).padStart(2, '0')}
                        </span>

                        <div className="mb-3">
                          {IsClaimed ? <PixelCheck /> : <PixelChip Size={32} />}
                        </div>

                        <span
                          className={`font-mono text-[13px] font-semibold ${
                            IsCurrent
                              ? 'text-accent'
                              : IsClaimed
                                ? 'text-casino-gold/70'
                                : 'text-muted-foreground/40'
                          }`}
                        >
                          {DayReward.Chips >= 1000
                            ? (DayReward.Chips / 1000).toFixed(DayReward.Chips % 1000 === 0 ? 0 : 1) + 'k'
                            : DayReward.Chips}
                        </span>

                        {IsCurrent && (
                          <div className="absolute -right-1 -top-1 h-2 w-2 animate-pulse bg-accent" />
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
                      className="mb-3 border-2 border-red-500/40 bg-red-500/20 p-3 font-mono text-sm text-red-400"
                    >
                      {Error}
                    </motion.div>
                  )}

                  {LastReward !== null && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mb-3 border-2 border-accent/40 bg-accent/20 p-3 font-mono text-sm text-accent"
                    >
                      +{LastReward.toLocaleString('pt-BR')} fichas! Sequência:{' '}
                      {DailyState?.DailyStreak ?? 0} dias
                    </motion.div>
                  )}

                  <button
                    onClick={HandleClaim}
                    disabled={!DailyState || CanClaimToday === false || IsLoading}
                    className={`
                      w-full border-2 py-4 font-display text-sm uppercase tracking-[0.2em] transition-all
                      shadow-[3px_3px_0px_rgba(0,0,0,0.4)]
                      ${
                        DailyState && CanClaimToday !== false && !IsLoading
                          ? 'border-accent bg-accent/20 text-accent hover:bg-accent/30 active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_rgba(0,0,0,0.4)]'
                          : 'cursor-not-allowed border-border/20 bg-secondary/40 text-muted-foreground/30'
                      }
                    `}
                  >
                    {IsLoading ? (
                      'Resgatando...'
                    ) : !DailyState ? (
                      'Carregando bônus diário...'
                    ) : CanClaimToday === false ? (
                      'Bônus diário já resgatado hoje'
                    ) : (
                      <>
                        Resgatar{' '}
                        <span className="font-mono text-[13px] font-semibold normal-case tracking-normal">
                          {CurrentReward.Chips.toLocaleString('pt-BR')}
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