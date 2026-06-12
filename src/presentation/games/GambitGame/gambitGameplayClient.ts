import { readEnv } from '@infrastructure/env';
import * as backendApi from './gambitApi';
import * as mockApi from './gambitSandboxApi';
import type {
  CreateGambitSessionParams,
  GambitCashOutResponse,
  GambitResolveEffectResponse,
  ResolveActiveGambitEventSelection,
} from './gambitApi';

export type GambitGameplayMode = 'backend' | 'mock';
export type GambitGameplaySource = 'backend' | 'mock';

const GAMBIT_GAMEPLAY_MODE_ENV_KEY = 'VITE_GAMBIT_GAMEPLAY_MODE';
const VALID_GAMBIT_GAMEPLAY_MODES = new Set<GambitGameplayMode>([
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
  normalizeGameplayMode(readEnv(GAMBIT_GAMEPLAY_MODE_ENV_KEY));

const readConfiguredModeFromStorage = () => {
  try {
    return normalizeGameplayMode(
      window.localStorage.getItem('gambitGameplayMode')
    );
  } catch {
    return null;
  }
};

export const getConfiguredGambitGameplayMode = (): GambitGameplayMode =>
  readConfiguredModeFromEnv() ?? readConfiguredModeFromStorage() ?? 'backend';

export const getActiveGambitGameplaySource = () => activeGameplaySource;

export const resetGambitGameplayClient = () => {
  activeGameplaySource = null;
  mockApi.resetGambitSandboxSession();
};

const getActiveApi = () =>
  activeGameplaySource === 'mock' ? mockApi : backendApi;

export const fetchActiveGambitSession = async () => {
  const mode = getConfiguredGambitGameplayMode();

  if (mode === 'mock') {
    activeGameplaySource = 'mock';

    return {
      mode,
      session: await mockApi.fetchActiveGambitSession(),
      source: 'mock' as const,
    };
  }

  activeGameplaySource = 'backend';

  return {
    mode,
    session: await backendApi.fetchActiveGambitSession(),
    source: 'backend' as const,
  };
};

export const fetchGambitTables = () => backendApi.fetchGambitTables();

export const fetchGambitTableById = (id: number) =>
  backendApi.fetchGambitTableById(id);

export const createGambitSession = (params: CreateGambitSessionParams) =>
  backendApi.createGambitSession(params);

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
