import { config } from '../../../config';
import { apiClient } from '../../../infrastructure/http/client';
import {
  makeMockGambitSession,
  makeMockGambitTable,
} from './gambitMockBuilders';
import { mapGambitSessionToViewModel } from './gambitMapper';
import type {
  CreateGambitSessionPayload,
  GambitId,
  GambitSession,
  GambitSessionViewModel,
  GambitTable,
  UpdateGambitSessionPayload,
} from './gambitTypes';

const getMockGambitSession = (
  overrides: Partial<GambitSession> = {}
): GambitSession => makeMockGambitSession(undefined, overrides);

export const createMockBackendGambitSession = (): GambitSession =>
  getMockGambitSession();

export const createMockGambitViewModel = (): GambitSessionViewModel =>
  mapGambitSessionToViewModel(createMockBackendGambitSession());

export const fetchGambitTables = async (): Promise<GambitTable[]> => {
  if (config.useGambitMock) {
    return [makeMockGambitTable()];
  }

  const response = await apiClient.get<GambitTable[]>('/gambit-table');

  return response.data;
};

export const fetchGambitTable = async (
  gambitTableId: GambitId
): Promise<GambitTable> => {
  if (config.useGambitMock) {
    return makeMockGambitTable({
      GambitTableId: gambitTableId,
    });
  }

  const response = await apiClient.get<GambitTable>(
    `/gambit-table/${gambitTableId}`
  );

  return response.data;
};

export const createGambitSession = async (
  gambitTableId: GambitId,
  payload: CreateGambitSessionPayload
): Promise<GambitSession> => {
  if (config.useGambitMock) {
    return getMockGambitSession({
      CardsPurchased: payload.CardsPurchased,
      GambitTableId: gambitTableId,
    });
  }

  const response = await apiClient.post<GambitSession>(
    `/gambit-tables/${gambitTableId}/sessions`,
    payload
  );

  return response.data;
};

export const fetchGambitSessions = async (
  gambitTableId: GambitId
): Promise<GambitSession[]> => {
  if (config.useGambitMock) {
    return [
      getMockGambitSession({
        GambitTableId: gambitTableId,
      }),
    ];
  }

  const response = await apiClient.get<GambitSession[]>(
    `/gambit-tables/${gambitTableId}/sessions`
  );

  return response.data;
};

export const fetchGambitSession = async (
  gambitTableId: GambitId,
  sessionId: GambitId
): Promise<GambitSession> => {
  if (config.useGambitMock) {
    return getMockGambitSession({
      GambitSessionId: sessionId,
      GambitTableId: gambitTableId,
    });
  }

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
  if (config.useGambitMock) {
    return {
      ...getMockGambitSession({
        GambitSessionId: sessionId,
        GambitTableId: gambitTableId,
      }),
      ...payload,
    };
  }

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
  if (config.useGambitMock) {
    return;
  }

  await apiClient.delete(
    `/gambit-tables/${gambitTableId}/sessions/${sessionId}`
  );
};

export const getGambitSessionStub = async (): Promise<GambitSessionViewModel> =>
  mapGambitSessionToViewModel(await fetchGambitSession(1, 1));
