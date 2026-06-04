import { describe, expect, it } from '@jest/globals';
import {
  CONSUME_CLARIVIDENCIA_ON_PREVIEW_CANCEL,
  getGambitGridCoordinates,
  makeMockGambitSession,
  revealMockGambitCard,
  startMockClarividenciaPreview,
  sumRevealedGambitCardPoints,
} from '../src/presentation/games/GambitGame/gambitGameMock';

describe('Gambit visual mock mechanics', () => {
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
