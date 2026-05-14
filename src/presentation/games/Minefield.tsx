import { motion } from 'framer-motion';
import { useState } from 'react';
import { MinefieldBoard } from './MinefieldGame/MinefieldBoard';

export const Minefield = () => {
  const [selectedCells, setSelectedCells] = useState<Set<number>>(
    () => new Set()
  );

  const handleCellSelect = (cellIndex: number) => {
    setSelectedCells((currentSelectedCells) => {
      if (currentSelectedCells.has(cellIndex)) {
        return currentSelectedCells;
      }

      const nextSelectedCells = new Set(currentSelectedCells);
      nextSelectedCells.add(cellIndex);
      return nextSelectedCells;
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.94, y: 28 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="relative w-[min(86vw,560px)]"
    >
      <div className="bg-card p-4 pixel-border-gold">
        <MinefieldBoard
          className="aspect-square w-full overflow-hidden"
          onCellSelect={handleCellSelect}
          selectedCells={selectedCells}
        />
      </div>
    </motion.div>
  );
};
