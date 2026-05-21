import { AnimatePresence, motion } from 'framer-motion';
import { useEffect } from 'react';
import { rewardPresentationConfig } from '../../config/rewardPresentationConfig';
import type {
  RewardCardOption,
  RewardChoiceSession,
  RewardPresentationConfig,
} from '../../types/cardReward';
import { RewardCard } from './RewardCard';

type RewardChoiceModalProps = {
  onCardHover: (card: RewardCardOption) => void;
  onCardSelect: (optionId: string) => void;
  presentationConfig?: RewardPresentationConfig;
  session: RewardChoiceSession | null;
};

export const RewardChoiceModal = ({
  onCardHover,
  onCardSelect,
  presentationConfig = rewardPresentationConfig,
  session,
}: RewardChoiceModalProps) => {
  useEffect(() => {
    if (!session || typeof document === 'undefined') {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [session]);

  return (
    <AnimatePresence>
      {session ? (
        <motion.div
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-[80] flex items-center justify-center p-4 sm:p-6"
          exit={{ opacity: 0 }}
          initial={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-[rgba(4,8,7,0.88)]" />
          <div className="reward-soft-pulse pointer-events-none absolute left-1/2 top-1/2 h-[24rem] w-[24rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(218,206,176,0.12)_0%,rgba(218,206,176,0.04)_42%,transparent_74%)] blur-3xl" />

          <motion.div
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="relative z-10 w-full max-w-5xl overflow-hidden rounded-[28px] border border-white/10 bg-[#0a0f0e] px-4 py-6 shadow-[0_28px_90px_rgba(0,0,0,0.46)] sm:px-6 sm:py-7"
            exit={{ opacity: 0, scale: 0.985, y: 8 }}
            initial={{ opacity: 0, scale: 0.97, y: 16 }}
            role="dialog"
          >
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),transparent_18%,transparent_78%,rgba(255,255,255,0.03))]" />
            <div className="pointer-events-none absolute inset-x-16 top-0 h-20 bg-[radial-gradient(circle,rgba(218,206,176,0.18)_0%,transparent_74%)] blur-2xl" />

            <div className="text-center">
              <motion.div
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 py-1 text-[10px] font-bold uppercase tracking-[0.32em] text-white/68"
                initial={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.24, ease: 'easeOut' }}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-white/60" />
                {presentationConfig.bannerEyebrow}
              </motion.div>

              <motion.h2
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 font-display text-3xl font-bold tracking-[0.08em] text-white sm:text-4xl"
                initial={{ opacity: 0, y: -10 }}
                transition={{ delay: 0.04, duration: 0.28, ease: 'easeOut' }}
              >
                {presentationConfig.bannerTitle}
              </motion.h2>

              <motion.p
                animate={{ opacity: 1, y: 0 }}
                className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-white/76 sm:text-base"
                initial={{ opacity: 0, y: -8 }}
                transition={{ delay: 0.08, duration: 0.26, ease: 'easeOut' }}
              >
                {presentationConfig.bannerDescription}
              </motion.p>

              <motion.div
                animate={{ opacity: 1 }}
                className="mt-6 inline-flex rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-[10px] font-bold uppercase tracking-[0.28em] text-white/62"
                initial={{ opacity: 0 }}
                transition={{ delay: 0.12, duration: 0.22, ease: 'easeOut' }}
              >
                Escolha {session.selectionLimit} de {session.options.length}
              </motion.div>
            </div>

            <div className="mt-8 grid gap-4 lg:grid-cols-3">
              {session.options.map((card, index) => {
                const isSelected = session.selectedOptionIds.includes(
                  card.optionId
                );

                return (
                  <RewardCard
                    card={card}
                    index={index}
                    isDisabled={session.status !== 'selecting'}
                    isResolved={session.status === 'resolving'}
                    isSelected={isSelected}
                    key={card.optionId}
                    onHover={onCardHover}
                    onSelect={onCardSelect}
                  />
                );
              })}
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};
