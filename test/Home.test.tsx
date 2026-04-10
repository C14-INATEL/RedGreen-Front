import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import Home from '../src/presentation/pages/Home';

type HudProps = {
  IsLoggedIn: boolean;
  PlayerName: string;
  Chips: number;
  OnLogin: () => void;
  OnLogout: () => void;
};

type RankingPanelProps = {
  IsOpen: boolean;
  OnClose: () => void;
};

type DailyBonusPanelProps = {
  IsOpen: boolean;
  IsLoggedIn: boolean;
  OnClose: () => void;
  MutateChips?: () => void;
};

const mockUseUserProfile = jest.fn();
const mockUseUserChips = jest.fn();
const mockHud = jest.fn();
const mockRankingPanel = jest.fn();
const mockDailyBonusPanel = jest.fn();
const mockMutateChips = jest.fn();

jest.mock('@application/hooks/useUserProfile', () => ({
  useUserProfile: (enabled: boolean) => mockUseUserProfile(enabled),
}));

jest.mock('@application/hooks/useUserChips', () => ({
  useUserChips: (enabled: boolean) => mockUseUserChips(enabled),
}));

jest.mock('@ui/HUD', () => ({
  __esModule: true,
  default: (props: HudProps) => {
    mockHud(props);

    return (
      <div>
        <span data-testid="hud-player-name">{props.PlayerName}</span>
        <span data-testid="hud-chips">{props.Chips}</span>
        <button onClick={props.OnLogin}>Entrar</button>
        <button onClick={props.OnLogout}>Sair</button>
      </div>
    );
  },
}));

jest.mock('@ui/Table', () => ({
  __esModule: true,
  default: () => <div data-testid="table" />,
}));

jest.mock('@ui/RankingPanel', () => ({
  __esModule: true,
  default: (props: RankingPanelProps) => {
    mockRankingPanel(props);

    return (
      <div data-testid="ranking-panel">{props.IsOpen ? 'aberto' : 'fechado'}</div>
    );
  },
}));

jest.mock('@ui/DailyBonusPanel', () => ({
  __esModule: true,
  default: (props: DailyBonusPanelProps) => {
    mockDailyBonusPanel(props);

    return (
      <div data-testid="daily-bonus-panel">
        {props.IsOpen ? 'aberto' : 'fechado'}
      </div>
    );
  },
}));

const renderHome = () =>
  render(
    <MemoryRouter
      initialEntries={['/']}
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/Login" element={<div>Tela de login</div>} />
      </Routes>
    </MemoryRouter>
  );

describe('Home', () => {
  beforeEach(() => {
    localStorage.clear();

    mockUseUserProfile.mockReset();
    mockUseUserChips.mockReset();
    mockHud.mockClear();
    mockRankingPanel.mockClear();
    mockDailyBonusPanel.mockClear();
    mockMutateChips.mockReset();

    mockUseUserProfile.mockReturnValue({
      nickname: undefined,
      isLoading: false,
    });

    mockUseUserChips.mockReturnValue({
      chips: undefined,
      mutate: mockMutateChips,
    });
  });

  it('redirects the guest user to the login page after clicking the login action', () => {
    renderHome();

    fireEvent.click(screen.getByRole('button', { name: 'Entrar' }));

    expect(screen.getByText('Tela de login')).not.toBeNull();
    expect(mockUseUserProfile).toHaveBeenCalledWith(false);
    expect(mockUseUserChips).toHaveBeenCalledWith(false);
  });

  it('uses the user data stored in localStorage and opens the daily bonus when a token exists', () => {
    localStorage.setItem('token', 'token-fake-123');
    localStorage.setItem(
      'user',
      JSON.stringify({
        Nickname: 'JogadorLocal',
        ChipBalance: 24500,
      })
    );

    renderHome();

    expect(screen.getByText('JogadorLocal')).not.toBeNull();
    expect(screen.getByText('24500')).not.toBeNull();
    expect(screen.getByTestId('daily-bonus-panel').textContent).toBe('aberto');
    expect(mockUseUserProfile).toHaveBeenCalledWith(true);
    expect(mockUseUserChips).toHaveBeenCalledWith(true);
  });

  it('prioritizes the values returned by the hooks over stale data from localStorage', () => {
    localStorage.setItem('token', 'token-fake-123');
    localStorage.setItem(
      'user',
      JSON.stringify({
        Nickname: 'JogadorAntigo',
        ChipBalance: 1200,
      })
    );

    mockUseUserProfile.mockReturnValue({
      nickname: 'JogadorAtual',
      isLoading: false,
    });

    mockUseUserChips.mockReturnValue({
      chips: 32000,
      mutate: mockMutateChips,
    });

    renderHome();

    expect(screen.getByText('JogadorAtual')).not.toBeNull();
    expect(screen.getByText('32000')).not.toBeNull();
    expect(screen.queryByText('JogadorAntigo')).toBeNull();
    expect(screen.queryByText('1200')).toBeNull();
  });
});
