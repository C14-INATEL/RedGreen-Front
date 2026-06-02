import {
  buildBackendGambitCurrentGridSnapshot,
  buildBackendGambitGridPosition,
  buildBackendGambitPendingEvent,
  buildBackendGambitSession,
  buildBackendGambitTable,
} from './GambitTestBuilders';

export const MOCK_GAMBIT_TABLE_ACTIVE = buildBackendGambitTable();

export const MOCK_GAMBIT_SESSION_IN_PROGRESS = buildBackendGambitSession({
  CurrentGridSnapshot: buildBackendGambitCurrentGridSnapshot({
    PendingEvent: buildBackendGambitPendingEvent(),
    Revealed: [
      buildBackendGambitGridPosition({
        Effect: 'DOBRO_DE_POTASSIO',
        Points: 30,
        Position: 0,
      }),
      buildBackendGambitGridPosition({
        Effect: 'CLARIVIDENCIA',
        Points: 45,
        Position: 12,
      }),
    ],
  }),
  NextEffect: 'INVERSAO_GRAVITACIONAL',
});

export const MOCK_GAMBIT_SESSION_FINISHED = buildBackendGambitSession({
  Result: 120,
  Status: 'Finished',
});

export const MOCK_GAMBIT_SESSION_CASHED_OUT = buildBackendGambitSession({
  Result: 120,
  Status: 'CashedOut',
});

export const MOCK_GAMBIT_SESSION_WITH_NULL_GRID = buildBackendGambitSession({
  CurrentGridSnapshot: null,
});
