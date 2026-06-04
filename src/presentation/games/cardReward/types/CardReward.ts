import type { MinefieldTableType } from '../../MinefieldGame/MinefieldTableConfig';

export type RewardSelectionPhase = 'selecting' | 'resolving';
export type RewardTablePhase = 'normal' | 'transitioning' | 'bad';

export type RewardTriggerReason = 'reveal-threshold';

export type RewardAudioCue =
  | 'reward-choice-open'
  | 'reward-choice-hover'
  | 'reward-choice-confirm';

export type RewardCardDefinition = {
  description: string;
  id: string;
  spritePath: string;
  subtitle: string;
  title: string;
};

export type RewardCardOption = RewardCardDefinition & {
  optionId: string;
  optionIndex: number;
  sessionId: string;
};

export type RewardSelectionEntry = {
  optionId: string;
  tableType: MinefieldTableType;
};

export type RewardTriggerConfig = {
  carryOverRevealProgress: boolean;
  optionsPerChoice: number;
  revealInterval: number;
  selectionLimit: number;
};

export type RewardPresentationConfig = {
  audioCues: {
    confirm: RewardAudioCue;
    hover: RewardAudioCue;
    open: RewardAudioCue;
  };
  bannerDescription: string;
  bannerEyebrow: string;
  bannerTitle: string;
  particleCount: number;
};

export type RewardTimingsConfig = {
  bannerEntranceDuration: number;
  cardEntranceDuration: number;
  cardEntranceStagger: number;
  modalFadeDuration: number;
  revealCompletionDelay: number;
  revealObservationDelay: number;
  selectedCardCenteringDurationMs: number;
  selectedCardFlyAwayDurationMs: number;
  selectionResolveDelayMs: number;
  tableTransitionBreathingDelayMs: number;
  tablePostTransitionHoldMs: number;
  tableTransitionDramaticPauseMs: number;
  tableTransitionDurationMs: number;
  transitionPreparationDelay: number;
};

export type RewardChoiceSession = {
  badTableCards: RewardCardOption[];
  id: string;
  normalTableCards: RewardCardOption[];
  openedAt: number;
  reason: RewardTriggerReason;
  selectionHistory: RewardSelectionEntry[];
  selectionLimit: number;
  status: RewardSelectionPhase;
  tableState: RewardTableState;
};

export type RewardSelectionResult = {
  selectedCards: RewardCardOption[];
  session: RewardChoiceSession;
};

export type RewardTableState = {
  currentTable: MinefieldTableType;
  incomingTable: MinefieldTableType | null;
  isTransitioning: boolean;
  phase: RewardTablePhase;
  transitionId: string | null;
};
