import { motion } from 'framer-motion';
import { useState } from 'react';
import { getFloatingCardAnimation } from '../../animations/cardFloating';
import {
  rewardCardEntranceVariants,
  rewardCardHoverAnimation,
  rewardCardTapAnimation,
  rewardSelectionFocusVariants,
} from '../../animations/cardRewardAnimations';
import type { RewardCardOption } from '../../types/cardReward';

type RewardCardProps = {
  card: RewardCardOption;
  index: number;
  isDisabled: boolean;
  isResolved: boolean;
  isSelected: boolean;
  onHover: (card: RewardCardOption) => void;
  onSelect: (optionId: string) => void;
};

export const RewardCard = ({
  card,
  index,
  isDisabled,
  isResolved,
  isSelected,
  onHover,
  onSelect,
}: RewardCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const selectionState = !isResolved
    ? 'idle'
    : isSelected
      ? 'resolvingSelected'
      : 'resolvingFaded';
  const floatingAnimation = getFloatingCardAnimation(
    index,
    !isHovered && !isResolved
  );

  return (
    <motion.button
      animate="enter"
      aria-label={`Escolher ${card.title}`}
      className="relative w-full bg-transparent p-0 text-left transform-gpu"
      custom={index}
      disabled={isDisabled}
      exit="exit"
      initial="initial"
      onClick={() => onSelect(card.optionId)}
      onHoverStart={() => {
        if (!isDisabled) {
          setIsHovered(true);
          onHover(card);
        }
      }}
      onHoverEnd={() => {
        setIsHovered(false);
      }}
      type="button"
      variants={rewardCardEntranceVariants}
      whileHover={isDisabled ? undefined : rewardCardHoverAnimation}
      whileTap={isDisabled ? undefined : rewardCardTapAnimation}
    >
      <motion.div
        animate={selectionState}
        className="relative transform-gpu"
        initial="idle"
        variants={rewardSelectionFocusVariants}
      >
        <motion.div
          animate={floatingAnimation}
          className="transform-gpu"
          style={{ transformOrigin: '50% 50%' }}
        >
          <motion.img
            alt={card.title}
            className="block h-auto w-full select-none"
            draggable={false}
            src={card.spritePath}
            style={{
              filter: isSelected
                ? 'drop-shadow(0 0 14px rgba(255,255,255,0.16)) drop-shadow(0 10px 24px rgba(0,0,0,0.28))'
                : 'drop-shadow(0 8px 20px rgba(0,0,0,0.24))',
            }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
          />
        </motion.div>

        <motion.div
          animate={isSelected ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
          className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-white/12 bg-[#0d1312]/84 px-4 py-2 text-center text-[10px] font-bold uppercase tracking-[0.28em] text-white/78 shadow-[0_10px_28px_rgba(0,0,0,0.24)]"
          transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
        >
          Escolhida
        </motion.div>
      </motion.div>
    </motion.button>
  );
};
