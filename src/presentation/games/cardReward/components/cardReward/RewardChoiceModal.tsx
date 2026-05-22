import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { BackgroundParticles } from '../../../MinefieldGame/BackgroundParticles';
import { MinefieldEventTable } from '../../../MinefieldGame/MinefieldEventTable';
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
        {/* O efeito de "carta dentro de container" vinha deste wrapper com rounded/bg/shadow.
            A carta revelada agora e o proprio elemento visual, sem caixa ao redor. */}
        <motion.img
          alt={selectedCard.title}
          className="block h-full w-full select-none object-cover"
          draggable={false}
          src={selectedCard.spritePath}
          style={{
            filter: 'brightness(1.05) drop-shadow(4px 4px 0 rgba(20,12,4,0.5))',
            imageRendering: 'pixelated',
          }}
          initial={{ scale: 1 }}
          animate={{ scale: [1, 1.04, 1.02, 1.05, 1.01] }}
          transition={{ duration: 0.68, ease: [0.22, 1, 0.36, 1] }}
        />
      </motion.div>
    );
  }, [selectionOverlay, selectedCard]);

  return (
    <AnimatePresence>
      {session ? (
        <motion.div
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-[80] flex items-center justify-center"
          exit={{ opacity: 0 }}
          initial={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-[rgba(4,8,7,0.88)]" />

          {selectionOverlayNode}

          {session.status === 'selecting' ? (
            <BackgroundParticles
              alphaMultiplier={0.82}
              className="absolute inset-0 z-[12] overflow-hidden opacity-95"
              maxParticles={presentationConfig.particleCount}
              spawnIntervalMs={90}
              speedMultiplier={1.22}
              tremorMultiplier={1.15}
            />
          ) : null}

          <motion.div
            ref={registerModalRef}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="relative z-10 w-full max-w-5xl bg-transparent"
            exit={{ opacity: 0, scale: 0.985, y: 8 }}
            initial={{ opacity: 0, scale: 0.97, y: 16 }}
            role="dialog"
          >
            {/* O efeito de "sprite dentro de caixa" vinha de rounded + overflow + shadow no wrapper HTML.
                Aqui a mesa vira o proprio painel visual, sem clipping moderno ao redor do pixel-art. */}
            <MinefieldEventTable className="pointer-events-none absolute inset-0 z-0" />

            {/* O conteudo sobe para uma camada acima da mesa, mas sem caixas/transparencias por tras dos textos. */}
            <div className="relative z-10 px-5 py-7 sm:px-7 sm:py-8">
              <div className="text-center">
                <motion.div
                  animate={{ opacity: 1, y: 0 }}
                  className="text-[11px] font-bold uppercase tracking-[0.32em] text-[#e9d79f]"
                  initial={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.24, ease: 'easeOut' }}
                  style={{ textShadow: '2px 2px 0 rgba(18,12,5,0.85)' }}
                >
                  {presentationConfig.bannerEyebrow}
                </motion.div>

                <motion.h2
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 font-display text-3xl font-bold tracking-[0.08em] text-[#fff6d8] sm:text-4xl"
                  initial={{ opacity: 0, y: -10 }}
                  transition={{ delay: 0.04, duration: 0.28, ease: 'easeOut' }}
                  style={{ textShadow: '3px 3px 0 rgba(20,12,4,0.92)' }}
                >
                  {presentationConfig.bannerTitle}
                </motion.h2>

                <motion.p
                  animate={{ opacity: 1, y: 0 }}
                  className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-[#f0e4bd] sm:text-base"
                  initial={{ opacity: 0, y: -8 }}
                  transition={{ delay: 0.08, duration: 0.26, ease: 'easeOut' }}
                  style={{ textShadow: '2px 2px 0 rgba(20,12,4,0.85)' }}
                >
                  {presentationConfig.bannerDescription}
                </motion.p>

                <motion.div
                  animate={{ opacity: 1 }}
                  className="mt-6 text-[11px] font-bold uppercase tracking-[0.28em] text-[#f6ebc7]"
                  initial={{ opacity: 0 }}
                  transition={{ delay: 0.12, duration: 0.22, ease: 'easeOut' }}
                  style={{ textShadow: '2px 2px 0 rgba(20,12,4,0.85)' }}
                >
                  Escolha {session.selectionLimit} de {session.options.length}
                </motion.div>
              </div>

              <div className="mt-8 grid gap-4 lg:grid-cols-3">
                {session.options.map((card, index) => {
                  const isSelected = session.selectedOptionIds.includes(
                    card.optionId
                  );
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
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};
