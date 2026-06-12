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

  it('renders Gambit when an active session exists', async () => {
    mockFetchActiveGambitSession.mockResolvedValueOnce(
      createGambitApiSession({
        GambitSessionId: 'active-session',
      })
    );

    renderGambitRoom();

    expect(await screen.findByTestId('gambit-game')).toHaveTextContent(
      'Gambit board:active-session'
    );
    expect(mockFetchGambitTables).not.toHaveBeenCalled();
  });

  it('loads tables and keeps the side bet panel when there is no active session', async () => {
    mockFetchGambitTables.mockResolvedValueOnce([
      createGambitTable({
        CardPrice: 7,
        MaxCardsPurchased: 6,
        MinimumCardsPurchased: 3,
        TableMultiplier: 2.5,
      }),
    ]);

    renderGambitRoom();

    await waitFor(() => {
      expect(mockFetchGambitTables).toHaveBeenCalledTimes(1);
    });
    expect(screen.queryByTestId('gambit-game')).not.toBeInTheDocument();
    expect(
      screen.queryByText('Nenhuma sessão ativa do Gambit encontrada.')
    ).not.toBeInTheDocument();
    expect(await screen.findByText('3 cartas')).toBeInTheDocument();
    expect(await screen.findByText('21')).toBeInTheDocument();
    expect(await screen.findByText('7.5×')).toBeInTheDocument();
    expect(mockCreateGambitSession).not.toHaveBeenCalled();
  });

  it('uses route state values in the Gambit bet panel', () => {
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

    expect(screen.getByText('3 cartas')).toBeInTheDocument();
    expect(screen.getByText('21')).toBeInTheDocument();
    expect(screen.getByText('7.5×')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '+' }));

    expect(screen.getByText('4 cartas')).toBeInTheDocument();
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
    mockFetchActiveGambitSession
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(session);
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

  it('keeps the original back button behavior', () => {
    renderGambitRoom();

    fireEvent.click(screen.getByRole('button', { name: '←' }));

    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('does not render the removed session start UI', () => {
    renderGambitRoom();

    expect(
      screen.queryByText('Iniciar partida Gambit')
    ).not.toBeInTheDocument();
  });
});
