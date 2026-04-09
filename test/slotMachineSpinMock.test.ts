import { describe, expect, it } from '@jest/globals';
import {
  getTestSlotMachineSpinResult,
  TEST_SLOT_MACHINE_SPIN_RESULTS,
} from '../src/presentation/games/SlotMachineGame/testSlotMachineSpinMock';

describe('slotMachineSpinMock', () => {
  it('cycles through the configured spin sets and protects the base mock from external mutation', () => {
    const firstResult = getTestSlotMachineSpinResult();

    expect(firstResult.id).toBe('mixedDrop');

    firstResult.reelStopOrder[0] = 99;
    firstResult.reels[0].symbolId = 'rat';

    const secondResult = getTestSlotMachineSpinResult();
    const thirdResult = getTestSlotMachineSpinResult();
    const fourthResult = getTestSlotMachineSpinResult();

    expect(secondResult.id).toBe('forcedCombo');
    expect(thirdResult.id).toBe('reverseStopOrder');
    expect(fourthResult.id).toBe('mixedDrop');

    expect(TEST_SLOT_MACHINE_SPIN_RESULTS.mixedDrop.reelStopOrder[0]).toBe(0);
    expect(TEST_SLOT_MACHINE_SPIN_RESULTS.mixedDrop.reels[0].symbolId).toBe(
      'watermelon'
    );
    expect(fourthResult.reelStopOrder[0]).toBe(0);
    expect(fourthResult.reels[0].symbolId).toBe('watermelon');
  });
});
