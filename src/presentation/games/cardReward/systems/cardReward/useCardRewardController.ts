import {
  getNextMinefieldTableType,
  type MinefieldTableType,
} from '../../../MinefieldGame/minefieldTableConfig';
import { useEffect, useReducer, useRef } from 'react';
import { getRewardCardPoolByTableType } from '../../config/rewardCardPoolsByTableType';
import { rewardCardPool } from '../../config/rewardCardPool';
import { rewardPresentationConfig } from '../../config/rewardPresentationConfig';
import { rewardTimings } from '../../config/rewardTimings';
import { rewardTriggerConfig } from '../../config/rewardTriggerConfig';
import type {
  RewardAudioCue,
  RewardCardDefinition,
  RewardCardOption,
  RewardChoiceSession,
  RewardSelectionEntry,
  RewardSelectionResult,
  RewardTableState,
  RewardTimingsConfig,
  RewardTriggerConfig,
} from '../../types/cardReward';
import { buildRewardCardOptions } from './rewardCardSelection';

type UseCardRewardControllerParams = {
  onRewardSelected?: (result: RewardSelectionResult) => Promise<void> | void;
  onSoundCue?: (cue: RewardAudioCue, card?: RewardCardOption) => void;
  optionsResolver?: (
    pool: RewardCardDefinition[],
    amount: number,
    sessionId: string
  ) => RewardCardOption[];
  rewardPool?: RewardCardDefinition[];
  revealedCardCount: number;
  tableType?: MinefieldTableType;
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
      sessionId: string;
      type: 'complete-table-transition';
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

    case 'complete-table-transition': {
      if (
        !state.activeSession ||
        state.activeSession.id !== action.sessionId ||
        !state.activeSession.tableState.incomingTable
      ) {
        return state;
      }

      const settledTable = state.activeSession.tableState.incomingTable;
      const nextPhase = settledTable === 'bad' ? 'bad' : 'normal';

      return {
        ...state,
        activeSession: {
          ...state.activeSession,
          tableState: {
            currentTable: settledTable,
            incomingTable: null,
            isTransitioning: false,
            phase: nextPhase,
            transitionId: null,
          },
        },
      };
    }

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
  tableType: MinefieldTableType,
  optionsResolver: (
    pool: RewardCardDefinition[],
    amount: number,
    sessionId: string
  ) => RewardCardOption[]
): RewardChoiceSession => {
  const sessionId = `reward-choice-${Date.now()}-${Math.round(Math.random() * 10_000)}`;
  const initialTableState: RewardTableState = {
    currentTable: tableType,
    incomingTable: null,
    isTransitioning: false,
    phase: tableType === 'bad' ? 'bad' : 'normal',
    transitionId: null,
  };

  return {
    badTableCards: [],
    id: sessionId,
    normalTableCards: optionsResolver(
      pool,
      config.optionsPerChoice,
      buildTableOptionSessionId(sessionId, tableType)
    ),
    openedAt: Date.now(),
    reason: 'reveal-threshold',
    selectionHistory: [],
    selectionLimit: config.selectionLimit,
    status: 'selecting',
    tableState: initialTableState,
  };
};

const buildTableOptionSessionId = (
  sessionId: string,
  tableType: MinefieldTableType
) => `${sessionId}-${tableType}`;

const getCardsForTable = (
  session: RewardChoiceSession,
  tableType: MinefieldTableType
) => (tableType === 'bad' ? session.badTableCards : session.normalTableCards);

const getSelectedOptionIdsForTable = (
  selectionHistory: RewardSelectionEntry[],
  tableType: MinefieldTableType
) =>
  selectionHistory
    .filter((entry) => entry.tableType === tableType)
    .map((entry) => entry.optionId);

const getSelectedCardsFromSession = (session: RewardChoiceSession) =>
  session.selectionHistory
    .map((entry) => {
      const tableCards = getCardsForTable(session, entry.tableType);

      return (
        tableCards.find((option) => option.optionId === entry.optionId) ?? null
      );
    })
    .filter((option): option is RewardCardOption => option !== null);

export const useCardRewardController = ({
  onRewardSelected,
  onSoundCue,
  optionsResolver = buildRewardCardOptions,
  rewardPool = rewardCardPool,
  revealedCardCount,
  tableType = 'normal',
  timings = rewardTimings,
  triggerConfig = rewardTriggerConfig,
}: UseCardRewardControllerParams) => {
  const [{ activeSession, pendingTrigger, revealProgress }, dispatch] =
    useReducer(rewardControllerReducer, initialRewardControllerState);
  const activeSessionRef = useRef<RewardChoiceSession | null>(activeSession);
  const previousRevealedCountRef = useRef(revealedCardCount);
  const modalOpenTimeoutRef = useRef<number | null>(null);
  const revealProgressRef = useRef(0);
  const resolveTimeoutRef = useRef<number | null>(null);
  const rewardModalDelay = Math.max(
    timings.revealCompletionDelay,
    timings.revealObservationDelay + timings.transitionPreparationDelay
  );

  useEffect(() => {
    activeSessionRef.current = activeSession;
  }, [activeSession]);

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
      getRewardCardPoolByTableType(tableType) || rewardPool,
      triggerConfig,
      tableType,
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
    if (
      !activeSession ||
      activeSession.status !== 'selecting' ||
      activeSession.tableState.isTransitioning
    ) {
      return;
    }

    const activeTableType = activeSession.tableState.currentTable;
    const activeTableCards = getCardsForTable(activeSession, activeTableType);
    const selectedOptionIdsForActiveTable = getSelectedOptionIdsForTable(
      activeSession.selectionHistory,
      activeTableType
    );
    const selectedCard = activeTableCards.find(
      (option) => option.optionId === optionId
    );

    if (!selectedCard) {
      return;
    }

    if (selectedOptionIdsForActiveTable.includes(selectedCard.optionId)) {
      return;
    }

    const nextSelectionHistory = [
      ...activeSession.selectionHistory,
      {
        optionId: selectedCard.optionId,
        tableType: activeTableType,
      },
    ];
    const nextSelectedCount = nextSelectionHistory.length;
    const nextTableType = getNextMinefieldTableType(
      activeSession.tableState.currentTable
    );
    const shouldTransitionToNextTable =
      activeSession.tableState.phase === 'normal' &&
      nextSelectedCount < activeSession.selectionLimit;
    const badTableCards = shouldTransitionToNextTable
      ? buildRewardCardOptions(
          getRewardCardPoolByTableType(nextTableType) || rewardCardPool,
          triggerConfig.optionsPerChoice,
          buildTableOptionSessionId(activeSession.id, nextTableType)
        )
      : activeSession.badTableCards;

    const nextTableState: RewardTableState = shouldTransitionToNextTable
      ? {
          currentTable: activeSession.tableState.currentTable,
          incomingTable: nextTableType,
          isTransitioning: true,
          phase: 'transitioning',
          transitionId: `${activeSession.id}-${nextSelectedCount}`,
        }
      : activeSession.tableState;
    const nextSession: RewardChoiceSession = {
      ...activeSession,
      badTableCards,
      selectionHistory: nextSelectionHistory,
      status:
        shouldTransitionToNextTable ||
        nextSelectedCount < triggerConfig.selectionLimit
          ? 'selecting'
          : 'resolving',
      tableState: nextTableState,
    };

    dispatch({
      session: nextSession,
      type: 'update-session',
    });

    if (shouldTransitionToNextTable) {
      onSoundCue?.(rewardPresentationConfig.audioCues.confirm, selectedCard);
      return;
    }

    if (nextSession.status !== 'resolving') {
      return;
    }

    onSoundCue?.(rewardPresentationConfig.audioCues.confirm, selectedCard);
  };

  const handleSelectedCardCinematicComplete = (sessionId: string) => {
    const currentSession = activeSessionRef.current;

    if (
      !currentSession ||
      currentSession.id !== sessionId ||
      currentSession.status !== 'resolving'
    ) {
      return;
    }

    if (resolveTimeoutRef.current) {
      window.clearTimeout(resolveTimeoutRef.current);
      resolveTimeoutRef.current = null;
    }

    const finishResolution = async () => {
      try {
        await onRewardSelected?.({
          selectedCards: getSelectedCardsFromSession(currentSession),
          session: currentSession,
        });
      } finally {
        dispatch({ type: 'close-session' });
      }
    };

    void finishResolution();
  };

  return {
    activeSession,
    handleRevealAnimationComplete,
    handleRewardCardHover,
    handleRewardCardSelect,
    handleSelectedCardCinematicComplete,
    handleTableTransitionComplete: (sessionId: string) => {
      dispatch({ sessionId, type: 'complete-table-transition' });
    },
    isChoiceOpen: Boolean(activeSession),
    isInteractionLocked: Boolean(activeSession || pendingTrigger),
    registerCardReveal,
    revealProgress,
  };
};
