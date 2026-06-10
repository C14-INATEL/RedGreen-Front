import type { GambitCardEffect } from './gambitTypes';

export type GambitBoardMockCard = {
  effect: GambitCardEffect | null;
  id: number;
  locked?: boolean;
  points: number | null;
  position: number;
  revealed: boolean;
};

export const gambitBoardMockCards: GambitBoardMockCard[] = [
  { effect: null, id: 0, points: 10, position: 0, revealed: false },
  { effect: null, id: 1, points: -15, position: 1, revealed: false },
  { effect: null, id: 2, points: 25, position: 2, revealed: false },
  { effect: null, id: 3, points: -30, position: 3, revealed: false },
  {
    effect: 'DOBRO_DE_POTASSIO',
    id: 4,
    points: null,
    position: 4,
    revealed: false,
  },

  {
    effect: 'MELANCIDIO',
    id: 5,
    points: null,
    position: 5,
    revealed: false,
  },
  {
    effect: 'INVERSAO_GRAVITACIONAL',
    id: 6,
    points: null,
    position: 6,
    revealed: false,
  },
  {
    effect: 'ANULACAO_TOTAL',
    id: 7,
    points: null,
    position: 7,
    revealed: false,
  },
  {
    effect: 'COLORIDINHO',
    id: 8,
    points: null,
    position: 8,
    revealed: false,
  },
  {
    effect: 'HEADGEAR',
    id: 9,
    points: null,
    position: 9,
    revealed: false,
  },

  {
    effect: 'CLARIVIDENCIA',
    id: 10,
    points: null,
    position: 10,
    revealed: false,
  },
  {
    effect: 'CABECINHA',
    id: 11,
    points: null,
    position: 11,
    revealed: false,
  },
  {
    effect: 'JONAS_JOKER',
    id: 12,
    points: null,
    position: 12,
    revealed: false,
  },
  {
    effect: 'CHRIS_JOKER',
    id: 13,
    points: null,
    position: 13,
    revealed: false,
  },
  {
    effect: 'QUANTO_MAIS_MELHOR',
    id: 14,
    points: null,
    position: 14,
    revealed: false,
  },

  {
    effect: 'QUANTO_MENOS_MELHOR',
    id: 15,
    points: null,
    position: 15,
    revealed: false,
  },
  {
    effect: 'MENTE_LISA',
    id: 16,
    points: null,
    position: 16,
    revealed: false,
  },
  {
    effect: 'JACKPOT',
    id: 17,
    points: null,
    position: 17,
    revealed: false,
  },
  {
    effect: 'RATIMUNDIO',
    id: 18,
    points: null,
    position: 18,
    revealed: false,
  },
  {
    effect: 'PAO_COM_OQUE',
    id: 19,
    points: null,
    position: 19,
    revealed: false,
  },

  {
    effect: 'BUMIS_INFILTRADOS',
    id: 20,
    points: null,
    position: 20,
    revealed: false,
  },
  { effect: null, id: 21, points: 40, position: 21, revealed: false },
  { effect: null, id: 22, points: -35, position: 22, revealed: false },
  { effect: null, id: 23, points: 50, position: 23, revealed: false },
  { effect: null, id: 24, points: 35, position: 24, revealed: false },
];

export const basicPointsBoardMockCards: GambitBoardMockCard[] = [
  { effect: null, id: 0, points: 10, position: 0, revealed: false },
  { effect: null, id: 1, points: 15, position: 1, revealed: false },
  { effect: null, id: 2, points: 25, position: 2, revealed: false },
  { effect: null, id: 3, points: 30, position: 3, revealed: false },
  { effect: null, id: 4, points: 20, position: 4, revealed: false },

  { effect: null, id: 5, points: 15, position: 5, revealed: false },
  { effect: null, id: 6, points: 10, position: 6, revealed: false },
  { effect: null, id: 7, points: 40, position: 7, revealed: false },
  { effect: null, id: 8, points: 35, position: 8, revealed: false },
  { effect: null, id: 9, points: 45, position: 9, revealed: false },

  { effect: null, id: 10, points: 25, position: 10, revealed: false },
  { effect: null, id: 11, points: 20, position: 11, revealed: false },
  { effect: null, id: 12, points: 50, position: 12, revealed: false },
  { effect: null, id: 13, points: 30, position: 13, revealed: false },
  { effect: null, id: 14, points: 25, position: 14, revealed: false },

  { effect: null, id: 15, points: 40, position: 15, revealed: false },
  { effect: null, id: 16, points: 15, position: 16, revealed: false },
  { effect: null, id: 17, points: 35, position: 17, revealed: false },
  { effect: null, id: 18, points: 20, position: 18, revealed: false },
  { effect: null, id: 19, points: 45, position: 19, revealed: false },

  { effect: null, id: 20, points: 30, position: 20, revealed: false },
  { effect: null, id: 21, points: 35, position: 21, revealed: false },
  { effect: null, id: 22, points: 10, position: 22, revealed: false },
  { effect: null, id: 23, points: 50, position: 23, revealed: false },
  { effect: null, id: 24, points: 35, position: 24, revealed: false },
];
