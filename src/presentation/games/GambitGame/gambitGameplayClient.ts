import axios from 'axios';
import * as backendApi from './gambitApi';
import * as sandboxApi from './gambitSandboxApi';
import type {
  GambitApiSession,
  GambitCashOutResponse,
  GambitResolveEffectResponse,
  ResolveActiveGambitEventSelection,
} from './gambitApi';

export type GambitGameplayMode = 'auto' | 'backend' | 'mock';
export type GambitGameplaySource = 'backend' | 'mock';

export type GambitGameplayFetchResult = {
  fallbackReason: 'backend-error' | 'missing-session' | null;
  mode: GambitGameplayMode;
  session: GambitApiSession | null;
  source: GambitGameplaySource;
};

const GAMBIT_GAMEPLAY_MODE_ENV_KEY = 'VITE_GAMBIT_GAMEPLAY_MODE';
const VALID_GAMBIT_GAMEPLAY_MODES = new Set<GambitGameplayMode>([
  'auto',
  'backend',
  'mock',
]);

let activeGameplaySource: GambitGameplaySource | null = null;

const normalizeGameplayMode = (
  mode: string | null | undefined
): GambitGameplayMode | null => {
  if (!mode) {
    return null;
  }

  const normalizedMode = mode.toLowerCase();

  return VALID_GAMBIT_GAMEPLAY_MODES.has(normalizedMode as GambitGameplayMode)
    ? (normalizedMode as GambitGameplayMode)
    : null;
};

const readConfiguredModeFromEnv = () =>
  normalizeGameplayMode(import.meta.env?.[GAMBIT_GAMEPLAY_MODE_ENV_KEY]);

const readConfiguredModeFromStorage = () => {
  try {
    return normalizeGameplayMode(
      window.localStorage.getItem('gambitGameplayMode')
    );
  } catch {
    return null;
  }
};

export const getConfiguredGambitGameplayMode = (): GambitGameplayMode => {
  const configuredMode =
    readConfiguredModeFromEnv() ?? readConfiguredModeFromStorage();

  if (configuredMode) {
    return configuredMode;
  }

  return import.meta.env?.PROD ? 'backend' : 'auto';
};

export const getActiveGambitGameplaySource = () => activeGameplaySource;

export const resetGambitGameplayClient = () => {
  activeGameplaySource = null;
  sandboxApi.resetGambitSandboxSession();
};

const shouldFallbackToSandbox = (error: unknown) => {
  if (!axios.isAxiosError(error)) {
    return false;
  }

  const status = error.response?.status;

  return status == null || status === 401 || status === 403 || status === 404;
};

const activateSandboxSession = async (
  mode: GambitGameplayMode,
  fallbackReason: GambitGameplayFetchResult['fallbackReason']
): Promise<GambitGameplayFetchResult> => {
  activeGameplaySource = 'mock';

  return {
    fallbackReason,
    mode,
    session: await sandboxApi.fetchActiveGambitSession(),
    source: 'mock',
  };
};

const getActiveApi = () =>
  activeGameplaySource === 'mock' ? sandboxApi : backendApi;

export const fetchActiveGambitSession =
  async (): Promise<GambitGameplayFetchResult> => {
    const mode = getConfiguredGambitGameplayMode();

    if (mode === 'mock') {
      return activateSandboxSession(mode, null);
    }

    try {
      const session = await backendApi.fetchActiveGambitSession();

      if (session) {
        activeGameplaySource = 'backend';

        return {
          fallbackReason: null,
          mode,
          session,
          source: 'backend',
        };
      }

      if (mode === 'auto') {
        return activateSandboxSession(mode, 'missing-session');
      }

      activeGameplaySource = 'backend';

      return {
        fallbackReason: 'missing-session',
        mode,
        session: null,
        source: 'backend',
      };
    } catch (error) {
      if (mode === 'auto' && shouldFallbackToSandbox(error)) {
        return activateSandboxSession(mode, 'backend-error');
      }

      activeGameplaySource = 'backend';
      throw error;
    }
  };

export const burnActiveGambitCard = async (position: number) =>
  getActiveApi().burnActiveGambitCard(position);

export const resolveActiveGambitEvent = async (
  selection: ResolveActiveGambitEventSelection
) => getActiveApi().resolveActiveGambitEvent(selection);

export const resolveActiveGambitEffect = async (
  positions: number[]
): Promise<GambitResolveEffectResponse> =>
  getActiveApi().resolveActiveGambitEffect(positions);

export const cashOutActiveGambitSession =
  async (): Promise<GambitCashOutResponse> =>
    getActiveApi().cashOutActiveGambitSession();

export const getGambitResolveEffectSession =
  backendApi.getGambitResolveEffectSession;

export const getGambitResolveEffectPeekResult =
  backendApi.getGambitResolveEffectPeekResult;
