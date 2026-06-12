import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { createElement, type ReactNode } from 'react';
import { GambitRoom } from '../src/presentation/pages/GambitRoom';
import type { GambitProps } from '../src/presentation/games/Gambit';
import type { GambitTable } from '../src/presentation/games/GambitGame/gambitTypes';
import { createGambitApiSession } from './GambitTestBuilders';

type MotionProps = {
  children?: ReactNode;
};

const mockCreateGambitSession = jest.fn();
const mockFetchActiveGambitSession = jest.fn();
const mockFetchGambitTables = jest.fn();
const mockNavigate = jest.fn();
const mockUseLocation = jest.fn();

jest.mock('../src/infrastructure/http/client', () => ({
  apiClient: {
    get: jest.fn(),
    post: jest.fn(),
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() },
    },
  },
}));

jest.mock('framer-motion', () => {
  const React = jest.requireActual('react') as typeof import('react');

  return {
    AnimatePresence: ({ children }: MotionProps) =>
      React.createElement(React.Fragment, null, children),
    motion: {
      div: ({ children, ...props }: MotionProps) =>
        React.createElement('div', props, children),
    },
  };
});

jest.mock('react-router-dom', () => {
  const actual =
    jest.requireActual<typeof import('react-router-dom')>('react-router-dom');

  return {
    ...actual,
    useLocation: () => mockUseLocation(),
    useNavigate: () => mockNavigate,
  };
});

jest.mock('../src/presentation/games/Gambit', () => {
  const React = jest.requireActual('react') as typeof import('react');

  return {
    Gambit: ({ initialSession, onNewGame }: GambitProps) =>
      React.createElement(
        'div',
        {
          'data-testid': 'gambit-game',
        },
        React.createElement(
          'p',
          null,
          `Gambit board:${String(initialSession?.GambitSessionId)}`
        ),
        React.createElement(
          'button',
          {
            onClick: onNewGame,
            type: 'button',
          },
          'Nova partida'
        )
      ),
  };
});

jest.mock('../src/presentation/games/GambitGame/gambitGameplayClient', () => ({
  createGambitSession: (...args: unknown[]) => mockCreateGambitSession(...args),
  fetchActiveGambitSession: (...args: unknown[]) =>
    mockFetchActiveGambitSession(...args),
  fetchGambitTables: (...args: unknown[]) => mockFetchGambitTables(...args),
}));

jest.mock('../src/presentation/ui/GambitBetPanel', () => {
  const React = jest.requireActual('react') as typeof import('react');
  return {
    GambitBetPanel: (props: {
      MinimumCardsPurchased: number;
      MaxCardsPurchased: number;
      CardPrice: number;
      TableMultiplier: number;
      OnConfirm: (cards: number) => void;
    }) =>
      React.createElement(
        'div',
        {
          'data-testid': 'gambit-bet-panel',
        },
        React.createElement('p', null, `${props.MinimumCardsPurchased} cartas`),
        React.createElement(
          'p',
          null,
          String(props.MaxCardsPurchased * props.CardPrice)
        ),
        React.createElement('p', null, `${props.TableMultiplier}×`),
        React.createElement(
          'button',
          { onClick: () => props.OnConfirm(props.MinimumCardsPurchased + 1) },
          '+'
        ),
        React.createElement(
          'button',
          { onClick: () => props.OnConfirm(props.MinimumCardsPurchased) },
          'Confirmar'
        )
      ),
  };
});

jest.mock('@application/hooks/useUserProfile', () => ({
  useUserProfile: () => ({
    nickname: 'TestPlayer',
    isLoading: false,
  }),
}));

jest.mock('@application/hooks/useUserChips', () => ({
  useUserChips: () => ({
    chips: 1000,
    mutate: jest.fn(),
  }),
}));

jest.mock('@ui/RankingPanel', () => {
  const React = jest.requireActual('react') as typeof import('react');
  return {
    __esModule: true,
    default: () =>
      React.createElement('div', { 'data-testid': 'ranking-panel' }),
  };
});

const createGambitTable = (
  overrides: Partial<GambitTable> = {}
): GambitTable => ({
  Active: true,
  CardPrice: 10,
  Description: null,
  GambitTableId: 1,
  MaxCardsPurchased: 25,
  MinimumCardsPurchased: 1,
  MinimumChipsRequired: null,
  Name: 'Mesa Gambit',
  TableMultiplier: 1,
  ...overrides,
});

const renderGambitRoom = () => render(createElement(GambitRoom));

describe('GambitRoom', () => {
  beforeEach(() => {
    mockCreateGambitSession.mockReset();
    mockFetchActiveGambitSession.mockReset();
    mockFetchGambitTables.mockReset();
    mockNavigate.mockReset();
    mockUseLocation.mockReset();

    mockFetchActiveGambitSession.mockResolvedValue(null);
    mockFetchGambitTables.mockResolvedValue([createGambitTable()]);
    mockUseLocation.mockReturnValue({
      state: null,
    });
  });

  it('renders Gambit and bet panel regardless of active session', async () => {
    renderGambitRoom();

    expect(await screen.findByTestId('gambit-game')).toHaveTextContent(
      'Gambit board:undefined'
    );
    expect(screen.getByTestId('gambit-bet-panel')).toBeInTheDocument();
  });

  it('renders Gambit with active session', async () => {
    mockFetchActiveGambitSession.mockResolvedValueOnce(
      createGambitApiSession({
        GambitSessionId: 'active-session',
      })
    );

    renderGambitRoom();

    await waitFor(() => {
      expect(screen.getByTestId('gambit-game')).toHaveTextContent(
        'Gambit board:active-session'
      );
    });
  });

  it('fetches tables when there is no active session', async () => {
    renderGambitRoom();

    await waitFor(() => {
      expect(mockFetchGambitTables).toHaveBeenCalledTimes(1);
    });
  });

  it('uses route state values in the Gambit bet panel', async () => {
    mockUseLocation.mockReturnValue({
      state: {
        CardPrice: 7,
        GambitTableId: 12,
        MaxCardsPurchased: 6,
        MinimumCardsPurchased: 3,
        TableMultiplier: 2.5,
      },
    });

    renderGambitRoom();

    await waitFor(() => {
      expect(screen.getByText('3 cartas')).toBeInTheDocument();
      expect(screen.getByText('42')).toBeInTheDocument();
      expect(screen.getByText('2.5×')).toBeInTheDocument();
    });
  });

  it('creates a Gambit session from the side bet panel and renders the board', async () => {
    const session = createGambitApiSession({
      GambitSessionId: 'created-session',
    });

    mockUseLocation.mockReturnValue({
      state: {
        CardPrice: 7,
        GambitTableId: 12,
        MaxCardsPurchased: 6,
        MinimumCardsPurchased: 3,
        TableMultiplier: 2.5,
      },
    });
    mockFetchActiveGambitSession.mockResolvedValueOnce(null);
    mockCreateGambitSession.mockResolvedValueOnce(session);

    renderGambitRoom();

    fireEvent.click(screen.getByRole('button', { name: '+' }));
    fireEvent.click(screen.getByRole('button', { name: 'Confirmar' }));

    await waitFor(() => {
      expect(mockCreateGambitSession).toHaveBeenCalledWith({
        CardsPurchased: 4,
        GambitTableId: 12,
      });
    });
    expect(await screen.findByTestId('gambit-game')).toHaveTextContent(
      'Gambit board:created-session'
    );
  });

  it('keeps the original back button behavior', async () => {
    renderGambitRoom();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: '←' })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: '←' }));

    expect(mockNavigate).toHaveBeenCalledWith(-1);
  });

  it('does not render the removed session start UI', () => {
    renderGambitRoom();

    expect(
      screen.queryByText('Iniciar partida Gambit')
    ).not.toBeInTheDocument();
  });
});
