import type {
  GambitApiGrid,
  GambitApiPendingEvent,
  GambitApiPendingInteraction,
  GambitApiRevealedCard,
  GambitApiSession,
  GambitApiUnrevealedCard,
} from '../src/presentation/games/GambitGame/gambitApi';

const GAMBIT_TEST_CELL_COUNT = 25;

export const createGambitApiUnrevealedCard = (
  overrides: Partial<GambitApiUnrevealedCard> = {}
): GambitApiUnrevealedCard => ({
  Locked: false,
  Position: 0,
  ...overrides,
});

export const createGambitApiRevealedCard = (
  overrides: Partial<GambitApiRevealedCard> = {}
): GambitApiRevealedCard => ({
  Effect: null,
  Locked: false,
  Points: 10,
  Position: 0,
  ...overrides,
});

export const createGambitApiPendingEvent = (
  overrides: Partial<GambitApiPendingEvent> = {}
): GambitApiPendingEvent => ({
  BadOptions: ['MELANCIDIO', 'QUANTO_MENOS_MELHOR', 'CORINGA_DO_INATEL'],
  GoodOptions: ['DOBRO_DE_POTASSIO', 'QUANTO_MAIS_MELHOR', 'MENTE_LISA'],
  ...overrides,
});

export const createGambitApiPendingInteraction = (
  overrides: Partial<GambitApiPendingInteraction> = {}
): GambitApiPendingInteraction => ({
  Action: 'SELECT_CARD',
  Effect: 'CLARIVIDENCIA',
  RequiredSelections: 1,
  SelectedPositions: [],
  ...overrides,
});

export const createGambitApiGrid = (
  overrides: Partial<GambitApiGrid> = {}
): GambitApiGrid => ({
  PendingEvent: null,
  PendingInteraction: null,
  Revealed: [],
  Unrevealed: Array.from({ length: GAMBIT_TEST_CELL_COUNT }, (_, position) =>
    createGambitApiUnrevealedCard({ Position: position })
  ),
  ...overrides,
});

export const createGambitApiSession = (
  overrides: Partial<GambitApiSession> = {}
): GambitApiSession => ({
  AccumulatedPoints: 0,
  BurnSlotsAvailable: 25,
  BurnsRemaining: 25,
  CardsPurchased: 25,
  CreatedAt: '2026-06-01T00:00:00.000Z',
  GambitSessionId: 101,
  GambitTableId: 7,
  Grid: createGambitApiGrid(),
  ManualFlipsCount: 0,
  NextEffect: null,
  Result: null,
  Status: 'InProgress',
  UpdatedAt: '2026-06-01T00:00:00.000Z',
  UserId: 'gambit-test-user',
  ...overrides,
});
