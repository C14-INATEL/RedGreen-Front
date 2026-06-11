import useSWR from 'swr';
import { apiClient } from '@infrastructure/http/client';

export interface UserProfile {
  nickname?: string;
  Nickname?: string;
  UserType?: string;
  Email?: string;
  email?: string;
  Name?: string;
  name?: string;
  BirthDate?: string;
  birthDate?: string;
  ChipBalance?: number;
  chips?: number;
  [key: string]: unknown;
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
    nickname: data?.nickname ?? data?.Nickname,
    isAdmin: data?.UserType === 'Admin',
    isLoading,
    error,
    mutate,
  };
};
