import type {
  GambitCardEffect,
  GambitGridCard,
  GambitPendingEvent,
  GambitSessionStatus,
} from './gambitTypes';

export const ACTIVE_GAMBIT_MOCK_SCENARIO = 'basicPoints';

export type GambitMockScenarioId =
  | 'basicPoints'
  | 'mixedPositiveNegative'
  | 'effectsOnBoard'
  | 'clarividenciaFlow'
  | 'basicRevealFlow'
  | 'pendingEventChoice'
  | 'nextEffectPreview';

export type GambitMockScenarioCard = {
  effect?: GambitCardEffect | null;
  id?: number;
  points: number;
  position: number;
  revealed?: boolean;
};

export type GambitMockScenario = {
  accumulatedPoints: number;
  cardsPurchased: number;
  manualFlipsCount: number;
  name: string;
  nextEffect: GambitCardEffect | null;
  pendingEvent: GambitPendingEvent | null;
  result?: number | null;
  revealed: GambitMockScenarioCard[];
  status: GambitSessionStatus;
  unrevealed: GambitMockScenarioCard[];
};

const BASIC_CARD_POINTS = [
  10, 15, 20, 25, 30, 15, 35, 40, 20, 45, 25, 10, 50, 30, 20, 40, 15, 35, 25,
  45, 30, 20, 10, 50, 35,
] as const;

const MIXED_CARD_POINTS = [
  10, 25, -15, 30, -30, 15, 35, -20, 20, 45, -10, 10, 50, -25, 20, 40, 15, -35,
  25, 45, -5, 20, 10, -50, 35,
] as const;

const makeScenarioCard = (
  position: number,
  points: number,
  effect: GambitCardEffect | null = null,
  revealed = false
): GambitMockScenarioCard => ({
  effect,
  id: position,
  points,
  position,
  revealed,
});

const makeScenarioGrid = (points: readonly number[]) =>
  Array.from({ length: points.length }, (_, position) =>
    makeScenarioCard(position, points[position] ?? 10)
  );

const toGridCard = (card: GambitMockScenarioCard): GambitGridCard => ({
  Effect: card.effect ?? null,
  Points: card.points,
  Position: card.position,
});

const basicPointsGrid = makeScenarioGrid(BASIC_CARD_POINTS);
const mixedPositiveNegativeGrid = makeScenarioGrid(MIXED_CARD_POINTS);
const effectsOnBoardGrid = basicPointsGrid.map((card) => {
  if (card.position === 7) {
    return makeScenarioCard(7, 0, 'CLARIVIDENCIA');
  }

  if (card.position === 13) {
    return makeScenarioCard(13, 0, 'DOBRO_DE_POTASSIO');
  }

  return card;
});
const clarividenciaGrid = mixedPositiveNegativeGrid.map((card) => {
  if (card.position === 7) {
    return makeScenarioCard(7, 0, 'CLARIVIDENCIA');
  }

  return card;
});

const pendingEvent: GambitPendingEvent = {
  CardsOffered: ['DOBRO_DE_POTASSIO', 'MELANCIDIO', 'CLARIVIDENCIA'],
  EventType: 'Neutral',
};

const basicPointsScenario: GambitMockScenario = {
  accumulatedPoints: 0,
  cardsPurchased: basicPointsGrid.length,
  manualFlipsCount: 0,
  name: 'Pontos positivos basicos',
  nextEffect: null,
  pendingEvent: null,
  revealed: [],
  status: 'InProgress',
  unrevealed: basicPointsGrid,
};

export const gambitMockScenarios: Record<
  GambitMockScenarioId,
  GambitMockScenario
> = {
  basicPoints: basicPointsScenario,
  basicRevealFlow: basicPointsScenario,
  clarividenciaFlow: {
    accumulatedPoints: 0,
    cardsPurchased: clarividenciaGrid.length,
    manualFlipsCount: 0,
    name: 'Fluxo de pre-visualizacao da Clarividencia',
    nextEffect: 'CLARIVIDENCIA',
    pendingEvent: null,
    revealed: [],
    status: 'InProgress',
    unrevealed: clarividenciaGrid,
  },
  effectsOnBoard: {
    accumulatedPoints: 0,
    cardsPurchased: effectsOnBoardGrid.length,
    manualFlipsCount: 0,
    name: 'Cartas de efeito posicionadas na mesa',
    nextEffect: null,
    pendingEvent: null,
    revealed: [],
    status: 'InProgress',
    unrevealed: effectsOnBoardGrid,
  },
  mixedPositiveNegative: {
    accumulatedPoints: 0,
    cardsPurchased: mixedPositiveNegativeGrid.length,
    manualFlipsCount: 0,
    name: 'Mistura de pontos positivos e negativos',
    nextEffect: null,
    pendingEvent: null,
    revealed: [],
    status: 'InProgress',
    unrevealed: mixedPositiveNegativeGrid,
  },
  nextEffectPreview: {
    accumulatedPoints: 25,
    cardsPurchased: basicPointsGrid.length,
    manualFlipsCount: 2,
    name: 'Proximo efeito pronto para a carta seguinte',
    nextEffect: 'DOBRO_DE_POTASSIO',
    pendingEvent: null,
    revealed: basicPointsGrid.slice(0, 2),
    status: 'InProgress',
    unrevealed: basicPointsGrid.slice(2),
  },
  pendingEventChoice: {
    accumulatedPoints: 45,
    cardsPurchased: basicPointsGrid.length,
    manualFlipsCount: 3,
    name: 'Evento pendente apos tres revelacoes',
    nextEffect: null,
    pendingEvent,
    revealed: basicPointsGrid.slice(0, 3),
    status: 'InProgress',
    unrevealed: basicPointsGrid.slice(3),
  },
};

export const getActiveGambitMockScenario = () =>
  gambitMockScenarios[ACTIVE_GAMBIT_MOCK_SCENARIO];

export const mapScenarioCardToGambitGridCard = toGridCard;
