import { useEffect, useReducer, useRef } from 'react';
import { rewardCardPool } from '../../config/rewardCardPool';
import { rewardPresentationConfig } from '../../config/rewardPresentationConfig';
import { rewardTimings } from '../../config/rewardTimings';
import { rewardTriggerConfig } from '../../config/rewardTriggerConfig';
import type {
  RewardAudioCue,
  RewardCardDefinition,
  RewardCardOption,
  RewardChoiceSession,
  RewardSelectionResult,
  RewardTimingsConfig,
  RewardTriggerConfig,
} from '../../types/cardReward';
import { buildRewardCardOptions } from './rewardCardSelection';

type UseCardRewardControllerParams = {
  onRewardSelected?: (result: RewardSelectionResult) => void;
  onSoundCue?: (cue: RewardAudioCue, card?: RewardCardOption) => void;
  optionsResolver?: (
    pool: RewardCardDefinition[],
    amount: number,
    sessionId: string
  ) => RewardCardOption[];
  rewardPool?: RewardCardDefinition[];
  revealedCardCount: number;
  timings?: RewardTimingsConfig;
  triggerConfig?: RewardTriggerConfig;
};

type PendingRewardTrigger = {
  session: RewardChoiceSession;
  triggerCardId: number;
};

type RewardControllerState = {
  activeSession: RewardChoiceSession | null;
  pendingTrigger: PendingRewardTrigger | null;
  revealProgress: number;
};

type RewardControllerAction =
  | {
      type: 'close-session';
    }
  | {
      pendingTrigger: PendingRewardTrigger;
      revealProgress: number;
      type: 'queue-session';
    }
  | {
      revealProgress: number;
      type: 'reset-controller';
    }
  | {
      revealProgress: number;
      type: 'sync-progress';
    }
  | {
      session: RewardChoiceSession;
      type: 'open-pending-session';
    }
  | {
      session: RewardChoiceSession;
      type: 'update-session';
    };

const initialRewardControllerState: RewardControllerState = {
  activeSession: null,
  pendingTrigger: null,
  revealProgress: 0,
};

const rewardControllerReducer = (
  state: RewardControllerState,
  action: RewardControllerAction
): RewardControllerState => {
  switch (action.type) {
    case 'close-session':
      return {
        ...state,
        activeSession: null,
      };

    case 'open-pending-session':
      return {
        ...state,
        activeSession: action.session,
        pendingTrigger: null,
      };

    case 'queue-session':
      return {
        ...state,
        pendingTrigger: action.pendingTrigger,
        revealProgress: action.revealProgress,
      };

    case 'reset-controller':
      return {
        activeSession: null,
        pendingTrigger: null,
        revealProgress: action.revealProgress,
      };

    case 'sync-progress':
      return {
        ...state,
        revealProgress: action.revealProgress,
      };

    case 'update-session':
      return {
        ...state,
        activeSession: action.session,
      };

    default:
      return state;
  }
};

const createRewardSession = (
  pool: RewardCardDefinition[],
  config: RewardTriggerConfig,
  optionsResolver: (
    pool: RewardCardDefinition[],
    amount: number,
    sessionId: string
  ) => RewardCardOption[]
): RewardChoiceSession => {
  const sessionId = `reward-choice-${Date.now()}-${Math.round(Math.random() * 10_000)}`;

  return {
    id: sessionId,
    openedAt: Date.now(),
    options: optionsResolver(pool, config.optionsPerChoice, sessionId),
    reason: 'reveal-threshold',
    selectedOptionIds: [],
    selectionLimit: config.selectionLimit,
    status: 'selecting',
  };
};

export const useCardRewardController = ({
  onRewardSelected,
  onSoundCue,
  optionsResolver = buildRewardCardOptions,
  rewardPool = rewardCardPool,
  revealedCardCount,
  timings = rewardTimings,
  triggerConfig = rewardTriggerConfig,
}: UseCardRewardControllerParams) => {
  const [{ activeSession, pendingTrigger, revealProgress }, dispatch] =
    useReducer(rewardControllerReducer, initialRewardControllerState);
  const previousRevealedCountRef = useRef(revealedCardCount);
  const modalOpenTimeoutRef = useRef<number | null>(null);
  const revealProgressRef = useRef(0);
  const resolveTimeoutRef = useRef<number | null>(null);
  const rewardModalDelay = Math.max(
    timings.revealCompletionDelay,
    timings.revealObservationDelay + timings.transitionPreparationDelay
  );

  useEffect(() => {
    return () => {
      if (modalOpenTimeoutRef.current) {
        window.clearTimeout(modalOpenTimeoutRef.current);
      }

      if (resolveTimeoutRef.current) {
        window.clearTimeout(resolveTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const previousRevealedCount = previousRevealedCountRef.current;

    if (revealedCardCount < previousRevealedCount) {
      if (modalOpenTimeoutRef.current) {
        window.clearTimeout(modalOpenTimeoutRef.current);
        modalOpenTimeoutRef.current = null;
      }

      if (resolveTimeoutRef.current) {
        window.clearTimeout(resolveTimeoutRef.current);
        resolveTimeoutRef.current = null;
      }

      previousRevealedCountRef.current = revealedCardCount;
      revealProgressRef.current = 0;
      dispatch({ revealProgress: 0, type: 'reset-controller' });

      return;
    }

    previousRevealedCountRef.current = revealedCardCount;
  }, [revealedCardCount]);

  const registerCardReveal = (cardId: number) => {
    if (activeSession || pendingTrigger) {
      return;
    }

    const nextRevealProgress = revealProgressRef.current + 1;

    if (nextRevealProgress < triggerConfig.revealInterval) {
      revealProgressRef.current = nextRevealProgress;
      dispatch({
        revealProgress: nextRevealProgress,
        type: 'sync-progress',
      });
      return;
    }

    const nextSession = createRewardSession(
      rewardPool,
      triggerConfig,
      optionsResolver
    );
    const nextProgressAfterTrigger = triggerConfig.carryOverRevealProgress
      ? nextRevealProgress % triggerConfig.revealInterval
      : 0;

    revealProgressRef.current = nextProgressAfterTrigger;
    dispatch({
      pendingTrigger: {
        session: nextSession,
        triggerCardId: cardId,
      },
      revealProgress: nextProgressAfterTrigger,
      type: 'queue-session',
    });
  };

  const handleRevealAnimationComplete = (cardId: number) => {
    if (!pendingTrigger || pendingTrigger.triggerCardId !== cardId) {
      return;
    }

    if (modalOpenTimeoutRef.current) {
      window.clearTimeout(modalOpenTimeoutRef.current);
    }

    modalOpenTimeoutRef.current = window.setTimeout(() => {
      onSoundCue?.(rewardPresentationConfig.audioCues.open);
      dispatch({
        session: pendingTrigger.session,
        type: 'open-pending-session',
      });
      modalOpenTimeoutRef.current = null;
    }, rewardModalDelay);
  };

  const handleRewardCardHover = (card: RewardCardOption) => {
    if (!activeSession || activeSession.status !== 'selecting') {
      return;
    }

    onSoundCue?.(rewardPresentationConfig.audioCues.hover, card);
  };

  const handleRewardCardSelect = (optionId: string) => {
    if (!activeSession || activeSession.status !== 'selecting') {
      return;
    }

    const selectedCard = activeSession.options.find(
      (option) => option.optionId === optionId
    );

    if (!selectedCard) {
      return;
    }

    if (activeSession.selectedOptionIds.includes(selectedCard.optionId)) {
      return;
    }

    const nextSelectedOptionIds = [
      ...activeSession.selectedOptionIds,
      selectedCard.optionId,
    ];
    const nextSession: RewardChoiceSession = {
      ...activeSession,
      selectedOptionIds: nextSelectedOptionIds,
      status:
        nextSelectedOptionIds.length >= triggerConfig.selectionLimit
          ? 'resolving'
          : 'selecting',
    };

    dispatch({
      session: nextSession,
      type: 'update-session',
    });

    if (nextSession.status !== 'resolving') {
      return;
    }

    onSoundCue?.(rewardPresentationConfig.audioCues.confirm, selectedCard);

    if (resolveTimeoutRef.current) {
      window.clearTimeout(resolveTimeoutRef.current);
    }

    resolveTimeoutRef.current = window.setTimeout(() => {
      onRewardSelected?.({
        selectedCards: nextSession.options.filter((option) =>
          nextSession.selectedOptionIds.includes(option.optionId)
        ),
        session: nextSession,
      });
      resolveTimeoutRef.current = null;
      dispatch({ type: 'close-session' });
    }, timings.selectionResolveDelayMs);
  };

  return {
    activeSession,
    handleRevealAnimationComplete,
    handleRewardCardHover,
    handleRewardCardSelect,
    isChoiceOpen: Boolean(activeSession),
    isInteractionLocked: Boolean(activeSession || pendingTrigger),
    registerCardReveal,
    revealProgress,
  };
};
