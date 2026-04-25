import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from '@jest/globals';
import { buildSpinAnimationFromSession } from '../src/presentation/games/SlotMachineGame/slotMachineApi';
import { createSlotMachineSession } from './SlotMachineTestBuilders';

const mockApiGet = jest.fn();
const mockApiPost = jest.fn();

jest.mock('@infrastructure/http/client', () => ({
  apiClient: {
    get: (...args: unknown[]) => mockApiGet(...args),
    post: (...args: unknown[]) => mockApiPost(...args),
  },
}));

describe('SlotMachineApi', () => {
  beforeEach(() => {
    jest.spyOn(Date, 'now').mockReturnValue(1_713_916_800_000);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    mockApiGet.mockReset();
    mockApiPost.mockReset();
  });

  it('adapts the backend session reels into the ordered visual spin envelope used by the slot', () => {
    const session = createSlotMachineSession({
      CurrentSpinResult: {
        Reels: [
          { ReelIndex: 3, SymbolId: 'Pig' },
          { ReelIndex: 1, SymbolId: 'Cheese' },
          { ReelIndex: 0, SymbolId: 'Watermelon' },
          { ReelIndex: 2, SymbolId: 'Oranges' },
        ],
      },
      SlotSessionId: 889,
    });

    expect(buildSpinAnimationFromSession(session)).toEqual({
      firstStopDelayMs: 780,
      id: 'slot-session-889-1713916800000',
      reelStopOrder: [0, 1, 2, 3],
      reels: [
        { extraSpinSteps: 1, reelIndex: 0, symbolId: 'watermelon' },
        { extraSpinSteps: 2, reelIndex: 1, symbolId: 'cheese' },
        { extraSpinSteps: 3, reelIndex: 2, symbolId: 'oranges' },
        { extraSpinSteps: 4, reelIndex: 3, symbolId: 'pig' },
      ],
      responseDelayMs: 120,
      spinDirection: 'down',
      spinSpeedPxPerMs: 2.9,
      stopDelayMs: 220,
    });
  });
});
