import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import {
  burnActiveGambitCard,
  createGambitSession,
  fetchActiveGambitSession,
  fetchGambitTableById,
  fetchGambitTables,
  resetGambitGameplayClient,
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
const mockMockBurn = jest.fn();
const mockMockCashOut = jest.fn();
const mockMockFetch = jest.fn();
const mockMockResolveEffect = jest.fn();
const mockMockResolveEvent = jest.fn();
const mockMockReset = jest.fn();

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

jest.mock('../src/presentation/games/GambitGame/gambitSandboxApi', () => ({
  burnActiveGambitCard: (...args: unknown[]) => mockMockBurn(...args),
  cashOutActiveGambitSession: (...args: unknown[]) => mockMockCashOut(...args),
  fetchActiveGambitSession: (...args: unknown[]) => mockMockFetch(...args),
  resetGambitSandboxSession: (...args: unknown[]) => mockMockReset(...args),
  resolveActiveGambitEffect: (...args: unknown[]) =>
    mockMockResolveEffect(...args),
  resolveActiveGambitEvent: (...args: unknown[]) =>
    mockMockResolveEvent(...args),
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
    window.localStorage.clear();
    mockBackendBurn.mockReset();
    mockBackendCashOut.mockReset();
    mockBackendCreateSession.mockReset();
    mockBackendFetch.mockReset();
    mockBackendFetchTableById.mockReset();
    mockBackendFetchTables.mockReset();
    mockBackendResolveEffect.mockReset();
    mockBackendResolveEvent.mockReset();
    mockMockBurn.mockReset();
    mockMockCashOut.mockReset();
    mockMockFetch.mockReset();
    mockMockResolveEffect.mockReset();
    mockMockResolveEvent.mockReset();
    mockMockReset.mockReset();
    resetGambitGameplayClient();
  });

  it('uses backend mode by default and does not fall back to mock when no active session exists', async () => {
    mockBackendFetch.mockResolvedValueOnce(null);

    await expect(fetchActiveGambitSession()).resolves.toEqual({
      mode: 'backend',
      session: null,
      source: 'backend',
    });

    expect(mockBackendFetch).toHaveBeenCalled();
    expect(mockMockFetch).not.toHaveBeenCalled();
    expect(mockBackendCreateSession).not.toHaveBeenCalled();
  });

  it('propagates backend auth errors instead of masking them with mock gameplay', async () => {
    const authError = new Error('401 Unauthorized');

    mockBackendFetch.mockRejectedValueOnce(authError);

    await expect(fetchActiveGambitSession()).rejects.toBe(authError);

    expect(mockMockFetch).not.toHaveBeenCalled();
    expect(mockBackendCreateSession).not.toHaveBeenCalled();
  });

  it('keeps backend actions on gambitApi after the backend source is active', async () => {
    const session = createGambitApiSession();

    window.localStorage.setItem('gambitGameplayMode', 'backend');
    mockBackendFetch.mockResolvedValueOnce(session);
    mockBackendBurn.mockResolvedValueOnce(session);
    mockBackendResolveEvent.mockResolvedValueOnce(session);
    mockBackendResolveEffect.mockResolvedValueOnce({
      PeekResult: null,
      Session: session,
    });

    await fetchActiveGambitSession();
    await burnActiveGambitCard(3);
    await resolveActiveGambitEvent({ BadIndex: 2, GoodIndex: 1 });
    await resolveActiveGambitEffect([8]);

    expect(mockBackendBurn).toHaveBeenCalledWith(3);
    expect(mockBackendResolveEvent).toHaveBeenCalledWith({
      BadIndex: 2,
      GoodIndex: 1,
    });
    expect(mockBackendResolveEffect).toHaveBeenCalledWith([8]);
    expect(mockMockBurn).not.toHaveBeenCalled();
    expect(mockMockResolveEvent).not.toHaveBeenCalled();
    expect(mockMockResolveEffect).not.toHaveBeenCalled();
  });

  it('uses gambitSandboxApi only in explicit mock mode', async () => {
    const mockSession = createGambitApiSession({
      GambitSessionId: 'mock-session',
    });

    window.localStorage.setItem('gambitGameplayMode', 'mock');
    mockMockFetch.mockResolvedValueOnce(mockSession);
    mockMockBurn.mockResolvedValueOnce(mockSession);
    mockMockResolveEvent.mockResolvedValueOnce(mockSession);
    mockMockResolveEffect.mockResolvedValueOnce({
      PeekResult: null,
      Session: mockSession,
    });

    await expect(fetchActiveGambitSession()).resolves.toEqual({
      mode: 'mock',
      session: mockSession,
      source: 'mock',
    });
    await burnActiveGambitCard(7);
    await resolveActiveGambitEvent({ BadIndex: 1, GoodIndex: 0 });
    await resolveActiveGambitEffect([4]);

    expect(mockBackendFetch).not.toHaveBeenCalled();
    expect(mockBackendBurn).not.toHaveBeenCalled();
    expect(mockMockBurn).toHaveBeenCalledWith(7);
    expect(mockMockResolveEvent).toHaveBeenCalledWith({
      BadIndex: 1,
      GoodIndex: 0,
    });
    expect(mockMockResolveEffect).toHaveBeenCalledWith([4]);
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
