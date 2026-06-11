import { beforeEach, describe, expect, it } from '@jest/globals';
import {
  burnActiveGambitCard,
  fetchActiveGambitSession,
  resetGambitSandboxSession,
  resolveActiveGambitEffect,
  resolveActiveGambitEvent,
} from '../src/presentation/games/GambitGame/gambitSandboxApi';

describe('GambitSandboxApi', () => {
  beforeEach(() => {
    resetGambitSandboxSession();
  });

  it('returns an active session using the new backend gameplay contract', async () => {
    const session = await fetchActiveGambitSession();

    expect(session).toMatchObject({
      AccumulatedPoints: 0,
      BurnSlotsAvailable: 25,
      Grid: {
        PendingEvent: null,
        PendingInteraction: null,
      },
      Status: 'InProgress',
    });
    expect(session?.Grid.Unrevealed[0]).toEqual({
      Locked: false,
      Position: 0,
    });
    expect(session?.Grid.Unrevealed[0]).not.toHaveProperty('Points');
    expect(session?.Grid.Unrevealed[0]).not.toHaveProperty('Effect');
  });

  it('burns a card and moves it from Unrevealed to Revealed', async () => {
    const session = await burnActiveGambitCard(0);

    expect(session.ManualFlipsCount).toBe(1);
    expect(session.Grid.Revealed).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          Locked: false,
          Points: expect.any(Number),
          Position: 0,
        }),
      ])
    );
    expect(session.Grid.Unrevealed.some((card) => card.Position === 0)).toBe(
      false
    );
  });

  it('resolves PendingEvent with GoodIndex and BadIndex', async () => {
    resetGambitSandboxSession('pendingEventChoice');

    const session = await resolveActiveGambitEvent({
      BadIndex: 2,
      GoodIndex: 0,
    });

    expect(session.Grid.PendingEvent).toBeNull();
    expect(session.Grid.Unrevealed[0]).toEqual({
      Locked: false,
      Position: 5,
    });
  });

  it('returns a Clarividencia PeekResult without revealing the selected card', async () => {
    resetGambitSandboxSession('clarividenciaFlow');

    await burnActiveGambitCard(8);

    const response = await resolveActiveGambitEffect([0]);

    expect(response).toMatchObject({
      PeekResult: {
        Effect: null,
        Points: expect.any(Number),
        Position: 0,
      },
    });
    expect(
      'Session' in response ? response.Session.Grid.Revealed : []
    ).not.toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          Position: 0,
        }),
      ])
    );
  });
});
