import useSWR from 'swr';
import { apiClient } from '@infrastructure/http/client';

export interface UserProfile {
  UserId?: string;
  Name?: string;
  BirthDate?: string;
  Nickname?: string;
  Email?: string;
  ChipBalance?: number;
  DailyLoginStreak?: number;
  LastLoginDate?: string;
  CreatedAt?: string;
  Active?: boolean;
  UserType?: string;
}

export const useUserProfile = (enabled: boolean = true) => {
  const { data, error, isLoading, mutate } = useSWR<UserProfile>(
    enabled ? '/user/profile' : null,
    async (url) => {
      const response = await apiClient.get<Record<string, unknown>>(url);
      return (response.data?.User ?? response.data) as UserProfile;
    },
    {
      revalidateOnFocus: false,
      dedupingInterval: 5000,
    }
  );

  return {
    user: data,
    nickname: data?.Nickname ?? data?.Nickname,
    isAdmin: data?.UserType === 'Admin',
    isLoading,
    error,
    mutate,
  };
};
