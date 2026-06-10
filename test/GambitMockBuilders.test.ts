import { describe, expect, it } from '@jest/globals';
import {
  applyMockGambitEffect,
  canRevealMockGambitCard,
  getGambitGridCoordinates,
  getGambitSessionGridSnapshot,
  makeMockGambitSession,
  makeMockGambitTable,
  revealMockGambitCard,
  resolveMockPendingEvent,
  resolveMockPendingInteraction,
  sumRevealedGambitCardPoints,
} from '../src/presentation/games/GambitGame/gambitGameMock';
import {
  mapBackendGambitCardToViewModel,
  mapBackendGambitGridToViewModel,
} from '../src/presentation/games/GambitGame/gambitMapper';
import type {
  GambitCardEffect,
  GambitGridSnapshot,
} from '../src/presentation/games/GambitGame/gambitTypes';

const CONTRACT_EFFECTS: GambitCardEffect[] = [
  'DOBRO_DE_POTASSIO',
  'MELANCIDIO',
  'INVERSAO_GRAVITACIONAL',
  'ANULACAO_TOTAL',
  'COLORIDINHO',
  'HEADGEAR',
  'CLARIVIDENCIA',
  'CABECINHA',
  'JONAS_JOKER',
  'CHRIS_JOKER',
  'QUANTO_MAIS_MELHOR',
  'QUANTO_MENOS_MELHOR',
  'MENTE_LISA',
  'MOSCA_JOKER',
  'JACKPOT',
  'RATIMUNDIO',
  'PAO_COM_OQUE',
  'BUMIS_INFILTRADOS',
];

const revealMany = (positions: number[]) =>
  positions.reduce(
    (currentSession, position) =>
      revealMockGambitCard(currentSession, position),
    makeMockGambitSession('effectsOnBoard')
  );

describe('Gambit visual mock mechanics', () => {
  it('maps the complete new card catalog', () => {
    expect(CONTRACT_EFFECTS).toHaveLength(18);

    CONTRACT_EFFECTS.forEach((effect) => {
      expect(mapBackendGambitCardToViewModel(effect)).toEqual(
        expect.any(String)
      );
    });
  });

  it('uses GoodOptions and BadOptions for pending events', () => {
    const session = makeMockGambitSession('pendingEventChoice');
    const pendingEvent = getGambitSessionGridSnapshot(session)?.PendingEvent;

    expect(pendingEvent).toEqual({
      BadOptions: ['RATIMUNDIO', 'QUANTO_MENOS_MELHOR', 'PAO_COM_OQUE'],
      EventType: 'Neutral',
      GoodOptions: ['DOBRO_DE_POTASSIO', 'JACKPOT', 'QUANTO_MAIS_MELHOR'],
    });
    expect(pendingEvent).not.toHaveProperty('CardsOffered');
  });

  it('maps hidden backend cards without requiring Points or Effect', () => {
    const snapshot: GambitGridSnapshot = {
      PendingEvent: null,
      PendingInteraction: null,
      Revealed: [],
      Unrevealed: [{ Locked: false, Position: 0 }],
    };

    expect(mapBackendGambitGridToViewModel(snapshot).cards[0]).toMatchObject({
      effect: null,
      locked: false,
      points: null,
      position: 0,
      revealed: false,
    });
  });

  it('subtracts a revealed negative card from the accumulated total', () => {
    const session = [0, 1].reduce(
      (currentSession, position) =>
        revealMockGambitCard(currentSession, position),
      makeMockGambitSession('mixedPositiveNegative')
    );

    expect(sumRevealedGambitCardPoints(session)).toBe(-5);
    expect(session.AccumulatedPoints).toBe(-5);
  });

  it('keeps closed cards out of the accumulated total', () => {
    const session = makeMockGambitSession('basicPoints');

    expect(getGambitSessionGridSnapshot(session)?.Revealed).toHaveLength(0);
    expect(sumRevealedGambitCardPoints(session)).toBe(0);
    expect(session.AccumulatedPoints).toBe(0);
  });

  it('applies every next-card point effect and consumes it', () => {
    expect(
      revealMockGambitCard(
        revealMockGambitCard(makeMockGambitSession('effectsOnBoard'), 4),
        0
      ).AccumulatedPoints
    ).toBe(20);
    expect(
      revealMockGambitCard(
        revealMockGambitCard(makeMockGambitSession('effectsOnBoard'), 5),
        0
      ).AccumulatedPoints
    ).toBe(5);
    expect(
      revealMockGambitCard(
        revealMockGambitCard(makeMockGambitSession('effectsOnBoard'), 6),
        0
      ).AccumulatedPoints
    ).toBe(-10);
    expect(
      revealMockGambitCard(
        revealMockGambitCard(makeMockGambitSession('effectsOnBoard'), 8),
        0
      ).AccumulatedPoints
    ).toBe(0);
    expect(
      revealMockGambitCard(
        revealMockGambitCard(makeMockGambitSession('effectsOnBoard'), 9),
        0
      ).AccumulatedPoints
    ).toBe(-10);
  });

  it('keeps the next effect ready when an effect-only card is revealed before a point card', () => {
    const withPreparedDouble = revealMockGambitCard(
      makeMockGambitSession('effectsOnBoard'),
      4
    );
    const afterEffectOnlyCard = revealMockGambitCard(withPreparedDouble, 5);
    const afterPointCard = revealMockGambitCard(afterEffectOnlyCard, 0);

    expect(afterEffectOnlyCard.NextEffect).toBe('MELANCIDIO');
    expect(afterPointCard.AccumulatedPoints).toBe(5);
    expect(afterPointCard.NextEffect).toBeNull();
  });

  it('uses Anulacao Total to cancel the next card effect', () => {
    const withAnulacao = revealMockGambitCard(
      makeMockGambitSession('effectsOnBoard'),
      7
    );
    const session = revealMockGambitCard(withAnulacao, 12);

    expect(session.AccumulatedPoints).toBe(0);
    expect(session.NextEffect).toBeNull();
  });

  it('opens PendingInteraction for Clarividencia and resolves a one-card peek', () => {
    const withClarividencia = revealMockGambitCard(
      makeMockGambitSession('clarividenciaFlow'),
      10
    );

    expect(
      getGambitSessionGridSnapshot(withClarividencia)?.PendingInteraction
    ).toEqual({
      Action: 'SELECT_CARD',
      Effect: 'CLARIVIDENCIA',
      RequiredSelections: 1,
      SelectedPositions: [],
    });

    const resolution = resolveMockPendingInteraction(withClarividencia, [0]);

    expect(resolution.PeekResult).toEqual({
      Effect: null,
      Locked: false,
      Points: 10,
      Position: 0,
    });
    expect(
      getGambitSessionGridSnapshot(resolution.session)?.PendingInteraction
    ).toBeNull();
    expect(
      getGambitSessionGridSnapshot(resolution.session)?.Revealed.some(
        (card) => card.Position === 0
      )
    ).toBe(false);
  });

  it('opens PendingInteraction for Cabecinha and reports if any selected card is bad', () => {
    const withCabecinha = revealMockGambitCard(
      makeMockGambitSession('cabecinhaFlow'),
      11
    );

    expect(
      getGambitSessionGridSnapshot(withCabecinha)?.PendingInteraction
    ).toEqual({
      Action: 'SELECT_MULTIPLE_CARDS',
      Effect: 'CABECINHA',
      RequiredSelections: 3,
      SelectedPositions: [],
    });

    const resolution = resolveMockPendingInteraction(withCabecinha, [0, 1, 2]);

    expect(resolution.PeekResult).toEqual({
      AtLeastOneBad: true,
    });
    expect(
      getGambitSessionGridSnapshot(resolution.session)?.PendingInteraction
    ).toBeNull();
  });

  it('creates mock PendingEvent at the fixed fifth reveal trigger', () => {
    const session = revealMany([0, 1, 2, 3, 4]);

    expect(session.ManualFlipsCount).toBe(5);
    expect(getGambitSessionGridSnapshot(session)?.PendingEvent).toMatchObject({
      BadOptions: ['RATIMUNDIO', 'QUANTO_MENOS_MELHOR', 'PAO_COM_OQUE'],
      GoodOptions: ['DOBRO_DE_POTASSIO', 'JACKPOT', 'QUANTO_MAIS_MELHOR'],
    });
  });

  it('blocks reveals while PendingEvent or PendingInteraction exists', () => {
    const pendingEventSession = makeMockGambitSession('pendingEventChoice');
    const pendingInteractionSession = revealMockGambitCard(
      makeMockGambitSession('clarividenciaFlow'),
      10
    );

    expect(canRevealMockGambitCard(pendingEventSession, 5)).toBe(false);
    expect(revealMockGambitCard(pendingEventSession, 5)).toBe(
      pendingEventSession
    );
    expect(canRevealMockGambitCard(pendingInteractionSession, 0)).toBe(false);
    expect(revealMockGambitCard(pendingInteractionSession, 0)).toBe(
      pendingInteractionSession
    );
  });

  it('blocks invalid, revealed, locked, finished and out-of-burn reveals', () => {
    const revealedOnce = revealMockGambitCard(
      makeMockGambitSession('basicPoints'),
      0
    );
    const lockedSession = makeMockGambitSession('lockedCardFlow');

    expect(canRevealMockGambitCard(revealedOnce, 0)).toBe(false);
    expect(canRevealMockGambitCard(lockedSession, 3)).toBe(false);
    expect(
      canRevealMockGambitCard(
        makeMockGambitSession('basicPoints', { BurnSlotsAvailable: 0 }),
        0
      )
    ).toBe(false);
    expect(
      canRevealMockGambitCard(
        makeMockGambitSession('basicPoints', { Status: 'Finished' }),
        0
      )
    ).toBe(false);
    expect(
      canRevealMockGambitCard(makeMockGambitSession('basicPoints'), 99)
    ).toBe(false);
  });

  it('resolves PendingEvent by injecting one good and one bad card deterministically', () => {
    const session = resolveMockPendingEvent(
      makeMockGambitSession('pendingEventChoice'),
      {
        BadIndex: 2,
        GoodIndex: 0,
      }
    );
    const snapshot = getGambitSessionGridSnapshot(session);

    expect(snapshot?.PendingEvent).toBeNull();
    expect(
      snapshot?.Unrevealed.find((card) => card.Position === 5)
    ).toMatchObject({
      Effect: 'DOBRO_DE_POTASSIO',
      Points: null,
    });
    expect(
      snapshot?.Unrevealed.find((card) => card.Position === 6)
    ).toMatchObject({
      Effect: 'PAO_COM_OQUE',
      Points: null,
    });
  });

  it('applies deterministic automatic immediate effects', () => {
    const withMenteLisa = revealMockGambitCard(
      makeMockGambitSession('effectsOnBoard'),
      16
    );
    const withPaoComOque = revealMockGambitCard(
      makeMockGambitSession('effectsOnBoard'),
      19
    );

    expect(
      getGambitSessionGridSnapshot(withMenteLisa)?.Unrevealed.find(
        (card) => card.Position === 23
      )
    ).toMatchObject({
      Locked: true,
      Points: 50,
    });
    expect(
      getGambitSessionGridSnapshot(withPaoComOque)?.Unrevealed.find(
        (card) => card.Position === 23
      )
    ).toMatchObject({
      Points: -50,
    });
  });

  it('finishes by BurnSlotsAvailable and clamps negative results to zero', () => {
    const session = revealMockGambitCard(
      makeMockGambitSession('mixedPositiveNegative', {
        BurnSlotsAvailable: 1,
        GambitTable: makeMockGambitTable({ TableMultiplier: 2 }),
      }),
      1
    );

    expect(session.Status).toBe('Finished');
    expect(session.AccumulatedPoints).toBe(-15);
    expect(session.Result).toBe(0);
  });

  it('calculates positive Result with floor(points * multiplier)', () => {
    const session = revealMockGambitCard(
      makeMockGambitSession('basicPoints', {
        BurnSlotsAvailable: 1,
        GambitTable: makeMockGambitTable({ TableMultiplier: 1.5 }),
      }),
      1
    );

    expect(session.Status).toBe('Finished');
    expect(session.AccumulatedPoints).toBe(15);
    expect(session.Result).toBe(22);
  });

  it('keeps grid coordinate helpers unchanged', () => {
    expect(getGambitGridCoordinates(13)).toEqual({
      column: 4,
      row: 3,
    });
  });

  it('still exposes standalone next-effect point math for focused tests', () => {
    expect(applyMockGambitEffect(30, 'DOBRO_DE_POTASSIO')).toBe(60);
    expect(applyMockGambitEffect(30, 'MELANCIDIO')).toBe(15);
    expect(applyMockGambitEffect(30, 'INVERSAO_GRAVITACIONAL')).toBe(-30);
    expect(applyMockGambitEffect(30, 'COLORIDINHO')).toBe(0);
    expect(applyMockGambitEffect(30, 'HEADGEAR')).toBe(-30);
  });
});
