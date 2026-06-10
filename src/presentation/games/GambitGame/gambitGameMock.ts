import { GAMBIT_GRID_SIZE } from './gambitGameConfig';
import {
  CONSUME_CLARIVIDENCIA_ON_PREVIEW_CANCEL,
  FIRST_MOCK_EVENT_FLIP,
  SECOND_MOCK_EVENT_FLIP,
  applyMockGambitEffect,
  canRevealMockGambitCard,
  getGambitSessionGridSnapshot,
  makeMockGambitSession,
  makeMockGambitTable,
  revealMockGambitCard,
  resolveMockPendingEvent,
  resolveMockPendingInteraction,
  selectMockPendingInteractionPosition,
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
  FIRST_MOCK_EVENT_FLIP,
  SECOND_MOCK_EVENT_FLIP,
  applyMockGambitEffect,
  canRevealMockGambitCard,
  gambitMockScenarios,
  getGambitSessionGridSnapshot,
  makeMockGambitSession,
  makeMockGambitTable,
  revealMockGambitCard,
  resolveMockPendingEvent,
  resolveMockPendingInteraction,
  selectMockPendingInteractionPosition,
  selectMockPendingEventCard,
  startMockClarividenciaPreview,
};

export const getGambitGridCoordinates = (position: number) => ({
  column: (position % GAMBIT_GRID_SIZE) + 1,
  row: Math.floor(position / GAMBIT_GRID_SIZE) + 1,
});

export const sumRevealedGambitCardPoints = (session: GambitSession) =>
  getGambitSessionGridSnapshot(session)?.Revealed.reduce(
    (total, card) =>
      (card.Points ?? null) !== null ? total + card.Points : total,
    0
  ) ?? 0;
