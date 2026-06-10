import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from '@jest/globals';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { paths } from '../src/paths';
import Home from '../src/presentation/pages/Home';
import DeleteAccountModal from '../src/presentation/ui/DeleteAccountModal';
import EditProfileModal from '../src/presentation/ui/EditProfileModal';

type ApiPatchMock = (
  url: string,
  payload: Record<string, string>
) => Promise<{ data: Record<string, unknown> }>;

type ApiPostMock = (
  url: string,
  payload?: Record<string, string>
) => Promise<{ data: Record<string, unknown> }>;

type ApiDeleteMock = (url: string) => Promise<unknown>;

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

type DailyLoginHookReturn = {
  DailyState: Record<string, unknown> | null;
  CanClaimToday: boolean;
  IsLoading: boolean;
};

const MockUseUserProfile = jest.fn();
const MockUseUserChips = jest.fn();
const MockUseDailyLogin = jest.fn();
const MockHud = jest.fn();
const MockRankingPanel = jest.fn();
const MockDailyBonusPanel = jest.fn();
const MockMutateChips = jest.fn();
const MockApiPost = jest.fn<ApiPostMock>();
const MockApiPatch = jest.fn<ApiPatchMock>();
const MockApiDelete = jest.fn<ApiDeleteMock>();

jest.mock('@infrastructure/http/client', () => ({
  apiClient: {
    post: (url: string, payload?: Record<string, string>) =>
      MockApiPost(url, payload),
    patch: (url: string, payload: Record<string, string>) =>
      MockApiPatch(url, payload),
    delete: (url: string) => MockApiDelete(url),
  },
}));

jest.mock('@application/hooks/useUserProfile', () => ({
  useUserProfile: (enabled: boolean) => MockUseUserProfile(enabled),
}));

jest.mock('@application/hooks/useUserChips', () => ({
  useUserChips: (enabled: boolean) => MockUseUserChips(enabled),
}));

jest.mock('@application/hooks/useDailyLogin', () => ({
  UseDailyLogin: (enabled: boolean) => MockUseDailyLogin(enabled),
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
      <div data-testid="ranking-panel">
        {props.IsOpen ? 'open' : 'closed'}
        {props.IsOpen && (
          <button type="button" onClick={props.OnClose}>
            Close ranking
          </button>
        )}
      </div>
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
        {props.IsOpen && (
          <button type="button" onClick={props.OnClose}>
            Close daily bonus
          </button>
        )}
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
        <Route path={paths.login} element={<div>Login page</div>} />
      </Routes>
    </MemoryRouter>
  );

describe('Home', () => {
  beforeEach(() => {
    localStorage.clear();

    MockUseUserProfile.mockReset();
    MockUseUserChips.mockReset();
    MockUseDailyLogin.mockReset();
    MockHud.mockClear();
    MockRankingPanel.mockClear();
    MockDailyBonusPanel.mockClear();
    MockMutateChips.mockReset();
    MockApiPost.mockReset();
    MockApiPatch.mockReset();
    MockApiDelete.mockReset();

    MockApiPost.mockResolvedValue({ data: {} });
    MockApiPatch.mockResolvedValue({ data: {} });
    MockApiDelete.mockResolvedValue({});

    MockUseUserProfile.mockReturnValue({
      nickname: undefined,
      isLoading: false,
    });

    MockUseUserChips.mockReturnValue({
      chips: undefined,
      mutate: MockMutateChips,
    });

    MockUseDailyLogin.mockReturnValue({
      DailyState: {
        FirstLoginToday: true,
        DailyStreak: 2,
        Reward: 150,
        ChipBalance: 24500,
      },
      CanClaimToday: true,
      IsLoading: false,
    } satisfies DailyLoginHookReturn);
  });

  afterEach(() => {
    jest.useRealTimers();
    localStorage.clear();
  });

  it('redirects the guest user to the login page after clicking the login action', () => {
    RenderHome();

    fireEvent.click(screen.getByRole('button', { name: 'Login' }));

    expect(screen.getByText('Login page')).not.toBeNull();
    expect(MockUseUserProfile).toHaveBeenCalledWith(false);
    expect(MockUseUserChips).toHaveBeenCalledWith(false);
  });

  it('uses the user data returned by hooks and opens the daily bonus when a token exists', () => {
    localStorage.setItem('token', 'token-fake-123');

    MockUseUserProfile.mockReturnValue({
      nickname: 'ApiPlayer',
      isLoading: false,
    });

    MockUseUserChips.mockReturnValue({
      chips: 24500,
      mutate: MockMutateChips,
    });

    RenderHome();

    expect(screen.getByText('ApiPlayer')).not.toBeNull();
    expect(screen.getByText('24500')).not.toBeNull();
    expect(screen.getByTestId('daily-bonus-panel').textContent).toContain(
      'open'
    );
    expect(MockUseUserProfile).toHaveBeenCalledWith(true);
    expect(MockUseUserChips).toHaveBeenCalledWith(true);
    expect(MockUseDailyLogin).toHaveBeenCalledWith(true);
  });

  it('uses logged-in fallbacks while hook data is not available', () => {
    localStorage.setItem('token', 'token-fake-123');

    MockUseUserProfile.mockReturnValue({
      nickname: undefined,
      isLoading: true,
    });

    MockUseUserChips.mockReturnValue({
      chips: undefined,
      mutate: MockMutateChips,
    });

    RenderHome();

    expect(screen.getByText('Carregando...')).not.toBeNull();
    expect(screen.getByText('0')).not.toBeNull();
  });

  it('clears localStorage and disables hooks when logout is clicked', () => {
    localStorage.setItem('token', 'token-fake-123');

    RenderHome();

    fireEvent.click(screen.getByRole('button', { name: 'Logout' }));

    expect(localStorage.getItem('token')).toBeNull();
    expect(MockUseUserProfile).toHaveBeenLastCalledWith(false);
    expect(MockUseUserChips).toHaveBeenLastCalledWith(false);
  });

  it('keeps the daily bonus closed while the daily state is still loading', () => {
    localStorage.setItem('token', 'token-fake-123');
    MockUseDailyLogin.mockReturnValue({
      DailyState: null,
      CanClaimToday: false,
      IsLoading: true,
    } satisfies DailyLoginHookReturn);

    RenderHome();

    expect(screen.getByTestId('daily-bonus-panel').textContent).toContain(
      'closed'
    );
    expect(MockUseDailyLogin).toHaveBeenCalledWith(true);
  });

  it('opens the ranking panel from the shortcut and closes it through the panel callback', () => {
    localStorage.setItem('token', 'token-fake-123');
    MockUseDailyLogin.mockReturnValue({
      DailyState: {
        FirstLoginToday: false,
        DailyStreak: 3,
        Reward: 0,
        ChipBalance: 1000,
      },
      CanClaimToday: false,
      IsLoading: false,
    } satisfies DailyLoginHookReturn);

    RenderHome();

    const Buttons = screen.getAllByRole('button');
    fireEvent.click(Buttons[Buttons.length - 1]);

    expect(screen.getByTestId('ranking-panel').textContent).toContain('open');

    fireEvent.click(screen.getByRole('button', { name: 'Close ranking' }));

    expect(screen.getByTestId('ranking-panel').textContent).toContain('closed');
  });

  it('opens the daily bonus from the gift shortcut and forwards the chips mutator to the panel', () => {
    localStorage.setItem('token', 'token-fake-123');
    MockUseDailyLogin.mockReturnValue({
      DailyState: {
        FirstLoginToday: false,
        DailyStreak: 3,
        Reward: 0,
        ChipBalance: 1000,
      },
      CanClaimToday: false,
      IsLoading: false,
    } satisfies DailyLoginHookReturn);

    const { container } = RenderHome();

    expect(screen.getByTestId('daily-bonus-panel').textContent).toContain(
      'closed'
    );
    expect(MockDailyBonusPanel).toHaveBeenLastCalledWith(
      expect.objectContaining({
        IsLoggedIn: true,
        MutateChips: MockMutateChips,
      })
    );

    const DailyBonusShortcut = container.querySelector('main button');
    expect(DailyBonusShortcut).not.toBeNull();

    fireEvent.click(DailyBonusShortcut as HTMLButtonElement);

    expect(screen.getByTestId('daily-bonus-panel').textContent).toContain(
      'open'
    );
  });

  it('sends the normalized profile payload after validating the current password', async () => {
    jest.useFakeTimers();
    const OnClose = jest.fn();
    const OnSuccess = jest.fn();

    localStorage.setItem(
      'user',
      JSON.stringify({
        Name: 'Old Name',
        Nickname: 'PixelPlayer',
        Email: 'pixel@example.com',
        BirthDate: '2000-01-02',
      })
    );

    MockApiPatch.mockResolvedValue({
      data: {
        Name: 'New Name',
        BirthDate: '1999-04-03',
      },
    });

    render(
      <EditProfileModal IsOpen={true} OnClose={OnClose} OnSuccess={OnSuccess} />
    );

    fireEvent.change(screen.getByPlaceholderText('Nome'), {
      target: { value: 'New Name' },
    });
    fireEvent.change(screen.getByPlaceholderText('DD/MM/AAAA'), {
      target: { value: '03/04/1999' },
    });
    fireEvent.change(screen.getByPlaceholderText('Nova senha (opcional)'), {
      target: { value: 'strong123' },
    });
    fireEvent.change(screen.getByPlaceholderText('Confirmar nova senha'), {
      target: { value: 'strong123' },
    });
    fireEvent.change(screen.getByPlaceholderText('Senha atual'), {
      target: { value: 'current123' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Salvar alteracoes' }));

    await waitFor(() => {
      expect(MockApiPost).toHaveBeenCalledWith('/auth/login', {
        Email: 'pixel@example.com',
        Password: 'current123',
      });
      expect(MockApiPatch).toHaveBeenCalledWith('/user', {
        Name: 'New Name',
        BirthDate: '1999-04-03',
        Password: 'strong123',
      });
    });

    expect(OnSuccess).toHaveBeenCalledTimes(1);
    expect(JSON.parse(localStorage.getItem('user') ?? '{}')).toEqual(
      expect.objectContaining({
        Name: 'New Name',
        BirthDate: '1999-04-03',
      })
    );

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(OnClose).toHaveBeenCalledTimes(1);
  });

  it('deletes the account through the API and clears persisted session data', async () => {
    const OnClose = jest.fn();
    const OnDeleted = jest.fn();

    localStorage.setItem('token', 'token-123');

    MockApiDelete.mockResolvedValue({});

    render(
      <DeleteAccountModal
        IsOpen={true}
        OnClose={OnClose}
        OnDeleted={OnDeleted}
      />
    );

    fireEvent.change(screen.getByPlaceholderText('Senha'), {
      target: { value: 'strong123' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Excluir conta' }));

    await waitFor(() => {
      expect(MockApiDelete).toHaveBeenCalledWith('/user');
    });

    expect(localStorage.getItem('token')).toBeNull();
    expect(OnDeleted).toHaveBeenCalledTimes(1);
    expect(OnClose).not.toHaveBeenCalled();
  });
});
