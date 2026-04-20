import axios from 'axios';
import { apiClient } from '@infrastructure/http/client';
import type {
  SlotMachineSpinDirection,
  SlotMachineSpinResult,
  SlotMachineSymbolId,
} from './slotMachineGameConfig';

type BackendSlotSymbol =
  | 'Orange'
  | 'Oranges'
  | 'Watermelon'
  | 'Rat'
  | 'Cheese'
  | 'TwoX'
  | 'Pig';

type SlotMachineApiSpinReel = {
  ReelIndex: number;
  SymbolId: BackendSlotSymbol | string;
};

type SlotMachineApiRerolls = {
  Max: number;
  Used: number;
};

export type SlotMachineApiMachine = {
  Active: boolean;
  Description?: string | null;
  MaxRerolls: number;
  MinimumChipsRequired?: number | null;
  MinimumRerollValue?: number | null;
  MinimumSpinValue?: number | null;
  Name: string;
  SlotMachineId: number;
};

export type SlotMachineApiSession = {
  CurrentRewardSnapshot: number;
  CurrentRerollsSpent?: {
    Rerolls?: SlotMachineApiRerolls;
  } | null;
  CurrentSpinResult?: {
    Reels?: SlotMachineApiSpinReel[];
  } | null;
  EndedAt?: string | null;
  LastInteractionAt?: string;
  SlotMachineId: number;
  SlotSessionId: number;
  StartedAt?: string;
  Status: 'Active' | 'Ended' | 'Interrupted' | 'Expired';
};

export type SlotMachineSessionMutationResponse = {
  currentBalance: number;
  session: SlotMachineApiSession;
};

export type SlotMachineCashOutResponse = {
  finalBalance: number;
  message: string;
};

export type SlotMachineAnimationRerollResult = {
  extraSpinSteps?: number;
  id: string;
  reelIndex: number;
  responseDelayMs: number;
  spinDirection: SlotMachineSpinDirection;
  spinSpeedPxPerMs: number;
  symbolId: SlotMachineSymbolId;
};

export type SlotMachineSessionState = {
  reward: number;
  rerollsMax: number;
  rerollsRemaining: number;
};

const DEFAULT_SPIN_DIRECTION: SlotMachineSpinDirection = 'down';
const DEFAULT_SPIN_EXTRA_STEPS = [1, 2, 3, 4] as const;
const DEFAULT_REROLL_EXTRA_STEPS = [2, 3, 2, 3] as const;

const BACKEND_TO_FRONTEND_SYMBOL_ID: Record<
  BackendSlotSymbol,
  SlotMachineSymbolId
> = {
  Cheese: 'cheese',
  Orange: 'orange',
  Oranges: 'oranges',
  Pig: 'pig',
  Rat: 'rat',
  TwoX: 'twoX',
  Watermelon: 'watermelon',
};

const getNormalizedSessionReels = (session: SlotMachineApiSession) =>
  [...(session.CurrentSpinResult?.Reels ?? [])].sort(
    (leftReel, rightReel) => leftReel.ReelIndex - rightReel.ReelIndex
  );

const mapBackendSymbolToFrontendSymbolId = (
  backendSymbol: SlotMachineApiSpinReel['SymbolId']
): SlotMachineSymbolId => {
  const nextSymbolId =
    BACKEND_TO_FRONTEND_SYMBOL_ID[backendSymbol as BackendSlotSymbol];

  if (!nextSymbolId) {
    throw new Error(`Unsupported slot symbol received from backend: ${backendSymbol}`);
  }

  return nextSymbolId;
};

export const getPreferredSlotMachine = (
  slotMachines: SlotMachineApiMachine[],
  activeSession: SlotMachineApiSession | null
) => {
  const activeSessionMachine = activeSession
    ? slotMachines.find(
        (slotMachine) => slotMachine.SlotMachineId === activeSession.SlotMachineId
      ) ?? null
    : null;

  if (activeSessionMachine) {
    return activeSessionMachine;
  }

  return (
    slotMachines.find((slotMachine) => slotMachine.Active !== false) ??
    slotMachines[0] ??
    null
  );
};

export const getSlotMachineSessionState = (
  session: SlotMachineApiSession | null
): SlotMachineSessionState => {
  if (!session) {
    return {
      rerollsMax: 0,
      rerollsRemaining: 0,
      reward: 0,
    };
  }

  const rerolls = session.CurrentRerollsSpent?.Rerolls;
  const rerollsMax = Math.max(0, rerolls?.Max ?? 0);
  const rerollsUsed = Math.max(0, rerolls?.Used ?? 0);

  return {
    rerollsMax,
    rerollsRemaining: Math.max(0, rerollsMax - rerollsUsed),
    reward: Math.max(0, Math.trunc(session.CurrentRewardSnapshot ?? 0)),
  };
};

export const buildSpinAnimationFromSession = (
  session: SlotMachineApiSession
): SlotMachineSpinResult => {
  const reels = getNormalizedSessionReels(session).map((reel, index) => ({
    extraSpinSteps:
      DEFAULT_SPIN_EXTRA_STEPS[index % DEFAULT_SPIN_EXTRA_STEPS.length],
    reelIndex: reel.ReelIndex,
    symbolId: mapBackendSymbolToFrontendSymbolId(reel.SymbolId),
  }));

  return {
    firstStopDelayMs: 780,
    id: `slot-session-${session.SlotSessionId}-${Date.now()}`,
    reelStopOrder: reels.map((reel) => reel.reelIndex),
    reels,
    responseDelayMs: 120,
    spinDirection: DEFAULT_SPIN_DIRECTION,
    spinSpeedPxPerMs: 2.9,
    stopDelayMs: 220,
  };
};

export const buildRerollAnimationFromSession = (
  session: SlotMachineApiSession,
  reelIndex: number
): SlotMachineAnimationRerollResult => {
  const reelResult = getNormalizedSessionReels(session).find(
    (currentReel) => currentReel.ReelIndex === reelIndex
  );

  if (!reelResult) {
    throw new Error(`Slot reel ${reelIndex} was not returned by the backend session.`);
  }

  return {
    extraSpinSteps:
      DEFAULT_REROLL_EXTRA_STEPS[reelIndex % DEFAULT_REROLL_EXTRA_STEPS.length],
    id: `slot-reroll-${session.SlotSessionId}-${reelIndex}-${Date.now()}`,
    reelIndex,
    responseDelayMs: 100,
    spinDirection: DEFAULT_SPIN_DIRECTION,
    spinSpeedPxPerMs: 2.85,
    symbolId: mapBackendSymbolToFrontendSymbolId(reelResult.SymbolId),
  };
};

export const fetchSlotMachines = async () => {
  const response = await apiClient.get<SlotMachineApiMachine[]>('/slot/machine');
  return Array.isArray(response.data) ? response.data : [];
};

export const fetchActiveSlotSession = async () => {
  const response = await apiClient.get<SlotMachineApiSession | null>(
    '/sessions/active'
  );

  return response.data;
};

export const createSlotSession = async (slotMachineId: number) => {
  const response = await apiClient.post<SlotMachineSessionMutationResponse>(
    `/slot-machines/${slotMachineId}/sessions`,
    {}
  );

  return response.data;
};

export const rerollActiveSlotSession = async (reelIndex: number) => {
  const response = await apiClient.post<SlotMachineSessionMutationResponse>(
    `/sessions/active/reroll/${reelIndex}`
  );

  return response.data;
};

export const cashOutActiveSlotSession = async () => {
  const response = await apiClient.post<SlotMachineCashOutResponse>(
    '/sessions/active/cash-out'
  );

  return response.data;
};

export const getSlotMachineErrorMessage = (
  error: unknown,
  fallbackMessage: string
) => {
  if (axios.isAxiosError(error)) {
    const responseMessage = error.response?.data?.message;

    if (Array.isArray(responseMessage) && responseMessage.length > 0) {
      return responseMessage.join(', ');
    }

    if (typeof responseMessage === 'string' && responseMessage.trim()) {
      return responseMessage;
    }
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return fallbackMessage;
};
