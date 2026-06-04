import { basicPointsBoardMockCards } from './gambitBoardMock';
import type { GambitVisualCard } from './gambitTypes';

export const GAMBIT_GRID_SIZE = 5;
export const GAMBIT_CELL_COUNT = GAMBIT_GRID_SIZE * GAMBIT_GRID_SIZE;

export type GambitCard = GambitVisualCard;

export const createMockGambitCards = (): GambitCard[] =>
  basicPointsBoardMockCards.map((card) => ({
    effect: null,
    id: card.id,
    points: card.points,
    previewed: false,
    position: card.position,
    revealed: false,
  }));
