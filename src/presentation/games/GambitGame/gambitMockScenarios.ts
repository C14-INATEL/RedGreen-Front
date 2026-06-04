import {
  basicPointsBoardMockCards,
  gambitBoardMockCards,
  type GambitBoardMockCard,
} from './gambitBoardMock';
import type {
  GambitGridCard,
  GambitPendingEvent,
  GambitSessionStatus,
} from './gambitTypes';

export const ACTIVE_GAMBIT_MOCK_SCENARIO = 'effectsOnBoard';

export type GambitMockScenarioId =
  | 'basicPoints'
  | 'mixedPositiveNegative'
  | 'effectsOnBoard'
  | 'clarividenciaFlow'
  | 'basicRevealFlow'
  | 'pendingEventChoice'
  | 'nextEffectPreview';

export type GambitMockScenarioCard = GambitBoardMockCard;

export type GambitMockScenario = {
  accumulatedPoints: number;
  cardsPurchased: number;
  manualFlipsCount: number;
  name: string;
  nextEffect: GambitGridCard['Effect'];
  pendingEvent: GambitPendingEvent | null;
  result?: number | null;
  revealed: GambitMockScenarioCard[];
  status: GambitSessionStatus;
  unrevealed: GambitMockScenarioCard[];
};

const pendingEvent: GambitPendingEvent = {
  CardsOffered: ['DOBRO_DE_POTASSIO', 'MELANCIDIO', 'CLARIVIDENCIA'],
  EventType: 'Neutral',
};

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
  Points: card.points,
  Position: card.position,
});

const basicPointsBoard = splitBoardByRevealedPositions(
  basicPointsBoardMockCards
);
const mixedBoard = splitBoardByRevealedPositions(gambitBoardMockCards);
const pendingEventBoard = splitBoardByRevealedPositions(
  gambitBoardMockCards,
  [0, 2, 4]
);
const nextEffectBoard = splitBoardByRevealedPositions(
  basicPointsBoardMockCards,
  [0, 1]
);

const basicPointsScenario: GambitMockScenario = {
  accumulatedPoints: 0,
  cardsPurchased: basicPointsBoardMockCards.length,
  manualFlipsCount: 0,
  name: 'Pontos positivos basicos',
  nextEffect: null,
  pendingEvent: null,
  revealed: basicPointsBoard.revealed,
  status: 'InProgress',
  unrevealed: basicPointsBoard.unrevealed,
};

export const gambitMockScenarios: Record<
  GambitMockScenarioId,
  GambitMockScenario
> = {
  basicPoints: basicPointsScenario,
  basicRevealFlow: basicPointsScenario,
  clarividenciaFlow: {
    accumulatedPoints: 0,
    cardsPurchased: gambitBoardMockCards.length,
    manualFlipsCount: 0,
    name: 'Fluxo de pre-visualizacao da Clarividencia',
    nextEffect: 'CLARIVIDENCIA',
    pendingEvent: null,
    revealed: mixedBoard.revealed,
    status: 'InProgress',
    unrevealed: mixedBoard.unrevealed,
  },
  effectsOnBoard: {
    accumulatedPoints: 0,
    cardsPurchased: gambitBoardMockCards.length,
    manualFlipsCount: 0,
    name: 'Cartas de efeito posicionadas na mesa',
    nextEffect: null,
    pendingEvent: null,
    revealed: mixedBoard.revealed,
    status: 'InProgress',
    unrevealed: mixedBoard.unrevealed,
  },
  mixedPositiveNegative: {
    accumulatedPoints: 0,
    cardsPurchased: gambitBoardMockCards.length,
    manualFlipsCount: 0,
    name: 'Mistura de pontos positivos, negativos e efeitos',
    nextEffect: null,
    pendingEvent: null,
    revealed: mixedBoard.revealed,
    status: 'InProgress',
    unrevealed: mixedBoard.unrevealed,
  },
  nextEffectPreview: {
    accumulatedPoints: 25,
    cardsPurchased: basicPointsBoardMockCards.length,
    manualFlipsCount: 2,
    name: 'Proximo efeito pronto para a carta seguinte',
    nextEffect: 'DOBRO_DE_POTASSIO',
    pendingEvent: null,
    revealed: nextEffectBoard.revealed,
    status: 'InProgress',
    unrevealed: nextEffectBoard.unrevealed,
  },
  pendingEventChoice: {
    accumulatedPoints: 35,
    cardsPurchased: gambitBoardMockCards.length,
    manualFlipsCount: 3,
    name: 'Evento pendente apos tres revelacoes',
    nextEffect: 'DOBRO_DE_POTASSIO',
    pendingEvent,
    revealed: pendingEventBoard.revealed,
    status: 'InProgress',
    unrevealed: pendingEventBoard.unrevealed,
  },
};

export const getActiveGambitMockScenario = () =>
  gambitMockScenarios[ACTIVE_GAMBIT_MOCK_SCENARIO];

export const mapScenarioCardToGambitGridCard = toGridCard;
