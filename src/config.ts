export const config = {
  apiBaseUrl:
    (import.meta.env?.VITE_API_BASE_URL as string) || 'http://localhost:3000',
  rerollLimit: 3,
  cacheTime: 5 * 60 * 1000,
} as const;
