import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from '@jest/globals';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { createElement, useState } from 'react';
import { SlotMachineButtons } from '../src/presentation/games/SlotMachineGame/SlotMachineButtons';
import {
  SlotMachineCounters,
} from '../src/presentation/games/SlotMachineGame/SlotMachineCounters';
import { SlotMachineLever } from '../src/presentation/games/SlotMachineGame/SlotMachineLever';
import { MAX_REROLLS } from '../src/presentation/games/SlotMachineGame/slotMachineGameConfig';

const ACTIVE_COUNTER_SPRITE = '/SlotMachine/SpriteCounterOn.png';
const INACTIVE_COUNTER_SPRITE = '/SlotMachine/SpriteCounterOff.png';
const MACHINE_SIZE = {
  height: 4096,
  width: 4096,
};

const getRedButtons = () =>
  screen.getAllByRole('button', { name: /Botao \d+ da maquina/i });

const getLeverButton = () =>
  screen.getByRole('button', { name: /Alavanca da maquina/i });

const countCounterSprites = (container: HTMLElement, spriteSource: string) =>
  Array.from(container.querySelectorAll('img')).filter(
    (image) => image.getAttribute('src') === spriteSource
  ).length;

const countActiveCounters = (container: HTMLElement) =>
  countCounterSprites(container, ACTIVE_COUNTER_SPRITE);

const countInactiveCounters = (container: HTMLElement) =>
  countCounterSprites(container, INACTIVE_COUNTER_SPRITE);

const SlotMachineAnimationHarness = () => {
  const [redButtonPressCount, setRedButtonPressCount] = useState(0);

  const handleRerollReel = () => {
    setRedButtonPressCount((currentCount) =>
      Math.min(currentCount + 1, MAX_REROLLS)
    );
  };

  const handleLeverPull = () => {
    setRedButtonPressCount(0);
  };

  const counterStates = Array.from(
    { length: MAX_REROLLS },
    (_, index) => index >= MAX_REROLLS - redButtonPressCount
  );

  return createElement(
    'div',
    null,
    createElement(SlotMachineButtons, {
      canReroll: true,
      machineSize: MACHINE_SIZE,
      onRerollReel: handleRerollReel,
    }),
    createElement(SlotMachineCounters, {
      machineSize: MACHINE_SIZE,
      states: counterStates,
    }),
    createElement(SlotMachineLever, {
      machineSize: MACHINE_SIZE,
      onPull: handleLeverPull,
    })
  );
};

describe('SlotMachineAnimation', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    act(() => {
      jest.runOnlyPendingTimers();
    });
    jest.useRealTimers();
  });

  it('increments the LEDs when clicking a red button', () => {
    const { container } = render(createElement(SlotMachineAnimationHarness));
    const [firstRedButton] = getRedButtons();

    fireEvent.pointerDown(firstRedButton);
    expect(countActiveCounters(container)).toBe(1);

    fireEvent.pointerDown(firstRedButton);
    expect(countActiveCounters(container)).toBe(2);
    expect(countInactiveCounters(container)).toBe(3);
  });

  it('maintains the maximum limit of 5 active LEDs even with extra clicks', () => {
    const { container } = render(createElement(SlotMachineAnimationHarness));
    const [firstRedButton] = getRedButtons();

    for (let index = 0; index < 7; index += 1) {
      fireEvent.pointerDown(firstRedButton);
    }

    expect(countActiveCounters(container)).toBe(5);
    expect(countInactiveCounters(container)).toBe(0);
  });

  it('resets all LEDs when pulling the lever', () => {
    const { container } = render(createElement(SlotMachineAnimationHarness));
    const [firstRedButton] = getRedButtons();
    const leverButton = getLeverButton();

    for (let index = 0; index < 5; index += 1) {
      fireEvent.pointerDown(firstRedButton);
    }

    expect(countActiveCounters(container)).toBe(5);

    fireEvent.pointerDown(leverButton);

    expect(countActiveCounters(container)).toBe(0);
    expect(countInactiveCounters(container)).toBe(5);
  });

  it('blocks new lever activations during animation and releases at the end of the cycle', () => {
    render(createElement(SlotMachineAnimationHarness));
    const leverButton = getLeverButton();
    const leverImage = leverButton.querySelector('img');

    expect(leverButton.hasAttribute('disabled')).toBe(false);
    expect(leverButton.getAttribute('aria-busy')).toBe('false');
    expect(leverImage).not.toBeNull();
    expect(leverImage?.getAttribute('src')).toBe(
      '/SlotMachine/SpriteLever00.png'
    );

    fireEvent.pointerDown(leverButton);

    expect(leverButton.hasAttribute('disabled')).toBe(true);
    expect(leverButton.getAttribute('aria-busy')).toBe('true');

    act(() => {
      jest.advanceTimersByTime(28);
    });

    expect(leverImage?.getAttribute('src')).toBe(
      '/SlotMachine/SpriteLever01.png'
    );

    fireEvent.pointerDown(leverButton);
    fireEvent.pointerDown(leverButton);
    fireEvent.pointerDown(leverButton);

    expect(leverButton.hasAttribute('disabled')).toBe(true);
    expect(leverButton.getAttribute('aria-busy')).toBe('true');
    expect(leverImage?.getAttribute('src')).toBe(
      '/SlotMachine/SpriteLever01.png'
    );

    act(() => {
      jest.advanceTimersByTime(951);
    });

    expect(leverButton.hasAttribute('disabled')).toBe(true);
    expect(leverButton.getAttribute('aria-busy')).toBe('true');

    act(() => {
      jest.advanceTimersByTime(1);
    });

    expect(leverButton.hasAttribute('disabled')).toBe(false);
    expect(leverButton.getAttribute('aria-busy')).toBe('false');
    expect(leverImage?.getAttribute('src')).toBe(
      '/SlotMachine/SpriteLever00.png'
    );
  });
});
