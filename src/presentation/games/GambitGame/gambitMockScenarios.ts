import {
  basicPointsBoardMockCards,
  gambitBoardMockCards,
  type GambitBoardMockCard,
} from './gambitBoardMock';
import type {
  GambitGridCard,
  GambitPendingEvent,
  GambitPendingInteraction,
  GambitSessionStatus,
} from './gambitTypes';

export const ACTIVE_GAMBIT_MOCK_SCENARIO = 'effectsOnBoard';

export type GambitMockScenarioId =
  | 'basicPoints'
  | 'mixedPositiveNegative'
  | 'effectsOnBoard'
  | 'clarividenciaFlow'
  | 'cabecinhaFlow'
  | 'basicRevealFlow'
  | 'lockedCardFlow'
  | 'pendingEventChoice'
  | 'nextEffectPreview';

export type GambitMockScenarioCard = GambitBoardMockCard;

export type GambitMockScenario = {
  accumulatedPoints: number;
  burnSlotsAvailable: number;
  cardsPurchased: number;
  firstEventFlip: number;
  manualFlipsCount: number;
  name: string;
  nextEffect: GambitGridCard['Effect'];
  pendingEvent: GambitPendingEvent | null;
  pendingInteraction: GambitPendingInteraction | null;
  result?: number | null;
  revealed: GambitMockScenarioCard[];
  secondEventFlip: number;
  status: GambitSessionStatus;
  unrevealed: GambitMockScenarioCard[];
};

export const mockPendingEvent: GambitPendingEvent = {
  BadOptions: ['RATIMUNDIO', 'QUANTO_MENOS_MELHOR', 'PAO_COM_OQUE'],
  EventType: 'Neutral',
  GoodOptions: ['DOBRO_DE_POTASSIO', 'JACKPOT', 'QUANTO_MAIS_MELHOR'],
};

const DEFAULT_BURN_SLOTS_AVAILABLE = 25;
const FIRST_EVENT_FLIP = 5;
const SECOND_EVENT_FLIP = 13;

const cloneBoardCard = (card: GambitBoardMockCard): GambitMockScenarioCard => ({
  ...card,
});

const splitBoardByRevealedPositions = (
  cards: GambitBoardMockCard[],
  revealedPositions: number[] = []
) => {
  const revealedPositionSet = new Set(revealedPositions);
  const revealed: GambitMockScenarioCard[] = [];
  const unrevealed: GambitMockScenarioCard[] = [];

  cards.forEach((card) => {
    const nextCard = {
      ...cloneBoardCard(card),
      revealed: revealedPositionSet.has(card.position),
    };

    if (nextCard.revealed) {
      revealed.push(nextCard);
      return;
    }

    unrevealed.push(nextCard);
  });

  return {
    revealed,
    unrevealed,
  };
};

const toGridCard = (card: GambitMockScenarioCard): GambitGridCard => ({
  Effect: card.effect,
  Locked: Boolean(card.locked),
  Points: card.points,
  Position: card.position,
});

const makeScenario = (
  scenario: Omit<
    GambitMockScenario,
    'burnSlotsAvailable' | 'firstEventFlip' | 'secondEventFlip'
  > &
    Partial<
      Pick<
        GambitMockScenario,
        'burnSlotsAvailable' | 'firstEventFlip' | 'secondEventFlip'
      >
    >
): GambitMockScenario => ({
  burnSlotsAvailable: DEFAULT_BURN_SLOTS_AVAILABLE,
  firstEventFlip: FIRST_EVENT_FLIP,
  secondEventFlip: SECOND_EVENT_FLIP,
  ...scenario,
});

const basicPointsBoard = splitBoardByRevealedPositions(
  basicPointsBoardMockCards
);
const mixedBoard = splitBoardByRevealedPositions(gambitBoardMockCards);
const pendingEventBoard = splitBoardByRevealedPositions(
  gambitBoardMockCards,
  [0, 1, 2, 3, 4]
);
const nextEffectBoard = splitBoardByRevealedPositions(
  basicPointsBoardMockCards,
  [0, 1]
);
const lockedCardBoard = splitBoardByRevealedPositions(
  basicPointsBoardMockCards.map((card) =>
    card.position === 3 ? { ...card, locked: true } : card
  )
);

const basicPointsScenario = makeScenario({
  accumulatedPoints: 0,
  cardsPurchased: basicPointsBoardMockCards.length,
  manualFlipsCount: 0,
  name: 'Pontos positivos basicos',
  nextEffect: null,
  pendingEvent: null,
  pendingInteraction: null,
  revealed: basicPointsBoard.revealed,
  status: 'InProgress',
  unrevealed: basicPointsBoard.unrevealed,
});

export const gambitMockScenarios: Record<
  GambitMockScenarioId,
  GambitMockScenario
> = {
  basicPoints: basicPointsScenario,
  basicRevealFlow: basicPointsScenario,
  cabecinhaFlow: makeScenario({
    accumulatedPoints: 0,
    cardsPurchased: gambitBoardMockCards.length,
    manualFlipsCount: 0,
    name: 'Fluxo de Cabecinha',
    nextEffect: null,
    pendingEvent: null,
    pendingInteraction: null,
    revealed: mixedBoard.revealed,
    status: 'InProgress',
    unrevealed: mixedBoard.unrevealed,
  }),
  clarividenciaFlow: makeScenario({
    accumulatedPoints: 0,
    cardsPurchased: gambitBoardMockCards.length,
    manualFlipsCount: 0,
    name: 'Fluxo de Clarividencia',
    nextEffect: null,
    pendingEvent: null,
    pendingInteraction: null,
    revealed: mixedBoard.revealed,
    status: 'InProgress',
    unrevealed: mixedBoard.unrevealed,
  }),
  effectsOnBoard: makeScenario({
    accumulatedPoints: 0,
    cardsPurchased: gambitBoardMockCards.length,
    manualFlipsCount: 0,
    name: 'Cartas de efeito posicionadas na mesa',
    nextEffect: null,
    pendingEvent: null,
    pendingInteraction: null,
    revealed: mixedBoard.revealed,
    status: 'InProgress',
    unrevealed: mixedBoard.unrevealed,
  }),
  lockedCardFlow: makeScenario({
    accumulatedPoints: 0,
    cardsPurchased: basicPointsBoardMockCards.length,
    manualFlipsCount: 0,
    name: 'Carta travada no tabuleiro',
    nextEffect: null,
    pendingEvent: null,
    pendingInteraction: null,
    revealed: lockedCardBoard.revealed,
    status: 'InProgress',
    unrevealed: lockedCardBoard.unrevealed,
  }),
  mixedPositiveNegative: makeScenario({
    accumulatedPoints: 0,
    cardsPurchased: gambitBoardMockCards.length,
    manualFlipsCount: 0,
    name: 'Mistura de pontos positivos, negativos e efeitos',
    nextEffect: null,
    pendingEvent: null,
    pendingInteraction: null,
    revealed: mixedBoard.revealed,
    status: 'InProgress',
    unrevealed: mixedBoard.unrevealed,
  }),
  nextEffectPreview: makeScenario({
    accumulatedPoints: 25,
    cardsPurchased: basicPointsBoardMockCards.length,
    manualFlipsCount: 2,
    name: 'Proximo efeito pronto para a carta seguinte',
    nextEffect: 'DOBRO_DE_POTASSIO',
    pendingEvent: null,
    pendingInteraction: null,
    revealed: nextEffectBoard.revealed,
    status: 'InProgress',
    unrevealed: nextEffectBoard.unrevealed,
  }),
  pendingEventChoice: makeScenario({
    accumulatedPoints: 20,
    cardsPurchased: gambitBoardMockCards.length,
    manualFlipsCount: FIRST_EVENT_FLIP,
    name: 'Evento pendente no novo contrato',
    nextEffect: 'DOBRO_DE_POTASSIO',
    pendingEvent: mockPendingEvent,
    pendingInteraction: null,
    revealed: pendingEventBoard.revealed,
    status: 'InProgress',
    unrevealed: pendingEventBoard.unrevealed,
  }),
};

export const getActiveGambitMockScenario = () =>
  gambitMockScenarios[ACTIVE_GAMBIT_MOCK_SCENARIO];

export const mapScenarioCardToGambitGridCard = toGridCard;
