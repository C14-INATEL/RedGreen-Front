export const MINEFIELD_GRID_SIZE = 5;
export const MINEFIELD_CELL_COUNT = MINEFIELD_GRID_SIZE * MINEFIELD_GRID_SIZE;

export type MinefieldCard = {
  effect: null;
  id: number;
  points: number;
  revealed: boolean;
};

const MOCK_CARD_POINTS = [
  10, 15, 20, 25, 30, 15, 35, 40, 20, 45, 25, 10, 50, 30, 20, 40, 15, 35, 25,
  45, 30, 20, 10, 50, 35,
] as const;

export const createMockMinefieldCards = (): MinefieldCard[] =>
  Array.from({ length: MINEFIELD_CELL_COUNT }, (_, index) => ({
    effect: null,
    id: index,
    points: MOCK_CARD_POINTS[index] ?? 10,
    revealed: false,
  }));
