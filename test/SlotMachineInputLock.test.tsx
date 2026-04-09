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
import { SlotMachinePixi } from '../src/presentation/games/SlotMachineGame/SlotMachinePixi';

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

jest.mock(
  '../src/presentation/games/SlotMachineGame/SlotMachineReels',
  () => {
    const React = jest.requireActual('react') as typeof import('react');

    return {
      SlotMachineReels: (props: MockSlotMachineReelsProps) => {
        mockLatestSlotMachineReelsProps = props;

        return React.createElement('div', {
          'data-testid': 'slot-machine-reels',
        });
      },
    };
  }
);

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

describe('SlotMachineInputLock', () => {
  beforeEach(() => {
    mockLatestSlotMachineReelsProps = null;
    jest.useFakeTimers();
  });

  afterEach(() => {
    act(() => {
      jest.runOnlyPendingTimers();
    });
    jest.useRealTimers();
  });

  it('ignores concurrent inputs while the main lever/spin animation is active', () => {
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
