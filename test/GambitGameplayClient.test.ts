import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import {
  burnActiveGambitCard,
  cashOutActiveGambitSession,
  createGambitSession,
  fetchActiveGambitSession,
  fetchGambitTableById,
  fetchGambitTables,
  resolveActiveGambitEffect,
  resolveActiveGambitEvent,
} from '../src/presentation/games/GambitGame/gambitGameplayClient';
import type { GambitTable } from '../src/presentation/games/GambitGame/gambitTypes';
import { createGambitApiSession } from './GambitTestBuilders';

const mockBackendBurn = jest.fn();
const mockBackendCashOut = jest.fn();
const mockBackendCreateSession = jest.fn();
const mockBackendFetch = jest.fn();
const mockBackendFetchTableById = jest.fn();
const mockBackendFetchTables = jest.fn();
const mockBackendResolveEffect = jest.fn();
const mockBackendResolveEvent = jest.fn();

jest.mock('../src/presentation/games/GambitGame/gambitApi', () => ({
  burnActiveGambitCard: (...args: unknown[]) => mockBackendBurn(...args),
  cashOutActiveGambitSession: (...args: unknown[]) =>
    mockBackendCashOut(...args),
  createGambitSession: (...args: unknown[]) =>
    mockBackendCreateSession(...args),
  fetchActiveGambitSession: (...args: unknown[]) => mockBackendFetch(...args),
  fetchGambitTableById: (...args: unknown[]) =>
    mockBackendFetchTableById(...args),
  fetchGambitTables: (...args: unknown[]) => mockBackendFetchTables(...args),
  getGambitResolveEffectPeekResult: (response: { PeekResult?: unknown }) =>
    response.PeekResult ?? null,
  getGambitResolveEffectSession: <T extends { Session?: unknown }>(
    response: T
  ) => response.Session ?? response,
  resolveActiveGambitEffect: (...args: unknown[]) =>
    mockBackendResolveEffect(...args),
  resolveActiveGambitEvent: (...args: unknown[]) =>
    mockBackendResolveEvent(...args),
}));

const createGambitTable = (
  overrides: Partial<GambitTable> = {}
): GambitTable => ({
  Active: true,
  CardPrice: 10,
  Description: null,
  GambitTableId: 1,
  MaxCardsPurchased: 25,
  MinimumCardsPurchased: 1,
  MinimumChipsRequired: null,
  Name: 'Mesa Gambit',
  TableMultiplier: 1,
  ...overrides,
});

describe('GambitGameplayClient', () => {
  beforeEach(() => {
    mockBackendBurn.mockReset();
    mockBackendCashOut.mockReset();
    mockBackendCreateSession.mockReset();
    mockBackendFetch.mockReset();
    mockBackendFetchTableById.mockReset();
    mockBackendFetchTables.mockReset();
    mockBackendResolveEffect.mockReset();
    mockBackendResolveEvent.mockReset();
  });

  it('fetches the active session through gambitApi without fallback', async () => {
    mockBackendFetch.mockResolvedValueOnce(null);

    await expect(fetchActiveGambitSession()).resolves.toBeNull();

    expect(mockBackendFetch).toHaveBeenCalled();
    expect(mockBackendCreateSession).not.toHaveBeenCalled();
  });

  it('propagates backend auth errors without fallback', async () => {
    const authError = new Error('401 Unauthorized');

    mockBackendFetch.mockRejectedValueOnce(authError);

    await expect(fetchActiveGambitSession()).rejects.toBe(authError);

    expect(mockBackendCreateSession).not.toHaveBeenCalled();
  });

  it('delegates active gameplay actions to gambitApi', async () => {
    const session = createGambitApiSession();
    const cashOutResponse = {
      FinalBalance: 120,
      Message: 'ok',
    };

    mockBackendBurn.mockResolvedValueOnce(session);
    mockBackendCashOut.mockResolvedValueOnce(cashOutResponse);
    mockBackendResolveEvent.mockResolvedValueOnce(session);
    mockBackendResolveEffect.mockResolvedValueOnce({
      PeekResult: null,
      Session: session,
    });

    await expect(burnActiveGambitCard(3)).resolves.toBe(session);
    await expect(
      resolveActiveGambitEvent({ BadIndex: 2, GoodIndex: 1 })
    ).resolves.toBe(session);
    await expect(resolveActiveGambitEffect([8])).resolves.toEqual({
      PeekResult: null,
      Session: session,
    });
    await expect(cashOutActiveGambitSession()).resolves.toBe(cashOutResponse);

    expect(mockBackendBurn).toHaveBeenCalledWith(3);
    expect(mockBackendResolveEvent).toHaveBeenCalledWith({
      BadIndex: 2,
      GoodIndex: 1,
    });
    expect(mockBackendResolveEffect).toHaveBeenCalledWith([8]);
    expect(mockBackendCashOut).toHaveBeenCalled();
  });

  it('uses backendApi for table lookup and session creation', async () => {
    const tables = [createGambitTable()];
    const session = createGambitApiSession();

    mockBackendFetchTables.mockResolvedValueOnce(tables);
    mockBackendFetchTableById.mockResolvedValueOnce(tables[0]);
    mockBackendCreateSession.mockResolvedValueOnce(session);

    await expect(fetchGambitTables()).resolves.toBe(tables);
    await expect(fetchGambitTableById(1)).resolves.toBe(tables[0]);
    await expect(
      createGambitSession({ CardsPurchased: 5, GambitTableId: 1 })
    ).resolves.toBe(session);

    expect(mockBackendFetchTables).toHaveBeenCalled();
    expect(mockBackendFetchTableById).toHaveBeenCalledWith(1);
    expect(mockBackendCreateSession).toHaveBeenCalledWith({
      CardsPurchased: 5,
      GambitTableId: 1,
    });
  });
});
