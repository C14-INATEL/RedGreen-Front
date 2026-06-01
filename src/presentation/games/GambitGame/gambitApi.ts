import { mapBackendGambitSessionToViewModel } from './gambitMapper';
import type {
  BackendGambitSession,
  BackendGambitTable,
  GambitSessionViewModel,
} from './gambitTypes';

const createBackendGambitTableStub = (): BackendGambitTable => ({
  Active: true,
  CardPrice: 10,
  Description: 'Tabela local usada ate o contrato HTTP do Gambit entrar.',
  EventInterval: 3,
  GambitTableId: 1,
  MaxCardsPurchased: 25,
  MinimumCardsPurchased: 1,
  MinimumChipsRequired: 10,
  Name: 'Gambit',
  PurchaseMultiplierScale: 1,
  TableMultiplier: 1,
});

export const createMockBackendGambitSession = (): BackendGambitSession => ({
  AccumulatedPoints: 0,
  CardsPurchased: 0,
  CreatedAt: '2026-06-01T00:00:00.000Z',
  CurrentGridSnapshot: {
    PendingEvent: null,
    Revealed: [],
  },
  GambitSessionId: 'local-gambit-session',
  GambitTable: createBackendGambitTableStub(),
  GambitTableId: 1,
  ManualFlipsCount: 0,
  NextEffect: null,
  Result: null,
  Status: 'InProgress',
  UpdatedAt: '2026-06-01T00:00:00.000Z',
  UserId: 'local-user',
});

export const createMockGambitViewModel = (): GambitSessionViewModel =>
  mapBackendGambitSessionToViewModel(createMockBackendGambitSession());

export const getGambitSessionStub = async (): Promise<GambitSessionViewModel> =>
  createMockGambitViewModel();
