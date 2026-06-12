import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { createElement } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { GambitRoom } from '../src/presentation/pages/GambitRoom';
import type { GambitProps } from '../src/presentation/games/Gambit';
import type { GambitTable } from '../src/presentation/games/GambitGame/gambitTypes';
import { createGambitApiSession } from './GambitTestBuilders';

const mockCashOutActiveGambitSession = jest.fn();
const mockCreateGambitSession = jest.fn();
const mockFetchActiveGambitSession = jest.fn();
const mockFetchGambitTables = jest.fn();

jest.mock('../src/presentation/games/Gambit', () => {
  const React = jest.requireActual('react') as typeof import('react');

  return {
    Gambit: ({ gameplaySource, initialSession, onNewGame }: GambitProps) =>
      React.createElement(
        'div',
        {
          'data-testid': 'gambit-board',
        },
        React.createElement(
          'p',
          null,
          `Gambit board:${String(gameplaySource)}:${String(
            initialSession?.GambitSessionId
          )}`
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
  cashOutActiveGambitSession: (...args: unknown[]) =>
    mockCashOutActiveGambitSession(...args),
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

const createAxiosStatusError = (status: number) =>
  Object.assign(new Error(`Request failed with status code ${status}`), {
    isAxiosError: true,
    response: {
      status,
    },
  });

const renderGambitRoom = () =>
  render(
    createElement(
      MemoryRouter,
      {
        future: {
          v7_relativeSplatPath: true,
          v7_startTransition: true,
        },
      },
      createElement(GambitRoom)
    )
  );

describe('GambitRoom', () => {
  beforeEach(() => {
    window.localStorage.clear();
    mockCashOutActiveGambitSession.mockReset();
    mockCreateGambitSession.mockReset();
    mockFetchActiveGambitSession.mockReset();
    mockFetchGambitTables.mockReset();
  });

  it('shows the login CTA when there is no JWT token', async () => {
    renderGambitRoom();

    expect(
      await screen.findByText('Faça login para jogar Gambit')
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Entrar' })).toBeInTheDocument();
    expect(mockFetchActiveGambitSession).not.toHaveBeenCalled();
    expect(mockFetchGambitTables).not.toHaveBeenCalled();
  });

  it('renders Gambit directly when a backend active session exists', async () => {
    const session = createGambitApiSession({
      GambitSessionId: 'active-session',
    });

    window.localStorage.setItem('token', 'jwt-dev');
    mockFetchActiveGambitSession.mockResolvedValueOnce({
      mode: 'backend',
      session,
      source: 'backend',
    });

    renderGambitRoom();

    expect(await screen.findByTestId('gambit-board')).toHaveTextContent(
      'Gambit board:backend:active-session'
    );
    expect(mockFetchGambitTables).not.toHaveBeenCalled();
  });

  it('shows the start panel when there is a token but no active session', async () => {
    window.localStorage.setItem('token', 'jwt-dev');
    mockFetchActiveGambitSession.mockResolvedValueOnce({
      mode: 'backend',
      session: null,
      source: 'backend',
    });
    mockFetchGambitTables.mockResolvedValueOnce([
      createGambitTable({ Name: 'Mesa Inicial' }),
    ]);

    renderGambitRoom();

    expect(
      await screen.findByText('Iniciar partida Gambit')
    ).toBeInTheDocument();
    expect(screen.getByDisplayValue('5')).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toHaveTextContent('Mesa Inicial');
    expect(screen.queryByTestId('gambit-board')).not.toBeInTheDocument();
  });

  it('creates a backend session and renders Gambit after the start click', async () => {
    const session = createGambitApiSession({
      GambitSessionId: 'created-session',
    });

    window.localStorage.setItem('token', 'jwt-dev');
    mockFetchActiveGambitSession
      .mockResolvedValueOnce({
        mode: 'backend',
        session: null,
        source: 'backend',
      })
      .mockResolvedValueOnce({
        mode: 'backend',
        session: null,
        source: 'backend',
      })
      .mockResolvedValueOnce({
        mode: 'backend',
        session,
        source: 'backend',
      });
    mockFetchGambitTables.mockResolvedValueOnce([
      createGambitTable({ GambitTableId: 7, Name: 'Mesa Sete' }),
    ]);
    mockCreateGambitSession.mockResolvedValueOnce(session);

    renderGambitRoom();

    fireEvent.click(
      await screen.findByRole('button', {
        name: 'Iniciar',
      })
    );

    await waitFor(() => {
      expect(mockCreateGambitSession).toHaveBeenCalledWith({
        CardsPurchased: 5,
        GambitTableId: 7,
      });
    });
    expect(await screen.findByTestId('gambit-board')).toHaveTextContent(
      'Gambit board:backend:created-session'
    );
  });

  it('cashs out a finished active session before creating a new one from the start panel', async () => {
    const finishedSession = createGambitApiSession({
      GambitSessionId: 'finished-session',
      Status: 'Finished',
    });
    const nextSession = createGambitApiSession({
      GambitSessionId: 'next-session',
    });

    window.localStorage.setItem('token', 'jwt-dev');
    mockFetchActiveGambitSession
      .mockResolvedValueOnce({
        mode: 'backend',
        session: finishedSession,
        source: 'backend',
      })
      .mockResolvedValueOnce({
        mode: 'backend',
        session: finishedSession,
        source: 'backend',
      })
      .mockResolvedValueOnce({
        mode: 'backend',
        session: nextSession,
        source: 'backend',
      });
    mockFetchGambitTables.mockResolvedValueOnce([
      createGambitTable({ GambitTableId: 7, Name: 'Mesa Sete' }),
    ]);
    mockCashOutActiveGambitSession.mockResolvedValueOnce({
      message: 'ok',
    });
    mockCreateGambitSession.mockResolvedValueOnce(nextSession);

    renderGambitRoom();

    fireEvent.click(
      await screen.findByRole('button', {
        name: 'Nova partida',
      })
    );
    fireEvent.click(await screen.findByRole('button', { name: 'Iniciar' }));

    await waitFor(() => {
      expect(mockCashOutActiveGambitSession).toHaveBeenCalledTimes(1);
    });
    expect(mockCreateGambitSession).toHaveBeenCalledWith({
      CardsPurchased: 5,
      GambitTableId: 7,
    });
    expect(await screen.findByTestId('gambit-board')).toHaveTextContent(
      'Gambit board:backend:next-session'
    );
  });

  it('recovers a 409 by cashing out a finished active session and retrying creation once', async () => {
    const finishedSession = createGambitApiSession({
      GambitSessionId: 'finished-session',
      Status: 'Finished',
    });
    const nextSession = createGambitApiSession({
      GambitSessionId: 'retry-session',
    });

    window.localStorage.setItem('token', 'jwt-dev');
    mockFetchActiveGambitSession
      .mockResolvedValueOnce({
        mode: 'backend',
        session: null,
        source: 'backend',
      })
      .mockResolvedValueOnce({
        mode: 'backend',
        session: null,
        source: 'backend',
      })
      .mockResolvedValueOnce({
        mode: 'backend',
        session: finishedSession,
        source: 'backend',
      })
      .mockResolvedValueOnce({
        mode: 'backend',
        session: nextSession,
        source: 'backend',
      });
    mockFetchGambitTables.mockResolvedValueOnce([
      createGambitTable({ GambitTableId: 7, Name: 'Mesa Sete' }),
    ]);
    mockCreateGambitSession
      .mockRejectedValueOnce(createAxiosStatusError(409))
      .mockResolvedValueOnce(nextSession);
    mockCashOutActiveGambitSession.mockResolvedValueOnce({
      message: 'ok',
    });

    renderGambitRoom();

    fireEvent.click(await screen.findByRole('button', { name: 'Iniciar' }));

    await waitFor(() => {
      expect(mockCashOutActiveGambitSession).toHaveBeenCalledTimes(1);
    });
    expect(mockCreateGambitSession).toHaveBeenCalledTimes(2);
    expect(await screen.findByTestId('gambit-board')).toHaveTextContent(
      'Gambit board:backend:retry-session'
    );
  });

  it('recovers a 409 by loading an active in-progress session instead of creating another', async () => {
    const activeSession = createGambitApiSession({
      GambitSessionId: 'still-open-session',
      Status: 'InProgress',
    });

    window.localStorage.setItem('token', 'jwt-dev');
    mockFetchActiveGambitSession
      .mockResolvedValueOnce({
        mode: 'backend',
        session: null,
        source: 'backend',
      })
      .mockResolvedValueOnce({
        mode: 'backend',
        session: null,
        source: 'backend',
      })
      .mockResolvedValueOnce({
        mode: 'backend',
        session: activeSession,
        source: 'backend',
      });
    mockFetchGambitTables.mockResolvedValueOnce([
      createGambitTable({ GambitTableId: 7, Name: 'Mesa Sete' }),
    ]);
    mockCreateGambitSession.mockRejectedValueOnce(createAxiosStatusError(409));

    renderGambitRoom();

    fireEvent.click(await screen.findByRole('button', { name: 'Iniciar' }));

    expect(await screen.findByTestId('gambit-board')).toHaveTextContent(
      'Gambit board:backend:still-open-session'
    );
    expect(mockCashOutActiveGambitSession).not.toHaveBeenCalled();
    expect(mockCreateGambitSession).toHaveBeenCalledTimes(1);
  });

  it('treats an already cashed-out active session as ready for the real start panel', async () => {
    const session = createGambitApiSession({
      GambitSessionId: 'finished-session',
      Status: 'CashedOut',
    });

    window.localStorage.setItem('token', 'jwt-dev');
    mockFetchActiveGambitSession.mockResolvedValueOnce({
      mode: 'backend',
      session,
      source: 'backend',
    });
    mockFetchGambitTables.mockResolvedValueOnce([
      createGambitTable({ GambitTableId: 3, Name: 'Mesa Nova' }),
    ]);

    renderGambitRoom();

    expect(
      await screen.findByText('Iniciar partida Gambit')
    ).toBeInTheDocument();
    expect(mockFetchGambitTables).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('combobox')).toHaveTextContent('Mesa Nova');
  });
});
