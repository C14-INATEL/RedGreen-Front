import type { GambitCashOutResponse } from './gambitApi';
import type { GambitGridSnapshot, GambitSession } from './gambitTypes';

const getGambitSessionGridSnapshot = (
  session: GambitSession
): GambitGridSnapshot | null =>
  session.Grid ?? session.CurrentGridSnapshot ?? null;

export const getGambitBurnsRemaining = (session: GambitSession) =>
  Math.max(
    0,
    session.BurnsRemaining ??
      session.BurnSlotsAvailable - session.ManualFlipsCount
  );

export const isFinalGambitSessionStatus = (status: GambitSession['Status']) =>
  status !== 'InProgress';

export const shouldAutoCashOutGambitSession = (
  session: GambitSession | null
) => {
  if (!session || session.Status !== 'Finished') {
    return false;
  }

  const snapshot = getGambitSessionGridSnapshot(session);

  if (snapshot?.PendingEvent || snapshot?.PendingInteraction) {
    return false;
  }

  return true;
};

export const applyGambitCashOutResponseToSession = (
  session: GambitSession,
  response: GambitCashOutResponse
): GambitSession => {
  if (response.Session) {
    return response.Session;
  }

  return {
    ...session,
    Result:
      response.Result ??
      response.reward ??
      response.finalBalance ??
      response.FinalBalance ??
      session.Result ??
      session.AccumulatedPoints,
    Status: 'CashedOut',
  };
};
