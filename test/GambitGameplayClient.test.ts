import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import {
  burnActiveGambitCard,
  fetchActiveGambitSession,
  resetGambitGameplayClient,
} from '../src/presentation/games/GambitGame/gambitGameplayClient';
import { createGambitApiSession } from './GambitTestBuilders';

const mockBackendBurn = jest.fn();
const mockBackendFetch = jest.fn();
const mockBackendResolveEffect = jest.fn();
const mockBackendResolveEvent = jest.fn();
const mockBackendCashOut = jest.fn();
const mockSandboxBurn = jest.fn();
const mockSandboxFetch = jest.fn();
const mockSandboxResolveEffect = jest.fn();
const mockSandboxResolveEvent = jest.fn();
const mockSandboxCashOut = jest.fn();
const mockSandboxReset = jest.fn();

jest.mock('../src/presentation/games/GambitGame/gambitApi', () => ({
  burnActiveGambitCard: (...args: unknown[]) => mockBackendBurn(...args),
  cashOutActiveGambitSession: (...args: unknown[]) =>
    mockBackendCashOut(...args),
  fetchActiveGambitSession: (...args: unknown[]) => mockBackendFetch(...args),
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
  burnActiveGambitCard: (...args: unknown[]) => mockSandboxBurn(...args),
  cashOutActiveGambitSession: (...args: unknown[]) =>
    mockSandboxCashOut(...args),
  fetchActiveGambitSession: (...args: unknown[]) => mockSandboxFetch(...args),
  resetGambitSandboxSession: (...args: unknown[]) => mockSandboxReset(...args),
  resolveActiveGambitEffect: (...args: unknown[]) =>
    mockSandboxResolveEffect(...args),
  resolveActiveGambitEvent: (...args: unknown[]) =>
    mockSandboxResolveEvent(...args),
}));

describe('GambitGameplayClient', () => {
  beforeEach(() => {
    window.localStorage.clear();
    mockBackendBurn.mockReset();
    mockBackendFetch.mockReset();
    mockBackendResolveEffect.mockReset();
    mockBackendResolveEvent.mockReset();
    mockBackendCashOut.mockReset();
    mockSandboxBurn.mockReset();
    mockSandboxFetch.mockReset();
    mockSandboxResolveEffect.mockReset();
    mockSandboxResolveEvent.mockReset();
    mockSandboxCashOut.mockReset();
    mockSandboxReset.mockReset();
    resetGambitGameplayClient();
  });

  it('uses sandbox in auto mode when the backend has no active session', async () => {
    const sandboxSession = createGambitApiSession({
      GambitSessionId: 'sandbox-session',
    });

    mockBackendFetch.mockResolvedValueOnce(null);
    mockSandboxFetch.mockResolvedValueOnce(sandboxSession);

    await expect(fetchActiveGambitSession()).resolves.toEqual({
      fallbackReason: 'missing-session',
      mode: 'auto',
      session: sandboxSession,
      source: 'mock',
    });
  });

  it('keeps backend mode on the real client even when no session exists', async () => {
    window.localStorage.setItem('gambitGameplayMode', 'backend');
    mockBackendFetch.mockResolvedValueOnce(null);

    await expect(fetchActiveGambitSession()).resolves.toEqual({
      fallbackReason: 'missing-session',
      mode: 'backend',
      session: null,
      source: 'backend',
    });
    expect(mockSandboxFetch).not.toHaveBeenCalled();
  });

  it('routes gameplay mutations to sandbox after mock mode activation', async () => {
    const sandboxSession = createGambitApiSession();

    window.localStorage.setItem('gambitGameplayMode', 'mock');
    mockSandboxFetch.mockResolvedValueOnce(sandboxSession);
    mockSandboxBurn.mockResolvedValueOnce(
      createGambitApiSession({ ManualFlipsCount: 1 })
    );

    await fetchActiveGambitSession();
    await burnActiveGambitCard(7);

    expect(mockBackendFetch).not.toHaveBeenCalled();
    expect(mockSandboxBurn).toHaveBeenCalledWith(7);
  });
});
