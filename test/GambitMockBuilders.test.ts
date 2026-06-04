import { describe, expect, it } from '@jest/globals';
import {
  applyMockGambitEffect,
  makeMockGambitSession,
  selectMockPendingEventCard,
  revealMockGambitCard,
} from '../src/presentation/games/GambitGame/gambitMockBuilders';
import {
  ACTIVE_GAMBIT_MOCK_SCENARIO,
  gambitMockScenarios,
} from '../src/presentation/games/GambitGame/gambitMockScenarios';

describe('Gambit mock builders', () => {
  it('builds the active scenario as a backend-shaped session', () => {
    const session = makeMockGambitSession();

    expect(gambitMockScenarios[ACTIVE_GAMBIT_MOCK_SCENARIO]).toMatchObject({
      name: 'Fluxo basico de revelacao',
    });
    expect(session).toMatchObject({
      AccumulatedPoints: 0,
      CardsPurchased: 25,
      CurrentGridSnapshot: {
        PendingEvent: null,
        Revealed: [],
      },
      Status: 'InProgress',
    });
    expect(session.CurrentGridSnapshot?.Unrevealed).toHaveLength(25);
  });

  it('reveals a card by moving it from Unrevealed to Revealed', () => {
    const session = revealMockGambitCard(makeMockGambitSession(), 0);

    expect(session.AccumulatedPoints).toBe(10);
    expect(session.ManualFlipsCount).toBe(1);
    expect(session.CurrentGridSnapshot?.Revealed).toEqual([
      {
        Effect: null,
        Points: 10,
        Position: 0,
      },
    ]);
    expect(
      session.CurrentGridSnapshot?.Unrevealed.some(
        (card) => card.Position === 0
      )
    ).toBe(false);
  });

  it('creates a pending event every three manual reveals', () => {
    const session = [0, 1, 2].reduce(
      (currentSession, position) =>
        revealMockGambitCard(currentSession, position),
      makeMockGambitSession()
    );

    expect(session.ManualFlipsCount).toBe(3);
    expect(session.CurrentGridSnapshot?.PendingEvent).toEqual({
      CardsOffered: ['DOBRO_DE_POTASSIO', 'MELANCIDIO', 'CLARIVIDENCIA'],
      EventType: 'Neutral',
    });
  });

  it('stores the selected pending-event card as the next effect', () => {
    const sessionWithEvent = makeMockGambitSession('pendingEventChoice');
    const session = selectMockPendingEventCard(
      sessionWithEvent,
      'DOBRO_DE_POTASSIO'
    );

    expect(session.CurrentGridSnapshot?.PendingEvent).toBeNull();
    expect(session.NextEffect).toBe('DOBRO_DE_POTASSIO');
  });

  it('applies backend-named effects to mock points', () => {
    expect(applyMockGambitEffect(20, 'DOBRO_DE_POTASSIO')).toBe(40);
    expect(applyMockGambitEffect(21, 'MELANCIDIO')).toBe(10);
    expect(applyMockGambitEffect(20, 'CLARIVIDENCIA')).toBe(20);
    expect(applyMockGambitEffect(20, 'INVERSAO_GRAVITACIONAL')).toBe(20);
  });
});
