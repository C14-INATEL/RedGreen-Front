export type RewardSelectionPhase = 'selecting' | 'resolving';

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
  selectionResolveDelayMs: number;
  transitionPreparationDelay: number;
};

export type RewardChoiceSession = {
  id: string;
  openedAt: number;
  options: RewardCardOption[];
  reason: RewardTriggerReason;
  selectedOptionIds: string[];
  selectionLimit: number;
  status: RewardSelectionPhase;
};

export type RewardSelectionResult = {
  selectedCards: RewardCardOption[];
  session: RewardChoiceSession;
};
