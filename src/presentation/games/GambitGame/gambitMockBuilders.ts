import {
  ACTIVE_GAMBIT_MOCK_SCENARIO,
  gambitMockScenarios,
  mapScenarioCardToGambitGridCard,
  type GambitMockScenario,
  type GambitMockScenarioId,
} from './gambitMockScenarios';
import type {
  CreateGambitSessionPayload,
  GambitCardEffect,
  GambitGridCard,
  GambitGridSnapshot,
  GambitPendingEvent,
  GambitSession,
  GambitTable,
} from './gambitTypes';

const MOCK_NOW = '2026-06-01T00:00:00.000Z';
const DEFAULT_TABLE_ID = 1;
const DEFAULT_SESSION_ID = 1;
const DEFAULT_USER_ID = 'mock-gambit-user';

export const CONSUME_CLARIVIDENCIA_ON_PREVIEW_CANCEL = true;

type ScenarioInput = GambitMockScenario | GambitMockScenarioId;

const sortGridCards = (cards: GambitGridCard[]) =>
  [...cards].sort(
    (firstCard, secondCard) => firstCard.Position - secondCard.Position
  );

const resolveScenario = (
  scenario: ScenarioInput = ACTIVE_GAMBIT_MOCK_SCENARIO
): GambitMockScenario =>
  typeof scenario === 'string' ? gambitMockScenarios[scenario] : scenario;

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

const buildPendingEvent = (
  cardsOffered: GambitPendingEvent['CardsOffered'] = [
    'DOBRO_DE_POTASSIO',
    'MELANCIDIO',
    'CLARIVIDENCIA',
  ],
  eventType: GambitPendingEvent['EventType'] = 'Neutral'
): GambitPendingEvent => ({
  CardsOffered: cardsOffered,
  EventType: eventType,
});

const findUnrevealedCardByPosition = (
  snapshot: GambitGridSnapshot,
  position: number
) => snapshot.Unrevealed.find((card) => card.Position === position) ?? null;

export const makeMockGambitTable = (
  overrides: Partial<GambitTable> = {}
): GambitTable => ({
  Active: true,
  CardPrice: 10,
  Description: 'Mesa mockada do Gambit para desenvolvimento local.',
  EventInterval: 3,
  GambitTableId: DEFAULT_TABLE_ID,
  MaxCardsPurchased: 25,
  MinimumCardsPurchased: 1,
  MinimumChipsRequired: 10,
  Name: 'Gambit',
  PurchaseMultiplierScale: 1,
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

  return {
    AccumulatedPoints: scenario.accumulatedPoints,
    CardsPurchased: scenario.cardsPurchased,
    CreatedAt: MOCK_NOW,
    CurrentGridSnapshot: makeMockGridSnapshot(scenario),
    GambitSessionId: DEFAULT_SESSION_ID,
    GambitTable: table,
    GambitTableId: table.GambitTableId,
    ManualFlipsCount: scenario.manualFlipsCount,
    NextEffect: scenario.nextEffect,
    Result: scenario.result ?? null,
    Status: scenario.status,
    UpdatedAt: MOCK_NOW,
    UserId: DEFAULT_USER_ID,
    ...overrides,
  };
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
    case 'CLARIVIDENCIA':
    case null:
      return pointValue;
    default:
      return pointValue;
  }
};

export const startMockClarividenciaPreview = (
  session: GambitSession,
  position: number
): { previewedCardId: number | null; session: GambitSession } => {
  const snapshot = session.CurrentGridSnapshot;

  if (!snapshot || session.NextEffect !== 'CLARIVIDENCIA') {
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
  const snapshot = session.CurrentGridSnapshot;

  if (!snapshot || session.Status !== 'InProgress') {
    return session;
  }

  const selectedCard = findUnrevealedCardByPosition(snapshot, position);

  if (!selectedCard) {
    return session;
  }

  const isBoardEffectCard = selectedCard.Effect !== null;
  const nextManualFlipsCount = session.ManualFlipsCount + 1;
  const effectToApply = isBoardEffectCard ? null : session.NextEffect;
  const nextAccumulatedPoints =
    session.AccumulatedPoints +
    (isBoardEffectCard
      ? 0
      : applyMockGambitEffect(selectedCard.Points, effectToApply));
  const nextEffect = selectedCard.Effect ?? null;
  const eventInterval = session.GambitTable?.EventInterval ?? 3;
  const shouldCreatePendingEvent =
    !snapshot.PendingEvent &&
    eventInterval > 0 &&
    nextManualFlipsCount % eventInterval === 0;
  const nextSnapshot: GambitGridSnapshot = {
    PendingEvent: shouldCreatePendingEvent
      ? buildPendingEvent()
      : snapshot.PendingEvent,
    Revealed: sortGridCards([...snapshot.Revealed, selectedCard]),
    Unrevealed: snapshot.Unrevealed.filter(
      (card) => card.Position !== selectedCard.Position
    ),
  };
  const hasFinished = nextSnapshot.Unrevealed.length === 0;

  return {
    ...session,
    AccumulatedPoints: nextAccumulatedPoints,
    CurrentGridSnapshot: nextSnapshot,
    ManualFlipsCount: nextManualFlipsCount,
    NextEffect: nextEffect,
    Result: hasFinished ? nextAccumulatedPoints : session.Result,
    Status: hasFinished ? 'Finished' : session.Status,
    UpdatedAt: MOCK_NOW,
  };
};

export const selectMockPendingEventCard = (
  session: GambitSession,
  selectedCard: GambitCardEffect
): GambitSession => {
  const snapshot = session.CurrentGridSnapshot;

  if (!snapshot) {
    return session;
  }

  if (
    snapshot.PendingEvent &&
    !snapshot.PendingEvent.CardsOffered.includes(selectedCard)
  ) {
    return session;
  }

  return {
    ...session,
    CurrentGridSnapshot: {
      ...snapshot,
      PendingEvent: null,
    },
    NextEffect: selectedCard,
    UpdatedAt: MOCK_NOW,
  };
};

export const makeMockCreateGambitSessionPayload = (
  cardsPurchased = makeMockGambitTable().MaxCardsPurchased
): CreateGambitSessionPayload => ({
  CardsPurchased: cardsPurchased,
});
