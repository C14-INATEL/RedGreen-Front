import { afterEach, describe, expect, it, jest } from '@jest/globals';
import {
  burnActiveGambitCard,
  cashOutActiveGambitSession,
  fetchActiveGambitSession,
  resolveActiveGambitEffect,
  resolveActiveGambitEvent,
} from '../src/presentation/games/GambitGame/gambitApi';
import { createGambitApiSession } from './GambitTestBuilders';

const mockApiGet = jest.fn();
const mockApiPost = jest.fn();

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

  it('burns the active Gambit card by position', async () => {
    const session = createGambitApiSession();

    mockApiPost.mockResolvedValueOnce({ data: session });

    await expect(burnActiveGambitCard(7)).resolves.toBe(session);

    expect(mockApiPost).toHaveBeenCalledWith('/gambit/sessions/active/burn/7');
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

  it('keeps cash-out wired in the API contract without using it visually', async () => {
    const response = { FinalBalance: 500, Message: 'ok' };

    mockApiPost.mockResolvedValueOnce({ data: response });

    await expect(cashOutActiveGambitSession()).resolves.toBe(response);

    expect(mockApiPost).toHaveBeenCalledWith(
      '/gambit/sessions/active/cash-out'
    );
  });
});
