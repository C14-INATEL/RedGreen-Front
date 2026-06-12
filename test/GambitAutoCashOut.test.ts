import { describe, expect, it } from '@jest/globals';
import { shouldAutoCashOutGambitSession } from '../src/presentation/games/GambitGame/gambitAutoCashOut';
import {
  createGambitApiGrid,
  createGambitApiPendingEvent,
  createGambitApiPendingInteraction,
  createGambitApiSession,
} from './GambitTestBuilders';

describe('Gambit auto cash-out', () => {
  it('returns true when the backend marks the session as finished', () => {
    expect(
      shouldAutoCashOutGambitSession(
        createGambitApiSession({
          Status: 'Finished',
        })
      )
    ).toBe(true);
  });

  it('returns false when the session is still in progress', () => {
    expect(
      shouldAutoCashOutGambitSession(
        createGambitApiSession({
          Status: 'InProgress',
        })
      )
    ).toBe(false);
  });

  it('returns false when there is a pending event', () => {
    expect(
      shouldAutoCashOutGambitSession(
        createGambitApiSession({
          Grid: createGambitApiGrid({
            PendingEvent: createGambitApiPendingEvent(),
          }),
          Status: 'Finished',
        })
      )
    ).toBe(false);
  });

  it('returns false when there is a pending interaction', () => {
    expect(
      shouldAutoCashOutGambitSession(
        createGambitApiSession({
          Grid: createGambitApiGrid({
            PendingInteraction: createGambitApiPendingInteraction(),
          }),
          Status: 'Finished',
        })
      )
    ).toBe(false);
  });

  it('returns false when the session is already cashed out', () => {
    expect(
      shouldAutoCashOutGambitSession(
        createGambitApiSession({
          Status: 'CashedOut',
        })
      )
    ).toBe(false);
  });
});
