import { memo, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { getFloatingCardAnimation } from '../../animations/CardFloating';
import {
  rewardCardEntranceVariants,
  rewardCardHoverAnimation,
  rewardCardTapAnimation,
} from '../../animations/CardRewardAnimations';
import { rewardCardSelectionVariants } from '../../animations/CardSelectionAnimations';
import type { RewardCardOption } from '../../types/CardReward';

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

const DEFAULT_IMAGE_FILTER = 'drop-shadow(3px 3px 0 rgba(20,12,4,0.42))';
const SELECTED_IMAGE_FILTER =
  'brightness(1.04) drop-shadow(4px 4px 0 rgba(20,12,4,0.5))';
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
      filter: isSelected ? SELECTED_IMAGE_FILTER : DEFAULT_IMAGE_FILTER,
      imageRendering: 'pixelated' as const,
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
