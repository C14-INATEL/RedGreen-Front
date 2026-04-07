import useSWR from 'swr';
import { apiClient } from '@infrastructure/http/client';

interface UserProfile {
  nickname?: string;
  Nickname?: string;
}

export const useUserProfile = (enabled: boolean = true) => {
  const { data, error, isLoading } = useSWR<UserProfile>(
    enabled ? '/user/profile' : null,
    async (url) => {
      const response = await apiClient.get(url);
      return response.data;
    },
    {
      revalidateOnFocus: false,
      dedupingInterval: 5000,
    }
  );

  return {
    nickname: data?.nickname ?? data?.Nickname,
    isLoading,
    error,
  };
};
