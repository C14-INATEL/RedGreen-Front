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

const MockUseUserProfile = jest.fn();
const MockUseUserChips = jest.fn();
const MockHud = jest.fn();
const MockRankingPanel = jest.fn();
const MockDailyBonusPanel = jest.fn();
const MockMutateChips = jest.fn();

jest.mock('@application/hooks/useUserProfile', () => ({
  useUserProfile: (enabled: boolean) => MockUseUserProfile(enabled),
}));

jest.mock('@application/hooks/useUserChips', () => ({
  useUserChips: (enabled: boolean) => MockUseUserChips(enabled),
}));

jest.mock('@ui/HUD', () => ({
  __esModule: true,
  default: (props: HudProps) => {
    MockHud(props);

    return (
      <div>
        <span data-testid="hud-player-name">{props.PlayerName}</span>
        <span data-testid="hud-chips">{props.Chips}</span>
        <button onClick={props.OnLogin}>Login</button>
        <button onClick={props.OnLogout}>Logout</button>
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
    MockRankingPanel(props);

    return (
      <div data-testid="ranking-panel">{props.IsOpen ? 'open' : 'closed'}</div>
    );
  },
}));

jest.mock('@ui/DailyBonusPanel', () => ({
  __esModule: true,
  default: (props: DailyBonusPanelProps) => {
    MockDailyBonusPanel(props);

    return (
      <div data-testid="daily-bonus-panel">
        {props.IsOpen ? 'open' : 'closed'}
      </div>
    );
  },
}));

const RenderHome = () =>
  render(
    <MemoryRouter
      initialEntries={['/']}
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/Login" element={<div>Login page</div>} />
      </Routes>
    </MemoryRouter>
  );

describe('Home', () => {
  beforeEach(() => {
    localStorage.clear();

    MockUseUserProfile.mockReset();
    MockUseUserChips.mockReset();
    MockHud.mockClear();
    MockRankingPanel.mockClear();
    MockDailyBonusPanel.mockClear();
    MockMutateChips.mockReset();

    MockUseUserProfile.mockReturnValue({
      nickname: undefined,
      isLoading: false,
    });

    MockUseUserChips.mockReturnValue({
      chips: undefined,
      mutate: MockMutateChips,
    });
  });

  it('redirects the guest user to the login page after clicking the login action', () => {
    RenderHome();

    fireEvent.click(screen.getByRole('button', { name: 'Login' }));

    expect(screen.getByText('Login page')).not.toBeNull();
    expect(MockUseUserProfile).toHaveBeenCalledWith(false);
    expect(MockUseUserChips).toHaveBeenCalledWith(false);
  });

  it('uses the user data stored in localStorage and opens the daily bonus when a token exists', () => {
    localStorage.setItem('token', 'token-fake-123');
    localStorage.setItem(
      'user',
      JSON.stringify({
        Nickname: 'LocalPlayer',
        ChipBalance: 24500,
      })
    );

    RenderHome();

    expect(screen.getByText('LocalPlayer')).not.toBeNull();
    expect(screen.getByText('24500')).not.toBeNull();
    expect(screen.getByTestId('daily-bonus-panel').textContent).toBe('open');
    expect(MockUseUserProfile).toHaveBeenCalledWith(true);
    expect(MockUseUserChips).toHaveBeenCalledWith(true);
  });

  it('prioritizes the values returned by the hooks over stale data from localStorage', () => {
    localStorage.setItem('token', 'token-fake-123');
    localStorage.setItem(
      'user',
      JSON.stringify({
        Nickname: 'OldPlayer',
        ChipBalance: 1200,
      })
    );

    MockUseUserProfile.mockReturnValue({
      nickname: 'CurrentPlayer',
      isLoading: false,
    });

    MockUseUserChips.mockReturnValue({
      chips: 32000,
      mutate: MockMutateChips,
    });

    RenderHome();

    expect(screen.getByText('CurrentPlayer')).not.toBeNull();
    expect(screen.getByText('32000')).not.toBeNull();
    expect(screen.queryByText('OldPlayer')).toBeNull();
    expect(screen.queryByText('1200')).toBeNull();
  });

  it('clears localStorage and disables hooks when logout is clicked', () => {
    localStorage.setItem('token', 'token-fake-123');
    localStorage.setItem(
      'user',
      JSON.stringify({
        Nickname: 'LoggedInPlayer',
        ChipBalance: 5000,
      })
    );

    RenderHome();

    fireEvent.click(screen.getByRole('button', { name: 'Logout' }));

    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();
    expect(MockUseUserProfile).toHaveBeenLastCalledWith(false);
    expect(MockUseUserChips).toHaveBeenLastCalledWith(false);
  });
});
