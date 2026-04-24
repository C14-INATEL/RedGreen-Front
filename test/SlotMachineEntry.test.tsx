import { describe, expect, it, jest, beforeEach } from '@jest/globals';
import { fireEvent, render, screen } from '@testing-library/react';
import { createElement, type ReactNode } from 'react';
import { SlotMachine } from '../src/presentation/games/SlotMachine';

type MotionDivProps = {
  children?: ReactNode;
};

type MockSlotMachinePixiProps = {
  animateMachineSprite?: boolean;
};

const mockNavigate = jest.fn();
const mockUseLocation = jest.fn();
const mockSlotMachinePixi = jest.fn();

jest.mock('framer-motion', () => {
  const React = jest.requireActual('react') as typeof import('react');

  return {
    motion: {
      div: ({ children }: MotionDivProps) =>
        React.createElement('div', null, children),
    },
  };
});

jest.mock('react-router-dom', () => ({
  useLocation: () => mockUseLocation(),
  useNavigate: () => mockNavigate,
}));

jest.mock('../src/presentation/games/SlotMachineGame/SlotMachinePixi', () => {
  const React = jest.requireActual('react') as typeof import('react');

  return {
    SlotMachinePixi: (props: MockSlotMachinePixiProps) => {
      mockSlotMachinePixi(props);

      return React.createElement(
        'div',
        {
          'data-testid': 'slot-machine-pixi',
        },
        props.animateMachineSprite ? 'animated' : 'idle'
      );
    },
  };
});

jest.mock('../src/presentation/games/SlotMachineGame/SlotPaytableHUD', () => {
  const React = jest.requireActual('react') as typeof import('react');

  return {
    SlotPaytableHUD: () =>
      React.createElement('div', {
        'data-testid': 'slot-paytable-hud',
      }),
  };
});

describe('SlotMachine entry flow', () => {
  beforeEach(() => {
    mockNavigate.mockReset();
    mockUseLocation.mockReset();
    mockSlotMachinePixi.mockClear();

    mockUseLocation.mockReturnValue({
      hash: '#jackpot',
      pathname: '/slot-machine-room',
      search: '?mode=demo',
      state: {
        fromLobby: true,
      },
    });
  });

  it('zooms into the machine and persists the intro completion flag after the overlay click', () => {
    render(createElement(SlotMachine));

    expect(screen.getByLabelText('Aproximar da Slot Machine')).not.toBeNull();
    expect(screen.getByTestId('slot-machine-pixi').textContent).toBe('idle');
    expect(mockSlotMachinePixi).toHaveBeenLastCalledWith({
      animateMachineSprite: false,
    });

    fireEvent.click(screen.getByLabelText('Aproximar da Slot Machine'));

    expect(mockNavigate).toHaveBeenCalledWith(
      {
        hash: '#jackpot',
        pathname: '/slot-machine-room',
        search: '?mode=demo',
      },
      {
        replace: true,
        state: {
          fromLobby: true,
          slotMachineIntroCompleted: true,
        },
      }
    );
    expect(screen.queryByLabelText('Aproximar da Slot Machine')).toBeNull();
    expect(screen.getByTestId('slot-machine-pixi').textContent).toBe('animated');
    expect(mockSlotMachinePixi).toHaveBeenLastCalledWith({
      animateMachineSprite: true,
    });
  });
});
