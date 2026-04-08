import type {
  SlotMachineSpinDirection,
  SlotMachineSymbolId,
} from './slotMachineGameConfig';

export type SlotMachineRerollResult = {
  extraSpinSteps?: number;
  id: string;
  reelIndex: number;
  responseDelayMs: number;
  spinDirection: SlotMachineSpinDirection;
  spinSpeedPxPerMs: number;
  symbolId: SlotMachineSymbolId;
};

export const TEST_SLOT_MACHINE_REROLL_RESULTS_BY_REEL: Record<
  number,
  readonly SlotMachineRerollResult[]
> = {
  0: [
    {
      extraSpinSteps: 2,
      id: 'slot1-reroll-a',
      reelIndex: 0,
      responseDelayMs: 180,
      spinDirection: 'down',
      spinSpeedPxPerMs: 2.6,
      symbolId: 'pig',
    },
    {
      extraSpinSteps: 3,
      id: 'slot1-reroll-b',
      reelIndex: 0,
      responseDelayMs: 200,
      spinDirection: 'down',
      spinSpeedPxPerMs: 2.8,
      symbolId: 'rat',
    },
  ],
  1: [
    {
      extraSpinSteps: 2,
      id: 'slot2-reroll-a',
      reelIndex: 1,
      responseDelayMs: 180,
      spinDirection: 'down',
      spinSpeedPxPerMs: 2.7,
      symbolId: 'orange',
    },
    {
      extraSpinSteps: 3,
      id: 'slot2-reroll-b',
      reelIndex: 1,
      responseDelayMs: 200,
      spinDirection: 'down',
      spinSpeedPxPerMs: 2.9,
      symbolId: 'watermelon',
    },
  ],
  2: [
    {
      extraSpinSteps: 2,
      id: 'slot3-reroll-a',
      reelIndex: 2,
      responseDelayMs: 180,
      spinDirection: 'down',
      spinSpeedPxPerMs: 2.8,
      symbolId: 'egg',
    },
    {
      extraSpinSteps: 3,
      id: 'slot3-reroll-b',
      reelIndex: 2,
      responseDelayMs: 200,
      spinDirection: 'down',
      spinSpeedPxPerMs: 3,
      symbolId: 'twoX',
    },
  ],
  3: [
    {
      extraSpinSteps: 2,
      id: 'slot4-reroll-a',
      reelIndex: 3,
      responseDelayMs: 180,
      spinDirection: 'down',
      spinSpeedPxPerMs: 2.9,
      symbolId: 'cheese',
    },
    {
      extraSpinSteps: 3,
      id: 'slot4-reroll-b',
      reelIndex: 3,
      responseDelayMs: 200,
      spinDirection: 'down',
      spinSpeedPxPerMs: 3.1,
      symbolId: 'oranges',
    },
  ],
};

const testSlotMachineRerollScenarioIndexesByReel = new Map<number, number>();

const cloneTestSlotMachineRerollResult = (
  rerollResult: SlotMachineRerollResult
): SlotMachineRerollResult => ({
  ...rerollResult,
});

export const getTestSlotMachineRerollResult = (reelIndex: number) => {
  const reelResults = TEST_SLOT_MACHINE_REROLL_RESULTS_BY_REEL[reelIndex];

  if (!reelResults?.length) {
    throw new Error(
      `No slot machine test reroll result configured for reel ${reelIndex}.`
    );
  }

  const currentScenarioIndex =
    testSlotMachineRerollScenarioIndexesByReel.get(reelIndex) ?? 0;
  const nextMockResult = reelResults[currentScenarioIndex % reelResults.length];

  testSlotMachineRerollScenarioIndexesByReel.set(
    reelIndex,
    currentScenarioIndex + 1
  );

  return cloneTestSlotMachineRerollResult(nextMockResult);
};
