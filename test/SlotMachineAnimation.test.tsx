import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { createElement, useState } from 'react';
import { SlotMachineButtons } from '../src/presentation/games/SlotMachineButtons';
import {
  SLOT_COUNTER_COUNT,
  SlotMachineCounters,
} from '../src/presentation/games/SlotMachineCounters';
import { SlotMachineLever } from '../src/presentation/games/SlotMachineLever';

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

const countCounterSprites = (
  container: HTMLElement,
  spriteSource: string
) =>
  Array.from(container.querySelectorAll('img')).filter(
    (image) => image.getAttribute('src') === spriteSource
  ).length;

const countActiveCounters = (container: HTMLElement) =>
  countCounterSprites(container, ACTIVE_COUNTER_SPRITE);

const countInactiveCounters = (container: HTMLElement) =>
  countCounterSprites(container, INACTIVE_COUNTER_SPRITE);

const SlotMachineAnimationHarness = () => {
  const [redButtonPressCount, setRedButtonPressCount] = useState(0);

  const handleRedButtonPress = () => {
    setRedButtonPressCount((currentCount) =>
      Math.min(currentCount + 1, SLOT_COUNTER_COUNT)
    );
  };

  const handleLeverPull = () => {
    setRedButtonPressCount(0);
  };

  const counterStates = Array.from(
    { length: SLOT_COUNTER_COUNT },
    (_, index) => index >= SLOT_COUNTER_COUNT - redButtonPressCount
  );

  return createElement(
    'div',
    null,
    createElement(SlotMachineButtons, {
      machineSize: MACHINE_SIZE,
      onRedButtonPress: handleRedButtonPress,
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

  it('incrementa os LEDs ao clicar em um botao vermelho', () => {
    const { container } = render(createElement(SlotMachineAnimationHarness));
    const [firstRedButton] = getRedButtons();

    fireEvent.pointerDown(firstRedButton);
    expect(countActiveCounters(container)).toBe(1);

    fireEvent.pointerDown(firstRedButton);
    expect(countActiveCounters(container)).toBe(2);
    expect(countInactiveCounters(container)).toBe(3);
  });

  it('mantem o limite maximo de 5 LEDs ativos mesmo com cliques extras', () => {
    const { container } = render(createElement(SlotMachineAnimationHarness));
    const [firstRedButton] = getRedButtons();

    for (let index = 0; index < 7; index += 1) {
      fireEvent.pointerDown(firstRedButton);
    }

    expect(countActiveCounters(container)).toBe(5);
    expect(countInactiveCounters(container)).toBe(0);
  });

  it('reseta todos os LEDs ao acionar a alavanca', () => {
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

  it('nao altera o estado apos atingir o limite maximo', () => {
    const { container } = render(createElement(SlotMachineAnimationHarness));
    const redButtons = getRedButtons();

    for (let index = 0; index < 5; index += 1) {
      fireEvent.pointerDown(redButtons[index % redButtons.length]);
    }

    expect(countActiveCounters(container)).toBe(5);

    redButtons.forEach((button) => {
      fireEvent.pointerDown(button);
    });

    expect(countActiveCounters(container)).toBe(5);
    expect(countInactiveCounters(container)).toBe(0);
  });
});
