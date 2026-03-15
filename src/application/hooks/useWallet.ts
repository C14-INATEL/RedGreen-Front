import useSWR from 'swr';
import { apiClient } from '../../infrastructure/http/client';
import type { Wallet } from '../../domain/types';

export const useWallet = () => {
  const { data, error, mutate } = useSWR<Wallet>('/wallet', apiClient.get);

  return {
    wallet: data,
    isLoading: !error && !data,
    error,
    mutate,
  };
};
