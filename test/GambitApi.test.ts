import { describe, expect, it } from '@jest/globals';
import {
  createMockBackendGambitSession,
  createMockGambitViewModel,
  getGambitSessionStub,
} from '../src/presentation/games/GambitGame/gambitApi';

describe('GambitApi stub', () => {
  it('exposes a backend-shaped Gambit mock for future integration tests', () => {
    expect(createMockBackendGambitSession()).toMatchObject({
      CurrentGridSnapshot: {
        PendingEvent: null,
        Revealed: [],
      },
      GambitSessionId: 1,
      Result: null,
      Status: 'InProgress',
    });
  });

  it('maps the local backend mock into the visual ViewModel without HTTP', () => {
    const viewModel = createMockGambitViewModel();

    expect(viewModel).toMatchObject({
      gambitSessionId: 1,
      result: null,
      status: 'in-progress',
    });
    expect(viewModel.grid.cards).toHaveLength(25);
  });

  it('returns the same stable ViewModel envelope from the async stub', async () => {
    await expect(getGambitSessionStub()).resolves.toMatchObject({
      grid: {
        pendingEvent: null,
      },
      nextEffect: null,
      status: 'in-progress',
    });
  });
});
