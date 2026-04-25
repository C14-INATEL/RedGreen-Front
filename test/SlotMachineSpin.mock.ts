import type { SlotMachineSpinResult } from '../src/presentation/games/SlotMachineGame/slotMachineGameConfig';

export const TEST_SLOT_MACHINE_SPIN_RESULTS: Record<
  string,
  SlotMachineSpinResult
> = {
  mixedDrop: {
    firstStopDelayMs: 900,
    id: 'mixedDrop',
    reelStopOrder: [0, 1, 2, 3],
    reels: [
      { extraSpinSteps: 1, reelIndex: 0, symbolId: 'watermelon' },
      { extraSpinSteps: 2, reelIndex: 1, symbolId: 'pig' },
      { extraSpinSteps: 3, reelIndex: 2, symbolId: 'orange' },
      { extraSpinSteps: 4, reelIndex: 3, symbolId: 'cheese' },
    ],
    responseDelayMs: 320,
    spinDirection: 'down',
    spinSpeedPxPerMs: 2.8,
    stopDelayMs: 250,
  },
  forcedCombo: {
    firstStopDelayMs: 780,
    id: 'forcedCombo',
    reelStopOrder: [0, 1, 2, 3],
    reels: [
      { extraSpinSteps: 2, reelIndex: 0, symbolId: 'rat' },
      { extraSpinSteps: 2, reelIndex: 1, symbolId: 'rat' },
      { extraSpinSteps: 2, reelIndex: 2, symbolId: 'rat' },
      { extraSpinSteps: 2, reelIndex: 3, symbolId: 'rat' },
    ],
    responseDelayMs: 220,
    spinDirection: 'down',
    spinSpeedPxPerMs: 3.1,
    stopDelayMs: 220,
  },
  reverseStopOrder: {
    firstStopDelayMs: 1040,
    id: 'reverseStopOrder',
    reelStopOrder: [3, 2, 1, 0],
    reels: [
      { extraSpinSteps: 4, reelIndex: 0, symbolId: 'twoX' },
      { extraSpinSteps: 3, reelIndex: 1, symbolId: 'egg' },
      { extraSpinSteps: 2, reelIndex: 2, symbolId: 'watermelon' },
      { extraSpinSteps: 1, reelIndex: 3, symbolId: 'oranges' },
    ],
    responseDelayMs: 420,
    spinDirection: 'down',
    spinSpeedPxPerMs: 2.9,
    stopDelayMs: 180,
  },
};

const TEST_SLOT_MACHINE_SPIN_RESULT_SEQUENCE = [
  'mixedDrop',
  'forcedCombo',
  'reverseStopOrder',
] as const;

const TEST_SLOT_MACHINE_SPIN_RESULT_IDS =
  TEST_SLOT_MACHINE_SPIN_RESULT_SEQUENCE.length > 0
    ? TEST_SLOT_MACHINE_SPIN_RESULT_SEQUENCE
    : (Object.keys(TEST_SLOT_MACHINE_SPIN_RESULTS) as Array<
        keyof typeof TEST_SLOT_MACHINE_SPIN_RESULTS
      >);

let testSlotMachineSpinScenarioIndex = 0;

const cloneTestSlotMachineSpinResult = (
  spinResult: SlotMachineSpinResult
): SlotMachineSpinResult => ({
  ...spinResult,
  reelStopOrder: [...spinResult.reelStopOrder],
  reels: spinResult.reels.map((reelResult) => ({
    ...reelResult,
  })),
});

export const resetTestSlotMachineSpinResultSequence = () => {
  testSlotMachineSpinScenarioIndex = 0;
};

export const getTestSlotMachineSpinResult = () => {
  if (!TEST_SLOT_MACHINE_SPIN_RESULT_IDS.length) {
    throw new Error('No slot machine test spin result configured.');
  }

  const nextMockId =
    TEST_SLOT_MACHINE_SPIN_RESULT_IDS[
      testSlotMachineSpinScenarioIndex %
        TEST_SLOT_MACHINE_SPIN_RESULT_IDS.length
    ];

  testSlotMachineSpinScenarioIndex += 1;

  return cloneTestSlotMachineSpinResult(
    TEST_SLOT_MACHINE_SPIN_RESULTS[nextMockId]
  );
};
