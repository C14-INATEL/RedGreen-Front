import axios from 'axios';
import { apiClient } from '@infrastructure/http/client';
import type {
  GambitCardEffect,
  GambitCardNature,
  GambitId,
  GambitPendingInteractionAction,
  GambitSessionStatus,
  GambitTable,
} from './GambitTypes';

export type GambitApiCardEffect = GambitCardEffect;
export type GambitApiCard = GambitApiCardEffect;

export type GambitApiRevealedCard = {
  Effect: GambitApiCard | null;
  Locked: boolean;
  Points: number;
  Position: number;
};

export type GambitApiUnrevealedCard = {
  Locked: boolean;
  Position: number;
};

export type GambitApiPendingEvent = {
  BadOptions: GambitApiCard[];
  CardsOffered?: GambitApiCard[];
  EventType?: GambitCardNature | null;
  GoodOptions: GambitApiCard[];
};

export type GambitApiPendingInteraction = {
  Action: GambitPendingInteractionAction;
  Effect: GambitApiCard;
  RequiredSelections: number;
  SelectedPositions: number[];
};

export type GambitApiGrid = {
  PendingEvent: GambitApiPendingEvent | null;
  PendingInteraction: GambitApiPendingInteraction | null;
  Revealed: GambitApiRevealedCard[];
  Unrevealed: GambitApiUnrevealedCard[];
};

export type GambitApiSession = {
  AccumulatedPoints: number;
  BurnSlotsAvailable: number;
  BurnsRemaining?: number;
  CardsPurchased: number;
  CreatedAt?: string;
  CurrentGridSnapshot?: GambitApiGrid | null;
  FirstEventFlip?: number;
  GambitSessionId: GambitId;
  GambitTable?: GambitTable | null;
  GambitTableId: GambitId;
  Grid: GambitApiGrid;
  ManualFlipsCount: number;
  NextEffect: GambitApiCard | null;
  Result: number | null;
  SecondEventFlip?: number;
  Status: GambitSessionStatus;
  UpdatedAt?: string;
  UserId: GambitId;
};

export type GambitPeekResult =
  | {
      Effect: GambitApiCard | null;
      Locked?: boolean;
      Points: number | null;
      Position: number;
    }
  | {
      AtLeastOneBad: boolean;
    };

export type GambitResolveEffectResponse =
  | {
      PeekResult?: GambitPeekResult | null;
      Session: GambitApiSession;
    }
  | (GambitApiSession & {
      PeekResult?: GambitPeekResult | null;
    });

export type GambitCashOutResponse = {
  FinalBalance?: number;
  Message?: string;
  Reward?: number;
  Result?: number | null;
  Session?: GambitApiSession;
};

export type RawGambitCashOutResponse = GambitCashOutResponse & {
  finalBalance?: number;
  message?: string;
  reward?: number;
};

export type ResolveActiveGambitEventSelection = {
  BadIndex: number;
  GoodIndex: number;
};

export type CreateGambitSessionParams = {
  CardsPurchased: number;
  GambitTableId: number;
};

const isNotFoundResponse = (error: unknown) =>
  axios.isAxiosError(error) && error.response?.status === 404;

export const getGambitResolveEffectSession = (
  response: GambitResolveEffectResponse
): GambitApiSession => {
  if ('Session' in response) {
    return response.Session;
  }

  return response;
};

export const getGambitResolveEffectPeekResult = (
  response: GambitResolveEffectResponse
): GambitPeekResult | null => response.PeekResult ?? null;

export const normalizeGambitCashOutResponse = (
  response: RawGambitCashOutResponse
): GambitCashOutResponse => ({
  FinalBalance: response.FinalBalance ?? response.finalBalance,
  Message: response.Message ?? response.message,
  Reward: response.Reward ?? response.reward,
  Result: response.Result,
  Session: response.Session,
});

export const fetchActiveGambitSession =
  async (): Promise<GambitApiSession | null> => {
    try {
      const response = await apiClient.get<GambitApiSession | null>(
        '/gambit/sessions/active'
      );

      return response.data ?? null;
    } catch (error) {
      if (isNotFoundResponse(error)) {
        return null;
      }

      throw error;
    }
  };

export const fetchGambitTables = async (): Promise<GambitTable[]> => {
  const response = await apiClient.get<GambitTable[]>('/gambit-table');

  return Array.isArray(response.data) ? response.data : [];
};

export const fetchGambitTableById = async (
  id: number
): Promise<GambitTable> => {
  const response = await apiClient.get<GambitTable>(`/gambit-table/${id}`);

  return response.data;
};

export const createGambitSession = async ({
  CardsPurchased,
  GambitTableId,
}: CreateGambitSessionParams): Promise<GambitApiSession> => {
  const response = await apiClient.post<GambitApiSession>(
    `/gambit-tables/${GambitTableId}/sessions`,
    {
      CardsPurchased,
    }
  );

  return response.data;
};

export const burnActiveGambitCard = async (
  position: number
): Promise<GambitApiSession> => {
  const response = await apiClient.post<GambitApiSession>(
    `/gambit/sessions/active/burn/${position}`
  );

  return response.data;
};

export const resolveActiveGambitEvent = async (
  selection: ResolveActiveGambitEventSelection
): Promise<GambitApiSession> => {
  const response = await apiClient.post<GambitApiSession>(
    '/gambit/sessions/active/resolve-event',
    selection
  );

  return response.data;
};

export const resolveActiveGambitEffect = async (
  positions: number[]
): Promise<GambitResolveEffectResponse> => {
  const response = await apiClient.post<GambitResolveEffectResponse>(
    '/gambit/sessions/active/resolve-effect',
    {
      Positions: positions,
    }
  );

  return response.data;
};

export const cashOutActiveGambitSession =
  async (): Promise<GambitCashOutResponse> => {
    const response = await apiClient.post<RawGambitCashOutResponse>(
      '/gambit/sessions/active/cash-out'
    );

    return normalizeGambitCashOutResponse(response.data);
  };
