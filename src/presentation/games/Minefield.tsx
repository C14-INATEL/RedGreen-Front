import { motion } from 'framer-motion';
import { useState } from 'react';
import { MinefieldBoard } from './MinefieldGame/MinefieldBoard';
import { createMockMinefieldCards } from './MinefieldGame/minefieldGameConfig';

export const Minefield = () => {
  const [cards, setCards] = useState(createMockMinefieldCards);

  const totalScore = cards.reduce(
    (score, card) => (card.revealed ? score + card.points : score),
    0
  );

  const handleCardReveal = (cardId: number) => {
    setCards((currentCards) => {
      const selectedCard = currentCards.find((card) => card.id === cardId);

      if (!selectedCard || selectedCard.revealed) {
        return currentCards;
      }

      return currentCards.map((card) =>
        card.id === cardId ? { ...card, revealed: true } : card
      );
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.94, y: 28 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="relative w-[min(86vw,560px)]"
    >
      <div className="mb-4 flex items-center justify-between bg-card px-5 py-3 pixel-border">
        <span className="font-display text-xs font-bold uppercase tracking-widest text-cassino-gold">
          Pontos
        </span>

        <span className="font-mono text-lg font-bold text-foreground">
          {totalScore.toLocaleString('pt-BR')}
        </span>
      </div>

      <div className="bg-card p-4 pixel-border-gold">
        <MinefieldBoard
          cards={cards}
          className="aspect-square w-full overflow-hidden"
          onCardReveal={handleCardReveal}
        />
      </div>
    </motion.div>
  );
};
