import { describe, expect, it } from '@jest/globals';
import {
  mapBackendGambitCardToViewModel,
  mapBackendGambitGridToViewModel,
  mapBackendGambitSessionToViewModel,
  mapBackendGambitTableToViewModel,
} from '../src/presentation/games/GambitGame/gambitMapper';
import type { BackendGambitCard } from '../src/presentation/games/GambitGame/gambitTypes';
import {
  MOCK_GAMBIT_SESSION_CASHED_OUT,
  MOCK_GAMBIT_SESSION_FINISHED,
  MOCK_GAMBIT_SESSION_IN_PROGRESS,
  MOCK_GAMBIT_SESSION_WITH_NULL_GRID,
  MOCK_GAMBIT_TABLE_ACTIVE,
} from './GambitSession.mock';
import {
  buildBackendGambitCurrentGridSnapshot,
  buildBackendGambitGridPosition,
  buildBackendGambitPendingEvent,
  buildBackendGambitSession,
} from './GambitTestBuilders';

describe('Gambit mapper', () => {
  it('maps BackendGambitTable into the visual table ViewModel', () => {
    expect(mapBackendGambitTableToViewModel(MOCK_GAMBIT_TABLE_ACTIVE)).toEqual({
      active: true,
      cardPrice: 10,
      description: 'Gambit table used by mapper tests',
      eventInterval: 3,
      gambitTableId: 17,
      maxCardsPurchased: 25,
      minimumCardsPurchased: 1,
      minimumChipsRequired: 10,
      name: 'Gambit Test Table',
      purchaseMultiplierScale: 1.2,
      tableId: 17,
      tableMultiplier: 2,
    });
  });

  it('keeps MinimumChipsRequired null when the backend table sends null', () => {
    expect(
      mapBackendGambitTableToViewModel({
        ...MOCK_GAMBIT_TABLE_ACTIVE,
        MinimumChipsRequired: null,
      }).minimumChipsRequired
    ).toBeNull();
  });

  it('maps an InProgress BackendGambitSession into a stable visual session', () => {
    const viewModel = mapBackendGambitSessionToViewModel(
      MOCK_GAMBIT_SESSION_IN_PROGRESS
    );

    expect(viewModel).toMatchObject({
      cardsPurchased: 5,
      gambitSessionId: 101,
      gambitTableId: 17,
      nextEffect: 'inversao-gravitacional',
      result: null,
      sessionId: 101,
      status: 'in-progress',
      tableId: 17,
      userId: 'user-7',
    });
    expect(viewModel.grid.cards).toHaveLength(25);
  });

  it('maps Finished and CashedOut statuses explicitly', () => {
    expect(
      mapBackendGambitSessionToViewModel(MOCK_GAMBIT_SESSION_FINISHED)
    ).toMatchObject({
      result: 120,
      status: 'finished',
    });
    expect(
      mapBackendGambitSessionToViewModel(MOCK_GAMBIT_SESSION_CASHED_OUT)
    ).toMatchObject({
      result: 120,
      status: 'cashed-out',
    });
  });

  it('maps Revealed positions with Position, Points and Effect', () => {
    const grid = mapBackendGambitGridToViewModel(
      buildBackendGambitCurrentGridSnapshot({
        Revealed: [
          buildBackendGambitGridPosition({
            Effect: 'MELANCIDIO',
            Points: 80,
            Position: 7,
          }),
        ],
      })
    );

    expect(grid.cards[7]).toEqual({
      effect: 'melancidio',
      id: 7,
      points: 80,
      position: 7,
      revealed: true,
    });
  });

  it('fills a 5x5 visual grid without depending on backend Unrevealed', () => {
    const grid = mapBackendGambitGridToViewModel(
      buildBackendGambitCurrentGridSnapshot({
        Revealed: [
          buildBackendGambitGridPosition({
            Position: 24,
          }),
        ],
        Unrevealed: [],
      })
    );

    expect(grid.cards).toHaveLength(25);
    expect(grid.cards[0]).toMatchObject({
      id: 0,
      position: 0,
      revealed: false,
    });
    expect(grid.cards[24]).toMatchObject({
      id: 24,
      position: 24,
      revealed: true,
    });
  });

  it('maps PendingEvent with CardsOffered', () => {
    const grid = mapBackendGambitGridToViewModel(
      buildBackendGambitCurrentGridSnapshot({
        PendingEvent: buildBackendGambitPendingEvent({
          CardsOffered: [
            'CLARIVIDENCIA',
            'INVERSAO_GRAVITACIONAL',
            'DOBRO_DE_POTASSIO',
          ],
          EventType: 'Good',
        }),
      })
    );

    expect(grid.pendingEvent).toEqual({
      cardsOffered: [
        'clarividencia',
        'inversao-gravitacional',
        'dobro-de-potassio',
      ],
      eventType: 'good',
    });
  });

  it('uses a safe hidden grid when CurrentGridSnapshot is null', () => {
    const viewModel = mapBackendGambitSessionToViewModel(
      MOCK_GAMBIT_SESSION_WITH_NULL_GRID
    );

    expect(viewModel.grid.pendingEvent).toBeNull();
    expect(viewModel.grid.cards).toHaveLength(25);
    expect(viewModel.grid.cards.every((card) => !card.revealed)).toBe(true);
  });

  it('keeps Result and NextEffect null when the backend sends null', () => {
    const viewModel = mapBackendGambitSessionToViewModel(
      buildBackendGambitSession({
        NextEffect: null,
        Result: null,
      })
    );

    expect(viewModel.result).toBeNull();
    expect(viewModel.nextEffect).toBeNull();
  });

  it('throws a clear error for an unknown card/effect', () => {
    expect(() =>
      mapBackendGambitCardToViewModel(
        'EFEITO_DESCONHECIDO' as BackendGambitCard
      )
    ).toThrow('Unknown Gambit card/effect "EFEITO_DESCONHECIDO".');
  });

  it('throws a clear error for an incompatible grid position', () => {
    expect(() =>
      mapBackendGambitGridToViewModel(
        buildBackendGambitCurrentGridSnapshot({
          Revealed: [
            buildBackendGambitGridPosition({
              Position: 99,
            }),
          ],
        })
      )
    ).toThrow('Invalid Gambit grid Position "99". Expected 0-24.');
  });
});
