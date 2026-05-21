import { memo, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { getFloatingCardAnimation } from '../../animations/cardFloating';
import {
  rewardCardEntranceVariants,
  rewardCardHoverAnimation,
  rewardCardTapAnimation,
} from '../../animations/cardRewardAnimations';
import { rewardCardSelectionVariants } from '../../animations/cardSelectionAnimations';
import type { RewardCardOption } from '../../types/cardReward';

type RewardCardSelectionState = 'idle' | 'dimmed' | 'active' | 'hidden';

type RewardCardProps = {
  card: RewardCardOption;
  index: number;
  isDisabled: boolean;
  isResolved: boolean;
  isSelected: boolean;
  selectionState: RewardCardSelectionState;
  onHover: (card: RewardCardOption) => void;
  onSelect: (optionId: string, buttonElement: HTMLButtonElement | null) => void;
};

const DEFAULT_IMAGE_SHADOW =
  'drop-shadow(0 8px 20px rgba(0,0,0,0.24))';
const SELECTED_IMAGE_SHADOW =
  'drop-shadow(0 0 14px rgba(255,255,255,0.16)) drop-shadow(0 10px 24px rgba(0,0,0,0.28))';
const HIDDEN_BUTTON_STYLE = {
  pointerEvents: 'none' as const,
  visibility: 'hidden' as const,
};
const VISIBLE_BUTTON_STYLE = {
  pointerEvents: undefined,
  visibility: undefined,
} as const;

const RewardCardComponent = ({
  card,
  index,
  isDisabled,
  isResolved,
  isSelected,
  selectionState,
  onHover,
  onSelect,
}: RewardCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const floatingAnimation = useMemo(
    () => getFloatingCardAnimation(index, !isHovered && !isResolved),
    [index, isHovered, isResolved]
  );
  const isHidden = selectionState === 'hidden';

  const imgStyle = useMemo(
    () => ({
      filter: isSelected ? SELECTED_IMAGE_SHADOW : DEFAULT_IMAGE_SHADOW,
      willChange: 'transform',
    }),
    [isSelected]
  );

  const buttonStyle = isHidden ? HIDDEN_BUTTON_STYLE : VISIBLE_BUTTON_STYLE;

  return (
    <motion.button
      animate="enter"
      aria-label={`Escolher ${card.title}`}
      className="relative w-full bg-transparent p-0 text-left transform-gpu"
      custom={index}
      disabled={isDisabled}
      exit="exit"
      initial="initial"
      onClick={(event) => onSelect(card.optionId, event.currentTarget)}
      onHoverStart={() => {
        if (!isDisabled && !isHidden) {
          setIsHovered(true);
          onHover(card);
        }
      }}
      onHoverEnd={() => {
        setIsHovered(false);
      }}
      style={buttonStyle}
      type="button"
      variants={rewardCardEntranceVariants}
      whileHover={isDisabled || isHidden ? undefined : rewardCardHoverAnimation}
      whileTap={isDisabled || isHidden ? undefined : rewardCardTapAnimation}
    >
      <motion.div
        animate={selectionState}
        className="relative transform-gpu"
        initial="idle"
        variants={rewardCardSelectionVariants}
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
            style={imgStyle}
            transition={{ duration: 0.18, ease: 'easeOut' }}
          />
        </motion.div>

        {/* Label removed: no visible "Escolhida" text when a card is selected */}
      </motion.div>
    </motion.button>
  );
};

export const RewardCard = memo(
  RewardCardComponent,
  (prev, next) =>
    prev.card.optionId === next.card.optionId &&
    prev.index === next.index &&
    prev.isDisabled === next.isDisabled &&
    prev.isResolved === next.isResolved &&
    prev.isSelected === next.isSelected &&
    prev.selectionState === next.selectionState &&
    prev.onHover === next.onHover &&
    prev.onSelect === next.onSelect
);
