import { motion } from 'framer-motion';
import { useRef, useState } from 'react';
import {
  RewardChoiceModal,
  type RewardSelectionResult,
  rewardTriggerConfig,
  useCardRewardController,
} from './cardReward';
import { GambitBoard } from './GambitGame/GambitBoard';
import {
  makeMockGambitSession,
  revealMockGambitCard,
  selectMockPendingEventCard,
} from './GambitGame/gambitMockBuilders';
import { mapGambitSessionToMinefieldCards } from './GambitGame/gambitMapper';
import type { GambitCardEffect } from './GambitGame/gambitTypes';

const REWARD_CARD_ID_TO_GAMBIT_EFFECT: Record<string, GambitCardEffect> = {
  clarividencia: 'CLARIVIDENCIA',
  'dobro-de-potassio': 'DOBRO_DE_POTASSIO',
  'inversao-gravitacional': 'INVERSAO_GRAVITACIONAL',
  melancidio: 'MELANCIDIO',
};

const mapRewardCardIdToGambitEffect = (cardId: string) =>
  REWARD_CARD_ID_TO_GAMBIT_EFFECT[cardId] ?? null;

export const Gambit = () => {
  const [session, setSession] = useState(makeMockGambitSession);
  const [isRevealAnimationLocked, setIsRevealAnimationLocked] = useState(false);
  const revealAnimationLockedRef = useRef(false);
  const cards = mapGambitSessionToMinefieldCards(session);
  const revealedCardCount = cards.filter((card) => card.revealed).length;
  const handleRewardSelected = ({ selectedCards }: RewardSelectionResult) => {
    setSession((currentSession) =>
      selectedCards.reduce((nextSession, selectedCard) => {
        const selectedEffect = mapRewardCardIdToGambitEffect(selectedCard.id);

        if (!selectedEffect) {
          return nextSession;
        }

        return selectMockPendingEventCard(nextSession, selectedEffect);
      }, currentSession)
    );
  };
  const rewardController = useCardRewardController({
    onRewardSelected: handleRewardSelected,
    revealedCardCount,
  });
  const totalScore = session.AccumulatedPoints;

  const lockRevealAnimation = () => {
    revealAnimationLockedRef.current = true;
    setIsRevealAnimationLocked(true);
  };

  const unlockRevealAnimation = () => {
    revealAnimationLockedRef.current = false;
    setIsRevealAnimationLocked(false);
  };

  const handleCardReveal = (cardId: number) => {
    if (
      revealAnimationLockedRef.current ||
      rewardController.isInteractionLocked
    ) {
      return;
    }

    const selectedCard = cards.find((card) => card.id === cardId);

    if (!selectedCard || selectedCard.revealed) {
      return;
    }

    lockRevealAnimation();
    setSession((currentSession) =>
      revealMockGambitCard(currentSession, cardId)
    );
    rewardController.registerCardReveal(cardId);
  };

  const handleCardRevealAnimationComplete = (cardId: number) => {
    rewardController.handleRevealAnimationComplete(cardId);
    unlockRevealAnimation();
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
              {session.NextEffect ? 'Efeito preparado' : 'Evento configuravel'}
            </p>
          </div>

          <span className="font-mono text-sm font-bold text-foreground">
            {rewardController.revealProgress}/
            {rewardTriggerConfig.revealInterval}
          </span>
        </div>
      </div>

      <div className="bg-card p-4 pixel-border-gold">
        <GambitBoard
          cards={cards}
          className="aspect-square w-full overflow-hidden"
          interactionLocked={
            rewardController.isInteractionLocked || isRevealAnimationLocked
          }
          onCardReveal={handleCardReveal}
          onCardRevealAnimationComplete={handleCardRevealAnimationComplete}
        />
      </div>

      <RewardChoiceModal
        isSelectionLocked={rewardController.isRewardSelectionLocked}
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
