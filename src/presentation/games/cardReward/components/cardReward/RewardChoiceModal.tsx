import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { rewardPresentationConfig } from '../../config/rewardPresentationConfig';
import type {
  RewardCardOption,
  RewardChoiceSession,
  RewardPresentationConfig,
} from '../../types/cardReward';
import { RewardCard } from './RewardCard';
import { selectedCardOverlayTransition } from '../../animations/cardSelectionAnimations';

type RewardChoiceModalProps = {
  onCardHover: (card: RewardCardOption) => void;
  onCardSelect: (optionId: string) => void;
  presentationConfig?: RewardPresentationConfig;
  session: RewardChoiceSession | null;
};

type SelectionOverlay = {
  optionId: string;
  cardRect: DOMRect;
  modalRect: DOMRect;
};

export const RewardChoiceModal = ({
  onCardHover,
  onCardSelect,
  presentationConfig = rewardPresentationConfig,
  session,
}: RewardChoiceModalProps) => {
  const [selectionOverlay, setSelectionOverlay] = useState<SelectionOverlay | null>(null);
  const modalRef = useRef<HTMLDivElement | null>(null);

  const selectedOptionId = session?.selectedOptionIds[0] ?? null;
  const selectedCard = useMemo(
    () =>
      session?.options.find((card) => card.optionId === selectedOptionId) ?? null,
    [session?.options, selectedOptionId]
  );

  const registerModalRef = useCallback((node: HTMLDivElement | null) => {
    modalRef.current = node;
  }, []);

  const clearOverlay = useCallback(() => {
    setSelectionOverlay(null);
  }, []);

  useEffect(() => {
    let cleanupTimer: number | undefined;

    if (!session || session.status !== 'resolving') {
      cleanupTimer = window.setTimeout(clearOverlay, 0);
    }

    return () => {
      if (cleanupTimer) {
        window.clearTimeout(cleanupTimer);
      }
    };
  }, [clearOverlay, session]);

  const handleCardSelect = useCallback(
    (optionId: string, buttonElement: HTMLButtonElement | null) => {
      if (!modalRef.current || !buttonElement) {
        setSelectionOverlay(null);
      } else {
        const cardRect = buttonElement.getBoundingClientRect();
        const modalRect = modalRef.current.getBoundingClientRect();

        setSelectionOverlay({ optionId, cardRect, modalRect });
      }

      onCardSelect(optionId);
    },
    [onCardSelect]
  );

  const getSelectionState = useCallback(
    (optionId: string) => {
      if (!session || session.status !== 'resolving') {
        return 'idle' as const;
      }

      if (optionId === selectedOptionId) {
        return selectionOverlay ? 'hidden' as const : 'active' as const;
      }

      return 'dimmed' as const;
    },
    [selectedOptionId, selectionOverlay, session]
  );

  const selectionOverlayNode = useMemo(() => {
    if (!selectionOverlay || !selectedCard) {
      return null;
    }

    const targetX =
      selectionOverlay.modalRect.left +
      selectionOverlay.modalRect.width / 2 -
      selectionOverlay.cardRect.left -
      selectionOverlay.cardRect.width / 2;
    const targetY =
      selectionOverlay.modalRect.top +
      selectionOverlay.modalRect.height / 2 -
      selectionOverlay.cardRect.top -
      selectionOverlay.cardRect.height / 2;

    return (
      <motion.div
        className="fixed left-0 top-0 z-[90] pointer-events-none"
        style={{
          left: selectionOverlay.cardRect.left,
          top: selectionOverlay.cardRect.top,
          width: selectionOverlay.cardRect.width,
          height: selectionOverlay.cardRect.height,
          willChange: 'transform, opacity',
        }}
        initial={{ x: 0, y: 0, scale: 1, rotate: 0, opacity: 1 }}
        animate={{
          x: targetX,
          y: targetY,
          scale: [1, 1.04, 1.02, 1.05, 1.02],
          rotate: [0, 2, -1.5, 1, 0],
        }}
        transition={selectedCardOverlayTransition}
      >
        <div className="relative h-full w-full overflow-hidden rounded-[24px] border border-white/15 bg-[#0b1410] shadow-[0_30px_90px_rgba(0,0,0,0.48)]">
          <motion.img
            alt={selectedCard.title}
            className="block h-full w-full select-none rounded-[24px] object-cover"
            draggable={false}
            src={selectedCard.spritePath}
            style={{
              filter:
                'drop-shadow(0 0 18px rgba(255,255,255,0.18)) drop-shadow(0 16px 32px rgba(0,0,0,0.28))',
            }}
            initial={{ scale: 1 }}
            animate={{ scale: [1, 1.04, 1.02, 1.05, 1.01] }}
            transition={{ duration: 0.68, ease: [0.22, 1, 0.36, 1] }}
          />

          {/* Removed floating "Escolhida" label for the selected card overlay */}
        </div>
      </motion.div>
    );
  }, [selectionOverlay, selectedCard]);

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

          {selectionOverlayNode}

          <motion.div
            ref={registerModalRef}
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
                const isSelected = session.selectedOptionIds.includes(card.optionId);
                const selectionState = getSelectionState(card.optionId);

                return (
                  <RewardCard
                    card={card}
                    index={index}
                    isDisabled={session.status !== 'selecting'}
                    isResolved={session.status === 'resolving'}
                    isSelected={isSelected}
                    selectionState={selectionState}
                    key={card.optionId}
                    onHover={onCardHover}
                    onSelect={handleCardSelect}
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
