import useSWR from 'swr';
import { apiClient } from '@infrastructure/http/client';

type RankingApiItem = {
  Position: number;
  Nickname: string;
  ChipBalance: number;
};

export const RANKING_CACHE_KEY = '/auth/rank';

export type RankingPlayer = {
  Position: number;
  Nickname: string;
  ChipBalance: number;
};

const NormalizeRankingPlayer = (
  Player: RankingApiItem,
  Index: number
): RankingPlayer => ({
  Position: Number(Player.Position ?? Index + 1),
  Nickname: Player.Nickname,
  ChipBalance: Number(Player.ChipBalance),
});

export const useRanking = (Enabled: boolean = true) => {
  const {
    data: Players,
    error: Error,
    isLoading: IsLoading,
    mutate: Mutate,
  } = useSWR<RankingPlayer[]>(
    Enabled ? RANKING_CACHE_KEY : null,
    async (Url) => {
      const Response = await apiClient.get<RankingApiItem[] | RankingApiItem>(
        Url
      );
      const RankingData = Array.isArray(Response.data)
        ? Response.data
        : [Response.data];

      return RankingData.map(NormalizeRankingPlayer);
    },
    {
      revalidateOnFocus: false,
      dedupingInterval: 5000,
    }
  );

  return {
    Players: Players ?? [],
    IsLoading,
    Error,
    Mutate,
  };
};
