import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { fireEvent, render, renderHook, screen } from '@testing-library/react';
import useSWR from 'swr';
import {
  RANKING_CACHE_KEY,
  useRanking,
} from '../src/application/hooks/useRanking';
import RankingPanel from '../src/presentation/ui/RankingPanel';

type ApiGetMock = (url: string) => Promise<{ data: unknown }>;

const MockApiGet = jest.fn<ApiGetMock>();

jest.mock('@infrastructure/http/client', () => ({
  apiClient: {
    get: (url: string) => MockApiGet(url),
  },
}));

jest.mock('swr', () => ({
  __esModule: true,
  default: jest.fn(),
}));

type MockSWRHook = (...Args: unknown[]) => {
  data: unknown;
  error: unknown;
  isLoading: boolean;
  isValidating: boolean;
  mutate: never;
};

const MockUseSWR = useSWR as unknown as jest.MockedFunction<MockSWRHook>;

const SetSWRResult = ({
  data,
  error,
  isLoading = false,
  mutate = jest.fn(),
}: {
  data?: Array<{
    Position: number;
    Nickname: string;
    ChipBalance: number;
  }>;
  error?: Error;
  isLoading?: boolean;
  mutate?: ReturnType<typeof jest.fn>;
} = {}) => {
  MockUseSWR.mockReturnValue({
    data,
    error,
    isLoading,
    isValidating: false,
    mutate: mutate as never,
  });
};

describe('useRanking', () => {
  beforeEach(() => {
    MockApiGet.mockReset();
    MockUseSWR.mockReset();
    SetSWRResult();
  });

  it('passes the correct cache key to SWR when enabled', () => {
    renderHook(() => useRanking(true));

    expect(MockUseSWR).toHaveBeenCalledWith(
      RANKING_CACHE_KEY,
      expect.any(Function),
      expect.any(Object)
    );
  });

  it('passes null to SWR when disabled', () => {
    renderHook(() => useRanking(false));

    expect(MockUseSWR).toHaveBeenCalledWith(
      null,
      expect.any(Function),
      expect.any(Object)
    );
  });

  it('is enabled by default when no argument is passed', () => {
    renderHook(() => useRanking());

    expect(MockUseSWR).toHaveBeenCalledWith(
      RANKING_CACHE_KEY,
      expect.any(Function),
      expect.any(Object)
    );
  });

  it('returns empty Players array while loading', () => {
    SetSWRResult({ isLoading: true });

    const { result } = renderHook(() => useRanking(true));

    expect(result.current.Players).toEqual([]);
    expect(result.current.IsLoading).toBeTruthy();
    expect(result.current.Error).toBeUndefined();
  });

  it('returns players provided by SWR', () => {
    SetSWRResult({
      data: [
        { Position: 1, Nickname: 'Alpha', ChipBalance: 50000 },
        { Position: 2, Nickname: 'Beta', ChipBalance: 30000 },
      ],
    });

    const { result } = renderHook(() => useRanking(true));

    expect(result.current.Players).toEqual([
      { Position: 1, Nickname: 'Alpha', ChipBalance: 50000 },
      { Position: 2, Nickname: 'Beta', ChipBalance: 30000 },
    ]);
    expect(result.current.IsLoading).toBeFalsy();
  });

  it('exposes the error returned by SWR', () => {
    const FakeError = new Error('Network error');
    SetSWRResult({ error: FakeError });

    const { result } = renderHook(() => useRanking(true));

    expect(result.current.Error).toBe(FakeError);
    expect(result.current.Players).toEqual([]);
  });

  it('exposes the Mutate function from SWR', () => {
    const MockMutate = jest.fn();
    SetSWRResult({ mutate: MockMutate });

    const { result } = renderHook(() => useRanking(true));

    expect(result.current.Mutate).toBe(MockMutate);
  });

  it('fetcher normalizes a single object response into an array', async () => {
    MockApiGet.mockResolvedValue({
      data: { Position: 1, Nickname: 'Solo', ChipBalance: 99999 },
    });

    let CapturedFetcher: ((url: string) => Promise<unknown>) | undefined;

    MockUseSWR.mockImplementation((...Args: unknown[]) => {
      const Fetcher = Args[1];
      CapturedFetcher = Fetcher as (url: string) => Promise<unknown>;

      return {
        data: undefined,
        error: undefined,
        isLoading: false,
        isValidating: false,
        mutate: jest.fn() as never,
      };
    });

    renderHook(() => useRanking(true));

    const Result = await CapturedFetcher!(RANKING_CACHE_KEY);

    expect(Result).toEqual([
      { Position: 1, Nickname: 'Solo', ChipBalance: 99999 },
    ]);
  });

  it('fetcher normalizes an array response preserving all items', async () => {
    MockApiGet.mockResolvedValue({
      data: [
        { Position: 1, Nickname: 'First', ChipBalance: 10000 },
        { Position: 2, Nickname: 'Second', ChipBalance: 5000 },
        { Position: 3, Nickname: 'Third', ChipBalance: 1000 },
      ],
    });

    let CapturedFetcher: ((url: string) => Promise<unknown>) | undefined;

    MockUseSWR.mockImplementation((...Args: unknown[]) => {
      const Fetcher = Args[1];
      CapturedFetcher = Fetcher as (url: string) => Promise<unknown>;

      return {
        data: undefined,
        error: undefined,
        isLoading: false,
        isValidating: false,
        mutate: jest.fn() as never,
      };
    });

    renderHook(() => useRanking(true));

    const Result = (await CapturedFetcher!(RANKING_CACHE_KEY)) as Array<{
      Position: number;
      Nickname: string;
      ChipBalance: number;
    }>;

    expect(Result).toHaveLength(3);
    expect(Result[2]).toEqual({
      Position: 3,
      Nickname: 'Third',
      ChipBalance: 1000,
    });
  });

  it('configures SWR without focus revalidation and with 5000ms deduping', () => {
    renderHook(() => useRanking(true));

    expect(MockUseSWR).toHaveBeenCalledWith(
      expect.anything(),
      expect.any(Function),
      expect.objectContaining({
        revalidateOnFocus: false,
        dedupingInterval: 5000,
      })
    );
  });
});

describe('RankingPanel', () => {
  let OnClose: ReturnType<typeof jest.fn>;
  let OnExitComplete: ReturnType<typeof jest.fn>;

  beforeEach(() => {
    MockApiGet.mockReset();
    MockUseSWR.mockReset();
    SetSWRResult();
    OnClose = jest.fn();
    OnExitComplete = jest.fn();
  });

  const RenderRankingPanel = (IsOpen = true) =>
    render(
      <RankingPanel
        IsOpen={IsOpen}
        OnClose={OnClose}
        OnExitComplete={OnExitComplete}
      />
    );

  it('does not render the panel content when IsOpen is false', () => {
    RenderRankingPanel(false);

    expect(screen.queryByText('Ranking')).toBeNull();
  });

  it('renders the panel header when IsOpen is true', () => {
    RenderRankingPanel();

    expect(screen.getByText('Ranking')).not.toBeNull();
  });

  it('calls OnClose when the close button is clicked', () => {
    RenderRankingPanel();

    fireEvent.click(screen.getByRole('button'));

    expect(OnClose).toHaveBeenCalledTimes(1);
  });

  it('passes the open state as the enabled flag to useRanking', () => {
    RenderRankingPanel(true);

    expect(MockUseSWR).toHaveBeenCalledWith(
      RANKING_CACHE_KEY,
      expect.any(Function),
      expect.any(Object)
    );
  });

  it('disables ranking fetching when the panel is closed', () => {
    RenderRankingPanel(false);

    expect(MockUseSWR).toHaveBeenCalledWith(
      null,
      expect.any(Function),
      expect.any(Object)
    );
  });

  it('shows the loading message while data is being fetched', () => {
    SetSWRResult({ isLoading: true });

    RenderRankingPanel();

    expect(screen.getByText('Carregando ranking...')).not.toBeNull();
  });

  it('shows the error message when the request fails', () => {
    SetSWRResult({ error: new Error('Request failed') });

    RenderRankingPanel();

    expect(
      screen.getByText('Nao foi possivel carregar o ranking.')
    ).not.toBeNull();
  });

  it('shows the empty state when there are no players', () => {
    RenderRankingPanel();

    expect(screen.getByText('Ranking vazio.')).not.toBeNull();
  });

  it('renders all players returned by the hook', () => {
    SetSWRResult({
      data: [
        { Position: 1, Nickname: 'Alpha', ChipBalance: 50000 },
        { Position: 2, Nickname: 'Beta', ChipBalance: 30000 },
        { Position: 3, Nickname: 'Gamma', ChipBalance: 10000 },
      ],
    });

    RenderRankingPanel();

    expect(screen.getByText('Alpha')).not.toBeNull();
    expect(screen.getByText('Beta')).not.toBeNull();
    expect(screen.getByText('Gamma')).not.toBeNull();
  });

  it('renders each player position number', () => {
    SetSWRResult({
      data: [
        { Position: 1, Nickname: 'Alpha', ChipBalance: 50000 },
        { Position: 2, Nickname: 'Beta', ChipBalance: 30000 },
      ],
    });

    RenderRankingPanel();

    expect(screen.getByText('1')).not.toBeNull();
    expect(screen.getByText('2')).not.toBeNull();
  });

  it('formats chips above 1000 with k suffix', () => {
    SetSWRResult({
      data: [{ Position: 1, Nickname: 'Alpha', ChipBalance: 5000 }],
    });

    RenderRankingPanel();

    expect(screen.getByText('5.000k')).not.toBeNull();
  });

  it('formats chips above 1000000 with M suffix', () => {
    SetSWRResult({
      data: [{ Position: 1, Nickname: 'Alpha', ChipBalance: 2000000 }],
    });

    RenderRankingPanel();

    expect(screen.getByText('2.000M')).not.toBeNull();
  });

  it('formats chips below 1000 using pt-BR locale', () => {
    SetSWRResult({
      data: [{ Position: 1, Nickname: 'Alpha', ChipBalance: 500 }],
    });

    RenderRankingPanel();

    expect(screen.getByText('500')).not.toBeNull();
  });

  it('hides status messages when players are present', () => {
    SetSWRResult({
      data: [{ Position: 1, Nickname: 'Alpha', ChipBalance: 100 }],
    });

    RenderRankingPanel();

    expect(screen.queryByText('Carregando ranking...')).toBeNull();
    expect(
      screen.queryByText('Nao foi possivel carregar o ranking.')
    ).toBeNull();
    expect(screen.queryByText('Ranking vazio.')).toBeNull();
  });
});
