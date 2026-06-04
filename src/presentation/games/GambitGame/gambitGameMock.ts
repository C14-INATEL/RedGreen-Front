import { GAMBIT_GRID_SIZE } from './gambitGameConfig';
import {
  CONSUME_CLARIVIDENCIA_ON_PREVIEW_CANCEL,
  applyMockGambitEffect,
  makeMockGambitSession,
  makeMockGambitTable,
  revealMockGambitCard,
  selectMockPendingEventCard,
  startMockClarividenciaPreview,
} from './gambitMockBuilders';
import {
  ACTIVE_GAMBIT_MOCK_SCENARIO,
  gambitMockScenarios,
} from './gambitMockScenarios';
import type { GambitSession } from './gambitTypes';

export {
  ACTIVE_GAMBIT_MOCK_SCENARIO,
  CONSUME_CLARIVIDENCIA_ON_PREVIEW_CANCEL,
  applyMockGambitEffect,
  gambitMockScenarios,
  makeMockGambitSession,
  makeMockGambitTable,
  revealMockGambitCard,
  selectMockPendingEventCard,
  startMockClarividenciaPreview,
};

export const getGambitGridCoordinates = (position: number) => ({
  column: (position % GAMBIT_GRID_SIZE) + 1,
  row: Math.floor(position / GAMBIT_GRID_SIZE) + 1,
});

export const sumRevealedGambitCardPoints = (session: GambitSession) =>
  session.CurrentGridSnapshot?.Revealed.reduce(
    (total, card) =>
      card.Effect === null && card.Points !== null
        ? total + card.Points
        : total,
    0
  ) ?? 0;
