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

interface DailyStateSnapshot extends DailyLoginResponse {
  EligibilityDefined: boolean;
}

const DAILY_LOGIN_ENDPOINT = '/user/daily-login';
const DAILY_STATUS_ENDPOINT = '/user/profile';
const TOTAL_REWARD_DAYS = 7;

type AnyRecord = Record<string, unknown>;

type DailyStatusSource = AnyRecord & {
  User?: AnyRecord;
};

const ToBoolean = (Value: unknown): boolean | undefined => {
  if (typeof Value === 'boolean') {
    return Value;
  }

  if (typeof Value === 'number') {
    if (Value === 1) return true;
    if (Value === 0) return false;
    return undefined;
  }

  if (typeof Value === 'string') {
    const Normalized = Value.trim().toLowerCase();
    if (Normalized === 'true' || Normalized === '1') return true;
    if (Normalized === 'false' || Normalized === '0') return false;
  }

  return undefined;
};

const ToNumber = (Value: unknown): number | undefined => {
  if (typeof Value === 'number' && Number.isFinite(Value)) {
    return Value;
  }

  if (typeof Value === 'string' && Value.trim().length > 0) {
    const Parsed = Number(Value);
    if (Number.isFinite(Parsed)) {
      return Parsed;
    }
  }

  return undefined;
};

const ExtractFromCandidates = (
  Source: AnyRecord | undefined,
  Keys: string[]
): unknown => {
  if (!Source) {
    return undefined;
  }

  for (const Key of Keys) {
    if (Object.prototype.hasOwnProperty.call(Source, Key)) {
      const Value = Source[Key];
      if (Value !== undefined && Value !== null) {
        return Value;
      }
    }
  }

  return undefined;
};

const ExtractEligibility = (Source?: DailyStatusSource) => {
  const PositiveCandidates = [
    'FirstLoginToday',
    'firstLoginToday',
    'CanClaimToday',
    'canClaimToday',
    'CanClaimDailyBonus',
    'canClaimDailyBonus',
  ];

  const ClaimedTodayCandidates = [
    'HasClaimedToday',
    'hasClaimedToday',
    'DailyBonusClaimedToday',
    'dailyBonusClaimedToday',
    'ClaimedToday',
    'claimedToday',
  ];

  const PositiveValue =
    ToBoolean(ExtractFromCandidates(Source, PositiveCandidates)) ??
    ToBoolean(ExtractFromCandidates(Source?.User, PositiveCandidates));

  if (typeof PositiveValue === 'boolean') {
    return PositiveValue;
  }

  const ClaimedTodayValue =
    ToBoolean(ExtractFromCandidates(Source, ClaimedTodayCandidates)) ??
    ToBoolean(ExtractFromCandidates(Source?.User, ClaimedTodayCandidates));

  if (typeof ClaimedTodayValue === 'boolean') {
    return !ClaimedTodayValue;
  }

  return undefined;
};

const ExtractDailyStreak = (Source?: DailyStatusSource) => {
  const Candidates = [
    'DailyStreak',
    'dailyStreak',
    'DailyLoginStreak',
    'dailyLoginStreak',
    'LoginStreak',
    'loginStreak',
  ];

  return (
    ToNumber(ExtractFromCandidates(Source, Candidates)) ??
    ToNumber(ExtractFromCandidates(Source?.User, Candidates))
  );
};

const ExtractReward = (Source?: DailyStatusSource) => {
  const Candidates = ['Reward', 'reward'];
  return (
    ToNumber(ExtractFromCandidates(Source, Candidates)) ??
    ToNumber(ExtractFromCandidates(Source?.User, Candidates))
  );
};

const ExtractChipBalance = (Source?: DailyStatusSource) => {
  const Candidates = ['ChipBalance', 'chipBalance', 'chips'];
  return (
    ToNumber(ExtractFromCandidates(Source, Candidates)) ??
    ToNumber(ExtractFromCandidates(Source?.User, Candidates))
  );
};

const ReadLocalDailySnapshot = () => {
  try {
    const RawUser = localStorage.getItem('user');
    if (!RawUser) {
      return {
        DailyStreak: 0,
        FirstLoginToday: undefined as boolean | undefined,
      };
    }

    const Parsed = JSON.parse(RawUser) as AnyRecord;
    const Wrapped = { ...Parsed, User: Parsed } as DailyStatusSource;

    return {
      DailyStreak: Math.max(0, ExtractDailyStreak(Wrapped) ?? 0),
      FirstLoginToday: ExtractEligibility(Wrapped),
    };
  } catch {
    return {
      DailyStreak: 0,
      FirstLoginToday: undefined as boolean | undefined,
    };
  }
};

const PersistLocalDailyStreak = (DailyStreak: number) => {
  try {
    const RawUser = localStorage.getItem('user');
    if (!RawUser) return;

    const Parsed = JSON.parse(RawUser) as AnyRecord;
    const SafeStreak = Math.max(0, DailyStreak);

    const Updated = {
      ...Parsed,
      DailyStreak: SafeStreak,
      dailyStreak: SafeStreak,
      DailyLoginStreak: SafeStreak,
      dailyLoginStreak: SafeStreak,
    };

    localStorage.setItem('user', JSON.stringify(Updated));
  } catch {
    // no-op
  }
};

const NormalizeDailyState = (
  Source: DailyStatusSource | undefined,
  FallbackEligibility: boolean,
  FallbackStreak: number
): DailyStateSnapshot => {
  const EligibilityFromApi = ExtractEligibility(Source);
  const StreakFromApi = ExtractDailyStreak(Source);

  return {
    FirstLoginToday: EligibilityFromApi ?? FallbackEligibility,
    DailyStreak: Math.max(0, StreakFromApi ?? FallbackStreak),
    Reward: ExtractReward(Source) ?? 0,
    ChipBalance: ExtractChipBalance(Source) ?? 0,
    EligibilityDefined: typeof EligibilityFromApi === 'boolean',
  };
};

export const CalculateDailyProgress = (
  DailyStreak: number,
  FirstLoginToday: boolean
): DailyProgress => {
  const SafeStreak = Math.max(0, DailyStreak);
  const IsCappedAtLastDay = SafeStreak >= TOTAL_REWARD_DAYS;

  if (IsCappedAtLastDay) {
    const ClaimedDays = FirstLoginToday
      ? TOTAL_REWARD_DAYS - 1
      : TOTAL_REWARD_DAYS;

    return {
      ClaimedDays,
      CurrentDay: TOTAL_REWARD_DAYS,
      CurrentDayIndex: TOTAL_REWARD_DAYS - 1,
    };
  }

  if (FirstLoginToday) {
    const ClaimedDays = SafeStreak;
    return {
      ClaimedDays,
      CurrentDay: ClaimedDays + 1,
      CurrentDayIndex: ClaimedDays,
    };
  }

  const ClaimedDays = SafeStreak;
  const LastClaimedDayIndex = Math.max(SafeStreak - 1, 0);

  return {
    ClaimedDays: Math.max(ClaimedDays, 0),
    CurrentDay: SafeStreak > 0 ? SafeStreak : 1,
    CurrentDayIndex: LastClaimedDayIndex,
  };
};

export const useDailyLogin = (enabled: boolean = true) => {
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
    enabled ? DAILY_STATUS_ENDPOINT : null,
    async (Url) => {
      const Response = await apiClient.get<DailyStatusSource>(Url);
      const LocalSnapshot = ReadLocalDailySnapshot();
      const FallbackEligibility =
        LocalSnapshot.FirstLoginToday ??
        (LocalSnapshot.DailyStreak === 0 ? true : false);

      return NormalizeDailyState(
        Response.data,
        FallbackEligibility,
        LocalSnapshot.DailyStreak
      );
    },
    {
      revalidateOnFocus: false,
      dedupingInterval: 5000,
    }
  );

  const ClaimDailyReward = async () => {
    if (IsLoading) {
      return null;
    }

    SetIsLoading(true);
    SetError(null);

    try {
      const Response = await apiClient.post<DailyStatusSource>(DAILY_LOGIN_ENDPOINT);
      const LocalSnapshot = ReadLocalDailySnapshot();

      const FallbackClaimStreak = Math.max(
        DailyState?.DailyStreak ?? LocalSnapshot.DailyStreak,
        0
      );

      const NormalizedResponse = NormalizeDailyState(
        Response.data,
        false,
        FallbackClaimStreak
      );

      const LockedAfterClaim: DailyStateSnapshot = {
        ...NormalizedResponse,
        FirstLoginToday: false,
      };

      SetLastReward(LockedAfterClaim.Reward);
      SetCanClaimOverride(false);
      PersistLocalDailyStreak(LockedAfterClaim.DailyStreak);

      await MutateDailyState(LockedAfterClaim, false);

      return LockedAfterClaim;
    } catch (err) {
      const ErrorMessage =
        (err as { message?: string })?.message ||
        'Erro ao resgatar bonus diario';
      SetError(ErrorMessage);
      console.error('Daily login error:', err);
      return null;
    } finally {
      SetIsLoading(false);
    }
  };

  useEffect(() => {
    if (DailyState?.EligibilityDefined) {
      SetCanClaimOverride(null);
    }
  }, [DailyState]);

  const DerivedError = Error ?? DailyStateError?.message ?? null;
  const CanClaimToday = CanClaimOverride ?? DailyState?.FirstLoginToday ?? false;
  const Progress = CalculateDailyProgress(DailyState?.DailyStreak ?? 0, CanClaimToday);

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
