import { useEffect, useState } from 'react';
import useSWR from 'swr';
import { apiClient } from '@infrastructure/http/client';

export interface DailyLoginResponse {
  FirstLoginToday: boolean;
  DailyStreak: number;
  Reward: number;
  ChipBalance: number;
}

interface DailyProgress {
  ClaimedDays: number;
  CurrentDay: number;
  CurrentDayIndex: number;
}

interface DailyStateSnapshot {
  FirstLoginToday: boolean;
  DailyStreak: number;
  Reward: number;
  ChipBalance: number;
  LastLoginDate: string | null;
  SequenceDay: number | null;
}

const DailyLoginEndpoint = '/user/daily-login';
const DailyStatusEndpoint = '/user/profile';
const TotalRewardDays = 7;
const MillisecondsInDay = 24 * 60 * 60 * 1000;

const GetLocalDateKey = (Value: Date = new Date()) =>
  `${Value.getFullYear()}-${String(Value.getMonth() + 1).padStart(2, '0')}-${String(Value.getDate()).padStart(2, '0')}`;

const ParseDateKey = (DateKey: string) => {
  const [Year, Month, Day] = DateKey.split('-').map(Number);
  return new Date(Year, Month - 1, Day);
};

const NormalizeDateKey = (Value: unknown): string | null => {
  if (!Value) return null;
  if (Value instanceof Date && Number.isFinite(Value.getTime())) return GetLocalDateKey(Value);
  if (typeof Value === 'string') {
    const Match = Value.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (Match) return `${Match[1]}-${Match[2]}-${Match[3]}`;
    const Parsed = new Date(Value);
    if (Number.isFinite(Parsed.getTime())) return GetLocalDateKey(Parsed);
  }
  return null;
};

const GetDaysSinceDateKey = (DateKey: string, Now: Date = new Date()): number => {
  const Target = ParseDateKey(DateKey);
  const Today = new Date(Now.getFullYear(), Now.getMonth(), Now.getDate());
  return Math.round((Today.getTime() - Target.getTime()) / MillisecondsInDay);
};

const DeriveCanClaimFromLastLoginDate = (LastLoginDate: string | null): boolean => {
  if (!LastLoginDate) return true;
  return GetDaysSinceDateKey(LastLoginDate) > 0;
};

const DeriveStreakFromLastLoginDate = (
  LastLoginDate: string | null,
  StoredStreak: number
): number => {
  if (!LastLoginDate) return 0;
  const DaysSince = GetDaysSinceDateKey(LastLoginDate);
  if (DaysSince <= 1) return StoredStreak;
  return 0;
};

export const CalculateDailyProgress = (
  DailyStreak: number,
  CanClaim: boolean,
  SequenceDay?: number | null
): DailyProgress => {
  const SafeStreak = Math.max(0, DailyStreak);
  const SafeSequenceDay =
    typeof SequenceDay === 'number'
      ? Math.min(Math.max(Math.trunc(SequenceDay), 1), TotalRewardDays)
      : null;

  if (typeof SafeSequenceDay === 'number') {
    const ClaimedDays = CanClaim ? Math.max(SafeSequenceDay - 1, 0) : SafeSequenceDay;
    return { ClaimedDays, CurrentDay: SafeSequenceDay, CurrentDayIndex: SafeSequenceDay - 1 };
  }

  const IsCapped = SafeStreak >= TotalRewardDays;

  if (IsCapped) {
    const ClaimedDays = CanClaim ? TotalRewardDays - 1 : TotalRewardDays;
    return { ClaimedDays, CurrentDay: TotalRewardDays, CurrentDayIndex: TotalRewardDays - 1 };
  }

  if (CanClaim) {
    return { ClaimedDays: SafeStreak, CurrentDay: SafeStreak + 1, CurrentDayIndex: SafeStreak };
  }

  return {
    ClaimedDays: SafeStreak,
    CurrentDay: SafeStreak > 0 ? SafeStreak : 1,
    CurrentDayIndex: Math.max(SafeStreak - 1, 0),
  };
};

export const UseDailyLogin = (Enabled: boolean = true) => {
  const [IsLoading, SetIsLoading] = useState(false);
  const [Error, SetError] = useState<string | null>(null);
  const [LastReward, SetLastReward] = useState<number | null>(null);
  const [CanClaimOverride, SetCanClaimOverride] = useState<boolean | null>(null);

  const {
    data: DailyState,
    error: DailyStateError,
    isLoading: IsStateLoading,
    mutate: MutateDailyState,
  } = useSWR<DailyStateSnapshot>(
    Enabled ? DailyStatusEndpoint : null,
    async (Url) => {
      const Response = await apiClient.get<Record<string, unknown>>(Url);
      const Data = (Response.data?.User ?? Response.data) as Record<string, unknown>;

      const LastLoginDate = NormalizeDateKey(
        Data.LastLoginDate ?? Data.lastLoginDate ?? Data.LastDailyLoginAt ?? Data.lastDailyLoginAt
      );

      const StoredStreak = Math.max(
        0,
        Number(Data.DailyLoginStreak ?? Data.dailyLoginStreak ?? Data.DailyStreak ?? Data.dailyStreak ?? 0)
      );

      const CanClaim = DeriveCanClaimFromLastLoginDate(LastLoginDate);
      const ResolvedStreak = DeriveStreakFromLastLoginDate(LastLoginDate, StoredStreak);

      const SequenceDay = CanClaim
        ? Math.min(ResolvedStreak + 1, TotalRewardDays)
        : Math.min(ResolvedStreak, TotalRewardDays) || 1;

      return {
        FirstLoginToday: CanClaim,
        DailyStreak: ResolvedStreak,
        Reward: 0,
        ChipBalance: Number(Data.ChipBalance ?? Data.chipBalance ?? 0),
        LastLoginDate,
        SequenceDay,
      };
    },
    {
      revalidateOnFocus: false,
      dedupingInterval: 5000,
    }
  );

  const ClaimDailyReward = async () => {
    if (IsLoading) return null;
    SetIsLoading(true);
    SetError(null);

    try {
      const Response = await apiClient.post<Record<string, unknown>>(DailyLoginEndpoint);
      const Data = Response.data;

      const NewStreak = Math.min(
        Math.max(0, Number(Data.DailyStreak ?? Data.dailyStreak ?? 1)),
        TotalRewardDays
      );
      const Reward = Number(Data.Reward ?? Data.reward ?? 0);
      const TodayKey = GetLocalDateKey();

      const UpdatedState: DailyStateSnapshot = {
        FirstLoginToday: false,
        DailyStreak: NewStreak,
        Reward,
        ChipBalance: Number(Data.ChipBalance ?? Data.chipBalance ?? DailyState?.ChipBalance ?? 0),
        LastLoginDate: TodayKey,
        SequenceDay: Math.min(NewStreak, TotalRewardDays),
      };

      SetLastReward(Reward);
      SetCanClaimOverride(false);
      await MutateDailyState(UpdatedState, false);

      return UpdatedState;
    } catch (Err) {
      const ErrorMessage =
        (Err as { message?: string })?.message ?? 'Erro ao resgatar bonus diario';
      SetError(ErrorMessage);
      return null;
    } finally {
      SetIsLoading(false);
    }
  };

  useEffect(() => {
  if (DailyState && CanClaimOverride !== null) {
    SetCanClaimOverride(null);
  }
}, [DailyState, CanClaimOverride]);

  const DerivedError = Error ?? DailyStateError?.message ?? null;
  const CanClaimToday = CanClaimOverride ?? DailyState?.FirstLoginToday ?? false;
  const Progress = CalculateDailyProgress(
    DailyState?.DailyStreak ?? 0,
    CanClaimToday,
    DailyState?.SequenceDay
  );

  return {
    ClaimDailyReward,
    IsLoading: IsLoading || IsStateLoading,
    Error: DerivedError,
    LastReward,
    DailyState,
    CanClaimToday,
    CurrentDay: Progress.CurrentDay,
    CurrentDayIndex: Progress.CurrentDayIndex,
    ClaimedDays: Progress.ClaimedDays,
    MutateDailyState,
  };
};