import type { GambitVisualCard } from './gambitTypes';

export const GAMBIT_GRID_SIZE = 5;
export const GAMBIT_CELL_COUNT = GAMBIT_GRID_SIZE * GAMBIT_GRID_SIZE;

export type GambitCard = GambitVisualCard;

const MOCK_CARD_POINTS = [
  10, 15, 20, 25, 30, 15, 35, 40, 20, 45, 25, 10, 50, 30, 20, 40, 15, 35, 25,
  45, 30, 20, 10, 50, 35,
] as const;

export const createMockGambitCards = (): GambitCard[] =>
  Array.from({ length: GAMBIT_CELL_COUNT }, (_, index) => ({
    effect: null,
    id: index,
    points: MOCK_CARD_POINTS[index] ?? 10,
    previewed: false,
    position: index,
    revealed: false,
  }));
