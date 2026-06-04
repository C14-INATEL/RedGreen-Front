import { apiClient } from '../../../infrastructure/http/client';
import type {
  CreateGambitSessionPayload,
  GambitId,
  GambitSession,
  GambitTable,
  UpdateGambitSessionPayload,
} from './gambitTypes';

export const fetchGambitTables = async (): Promise<GambitTable[]> => {
  const response = await apiClient.get<GambitTable[]>('/gambit-table');

  return response.data;
};

export const fetchGambitTable = async (
  gambitTableId: GambitId
): Promise<GambitTable> => {
  const response = await apiClient.get<GambitTable>(
    `/gambit-table/${gambitTableId}`
  );

  return response.data;
};

export const createGambitSession = async (
  gambitTableId: GambitId,
  payload: CreateGambitSessionPayload
): Promise<GambitSession> => {
  const response = await apiClient.post<GambitSession>(
    `/gambit-tables/${gambitTableId}/sessions`,
    payload
  );

  return response.data;
};

export const fetchGambitSessions = async (
  gambitTableId: GambitId
): Promise<GambitSession[]> => {
  const response = await apiClient.get<GambitSession[]>(
    `/gambit-tables/${gambitTableId}/sessions`
  );

  return response.data;
};

export const fetchGambitSession = async (
  gambitTableId: GambitId,
  sessionId: GambitId
): Promise<GambitSession> => {
  const response = await apiClient.get<GambitSession>(
    `/gambit-tables/${gambitTableId}/sessions/${sessionId}`
  );

  return response.data;
};

export const updateGambitSession = async (
  gambitTableId: GambitId,
  sessionId: GambitId,
  payload: UpdateGambitSessionPayload
): Promise<GambitSession> => {
  const response = await apiClient.patch<GambitSession>(
    `/gambit-tables/${gambitTableId}/sessions/${sessionId}`,
    payload
  );

  return response.data;
};

export const deleteGambitSession = async (
  gambitTableId: GambitId,
  sessionId: GambitId
): Promise<void> => {
  await apiClient.delete(
    `/gambit-tables/${gambitTableId}/sessions/${sessionId}`
  );
};
