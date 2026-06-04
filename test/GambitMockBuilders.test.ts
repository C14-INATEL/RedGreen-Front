import { describe, expect, it } from '@jest/globals';
import {
  CONSUME_CLARIVIDENCIA_ON_PREVIEW_CANCEL,
  applyMockGambitEffect,
  getGambitGridCoordinates,
  makeMockGambitSession,
  revealMockGambitCard,
  startMockClarividenciaPreview,
  sumRevealedGambitCardPoints,
} from '../src/presentation/games/GambitGame/gambitGameMock';

describe('Gambit visual mock mechanics', () => {
  it('inverts positive, negative and zero point values with Inversao Gravitacional', () => {
    expect(applyMockGambitEffect(30, 'INVERSAO_GRAVITACIONAL')).toBe(-30);
    expect(applyMockGambitEffect(-15, 'INVERSAO_GRAVITACIONAL')).toBe(15);
    expect(applyMockGambitEffect(0, 'INVERSAO_GRAVITACIONAL')).toBe(0);
  });

  it('sums revealed positive cards into the accumulated total', () => {
    const session = [0, 1].reduce(
      (currentSession, position) =>
        revealMockGambitCard(currentSession, position),
      makeMockGambitSession('basicPoints')
    );

    expect(sumRevealedGambitCardPoints(session)).toBe(25);
    expect(session.AccumulatedPoints).toBe(25);
  });

  it('keeps closed cards out of the accumulated total', () => {
    const session = makeMockGambitSession('basicPoints');

    expect(session.CurrentGridSnapshot?.Revealed).toHaveLength(0);
    expect(sumRevealedGambitCardPoints(session)).toBe(0);
    expect(session.AccumulatedPoints).toBe(0);
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

  it('does not subtract a closed negative card', () => {
    const session = makeMockGambitSession('mixedPositiveNegative');

    expect(
      session.CurrentGridSnapshot?.Unrevealed.find(
        (card) => card.Position === 1
      )
    ).toMatchObject({
      Points: -15,
    });
    expect(session.AccumulatedPoints).toBe(0);
  });

  it('keeps position 12 as Clarividencia without points', () => {
    const session = makeMockGambitSession('effectsOnBoard');

    expect(
      session.CurrentGridSnapshot?.Unrevealed.find(
        (card) => card.Position === 12
      )
    ).toEqual({
      Effect: 'CLARIVIDENCIA',
      Points: null,
      Position: 12,
    });
  });

  it('models every visual mock card as either points or effect, never both', () => {
    const session = makeMockGambitSession('effectsOnBoard');
    const cards = [
      ...(session.CurrentGridSnapshot?.Revealed ?? []),
      ...(session.CurrentGridSnapshot?.Unrevealed ?? []),
    ];

    cards.forEach((card) => {
      expect(card.Effect === null).toBe(card.Points !== null);
    });
  });

  it('keeps position 13 as a +30 point card', () => {
    const session = makeMockGambitSession('effectsOnBoard');

    expect(
      session.CurrentGridSnapshot?.Unrevealed.find(
        (card) => card.Position === 13
      )
    ).toEqual({
      Effect: null,
      Points: 30,
      Position: 13,
    });
    expect(getGambitGridCoordinates(13)).toEqual({
      column: 4,
      row: 3,
    });
  });

  it('reveals board effect cards without adding +0 to the total', () => {
    const session = revealMockGambitCard(
      makeMockGambitSession('effectsOnBoard'),
      12
    );

    expect(session.AccumulatedPoints).toBe(0);
    expect(sumRevealedGambitCardPoints(session)).toBe(0);
    expect(session.NextEffect).toBe('CLARIVIDENCIA');
    expect(session.CurrentGridSnapshot?.Revealed).toEqual([
      {
        Effect: 'CLARIVIDENCIA',
        Points: null,
        Position: 12,
      },
    ]);
  });

  it('prepares Inversao Gravitacional when its board card is revealed', () => {
    const session = revealMockGambitCard(
      makeMockGambitSession('effectsOnBoard'),
      18
    );

    expect(session.AccumulatedPoints).toBe(0);
    expect(session.NextEffect).toBe('INVERSAO_GRAVITACIONAL');
    expect(session.CurrentGridSnapshot?.Revealed).toEqual([
      {
        Effect: 'INVERSAO_GRAVITACIONAL',
        Points: null,
        Position: 18,
      },
    ]);
  });

  it('applies Inversao Gravitacional to the next positive point card and consumes it', () => {
    const withInversionPrepared = revealMockGambitCard(
      makeMockGambitSession('effectsOnBoard'),
      18
    );
    const session = revealMockGambitCard(withInversionPrepared, 13);

    expect(session.AccumulatedPoints).toBe(-30);
    expect(session.NextEffect).toBeNull();
    expect(session.CurrentGridSnapshot?.Revealed).toEqual([
      {
        Effect: 'INVERSAO_GRAVITACIONAL',
        Points: null,
        Position: 18,
      },
      {
        Effect: null,
        Points: 30,
        Position: 13,
      },
    ]);
  });

  it('applies Inversao Gravitacional to the next negative point card and consumes it', () => {
    const withInversionPrepared = revealMockGambitCard(
      makeMockGambitSession('effectsOnBoard'),
      18
    );
    const session = revealMockGambitCard(withInversionPrepared, 1);

    expect(session.AccumulatedPoints).toBe(15);
    expect(session.NextEffect).toBeNull();
  });

  it('does not apply Inversao Gravitacional point math to board effect cards', () => {
    const session = revealMockGambitCard(
      makeMockGambitSession('effectsOnBoard', {
        NextEffect: 'INVERSAO_GRAVITACIONAL',
      }),
      12
    );

    expect(session.AccumulatedPoints).toBe(0);
    expect(session.NextEffect).toBe('CLARIVIDENCIA');
  });

  it('creates the choice event every three revealed cards', () => {
    const session = [0, 2, 4].reduce(
      (currentSession, position) =>
        revealMockGambitCard(currentSession, position),
      makeMockGambitSession('effectsOnBoard')
    );

    expect(session.ManualFlipsCount).toBe(3);
    expect(session.AccumulatedPoints).toBe(35);
    expect(session.CurrentGridSnapshot?.PendingEvent).toEqual({
      CardsOffered: ['DOBRO_DE_POTASSIO', 'MELANCIDIO', 'CLARIVIDENCIA'],
      EventType: 'Neutral',
    });
  });

  it('starts Clarividencia preview without revealing automatically', () => {
    const session = makeMockGambitSession('clarividenciaFlow');
    const preview = startMockClarividenciaPreview(session, 1);

    expect(CONSUME_CLARIVIDENCIA_ON_PREVIEW_CANCEL).toBe(true);
    expect(preview.previewedCardId).toBe(1);
    expect(preview.session.AccumulatedPoints).toBe(0);
    expect(preview.session.ManualFlipsCount).toBe(0);
    expect(preview.session.CurrentGridSnapshot?.PendingEvent).toBeNull();
    expect(preview.session.CurrentGridSnapshot?.Revealed).toHaveLength(0);
    expect(
      preview.session.CurrentGridSnapshot?.Unrevealed.find(
        (card) => card.Position === 1
      )
    ).toMatchObject({
      Points: -15,
    });
  });
});
