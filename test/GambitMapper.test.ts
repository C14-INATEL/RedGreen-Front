import { describe, expect, it } from '@jest/globals';
import {
  mapBackendGambitGridToViewModel,
  mapBackendGambitSessionToViewModel,
} from '../src/presentation/games/GambitGame/gambitMapper';
import type { GambitApiUnrevealedCard } from '../src/presentation/games/GambitGame/gambitApi';
import {
  createGambitApiGrid,
  createGambitApiPendingEvent,
  createGambitApiPendingInteraction,
  createGambitApiRevealedCard,
  createGambitApiSession,
  createGambitApiUnrevealedCard,
} from './GambitTestBuilders';

describe('GambitMapper', () => {
  it('maps unrevealed backend cards without leaking Points or Effect', () => {
    const hiddenCardWithUnexpectedPayload = {
      Effect: 'CLARIVIDENCIA',
      Locked: true,
      Points: 999,
      Position: 6,
    } as GambitApiUnrevealedCard & {
      Effect: 'CLARIVIDENCIA';
      Points: number;
    };
    const grid = createGambitApiGrid({
      Revealed: [],
      Unrevealed: [hiddenCardWithUnexpectedPayload],
    });

    expect(mapBackendGambitGridToViewModel(grid).cards[6]).toMatchObject({
      effect: null,
      locked: true,
      points: null,
      position: 6,
      revealed: false,
    });
  });

  it('maps revealed backend cards with points, effect and locked state', () => {
    const grid = createGambitApiGrid({
      Revealed: [
        createGambitApiRevealedCard({
          Effect: 'DOBRO_DE_POTASSIO',
          Locked: true,
          Points: 25,
          Position: 2,
        }),
      ],
      Unrevealed: [createGambitApiUnrevealedCard({ Position: 3 })],
    });

    expect(mapBackendGambitGridToViewModel(grid).cards[2]).toMatchObject({
      effect: 'dobro-de-potassio',
      locked: true,
      points: 25,
      position: 2,
      revealed: true,
    });
  });

  it('preserves PendingEvent GoodOptions and BadOptions as visual effects', () => {
    const grid = createGambitApiGrid({
      PendingEvent: createGambitApiPendingEvent({
        BadOptions: ['MELANCIDIO', 'QUANTO_MENOS_MELHOR', 'CORINGA_DO_INATEL'],
        GoodOptions: ['DOBRO_DE_POTASSIO', 'QUANTO_MAIS_MELHOR', 'MENTE_LISA'],
      }),
    });

    expect(mapBackendGambitGridToViewModel(grid).pendingEvent).toEqual({
      badOptions: ['melancidio', 'quanto-menos-melhor', 'coringa-do-inatel'],
      eventType: null,
      goodOptions: ['dobro-de-potassio', 'quanto-mais-melhor', 'mente-lisa'],
    });
  });

  it('preserves PendingInteraction RequiredSelections and SelectedPositions', () => {
    const grid = createGambitApiGrid({
      PendingInteraction: createGambitApiPendingInteraction({
        Action: 'SELECT_MULTIPLE_CARDS',
        Effect: 'CABECINHA',
        RequiredSelections: 3,
        SelectedPositions: [4, 9],
      }),
    });

    expect(mapBackendGambitGridToViewModel(grid).pendingInteraction).toEqual({
      action: 'SELECT_MULTIPLE_CARDS',
      effect: 'cabecinha',
      requiredSelections: 3,
      selectedPositions: [4, 9],
    });
  });

  it('maps session score, burns remaining and prepared effect from the active contract', () => {
    const session = createGambitApiSession({
      AccumulatedPoints: 120,
      BurnSlotsAvailable: 12,
      BurnsRemaining: 4,
      ManualFlipsCount: 8,
      NextEffect: 'CLARIVIDENCIA',
      Result: null,
      Status: 'InProgress',
    });

    expect(mapBackendGambitSessionToViewModel(session)).toMatchObject({
      accumulatedPoints: 120,
      burnsRemaining: 4,
      burnSlotsAvailable: 12,
      manualFlipsCount: 8,
      nextEffect: 'clarividencia',
      result: null,
      status: 'in-progress',
    });
  });
});
