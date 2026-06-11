import type { GambitTableType } from './gambitTableConfig';
import { getGambitEffectPresentation } from './gambitEffectPresentation';
import type { GambitCardEffect, GambitPendingEvent } from './gambitTypes';
import type {
  RewardCardOption,
  RewardChoiceSession,
  RewardTableState,
} from '../cardReward';
import type { RewardSelectionEntry } from '../cardReward/types/cardReward';

export type GambitPendingEventSelectionState = {
  BadIndex: number | null;
  GoodIndex: number | null;
};

export type GambitPendingEventOptionId = {
  effect: GambitCardEffect;
  index: number;
  selectionKey: keyof GambitPendingEventSelectionState;
  side: 'bad' | 'good';
  tableType: GambitTableType;
};

type CreateRewardChoiceSessionOptions = {
  hasCompletedGoodTableTransition?: boolean;
  openedAt?: number;
  selection?: GambitPendingEventSelectionState;
  sessionId?: string;
};

const defaultPendingEventSelection: GambitPendingEventSelectionState = {
  BadIndex: null,
  GoodIndex: null,
};

const getSideFromTableType = (tableType: GambitTableType) =>
  tableType === 'bad' ? 'bad' : 'good';

const getSelectionKeyFromSide = (
  side: GambitPendingEventOptionId['side']
): keyof GambitPendingEventSelectionState =>
  side === 'bad' ? 'BadIndex' : 'GoodIndex';

const getTableTypeFromSide = (
  side: GambitPendingEventOptionId['side']
): GambitTableType => (side === 'bad' ? 'bad' : 'normal');

const createTableState = (
  selection: GambitPendingEventSelectionState,
  hasCompletedGoodTableTransition: boolean,
  sessionId: string
): RewardTableState => {
  const hasGoodSelection = selection.GoodIndex !== null;
  const hasBadSelection = selection.BadIndex !== null;

  if (!hasGoodSelection) {
    return {
      currentTable: 'normal',
      incomingTable: null,
      isTransitioning: false,
      phase: 'normal',
      transitionId: null,
    };
  }

  if (!hasBadSelection && !hasCompletedGoodTableTransition) {
    return {
      currentTable: 'normal',
      incomingTable: 'bad',
      isTransitioning: true,
      phase: 'transitioning',
      transitionId: `${sessionId}-1`,
    };
  }

  return {
    currentTable: 'bad',
    incomingTable: null,
    isTransitioning: false,
    phase: 'bad',
    transitionId: null,
  };
};

const createSelectionHistoryEntry = (
  optionId: string,
  tableType: GambitTableType
): RewardSelectionEntry => ({
  optionId,
  tableType,
});

export const createRewardCardOptionFromGambitEffect = (
  effect: GambitCardEffect,
  index: number,
  tableType: GambitTableType,
  sessionId: string
): RewardCardOption => {
  const presentation = getGambitEffectPresentation(effect);
  const side = getSideFromTableType(tableType);

  return {
    description: presentation.description,
    id: presentation.viewModel,
    optionId: `${side}-${index}-${effect}`,
    optionIndex: index,
    sessionId,
    spritePath: presentation.spritePath,
    subtitle: presentation.subtitle,
    title: presentation.title,
  };
};

export const createRewardChoiceSessionFromPendingEvent = (
  pendingEvent: GambitPendingEvent,
  {
    hasCompletedGoodTableTransition = false,
    openedAt = Date.now(),
    selection = defaultPendingEventSelection,
    sessionId = `gambit-pending-event-${openedAt}`,
  }: CreateRewardChoiceSessionOptions = {}
): RewardChoiceSession => {
  const normalSessionId = `${sessionId}-normal`;
  const badSessionId = `${sessionId}-bad`;
  const normalTableCards = pendingEvent.GoodOptions.map((effect, index) =>
    createRewardCardOptionFromGambitEffect(
      effect,
      index,
      'normal',
      normalSessionId
    )
  );
  const badTableCards = pendingEvent.BadOptions.map((effect, index) =>
    createRewardCardOptionFromGambitEffect(effect, index, 'bad', badSessionId)
  );
  const selectionHistory: RewardSelectionEntry[] = [];

  if (selection.GoodIndex !== null) {
    const selectedGoodCard = normalTableCards[selection.GoodIndex];

    if (selectedGoodCard) {
      selectionHistory.push(
        createSelectionHistoryEntry(selectedGoodCard.optionId, 'normal')
      );
    }
  }

  if (selection.BadIndex !== null) {
    const selectedBadCard = badTableCards[selection.BadIndex];

    if (selectedBadCard) {
      selectionHistory.push(
        createSelectionHistoryEntry(selectedBadCard.optionId, 'bad')
      );
    }
  }

  return {
    badTableCards,
    id: sessionId,
    normalTableCards,
    openedAt,
    reason: 'reveal-threshold',
    selectionHistory,
    selectionLimit: 2,
    status: selectionHistory.length >= 2 ? 'resolving' : 'selecting',
    tableState: createTableState(
      selection,
      hasCompletedGoodTableTransition,
      sessionId
    ),
  };
};

export const parseGambitPendingEventOptionId = (
  optionId: string
): GambitPendingEventOptionId | null => {
  const match = /^(good|bad)-([0-2])-(.+)$/.exec(optionId);

  if (!match) {
    return null;
  }

  const side = match[1] as GambitPendingEventOptionId['side'];
  const index = Number(match[2]);

  return {
    effect: match[3] as GambitCardEffect,
    index,
    selectionKey: getSelectionKeyFromSide(side),
    side,
    tableType: getTableTypeFromSide(side),
  };
};
