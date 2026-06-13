export const config = {
  apiBaseUrl:
    (import.meta.env?.VITE_API_BASE_URL as string) ||
    'https://redgreen-back.onrender.com',
  rerollLimit: 3,
  cacheTime: 5 * 60 * 1000,
} as const;
