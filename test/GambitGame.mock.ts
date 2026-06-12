import type {
  GambitApiGrid,
  GambitApiPendingEvent,
  GambitApiPendingInteraction,
  GambitApiSession,
} from '../src/presentation/games/GambitGame/GambitApi';
import {
  createGambitApiPendingEvent,
  createGambitApiPendingInteraction,
  createGambitApiRevealedCard,
  createGambitApiSession,
  createGambitApiUnrevealedCard,
} from './GambitTestBuilders';

export const TEST_GAMBIT_GAME_SESSIONS: Record<string, GambitApiSession> = {
  active: createGambitApiSession(),
  pendingEvent: createGambitApiSession({
    Grid: {
      PendingEvent: createGambitApiPendingEvent(),
      PendingInteraction: null,
      Revealed: [
        createGambitApiRevealedCard({
          Points: 20,
          Position: 4,
        }),
      ],
      Unrevealed: [
        createGambitApiUnrevealedCard({ Position: 0 }),
        createGambitApiUnrevealedCard({ Position: 1 }),
      ],
    },
    ManualFlipsCount: 5,
  }),
  pendingInteraction: createGambitApiSession({
    Grid: {
      PendingEvent: null,
      PendingInteraction: createGambitApiPendingInteraction({
        Action: 'SELECT_MULTIPLE_CARDS',
        Effect: 'CABECINHA',
        RequiredSelections: 3,
      }),
      Revealed: [],
      Unrevealed: [
        createGambitApiUnrevealedCard({ Position: 0 }),
        createGambitApiUnrevealedCard({ Position: 1 }),
        createGambitApiUnrevealedCard({ Position: 2 }),
      ],
    },
  }),
};

const TEST_GAMBIT_GAME_SESSION_SEQUENCE = [
  'active',
  'pendingEvent',
  'pendingInteraction',
] as const;

let testGambitGameSessionIndex = 0;

const clonePendingEvent = (
  pendingEvent: GambitApiPendingEvent | null
): GambitApiPendingEvent | null =>
  pendingEvent
    ? {
        ...pendingEvent,
        BadOptions: [...pendingEvent.BadOptions],
        CardsOffered: pendingEvent.CardsOffered
          ? [...pendingEvent.CardsOffered]
          : undefined,
        GoodOptions: [...pendingEvent.GoodOptions],
      }
    : null;

const clonePendingInteraction = (
  pendingInteraction: GambitApiPendingInteraction | null
): GambitApiPendingInteraction | null =>
  pendingInteraction
    ? {
        ...pendingInteraction,
        SelectedPositions: [...pendingInteraction.SelectedPositions],
      }
    : null;

const cloneGrid = (grid: GambitApiGrid): GambitApiGrid => ({
  PendingEvent: clonePendingEvent(grid.PendingEvent),
  PendingInteraction: clonePendingInteraction(grid.PendingInteraction),
  Revealed: grid.Revealed.map((card) => ({ ...card })),
  Unrevealed: grid.Unrevealed.map((card) => ({ ...card })),
});

export const cloneTestGambitGameSession = (
  session: GambitApiSession
): GambitApiSession => ({
  ...session,
  CurrentGridSnapshot: session.CurrentGridSnapshot
    ? cloneGrid(session.CurrentGridSnapshot)
    : undefined,
  GambitTable: session.GambitTable ? { ...session.GambitTable } : null,
  Grid: cloneGrid(session.Grid),
});

export const resetTestGambitGameSessionSequence = () => {
  testGambitGameSessionIndex = 0;
};

export const getTestGambitGameSession = () => {
  const nextMockId =
    TEST_GAMBIT_GAME_SESSION_SEQUENCE[
      testGambitGameSessionIndex % TEST_GAMBIT_GAME_SESSION_SEQUENCE.length
    ];

  testGambitGameSessionIndex += 1;

  return cloneTestGambitGameSession(TEST_GAMBIT_GAME_SESSIONS[nextMockId]);
};
