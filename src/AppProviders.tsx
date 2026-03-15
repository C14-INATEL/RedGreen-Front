import { SWRConfig } from 'swr';
import type { ReactNode } from 'react';
import { config } from './config';

interface AppProvidersProps {
  children: ReactNode;
}

export const AppProviders = ({ children }: AppProvidersProps) => (
  <SWRConfig
    value={{
      revalidateOnFocus: false,
      dedupingInterval: config.cacheTime,
    }}
  >
    {children}
  </SWRConfig>
);
