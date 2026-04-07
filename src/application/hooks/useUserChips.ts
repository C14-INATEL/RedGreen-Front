import useSWR from 'swr';
import { apiClient } from '@infrastructure/http/client';

interface UserChips {
  chips?: number;
  ChipBalance?: number;
}

export const useUserChips = (enabled: boolean = true) => {
  const { data, error, isLoading, mutate } = useSWR<UserChips>(
    enabled ? '/user/chips' : null,
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
    chips: data?.chips ?? data?.ChipBalance,
    isLoading,
    error,
    mutate,
  };
};
