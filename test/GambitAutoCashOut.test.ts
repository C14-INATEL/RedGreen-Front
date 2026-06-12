import { describe, expect, it } from '@jest/globals';
import {
  applyGambitCashOutResponseToSession,
  shouldAutoCashOutGambitSession,
} from '../src/presentation/games/GambitGame/GambitAutoCashOut';
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

  it('applies the normalized cash-out reward to the finished session', () => {
    const session = createGambitApiSession({
      AccumulatedPoints: 80,
      Result: null,
      Status: 'Finished',
    });

    expect(
      applyGambitCashOutResponseToSession(session, {
        Message: 'ok',
        Reward: 120,
      })
    ).toEqual(
      expect.objectContaining({
        Result: 120,
        Status: 'CashedOut',
      })
    );
  });

  it('uses the backend session from cash-out when one is returned', () => {
    const session = createGambitApiSession({
      GambitSessionId: 'finished-session',
      Status: 'Finished',
    });
    const cashedOutSession = createGambitApiSession({
      GambitSessionId: 'cashed-out-session',
      Result: 90,
      Status: 'CashedOut',
    });

    expect(
      applyGambitCashOutResponseToSession(session, {
        Session: cashedOutSession,
      })
    ).toBe(cashedOutSession);
  });
});
