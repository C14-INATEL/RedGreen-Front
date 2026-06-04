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
    const session = [0, 2].reduce(
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
        (card) => card.Position === 2
      )
    ).toMatchObject({
      Points: -15,
    });
    expect(session.AccumulatedPoints).toBe(0);
  });

  it('maps position 13 to row 3 and column 4 in the 5x5 grid', () => {
    expect(getGambitGridCoordinates(13)).toEqual({
      column: 4,
      row: 3,
    });
  });

  it('starts Clarividencia preview without revealing automatically', () => {
    const session = makeMockGambitSession('clarividenciaFlow');
    const preview = startMockClarividenciaPreview(session, 2);

    expect(CONSUME_CLARIVIDENCIA_ON_PREVIEW_CANCEL).toBe(true);
    expect(preview.previewedCardId).toBe(2);
    expect(preview.session.AccumulatedPoints).toBe(0);
    expect(preview.session.ManualFlipsCount).toBe(0);
    expect(preview.session.CurrentGridSnapshot?.PendingEvent).toBeNull();
    expect(preview.session.CurrentGridSnapshot?.Revealed).toHaveLength(0);
    expect(
      preview.session.CurrentGridSnapshot?.Unrevealed.find(
        (card) => card.Position === 2
      )
    ).toMatchObject({
      Points: -15,
    });
  });
});
