import { GAMBIT_CELL_COUNT } from './gambitGameConfig';
import {
  ACTIVE_GAMBIT_MOCK_SCENARIO,
  gambitMockScenarios,
  mapScenarioCardToGambitGridCard,
  mockPendingEvent,
  type GambitMockScenario,
  type GambitMockScenarioId,
} from './gambitMockScenarios';
import type {
  CreateGambitSessionPayload,
  GambitCardEffect,
  GambitGridCard,
  GambitGridSnapshot,
  GambitInteractionPeekResult,
  GambitPendingEvent,
  GambitPendingInteraction,
  GambitSession,
  GambitTable,
} from './gambitTypes';

const MOCK_NOW = '2026-06-01T00:00:00.000Z';
const DEFAULT_TABLE_ID = 1;
const DEFAULT_SESSION_ID = 1;
const DEFAULT_USER_ID = 'mock-gambit-user';

export const CONSUME_CLARIVIDENCIA_ON_PREVIEW_CANCEL = true;
export const FIRST_MOCK_EVENT_FLIP = 5;
export const SECOND_MOCK_EVENT_FLIP = 13;

type ScenarioInput = GambitMockScenario | GambitMockScenarioId;

export type ResolveMockPendingEventSelection = {
  BadIndex: number;
  GoodIndex: number;
};

export type ResolveMockPendingInteractionResult = {
  PeekResult: GambitInteractionPeekResult | null;
  session: GambitSession;
};

const nextEffectCards = new Set<GambitCardEffect>([
  'DOBRO_DE_POTASSIO',
  'MELANCIDIO',
  'INVERSAO_GRAVITACIONAL',
  'ANULACAO_TOTAL',
  'COLORIDINHO',
  'HEADGEAR',
]);

const badEffectCards = new Set<GambitCardEffect>([
  'CHRIS_JOKER',
  'QUANTO_MENOS_MELHOR',
  'RATIMUNDIO',
  'PAO_COM_OQUE',
  'BUMIS_INFILTRADOS',
]);

const sortGridCards = (cards: GambitGridCard[]) =>
  [...cards].sort(
    (firstCard, secondCard) => firstCard.Position - secondCard.Position
  );

const resolveScenario = (
  scenario: ScenarioInput = ACTIVE_GAMBIT_MOCK_SCENARIO
): GambitMockScenario =>
  typeof scenario === 'string' ? gambitMockScenarios[scenario] : scenario;

export const getGambitSessionGridSnapshot = (session: GambitSession) =>
  session.Grid ?? session.CurrentGridSnapshot ?? null;

const withGridSnapshot = (
  session: GambitSession,
  snapshot: GambitGridSnapshot
): GambitSession => ({
  ...session,
  BurnsRemaining: Math.max(
    0,
    session.BurnSlotsAvailable - session.ManualFlipsCount
  ),
  CurrentGridSnapshot: snapshot,
  Grid: snapshot,
});

const ensureUniqueGridPositions = (cards: GambitGridCard[]) => {
  const positions = new Set<number>();

  cards.forEach((card) => {
    if (positions.has(card.Position)) {
      throw new Error(
        `Duplicate Gambit mock card position "${card.Position}".`
      );
    }

    positions.add(card.Position);
  });
};

const isValidGridPosition = (position: number) =>
  Number.isInteger(position) && position >= 0 && position < GAMBIT_CELL_COUNT;

const requireEventIndex = (index: number, fieldName: string) => {
  if (!Number.isInteger(index) || index < 0 || index > 2) {
    throw new Error(`Invalid Gambit ${fieldName}: expected 0-2.`);
  }

  return index;
};

const requireUnrevealedCardByPosition = (
  snapshot: GambitGridSnapshot,
  position: number
) => {
  const selectedCard =
    snapshot.Unrevealed.find((card) => card.Position === position) ?? null;

  if (!selectedCard) {
    throw new Error(
      `Invalid Gambit selection: Position ${position} is not unrevealed.`
    );
  }

  return selectedCard;
};

const buildPendingEvent = (): GambitPendingEvent => ({
  BadOptions: [...mockPendingEvent.BadOptions],
  EventType: mockPendingEvent.EventType,
  GoodOptions: [...mockPendingEvent.GoodOptions],
});

const buildPendingInteraction = (
  effect: 'CLARIVIDENCIA' | 'CABECINHA'
): GambitPendingInteraction =>
  effect === 'CLARIVIDENCIA'
    ? {
        Action: 'SELECT_CARD',
        Effect: effect,
        RequiredSelections: 1,
        SelectedPositions: [],
      }
    : {
        Action: 'SELECT_MULTIPLE_CARDS',
        Effect: effect,
        RequiredSelections: 3,
        SelectedPositions: [],
      };

const findUnrevealedCardByPosition = (
  snapshot: GambitGridSnapshot,
  position: number
) => snapshot.Unrevealed.find((card) => card.Position === position) ?? null;

const getTableMultiplier = (session: GambitSession) =>
  session.GambitTable?.TableMultiplier ?? 1;

const calculateFinalResult = (session: GambitSession) =>
  Math.max(
    0,
    Math.floor(session.AccumulatedPoints * getTableMultiplier(session))
  );

const getBurnSlotsAvailable = (session: GambitSession) =>
  Math.max(0, session.BurnSlotsAvailable);

const updateBurnsRemaining = (session: GambitSession): GambitSession => ({
  ...session,
  BurnsRemaining: Math.max(
    0,
    getBurnSlotsAvailable(session) - session.ManualFlipsCount
  ),
});

const replaceUnrevealedCards = (
  snapshot: GambitGridSnapshot,
  transformCard: (card: GambitGridCard) => GambitGridCard
): GambitGridSnapshot => ({
  ...snapshot,
  Unrevealed: sortGridCards(snapshot.Unrevealed.map(transformCard)),
});

const findHighestPointCard = (
  cards: GambitGridCard[],
  predicate: (card: GambitGridCard) => boolean
) =>
  cards
    .filter((card) => card.Points != null && predicate(card))
    .sort((firstCard, secondCard) => {
      const pointDelta = (secondCard.Points ?? 0) - (firstCard.Points ?? 0);

      return pointDelta || firstCard.Position - secondCard.Position;
    })[0] ?? null;

const lockBestGoodCard = (snapshot: GambitGridSnapshot) => {
  const targetCard = findHighestPointCard(
    snapshot.Unrevealed,
    (card) => !card.Locked && (card.Points ?? 0) > 0
  );

  if (!targetCard) {
    return snapshot;
  }

  return replaceUnrevealedCards(snapshot, (card) =>
    card.Position === targetCard.Position ? { ...card, Locked: true } : card
  );
};

const transformHighestCardToNegative = (snapshot: GambitGridSnapshot) => {
  const targetCard = findHighestPointCard(
    snapshot.Unrevealed,
    (card) => !card.Locked
  );

  if (!targetCard || targetCard.Points == null) {
    return snapshot;
  }

  return replaceUnrevealedCards(snapshot, (card) =>
    card.Position === targetCard.Position
      ? { ...card, Points: -Math.abs(targetCard.Points ?? 0) }
      : card
  );
};

const transformFirstCardToPower = (snapshot: GambitGridSnapshot) => {
  const targetCard =
    snapshot.Unrevealed.find((card) => !card.Locked && card.Effect == null) ??
    null;

  if (!targetCard) {
    return snapshot;
  }

  return replaceUnrevealedCards(snapshot, (card) =>
    card.Position === targetCard.Position
      ? { ...card, Effect: 'DOBRO_DE_POTASSIO' }
      : card
  );
};

const shouldConsumeNextEffect = (
  nextEffect: GambitCardEffect | null,
  selectedCard: GambitGridCard
) => {
  if (!nextEffect) {
    return false;
  }

  if (nextEffect === 'ANULACAO_TOTAL') {
    return selectedCard.Effect != null || selectedCard.Points != null;
  }

  return selectedCard.Points != null;
};

const isEffectSuppressed = (
  nextEffect: GambitCardEffect | null,
  selectedCard: GambitGridCard
) => nextEffect === 'ANULACAO_TOTAL' && selectedCard.Effect != null;

const isBadHiddenCard = (card: GambitGridCard) =>
  (card.Points ?? 0) < 0 ||
  (card.Effect ? badEffectCards.has(card.Effect) : false);

const applyImmediateEffect = (
  session: GambitSession,
  snapshot: GambitGridSnapshot,
  effect: GambitCardEffect
): { session: GambitSession; snapshot: GambitGridSnapshot } => {
  if (nextEffectCards.has(effect)) {
    return {
      session: {
        ...session,
        NextEffect: effect,
      },
      snapshot,
    };
  }

  switch (effect) {
    case 'CLARIVIDENCIA':
      return {
        session,
        snapshot: {
          ...snapshot,
          PendingInteraction: buildPendingInteraction('CLARIVIDENCIA'),
        },
      };
    case 'CABECINHA':
      return {
        session,
        snapshot: {
          ...snapshot,
          PendingInteraction: buildPendingInteraction('CABECINHA'),
        },
      };
    case 'JONAS_JOKER':
      return {
        session: {
          ...session,
          AccumulatedPoints: session.AccumulatedPoints + 50,
        },
        snapshot,
      };
    case 'CHRIS_JOKER':
    case 'CORINGA_DO_INATEL':
      return {
        session: {
          ...session,
          AccumulatedPoints: 0,
        },
        snapshot,
      };
    case 'QUANTO_MAIS_MELHOR':
      return {
        session: {
          ...session,
          BurnSlotsAvailable: session.BurnSlotsAvailable + 1,
        },
        snapshot,
      };
    case 'QUANTO_MENOS_MELHOR':
      return {
        session: {
          ...session,
          BurnSlotsAvailable: Math.max(
            session.ManualFlipsCount,
            session.BurnSlotsAvailable - 1
          ),
        },
        snapshot,
      };
    case 'MENTE_LISA':
      return {
        session,
        snapshot: lockBestGoodCard(snapshot),
      };
    case 'MOSCA_JOKER':
      return {
        session,
        snapshot: transformFirstCardToPower(snapshot),
      };
    case 'JACKPOT':
      return {
        session: {
          ...session,
          AccumulatedPoints: session.AccumulatedPoints + 200,
        },
        snapshot,
      };
    case 'RATIMUNDIO':
      return {
        session: {
          ...session,
          AccumulatedPoints: session.AccumulatedPoints - 200,
        },
        snapshot,
      };
    case 'PAO_COM_OQUE':
      return {
        session,
        snapshot: transformHighestCardToNegative(snapshot),
      };
    case 'BUMIS_INFILTRADOS':
      return {
        session,
        snapshot,
      };
    default:
      return {
        session,
        snapshot,
      };
  }
};

export const makeMockGambitTable = (
  overrides: Partial<GambitTable> = {}
): GambitTable => ({
  Active: true,
  CardPrice: 10,
  Description: 'Mesa mockada do Gambit para desenvolvimento local.',
  EventInterval: null,
  GambitTableId: DEFAULT_TABLE_ID,
  MaxCardsPurchased: 25,
  MinimumCardsPurchased: 1,
  MinimumChipsRequired: 10,
  Name: 'Gambit',
  PurchaseMultiplierScale: null,
  TableMultiplier: 1,
  ...overrides,
});

export const makeMockGridSnapshot = (
  scenarioInput: ScenarioInput = ACTIVE_GAMBIT_MOCK_SCENARIO
): GambitGridSnapshot => {
  const scenario = resolveScenario(scenarioInput);
  const revealed = sortGridCards(
    scenario.revealed.map(mapScenarioCardToGambitGridCard)
  );
  const unrevealed = sortGridCards(
    scenario.unrevealed.map(mapScenarioCardToGambitGridCard)
  );

  ensureUniqueGridPositions([...revealed, ...unrevealed]);

  return {
    PendingEvent: scenario.pendingEvent,
    PendingInteraction: scenario.pendingInteraction,
    Revealed: revealed,
    Unrevealed: unrevealed,
  };
};

export const makeMockGambitSession = (
  scenarioInput: ScenarioInput = ACTIVE_GAMBIT_MOCK_SCENARIO,
  overrides: Partial<GambitSession> = {}
): GambitSession => {
  const scenario = resolveScenario(scenarioInput);
  const table = makeMockGambitTable();
  const grid = makeMockGridSnapshot(scenario);
  const session: GambitSession = {
    AccumulatedPoints: scenario.accumulatedPoints,
    BurnSlotsAvailable: scenario.burnSlotsAvailable,
    BurnsRemaining: Math.max(
      0,
      scenario.burnSlotsAvailable - scenario.manualFlipsCount
    ),
    CardsPurchased: scenario.cardsPurchased,
    CreatedAt: MOCK_NOW,
    CurrentGridSnapshot: grid,
    FirstEventFlip: scenario.firstEventFlip,
    GambitSessionId: DEFAULT_SESSION_ID,
    GambitTable: table,
    GambitTableId: table.GambitTableId,
    Grid: grid,
    ManualFlipsCount: scenario.manualFlipsCount,
    NextEffect: scenario.nextEffect ?? null,
    Result: scenario.result ?? null,
    SecondEventFlip: scenario.secondEventFlip,
    Status: scenario.status,
    UpdatedAt: MOCK_NOW,
    UserId: DEFAULT_USER_ID,
  };

  return updateBurnsRemaining({
    ...session,
    ...overrides,
  });
};

export const applyMockGambitEffect = (
  points: number | null,
  effect: GambitCardEffect | null
) => {
  const pointValue = points ?? 0;

  switch (effect) {
    case 'DOBRO_DE_POTASSIO':
      return pointValue * 2;
    case 'MELANCIDIO':
      return Math.trunc(pointValue / 2);
    case 'INVERSAO_GRAVITACIONAL':
      return pointValue === 0 ? 0 : -pointValue;
    case 'COLORIDINHO':
      return 0;
    case 'HEADGEAR':
      return -Math.abs(pointValue);
    case 'ANULACAO_TOTAL':
    case null:
      return pointValue;
    default:
      return pointValue;
  }
};

export const canRevealMockGambitCard = (
  session: GambitSession,
  position: number
) => {
  const snapshot = getGambitSessionGridSnapshot(session);

  if (!snapshot || session.Status !== 'InProgress') {
    return false;
  }

  if (snapshot.PendingEvent || snapshot.PendingInteraction) {
    return false;
  }

  if (session.ManualFlipsCount >= getBurnSlotsAvailable(session)) {
    return false;
  }

  if (!isValidGridPosition(position)) {
    return false;
  }

  const selectedCard = findUnrevealedCardByPosition(snapshot, position);

  return Boolean(selectedCard && !selectedCard.Locked);
};

export const startMockClarividenciaPreview = (
  session: GambitSession,
  position: number
): { previewedCardId: number | null; session: GambitSession } => {
  const snapshot = getGambitSessionGridSnapshot(session);

  if (!snapshot) {
    return {
      previewedCardId: null,
      session,
    };
  }

  if (snapshot.PendingInteraction?.Effect === 'CLARIVIDENCIA') {
    const resolution = resolveMockPendingInteraction(session, [position]);

    return {
      previewedCardId:
        resolution.PeekResult && 'Position' in resolution.PeekResult
          ? resolution.PeekResult.Position
          : null,
      session: resolution.session,
    };
  }

  if (session.NextEffect !== 'CLARIVIDENCIA') {
    return {
      previewedCardId: null,
      session,
    };
  }

  const selectedCard = findUnrevealedCardByPosition(snapshot, position);

  if (!selectedCard) {
    return {
      previewedCardId: null,
      session,
    };
  }

  return {
    previewedCardId: selectedCard.Position,
    session: {
      ...session,
      NextEffect: CONSUME_CLARIVIDENCIA_ON_PREVIEW_CANCEL
        ? null
        : session.NextEffect,
      UpdatedAt: MOCK_NOW,
    },
  };
};

export const revealMockGambitCard = (
  session: GambitSession,
  position: number
): GambitSession => {
  const snapshot = getGambitSessionGridSnapshot(session);

  if (!snapshot || !canRevealMockGambitCard(session, position)) {
    return session;
  }

  const selectedCard = findUnrevealedCardByPosition(snapshot, position);

  if (!selectedCard) {
    return session;
  }

  const nextManualFlipsCount = session.ManualFlipsCount + 1;
  const initialRevealed = sortGridCards([...snapshot.Revealed, selectedCard]);
  let nextSnapshot: GambitGridSnapshot = {
    ...snapshot,
    PendingEvent: snapshot.PendingEvent,
    PendingInteraction: snapshot.PendingInteraction,
    Revealed: initialRevealed,
    Unrevealed: sortGridCards(
      snapshot.Unrevealed.filter(
        (card) => card.Position !== selectedCard.Position
      )
    ),
  };
  const consumedNextEffect = shouldConsumeNextEffect(
    session.NextEffect,
    selectedCard
  );
  let nextSession: GambitSession = {
    ...session,
    ManualFlipsCount: nextManualFlipsCount,
    NextEffect: consumedNextEffect ? null : session.NextEffect,
  };

  if (selectedCard.Points != null) {
    nextSession = {
      ...nextSession,
      AccumulatedPoints:
        nextSession.AccumulatedPoints +
        applyMockGambitEffect(selectedCard.Points, session.NextEffect),
    };
  }

  if (
    selectedCard.Effect &&
    !isEffectSuppressed(session.NextEffect, selectedCard)
  ) {
    const effectResult = applyImmediateEffect(
      nextSession,
      nextSnapshot,
      selectedCard.Effect
    );
    nextSession = effectResult.session;
    nextSnapshot = effectResult.snapshot;
  }

  const firstEventFlip = session.FirstEventFlip ?? FIRST_MOCK_EVENT_FLIP;
  const secondEventFlip = session.SecondEventFlip ?? SECOND_MOCK_EVENT_FLIP;
  const shouldCreatePendingEvent =
    !nextSnapshot.PendingEvent &&
    (nextManualFlipsCount === firstEventFlip ||
      nextManualFlipsCount === secondEventFlip);
  const hasFinished =
    nextManualFlipsCount >= getBurnSlotsAvailable(nextSession) ||
    nextSnapshot.Unrevealed.length === 0;

  if (shouldCreatePendingEvent && !hasFinished) {
    nextSnapshot = {
      ...nextSnapshot,
      PendingEvent: buildPendingEvent(),
    };
  }

  if (hasFinished) {
    nextSnapshot = {
      ...nextSnapshot,
      PendingEvent: null,
      PendingInteraction: null,
    };
    nextSession = {
      ...nextSession,
      Result: calculateFinalResult(nextSession),
      Status: 'Finished',
    };
  }

  return updateBurnsRemaining(
    withGridSnapshot(
      {
        ...nextSession,
        UpdatedAt: MOCK_NOW,
      },
      nextSnapshot
    )
  );
};

export const resolveMockPendingEvent = (
  session: GambitSession,
  selection: ResolveMockPendingEventSelection
): GambitSession => {
  const snapshot = getGambitSessionGridSnapshot(session);

  if (!snapshot?.PendingEvent) {
    return session;
  }

  const goodIndex = requireEventIndex(selection.GoodIndex, 'GoodIndex');
  const badIndex = requireEventIndex(selection.BadIndex, 'BadIndex');
  const targetCards = snapshot.Unrevealed.filter((card) => !card.Locked).slice(
    0,
    2
  );

  if (targetCards.length < 2) {
    throw new Error('Cannot resolve Gambit PendingEvent without two targets.');
  }

  const goodCard = snapshot.PendingEvent.GoodOptions[goodIndex];
  const badCard = snapshot.PendingEvent.BadOptions[badIndex];
  const nextSnapshot: GambitGridSnapshot = {
    ...snapshot,
    PendingEvent: null,
    Unrevealed: sortGridCards(
      snapshot.Unrevealed.map((card) => {
        if (card.Position === targetCards[0].Position) {
          return {
            ...card,
            Effect: goodCard,
            Locked: false,
          };
        }

        if (card.Position === targetCards[1].Position) {
          return {
            ...card,
            Effect: badCard,
            Locked: false,
          };
        }

        return card;
      })
    ),
  };

  return updateBurnsRemaining(
    withGridSnapshot(
      {
        ...session,
        Status: 'InProgress',
        UpdatedAt: MOCK_NOW,
      },
      nextSnapshot
    )
  );
};

export const selectMockPendingEventCard = (
  session: GambitSession,
  selectedCard: GambitCardEffect
): GambitSession => {
  const snapshot = getGambitSessionGridSnapshot(session);

  if (!snapshot?.PendingEvent) {
    return session;
  }

  const goodIndex = snapshot.PendingEvent.GoodOptions.indexOf(selectedCard);

  if (goodIndex >= 0) {
    return resolveMockPendingEvent(session, {
      BadIndex: 0,
      GoodIndex: goodIndex,
    });
  }

  const badIndex = snapshot.PendingEvent.BadOptions.indexOf(selectedCard);

  if (badIndex >= 0) {
    return resolveMockPendingEvent(session, {
      BadIndex: badIndex,
      GoodIndex: 0,
    });
  }

  return session;
};

export const resolveMockPendingInteraction = (
  session: GambitSession,
  positions: number[]
): ResolveMockPendingInteractionResult => {
  const snapshot = getGambitSessionGridSnapshot(session);
  const pendingInteraction = snapshot?.PendingInteraction;

  if (!snapshot || !pendingInteraction) {
    return {
      PeekResult: null,
      session,
    };
  }

  if (positions.length !== pendingInteraction.RequiredSelections) {
    throw new Error(
      `Invalid Gambit PendingInteraction selection count: expected ${pendingInteraction.RequiredSelections}.`
    );
  }

  const uniquePositions = new Set(positions);

  if (uniquePositions.size !== positions.length) {
    throw new Error('Invalid Gambit PendingInteraction: duplicated positions.');
  }

  const selectedCards = positions.map((position) => {
    if (!isValidGridPosition(position)) {
      throw new Error(`Invalid Gambit interaction Position "${position}".`);
    }

    const selectedCard = requireUnrevealedCardByPosition(snapshot, position);

    if (selectedCard.Locked) {
      throw new Error(
        `Invalid Gambit interaction Position "${position}": card is locked.`
      );
    }

    return selectedCard;
  });

  const nextSnapshot: GambitGridSnapshot = {
    ...snapshot,
    PendingInteraction: null,
  };
  const nextSession = updateBurnsRemaining(
    withGridSnapshot(
      {
        ...session,
        UpdatedAt: MOCK_NOW,
      },
      nextSnapshot
    )
  );

  if (pendingInteraction.Effect === 'CLARIVIDENCIA') {
    const selectedCard = selectedCards[0];

    return {
      PeekResult: {
        Effect: selectedCard.Effect ?? null,
        Locked: Boolean(selectedCard.Locked),
        Points: selectedCard.Points ?? null,
        Position: selectedCard.Position,
      },
      session: nextSession,
    };
  }

  return {
    PeekResult: {
      AtLeastOneBad: selectedCards.some(isBadHiddenCard),
    },
    session: nextSession,
  };
};

export const selectMockPendingInteractionPosition = (
  session: GambitSession,
  position: number
): ResolveMockPendingInteractionResult => {
  const snapshot = getGambitSessionGridSnapshot(session);
  const pendingInteraction = snapshot?.PendingInteraction;

  if (!snapshot || !pendingInteraction) {
    return {
      PeekResult: null,
      session,
    };
  }

  if (pendingInteraction.SelectedPositions.includes(position)) {
    return {
      PeekResult: null,
      session,
    };
  }

  requireUnrevealedCardByPosition(snapshot, position);

  const selectedPositions = [...pendingInteraction.SelectedPositions, position];

  if (selectedPositions.length >= pendingInteraction.RequiredSelections) {
    return resolveMockPendingInteraction(session, selectedPositions);
  }

  const nextSnapshot: GambitGridSnapshot = {
    ...snapshot,
    PendingInteraction: {
      ...pendingInteraction,
      SelectedPositions: selectedPositions,
    },
  };

  return {
    PeekResult: null,
    session: updateBurnsRemaining(
      withGridSnapshot(
        {
          ...session,
          UpdatedAt: MOCK_NOW,
        },
        nextSnapshot
      )
    ),
  };
};

export const makeMockCreateGambitSessionPayload = (
  cardsPurchased = makeMockGambitTable().MaxCardsPurchased
): CreateGambitSessionPayload => ({
  CardsPurchased: cardsPurchased,
});
