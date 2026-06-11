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
  getTestGambitGameSession,
  resetTestGambitGameSessionSequence,
  TEST_GAMBIT_GAME_SESSIONS,
} from './GambitGame.mock';
import { classifyGambitRevealNature } from '../src/presentation/games/GambitGame/gambitRevealNature';
import {
  createRewardChoiceSessionFromPendingEvent,
  parseGambitPendingEventOptionId,
} from '../src/presentation/games/GambitGame/gambitPendingEventRewardAdapter';
import {
  mapBackendGambitCardToViewModel,
  mapBackendGambitGridToViewModel,
} from '../src/presentation/games/GambitGame/gambitMapper';
import { gambitBoardMockCards } from '../src/presentation/games/GambitGame/gambitBoardMock';
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

const MAIN_BACKEND_EFFECTS = new Set<GambitCardEffect>([
  'DOBRO_DE_POTASSIO',
  'MELANCIDIO',
  'CLARIVIDENCIA',
  'INVERSAO_GRAVITACIONAL',
  'JONAS_JOKER',
  'CORINGA_DO_INATEL',
  'ANULACAO_TOTAL',
  'QUANTO_MENOS_MELHOR',
  'QUANTO_MAIS_MELHOR',
  'MENTE_LISA',
  'MOSCA_JOKER',
  'CABECINHA',
]);

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
      BadOptions: ['MELANCIDIO', 'QUANTO_MENOS_MELHOR', 'CORINGA_DO_INATEL'],
      EventType: 'Neutral',
      GoodOptions: ['DOBRO_DE_POTASSIO', 'QUANTO_MAIS_MELHOR', 'MENTE_LISA'],
    });
    expect(pendingEvent).not.toHaveProperty('CardsOffered');
  });

  it('adapts PendingEvent options into visual reward cards', () => {
    const pendingEvent = getGambitSessionGridSnapshot(
      makeMockGambitSession('pendingEventChoice')
    )?.PendingEvent;

    expect(pendingEvent).toBeTruthy();

    const rewardSession = createRewardChoiceSessionFromPendingEvent(
      pendingEvent!,
      {
        sessionId: 'pending-event-test',
      }
    );

    expect(rewardSession.normalTableCards[0]).toMatchObject({
      description: 'Dobra os pontos da proxima carta revelada.',
      optionId: 'good-0-DOBRO_DE_POTASSIO',
      spritePath: '/Gambit/DobroDePotassio.png',
      title: 'Dobro de Potassio',
    });
    expect(rewardSession.badTableCards[2]).toMatchObject({
      optionId: 'bad-2-CORINGA_DO_INATEL',
      title: 'Coringa do Inatel',
    });
  });

  it('parses PendingEvent visual option ids back to backend selection indexes', () => {
    expect(parseGambitPendingEventOptionId('good-1-ANULACAO_TOTAL')).toEqual({
      effect: 'ANULACAO_TOTAL',
      index: 1,
      selectionKey: 'GoodIndex',
      side: 'good',
      tableType: 'normal',
    });
    expect(parseGambitPendingEventOptionId('bad-2-MELANCIDIO')).toEqual({
      effect: 'MELANCIDIO',
      index: 2,
      selectionKey: 'BadIndex',
      side: 'bad',
      tableType: 'bad',
    });
    expect(parseGambitPendingEventOptionId('invalid')).toBeNull();
  });

  it('keeps every main mock board card with numeric points', () => {
    expect(gambitBoardMockCards).toHaveLength(25);

    gambitBoardMockCards.forEach((card) => {
      expect(typeof card.points).toBe('number');
      expect(card.points).not.toBeNull();
    });
  });

  it('keeps the main mock board limited to effects currently expected by backend main', () => {
    gambitBoardMockCards.forEach((card) => {
      if (card.effect) {
        expect(MAIN_BACKEND_EFFECTS.has(card.effect)).toBe(true);
      }
    });
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

  it('adds points from effect cards before preparing the next-card effect', () => {
    expect(
      revealMockGambitCard(
        revealMockGambitCard(makeMockGambitSession('effectsOnBoard'), 4),
        0
      ).AccumulatedPoints
    ).toBe(40);
    expect(
      revealMockGambitCard(
        revealMockGambitCard(makeMockGambitSession('effectsOnBoard'), 5),
        0
      ).AccumulatedPoints
    ).toBe(-15);
    expect(
      revealMockGambitCard(
        revealMockGambitCard(makeMockGambitSession('effectsOnBoard'), 6),
        0
      ).AccumulatedPoints
    ).toBe(5);
    expect(
      revealMockGambitCard(
        revealMockGambitCard(makeMockGambitSession('effectsOnBoard'), 7),
        0
      ).AccumulatedPoints
    ).toBe(40);
  });

  it('uses one prepared effect and then returns NextEffect to null', () => {
    const withPreparedDouble = revealMockGambitCard(
      makeMockGambitSession('effectsOnBoard'),
      4
    );
    const afterPointCard = revealMockGambitCard(withPreparedDouble, 0);

    expect(withPreparedDouble.AccumulatedPoints).toBe(20);
    expect(withPreparedDouble.NextEffect).toBe('DOBRO_DE_POTASSIO');
    expect(afterPointCard.AccumulatedPoints).toBe(40);
    expect(afterPointCard.NextEffect).toBeNull();
  });

  it('uses Anulacao Total to cancel the next card effect', () => {
    const withAnulacao = revealMockGambitCard(
      makeMockGambitSession('effectsOnBoard'),
      7
    );
    const session = revealMockGambitCard(withAnulacao, 10);

    expect(session.AccumulatedPoints).toBe(55);
    expect(session.NextEffect).toBeNull();
  });

  it('opens PendingInteraction for Clarividencia and resolves a one-card peek', () => {
    const withClarividencia = revealMockGambitCard(
      makeMockGambitSession('clarividenciaFlow'),
      8
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
      9
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
      BadOptions: ['MELANCIDIO', 'QUANTO_MENOS_MELHOR', 'CORINGA_DO_INATEL'],
      GoodOptions: ['DOBRO_DE_POTASSIO', 'QUANTO_MAIS_MELHOR', 'MENTE_LISA'],
    });
  });

  it('blocks reveals while PendingEvent or PendingInteraction exists', () => {
    const pendingEventSession = makeMockGambitSession('pendingEventChoice');
    const pendingInteractionSession = revealMockGambitCard(
      makeMockGambitSession('clarividenciaFlow'),
      8
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

  it('resolves PendingEvent by injecting effects while preserving target points', () => {
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
      Points: -20,
    });
    expect(
      snapshot?.Unrevealed.find((card) => card.Position === 6)
    ).toMatchObject({
      Effect: 'CORINGA_DO_INATEL',
      Points: 15,
    });
  });

  it('resolves PendingEvent without altering the current NextEffect', () => {
    const session = resolveMockPendingEvent(
      makeMockGambitSession('pendingEventChoice'),
      {
        BadIndex: 1,
        GoodIndex: 1,
      }
    );

    expect(session.NextEffect).toBe('DOBRO_DE_POTASSIO');
  });

  it('applies deterministic automatic immediate effects and preserves Mosca target points', () => {
    const withMenteLisa = revealMockGambitCard(
      makeMockGambitSession('effectsOnBoard'),
      14
    );
    const withMoscaJoker = revealMockGambitCard(
      makeMockGambitSession('effectsOnBoard'),
      15
    );

    expect(
      getGambitSessionGridSnapshot(withMenteLisa)?.Unrevealed.find(
        (card) => card.Position === 20
      )
    ).toMatchObject({
      Locked: true,
      Points: 50,
    });
    expect(
      getGambitSessionGridSnapshot(withMoscaJoker)?.Unrevealed.find(
        (card) => card.Position === 0
      )
    ).toMatchObject({
      Effect: 'DOBRO_DE_POTASSIO',
      Points: 10,
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

  it('classifies reveal cinematics as good, bad or neutral', () => {
    expect(classifyGambitRevealNature({ effect: null, points: 15 })).toBe(
      'good'
    );
    expect(
      classifyGambitRevealNature({ effect: 'mente-lisa', points: 15 })
    ).toBe('bad');
    expect(
      classifyGambitRevealNature({
        effect: 'inversao-gravitacional',
        points: 0,
      })
    ).toBe('neutral');
  });

  it('keeps API-shaped test Gambit sessions isolated from external mutation', () => {
    resetTestGambitGameSessionSequence();

    const firstSession = getTestGambitGameSession();
    const secondSession = getTestGambitGameSession();

    firstSession.Grid.Unrevealed[0].Locked = true;
    secondSession.Grid.PendingEvent!.GoodOptions[0] = 'JACKPOT';

    const thirdSession = getTestGambitGameSession();
    const fourthSession = getTestGambitGameSession();
    const fifthSession = getTestGambitGameSession();

    expect(thirdSession.Grid.PendingInteraction).toBeTruthy();
    expect(fourthSession.Grid.Unrevealed[0].Locked).toBe(false);
    expect(fifthSession.Grid.PendingEvent!.GoodOptions[0]).toBe(
      'DOBRO_DE_POTASSIO'
    );
    expect(TEST_GAMBIT_GAME_SESSIONS.active.Grid.Unrevealed[0].Locked).toBe(
      false
    );
    expect(
      TEST_GAMBIT_GAME_SESSIONS.pendingEvent.Grid.PendingEvent!.GoodOptions[0]
    ).toBe('DOBRO_DE_POTASSIO');
  });
});
