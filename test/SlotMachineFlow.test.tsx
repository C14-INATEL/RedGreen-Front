import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from '@jest/globals';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { createElement } from 'react';
import { SlotMachineButtons } from '../src/presentation/games/SlotMachineGame/SlotMachineButtons';
import { SlotMachinePixi } from '../src/presentation/games/SlotMachineGame/SlotMachinePixi';
import {
  getTestSlotMachineSpinResult,
  TEST_SLOT_MACHINE_SPIN_RESULTS,
} from '../src/presentation/games/SlotMachineGame/testSlotMachineSpinMock';

const MACHINE_SIZE = {
  height: 4096,
  width: 4096,
};

type MockSlotMachineReelsProps = {
  idleRequestId?: number;
  onMachineModeChange?: (
    mode: 'idle' | 'realSpin' | 'rerollSpin' | 'resultHold'
  ) => void;
  onRealSpinStateChange?: (isRunning: boolean) => void;
  rerollRequest?: {
    id: number;
    reelIndex: number;
  } | null;
  spinRequestId?: number;
};

let mockLatestSlotMachineReelsProps: MockSlotMachineReelsProps | null = null;

jest.mock('../src/presentation/games/SlotMachineGame/SlotMachineReels', () => {
  const React = jest.requireActual('react') as typeof import('react');

  return {
    SlotMachineReels: (props: MockSlotMachineReelsProps) => {
      mockLatestSlotMachineReelsProps = props;

      return React.createElement('div', {
        'data-testid': 'slot-machine-reels',
      });
    },
  };
});

const getLeverButton = () =>
  screen.getByRole('button', { name: /Alavanca da maquina/i });

const getBlueButton = () =>
  screen.getByRole('button', { name: /Botao azul da maquina/i });

const getRedButtons = () =>
  screen.getAllByRole('button', { name: /Botao \d+ da maquina/i });

const getReelsProps = () => {
  expect(mockLatestSlotMachineReelsProps).not.toBeNull();

  return mockLatestSlotMachineReelsProps as MockSlotMachineReelsProps;
};

const enterMainSpinState = () => {
  const reelsProps = getReelsProps();

  act(() => {
    reelsProps.onMachineModeChange?.('realSpin');
    reelsProps.onRealSpinStateChange?.(true);
  });
};

const transitionToResultHold = () => {
  const reelsProps = getReelsProps();

  act(() => {
    reelsProps.onMachineModeChange?.('realSpin');
    reelsProps.onRealSpinStateChange?.(true);
  });

  act(() => {
    reelsProps.onMachineModeChange?.('resultHold');
    reelsProps.onRealSpinStateChange?.(false);
  });
};

const startFakeTimers = () => {
  mockLatestSlotMachineReelsProps = null;
  jest.useFakeTimers();
};

const stopFakeTimers = () => {
  act(() => {
    jest.runOnlyPendingTimers();
  });
  jest.useRealTimers();
};

describe('reroll buttons', () => {
  beforeEach(() => {
    startFakeTimers();
  });

  afterEach(() => {
    stopFakeTimers();
  });

  it('maps each red button to the correct reel index', () => {
    const handleRerollReel = jest.fn<(reelIndex: number) => void>();

    render(
      createElement(SlotMachineButtons, {
        canReroll: true,
        machineSize: MACHINE_SIZE,
        onRerollReel: handleRerollReel,
      })
    );

    const redButtons = getRedButtons();

    fireEvent.pointerDown(redButtons[0]);
    fireEvent.pointerDown(redButtons[1]);
    fireEvent.pointerDown(redButtons[2]);
    fireEvent.pointerDown(redButtons[3]);

    expect(handleRerollReel).toHaveBeenCalledTimes(4);
    expect(handleRerollReel).toHaveBeenNthCalledWith(1, 0);
    expect(handleRerollReel).toHaveBeenNthCalledWith(2, 1);
    expect(handleRerollReel).toHaveBeenNthCalledWith(3, 2);
    expect(handleRerollReel).toHaveBeenNthCalledWith(4, 3);
  });
});

describe('input lock', () => {
  beforeEach(() => {
    startFakeTimers();
  });

  afterEach(() => {
    stopFakeTimers();
  });

  it('ignores concurrent inputs while the main lever animation is active', () => {
    render(createElement(SlotMachinePixi));

    const leverButton = getLeverButton();
    const blueButton = getBlueButton();
    const [firstRedButton] = getRedButtons();

    fireEvent.pointerDown(leverButton);
    enterMainSpinState();

    expect(leverButton.hasAttribute('disabled')).toBe(true);
    expect(blueButton.hasAttribute('disabled')).toBe(true);
    expect(firstRedButton.hasAttribute('disabled')).toBe(true);
    expect(getReelsProps().spinRequestId).toBe(1);
    expect(getReelsProps().idleRequestId).toBe(0);
    expect(getReelsProps().rerollRequest).toBeNull();

    fireEvent.pointerDown(firstRedButton);
    fireEvent.pointerDown(blueButton);
    fireEvent.pointerDown(leverButton);
    fireEvent.pointerDown(leverButton);

    expect(getReelsProps().spinRequestId).toBe(1);
    expect(getReelsProps().idleRequestId).toBe(0);
    expect(getReelsProps().rerollRequest).toBeNull();
  });
});

describe('reset flow', () => {
  beforeEach(() => {
    startFakeTimers();
  });

  afterEach(() => {
    stopFakeTimers();
  });

  it('keeps the machine in result hold until the blue button explicitly requests idle', () => {
    render(createElement(SlotMachinePixi));

    const leverButton = getLeverButton();

    fireEvent.pointerDown(leverButton);
    transitionToResultHold();

    const blueButton = getBlueButton();
    const [firstRedButton] = getRedButtons();

    expect(getReelsProps().spinRequestId).toBe(1);
    expect(getReelsProps().idleRequestId).toBe(0);
    expect(leverButton.hasAttribute('disabled')).toBe(true);
    expect(blueButton.hasAttribute('disabled')).toBe(false);
    expect(firstRedButton.hasAttribute('disabled')).toBe(false);

    act(() => {
      jest.advanceTimersByTime(10_000);
    });

    expect(getReelsProps().idleRequestId).toBe(0);
    expect(leverButton.hasAttribute('disabled')).toBe(true);
    expect(blueButton.hasAttribute('disabled')).toBe(false);
    expect(firstRedButton.hasAttribute('disabled')).toBe(false);

    fireEvent.pointerDown(blueButton);

    expect(getReelsProps().idleRequestId).toBe(1);
    expect(leverButton.hasAttribute('disabled')).toBe(true);

    act(() => {
      getReelsProps().onMachineModeChange?.('idle');
    });

    expect(getLeverButton().hasAttribute('disabled')).toBe(false);
    expect(getBlueButton().hasAttribute('disabled')).toBe(true);
  });
});

describe('reroll limits', () => {
  beforeEach(() => {
    startFakeTimers();
  });

  afterEach(() => {
    stopFakeTimers();
  });

  it('stops accepting reroll requests after consuming the configured limit', () => {
    render(createElement(SlotMachinePixi));

    fireEvent.pointerDown(getLeverButton());
    transitionToResultHold();

    for (let rerollCount = 1; rerollCount <= 5; rerollCount += 1) {
      const [firstRedButton] = getRedButtons();

      expect(firstRedButton.hasAttribute('disabled')).toBe(false);

      fireEvent.pointerDown(firstRedButton);

      expect(getReelsProps().rerollRequest).toEqual({
        id: rerollCount,
        reelIndex: 0,
      });

      act(() => {
        getReelsProps().onMachineModeChange?.('rerollSpin');
        getReelsProps().onRealSpinStateChange?.(true);
      });

      act(() => {
        getReelsProps().onMachineModeChange?.('resultHold');
        getReelsProps().onRealSpinStateChange?.(false);
      });
    }

    const [firstRedButton] = getRedButtons();

    expect(firstRedButton.hasAttribute('disabled')).toBe(true);

    fireEvent.pointerDown(firstRedButton);

    expect(getReelsProps().rerollRequest).toEqual({
      id: 5,
      reelIndex: 0,
    });
  });
});

describe('spin mock', () => {
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
