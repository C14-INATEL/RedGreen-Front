import { useState } from 'react';
import { apiClient } from '@infrastructure/http/client';

interface DailyLoginResponse {
  FirstLoginToday: boolean;
  DailyStreak: number;
  Reward: number;
  ChipBalance: number;
}

export const useDailyLogin = () => {
  const [IsLoading, SetIsLoading] = useState(false);
  const [Error, SetError] = useState<string | null>(null);
  const [LastReward, SetLastReward] = useState<DailyLoginResponse | null>(null);

  const ClaimDailyReward = async () => {
    SetIsLoading(true);
    SetError(null);

    try {
      const response =
        await apiClient.post<DailyLoginResponse>('/user/daily-login');

      console.log('Daily login response:', response.data);
      SetLastReward(response.data);

      return response.data;
    } catch (err) {
      const ErrorMessage =
        (err as { message?: string })?.message ||
        'Erro ao resgatar bônus diário';
      SetError(ErrorMessage);
      console.error('Daily login error:', err);
    } finally {
      SetIsLoading(false);
    }
  };

  return {
    ClaimDailyReward,
    IsLoading,
    Error,
    LastReward,
  };
};
