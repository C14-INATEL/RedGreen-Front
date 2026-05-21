import { motion } from 'framer-motion';
import { useState } from 'react';
import {
  RewardChoiceModal,
  rewardTriggerConfig,
  useCardRewardController,
  type RewardSelectionResult,
} from './cardReward';
import { MinefieldBoard } from './MinefieldGame/MinefieldBoard';
import { createMockMinefieldCards } from './MinefieldGame/minefieldGameConfig';

export const Minefield = () => {
  const [cards, setCards] = useState(createMockMinefieldCards);
  const [lastRewardResult, setLastRewardResult] =
    useState<RewardSelectionResult | null>(null);
  const revealedCardCount = cards.filter((card) => card.revealed).length;
  const rewardController = useCardRewardController({
    onRewardSelected: (result) => {
      setLastRewardResult(result);
    },
    revealedCardCount,
  });
  const lastSelectedReward = lastRewardResult?.selectedCards[0] ?? null;

  const totalScore = cards.reduce(
    (score, card) => (card.revealed ? score + card.points : score),
    0
  );

  const handleCardReveal = (cardId: number) => {
    if (rewardController.isInteractionLocked) {
      return;
    }

    const selectedCard = cards.find((card) => card.id === cardId);

    if (!selectedCard || selectedCard.revealed) {
      return;
    }

    setCards((currentCards) =>
      currentCards.map((card) =>
        card.id === cardId ? { ...card, revealed: true } : card
      )
    );
    rewardController.registerCardReveal(cardId);
  };

  const handleCardRevealAnimationComplete = (cardId: number) => {
    rewardController.handleRevealAnimationComplete(cardId);
  };

  return (
    <motion.div
      animate={{ opacity: 1, scale: 1, y: 0 }}
      className="relative w-[min(86vw,560px)]"
      initial={{ opacity: 0, scale: 0.94, y: 28 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="mb-4 grid gap-3 sm:grid-cols-2">
        <div className="flex items-center justify-between bg-card px-5 py-3 pixel-border">
          <span className="font-display text-xs font-bold uppercase tracking-widest text-cassino-gold">
            Pontos
          </span>

          <span className="font-mono text-lg font-bold text-foreground">
            {totalScore.toLocaleString('pt-BR')}
          </span>
        </div>

        <div className="flex items-center justify-between bg-card px-5 py-3 pixel-border">
          <div>
            <p className="font-display text-xs font-bold uppercase tracking-widest text-cassino-gold">
              Proxima Escolha
            </p>
            <p className="mt-1 text-[11px] uppercase tracking-[0.22em] text-white/55">
              Evento configuravel
            </p>
          </div>

          <span className="font-mono text-sm font-bold text-foreground">
            {rewardController.revealProgress}/
            {rewardTriggerConfig.revealInterval}
          </span>
        </div>
      </div>

      <div className="bg-card p-4 pixel-border-gold">
        <MinefieldBoard
          cards={cards}
          className="aspect-square w-full overflow-hidden"
          interactionLocked={rewardController.isInteractionLocked}
          onCardReveal={handleCardReveal}
          onCardRevealAnimationComplete={handleCardRevealAnimationComplete}
        />
      </div>

      {lastSelectedReward ? (
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 overflow-hidden rounded-[24px] border border-white/10 bg-[#0d1312]/94 px-4 py-4 shadow-[0_16px_45px_rgba(0,0,0,0.28)]"
          initial={{ opacity: 0, y: 12 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="flex items-center gap-4">
            <div className="flex h-20 w-16 shrink-0 items-center justify-center rounded-[18px] border border-white/10 bg-[linear-gradient(180deg,rgba(30,38,35,0.96),rgba(13,19,18,0.98))] p-2">
              <img
                alt={lastSelectedReward.title}
                className="h-full w-full object-contain"
                src={lastSelectedReward.spritePath}
              />
            </div>

            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-white/48">
                Ultima recompensa
              </p>

              <h3 className="mt-1 font-display text-xl font-bold text-white">
                {lastSelectedReward.title}
              </h3>

              <p className="mt-2 text-xs leading-5 text-white/74">
                {lastSelectedReward.description}
              </p>
            </div>
          </div>
        </motion.div>
      ) : null}

      <RewardChoiceModal
        onCardHover={rewardController.handleRewardCardHover}
        onCardSelect={rewardController.handleRewardCardSelect}
        session={rewardController.activeSession}
      />
    </motion.div>
  );
};
