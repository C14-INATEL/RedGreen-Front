import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { createElement } from 'react';
import { SlotMachineButtons } from '../src/presentation/games/SlotMachineButtons';
import { SlotMachinePixi } from '../src/presentation/games/SlotMachineGame/SlotMachinePixi';
import type {
  SlotMachineApiMachine,
  SlotMachineApiSession,
} from '../src/presentation/games/SlotMachineGame/slotMachineApi';
import {
  createSlotMachine,
  createSlotMachineSession,
} from './SlotMachineTestBuilders';

const MACHINE_SIZE = {
  height: 4096,
  width: 4096,
};

const mockApiGet = jest.fn();
const mockApiPost = jest.fn();
const mockMutateUserChips = jest.fn();

jest.mock('@infrastructure/http/client', () => ({
  apiClient: {
    get: (...args: unknown[]) => mockApiGet(...args),
    post: (...args: unknown[]) => mockApiPost(...args),
  },
}));

jest.mock('@application/hooks/useUserChips', () => ({
  useUserChips: () => ({
    chips: undefined,
    error: undefined,
    isLoading: false,
    mutate: (...args: unknown[]) => mockMutateUserChips(...args),
  }),
}));

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
  restoreRequestId?: number;
  spinRequestId?: number;
};

let mockLatestSlotMachineReelsProps: MockSlotMachineReelsProps | null = null;

jest.mock('../src/presentation/games/SlotMachineGame/SlotMachineReels', () => {
  const React = jest.requireActual('react') as typeof import('react');

  return {
    SlotMachineReels: (props: {
      idleRequestId?: number;
      onMachineModeChange?: MockSlotMachineReelsProps['onMachineModeChange'];
      onRealSpinStateChange?: MockSlotMachineReelsProps['onRealSpinStateChange'];
      rerollRequest?: MockSlotMachineReelsProps['rerollRequest'];
      restoreRequest?: { id: number } | null;
      spinRequest?: { id: number } | null;
    }) => {
      mockLatestSlotMachineReelsProps = {
        idleRequestId: props.idleRequestId,
        onMachineModeChange: props.onMachineModeChange,
        onRealSpinStateChange: props.onRealSpinStateChange,
        rerollRequest: props.rerollRequest ?? null,
        restoreRequestId: props.restoreRequest?.id,
        spinRequestId: props.spinRequest?.id,
      };

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

const configureSlotMachineBootstrap = ({
  activeSession = null,
  slotMachines = [createSlotMachine()],
}: {
  activeSession?: SlotMachineApiSession | null;
  slotMachines?: SlotMachineApiMachine[];
} = {}) => {
  mockApiGet.mockImplementation(async (url: string) => {
    if (url === '/sessions/active') {
      return { data: activeSession };
    }

    if (url === '/slot/machine') {
      return { data: slotMachines };
    }

    throw new Error(`Unexpected GET ${url}`);
  });
};

const configureSlotMachinePosts = ({
  createdSession = createSlotMachineSession(),
}: {
  createdSession?: SlotMachineApiSession;
} = {}) => {
  mockApiPost.mockImplementation(async (url: string) => {
    if (url === `/slot-machines/${createdSession.SlotMachineId}/sessions`) {
      return {
        data: {
          currentBalance: 900,
          session: createdSession,
        },
      };
    }

    if (url === '/sessions/active/cash-out') {
      return {
        data: {
          finalBalance: 900,
          message: 'Sessao encerrada',
        },
      };
    }

    if (url.startsWith('/sessions/active/reroll/')) {
      return {
        data: {
          currentBalance: 900,
          session: createdSession,
        },
      };
    }

    throw new Error(`Unexpected POST ${url}`);
  });
};

const renderReadySlotMachine = async () => {
  render(createElement(SlotMachinePixi));

  await waitFor(() => {
    expect(getLeverButton()).not.toBeDisabled();
  });
};

describe('reroll buttons', () => {
  beforeEach(() => {
    mockLatestSlotMachineReelsProps = null;
    mockApiGet.mockReset();
    mockApiPost.mockReset();
    mockMutateUserChips.mockReset();
    configureSlotMachineBootstrap();
    configureSlotMachinePosts();
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
    mockLatestSlotMachineReelsProps = null;
    mockApiGet.mockReset();
    mockApiPost.mockReset();
    mockMutateUserChips.mockReset();
    configureSlotMachineBootstrap();
    configureSlotMachinePosts();
  });

  it('ignores concurrent inputs while the main lever animation is active', async () => {
    await renderReadySlotMachine();

    const leverButton = getLeverButton();
    const blueButton = getBlueButton();
    const [firstRedButton] = getRedButtons();

    fireEvent.pointerDown(leverButton);

    await waitFor(() => {
      expect(getReelsProps().spinRequestId).toBe(1);
    });

    enterMainSpinState();

    expect(leverButton).toBeDisabled();
    expect(blueButton).toBeDisabled();
    expect(firstRedButton).toBeDisabled();
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
    expect(mockApiPost).toHaveBeenCalledTimes(1);
  });
});

describe('reset flow', () => {
  beforeEach(() => {
    mockLatestSlotMachineReelsProps = null;
    mockApiGet.mockReset();
    mockApiPost.mockReset();
    mockMutateUserChips.mockReset();
    configureSlotMachineBootstrap();
    configureSlotMachinePosts();
  });

  it('keeps the machine in result hold until the blue button explicitly requests idle', async () => {
    await renderReadySlotMachine();

    const leverButton = getLeverButton();

    fireEvent.pointerDown(leverButton);

    await waitFor(() => {
      expect(getReelsProps().spinRequestId).toBe(1);
    });

    transitionToResultHold();

    const blueButton = getBlueButton();
    const [firstRedButton] = getRedButtons();

    expect(getReelsProps().spinRequestId).toBe(1);
    expect(getReelsProps().idleRequestId).toBe(0);
    expect(leverButton).toBeDisabled();
    expect(blueButton).not.toBeDisabled();
    expect(firstRedButton).not.toBeDisabled();

    fireEvent.pointerDown(blueButton);

    await waitFor(() => {
      expect(getReelsProps().idleRequestId).toBe(1);
    });

    expect(leverButton).toBeDisabled();

    act(() => {
      getReelsProps().onMachineModeChange?.('idle');
    });

    await waitFor(
      () => {
        expect(getLeverButton()).not.toBeDisabled();
      },
      {
        timeout: 2_000,
      }
    );

    expect(getBlueButton()).toBeDisabled();
  });

  it('shows the backend empty-state message when no slot machine is available', async () => {
    configureSlotMachineBootstrap({
      activeSession: null,
      slotMachines: [],
    });

    render(createElement(SlotMachinePixi));

    expect(
      await screen.findByText('Nenhuma slot machine disponível no backend.')
    ).toBeInTheDocument();
    expect(getLeverButton()).toBeDisabled();
    expect(getBlueButton()).toBeDisabled();

    getRedButtons().forEach((button) => {
      expect(button).toBeDisabled();
    });

    expect(getReelsProps().spinRequestId).toBeUndefined();
    expect(getReelsProps().restoreRequestId).toBeUndefined();
  });
});
