import type {
  GambitApiGrid,
  GambitApiPendingEvent,
  GambitApiPendingInteraction,
  GambitApiSession,
  GambitCashOutResponse,
  GambitPeekResult,
  GambitResolveEffectResponse,
  ResolveActiveGambitEventSelection,
} from './gambitApi';
import {
  ACTIVE_GAMBIT_MOCK_SCENARIO,
  type GambitMockScenarioId,
} from './gambitMockScenarios';
import {
  getGambitSessionGridSnapshot,
  makeMockGambitSession,
  revealMockGambitCard,
  resolveMockPendingEvent,
  resolveMockPendingInteraction,
} from './gambitMockBuilders';
import type {
  GambitGridSnapshot,
  GambitInteractionPeekResult,
  GambitSession,
} from './gambitTypes';

let sandboxSession: GambitSession | null = null;

const clonePendingEvent = (
  pendingEvent: GambitGridSnapshot['PendingEvent']
): GambitApiPendingEvent | null =>
  pendingEvent
    ? {
        BadOptions: [...pendingEvent.BadOptions],
        EventType: pendingEvent.EventType ?? null,
        GoodOptions: [...pendingEvent.GoodOptions],
      }
    : null;

const clonePendingInteraction = (
  pendingInteraction: GambitGridSnapshot['PendingInteraction']
): GambitApiPendingInteraction | null =>
  pendingInteraction
    ? {
        Action: pendingInteraction.Action,
        Effect: pendingInteraction.Effect,
        RequiredSelections: pendingInteraction.RequiredSelections,
        SelectedPositions: [...pendingInteraction.SelectedPositions],
      }
    : null;

const sanitizeGridSnapshot = (snapshot: GambitGridSnapshot): GambitApiGrid => ({
  PendingEvent: clonePendingEvent(snapshot.PendingEvent),
  PendingInteraction: clonePendingInteraction(snapshot.PendingInteraction),
  Revealed: snapshot.Revealed.map((card) => ({
    Effect: card.Effect ?? null,
    Locked: Boolean(card.Locked),
    Points: card.Points ?? 0,
    Position: card.Position,
  })),
  Unrevealed: snapshot.Unrevealed.map((card) => ({
    Locked: Boolean(card.Locked),
    Position: card.Position,
  })),
});

const sanitizeSession = (session: GambitSession): GambitApiSession => {
  const snapshot = getGambitSessionGridSnapshot(session);

  if (!snapshot) {
    throw new Error('Invalid Gambit mock session without Grid.');
  }

  const grid = sanitizeGridSnapshot(snapshot);

  return {
    AccumulatedPoints: session.AccumulatedPoints,
    BurnSlotsAvailable: session.BurnSlotsAvailable,
    BurnsRemaining:
      session.BurnsRemaining ??
      Math.max(0, session.BurnSlotsAvailable - session.ManualFlipsCount),
    CardsPurchased: session.CardsPurchased,
    CreatedAt: session.CreatedAt,
    FirstEventFlip: session.FirstEventFlip,
    GambitSessionId: session.GambitSessionId,
    GambitTable: session.GambitTable ?? null,
    GambitTableId: session.GambitTableId,
    Grid: grid,
    ManualFlipsCount: session.ManualFlipsCount,
    NextEffect: session.NextEffect,
    Result: session.Result,
    SecondEventFlip: session.SecondEventFlip,
    Status: session.Status,
    UpdatedAt: session.UpdatedAt,
    UserId: session.UserId,
  };
};

const sanitizePeekResult = (
  peekResult: GambitInteractionPeekResult | null
): GambitPeekResult | null => {
  if (!peekResult) {
    return null;
  }

  if ('AtLeastOneBad' in peekResult) {
    return {
      AtLeastOneBad: peekResult.AtLeastOneBad,
    };
  }

  return {
    Effect: peekResult.Effect,
    Points: peekResult.Points,
    Position: peekResult.Position,
  };
};

const getSandboxSession = () => {
  if (!sandboxSession) {
    sandboxSession = makeMockGambitSession(ACTIVE_GAMBIT_MOCK_SCENARIO);
  }

  return sandboxSession;
};

export const resetGambitSandboxSession = (
  scenario: GambitMockScenarioId = ACTIVE_GAMBIT_MOCK_SCENARIO
) => {
  sandboxSession = makeMockGambitSession(scenario);
  return sanitizeSession(sandboxSession);
};

export const fetchActiveGambitSession =
  async (): Promise<GambitApiSession | null> =>
    sanitizeSession(getSandboxSession());

export const burnActiveGambitCard = async (
  position: number
): Promise<GambitApiSession> => {
  sandboxSession = revealMockGambitCard(getSandboxSession(), position);

  return sanitizeSession(sandboxSession);
};

export const resolveActiveGambitEvent = async (
  selection: ResolveActiveGambitEventSelection
): Promise<GambitApiSession> => {
  sandboxSession = resolveMockPendingEvent(getSandboxSession(), selection);

  return sanitizeSession(sandboxSession);
};

export const resolveActiveGambitEffect = async (
  positions: number[]
): Promise<GambitResolveEffectResponse> => {
  const resolution = resolveMockPendingInteraction(
    getSandboxSession(),
    positions
  );

  sandboxSession = resolution.session;

  return {
    PeekResult: sanitizePeekResult(resolution.PeekResult),
    Session: sanitizeSession(sandboxSession),
  };
};

export const cashOutActiveGambitSession =
  async (): Promise<GambitCashOutResponse> => {
    const session = getSandboxSession();
    const result = session.Result ?? Math.max(0, session.AccumulatedPoints);

    sandboxSession = {
      ...session,
      Result: result,
      Status: 'CashedOut',
    };

    return {
      FinalBalance: result,
      Message: 'Mock cash-out prepared.',
      Result: result,
      Session: sanitizeSession(sandboxSession),
    };
  };
