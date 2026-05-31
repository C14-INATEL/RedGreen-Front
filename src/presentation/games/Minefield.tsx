import { motion } from 'framer-motion';
import { useState } from 'react';
import {
  RewardChoiceModal,
  rewardTriggerConfig,
  useCardRewardController,
} from './cardReward';
import { MinefieldBoard } from './MinefieldGame/MinefieldBoard';
import { createMockMinefieldCards } from './MinefieldGame/minefieldGameConfig';

export const Minefield = () => {
  const [cards, setCards] = useState(createMockMinefieldCards);
  const revealedCardCount = cards.filter((card) => card.revealed).length;
  const rewardController = useCardRewardController({
    revealedCardCount,
  });

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

      <RewardChoiceModal
        onCardHover={rewardController.handleRewardCardHover}
        onCardSelect={rewardController.handleRewardCardSelect}
        onSelectedCardCinematicComplete={
          rewardController.handleSelectedCardCinematicComplete
        }
        onTableTransitionComplete={
          rewardController.handleTableTransitionComplete
        }
        session={rewardController.activeSession}
      />
    </motion.div>
  );
};
