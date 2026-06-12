import { afterEach, describe, expect, it, jest } from '@jest/globals';
import {
  burnActiveGambitCard,
  cashOutActiveGambitSession,
  createGambitSession,
  fetchActiveGambitSession,
  fetchGambitTableById,
  fetchGambitTables,
  resolveActiveGambitEffect,
  resolveActiveGambitEvent,
} from '../src/presentation/games/GambitGame/GambitApi';
import type { GambitTable } from '../src/presentation/games/GambitGame/GambitTypes';
import { createGambitApiSession } from './GambitTestBuilders';

const mockApiGet = jest.fn();
const mockApiPost = jest.fn();

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

jest.mock('@infrastructure/http/client', () => ({
  apiClient: {
    get: (...args: unknown[]) => mockApiGet(...args),
    post: (...args: unknown[]) => mockApiPost(...args),
  },
}));

describe('GambitApi', () => {
  afterEach(() => {
    mockApiGet.mockReset();
    mockApiPost.mockReset();
  });

  it('fetches the active Gambit session from the gameplay endpoint', async () => {
    const session = createGambitApiSession();

    mockApiGet.mockResolvedValueOnce({ data: session });

    await expect(fetchActiveGambitSession()).resolves.toBe(session);

    expect(mockApiGet).toHaveBeenCalledWith('/gambit/sessions/active');
  });

  it('fetches available Gambit tables from the backend', async () => {
    const tables = [
      createGambitTable(),
      createGambitTable({ GambitTableId: 2, Name: 'Mesa VIP' }),
    ];

    mockApiGet.mockResolvedValueOnce({ data: tables });

    await expect(fetchGambitTables()).resolves.toBe(tables);

    expect(mockApiGet).toHaveBeenCalledWith('/gambit-table');
  });

  it('fetches a Gambit table by id from the backend', async () => {
    const table = createGambitTable({ GambitTableId: 3 });

    mockApiGet.mockResolvedValueOnce({ data: table });

    await expect(fetchGambitTableById(3)).resolves.toBe(table);

    expect(mockApiGet).toHaveBeenCalledWith('/gambit-table/3');
  });

  it('burns the active Gambit card by position', async () => {
    const session = createGambitApiSession();

    mockApiPost.mockResolvedValueOnce({ data: session });

    await expect(burnActiveGambitCard(7)).resolves.toBe(session);

    expect(mockApiPost).toHaveBeenCalledWith('/gambit/sessions/active/burn/7');
  });

  it('creates a backend Gambit session through the table session route', async () => {
    const session = createGambitApiSession();

    mockApiPost.mockResolvedValueOnce({ data: session });

    await expect(
      createGambitSession({
        CardsPurchased: 5,
        GambitTableId: 1,
      })
    ).resolves.toBe(session);

    expect(mockApiPost).toHaveBeenCalledWith('/gambit-tables/1/sessions', {
      CardsPurchased: 5,
    });
  });

  it('resolves the active Gambit pending event with backend indexes', async () => {
    const session = createGambitApiSession();
    const selection = { BadIndex: 1, GoodIndex: 0 };

    mockApiPost.mockResolvedValueOnce({ data: session });

    await expect(resolveActiveGambitEvent(selection)).resolves.toBe(session);

    expect(mockApiPost).toHaveBeenCalledWith(
      '/gambit/sessions/active/resolve-event',
      selection
    );
  });

  it('resolves the active Gambit pending effect with selected positions', async () => {
    const response = {
      PeekResult: {
        Effect: null,
        Points: 40,
        Position: 4,
      },
      Session: createGambitApiSession(),
    };

    mockApiPost.mockResolvedValueOnce({ data: response });

    await expect(resolveActiveGambitEffect([4, 9, 17])).resolves.toBe(response);

    expect(mockApiPost).toHaveBeenCalledWith(
      '/gambit/sessions/active/resolve-effect',
      {
        Positions: [4, 9, 17],
      }
    );
  });

  it('normalizes cash-out camelCase backend fields to PascalCase', async () => {
    const response = {
      finalBalance: 500,
      message: 'ok',
      reward: 80,
    };

    mockApiPost.mockResolvedValueOnce({ data: response });

    await expect(cashOutActiveGambitSession()).resolves.toEqual({
      FinalBalance: 500,
      Message: 'ok',
      Reward: 80,
      Result: undefined,
      Session: undefined,
    });

    expect(mockApiPost).toHaveBeenCalledWith(
      '/gambit/sessions/active/cash-out'
    );
  });
});
