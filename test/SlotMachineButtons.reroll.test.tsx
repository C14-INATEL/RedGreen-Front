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
import { SlotMachineButtons } from '../src/presentation/games/SlotMachineButtons';

const MACHINE_SIZE = {
  height: 4096,
  width: 4096,
};

const getRedButtons = () =>
  screen.getAllByRole('button', { name: /Botao \d+ da maquina/i });

describe('SlotMachineButtons reroll mapping', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    act(() => {
      jest.runOnlyPendingTimers();
    });
    jest.useRealTimers();
  });

  it('dispatches each red button to the correct reel index', () => {
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
