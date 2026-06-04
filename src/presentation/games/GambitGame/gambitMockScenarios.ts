import type {
  GambitCardEffect,
  GambitGridCard,
  GambitPendingEvent,
  GambitSessionStatus,
} from './gambitTypes';

export const ACTIVE_GAMBIT_MOCK_SCENARIO = 'basicRevealFlow';

export type GambitMockScenarioId =
  | 'basicRevealFlow'
  | 'pendingEventChoice'
  | 'nextEffectPreview';

export type GambitMockScenarioCard = {
  effect?: GambitCardEffect | null;
  points: number;
  position: number;
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

const MOCK_CARD_POINTS = [
  10, 15, 20, 25, 30, 15, 35, 40, 20, 45, 25, 10, 50, 30, 20, 40, 15, 35, 25,
  45, 30, 20, 10, 50, 35,
] as const;

const effectByPosition: Partial<Record<number, GambitCardEffect>> = {
  4: 'DOBRO_DE_POTASSIO',
  8: 'MELANCIDIO',
  12: 'CLARIVIDENCIA',
  18: 'INVERSAO_GRAVITACIONAL',
};

const makeScenarioCard = (
  position: number,
  points = MOCK_CARD_POINTS[position] ?? 10
): GambitMockScenarioCard => ({
  effect: effectByPosition[position] ?? null,
  points,
  position,
});

const makeScenarioGrid = () =>
  Array.from({ length: MOCK_CARD_POINTS.length }, (_, position) =>
    makeScenarioCard(position)
  );

const toGridCard = (card: GambitMockScenarioCard): GambitGridCard => ({
  Effect: card.effect ?? null,
  Points: card.points,
  Position: card.position,
});

const baseGrid = makeScenarioGrid();

const pendingEvent: GambitPendingEvent = {
  CardsOffered: ['DOBRO_DE_POTASSIO', 'MELANCIDIO', 'CLARIVIDENCIA'],
  EventType: 'Neutral',
};

export const gambitMockScenarios: Record<
  GambitMockScenarioId,
  GambitMockScenario
> = {
  basicRevealFlow: {
    accumulatedPoints: 0,
    cardsPurchased: baseGrid.length,
    manualFlipsCount: 0,
    name: 'Fluxo basico de revelacao',
    nextEffect: null,
    pendingEvent: null,
    revealed: [],
    status: 'InProgress',
    unrevealed: baseGrid,
  },
  nextEffectPreview: {
    accumulatedPoints: 40,
    cardsPurchased: baseGrid.length,
    manualFlipsCount: 2,
    name: 'Proximo efeito pronto para a carta seguinte',
    nextEffect: 'DOBRO_DE_POTASSIO',
    pendingEvent: null,
    revealed: baseGrid.slice(0, 2),
    status: 'InProgress',
    unrevealed: baseGrid.slice(2),
  },
  pendingEventChoice: {
    accumulatedPoints: 45,
    cardsPurchased: baseGrid.length,
    manualFlipsCount: 3,
    name: 'Evento pendente apos tres revelacoes',
    nextEffect: null,
    pendingEvent,
    revealed: baseGrid.slice(0, 3),
    status: 'InProgress',
    unrevealed: baseGrid.slice(3),
  },
};

export const getActiveGambitMockScenario = () =>
  gambitMockScenarios[ACTIVE_GAMBIT_MOCK_SCENARIO];

export const mapScenarioCardToGambitGridCard = toGridCard;
