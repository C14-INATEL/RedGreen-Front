import type {
  BackendGambitCurrentGridSnapshot,
  BackendGambitGridPosition,
  BackendGambitPendingEvent,
  BackendGambitSession,
  BackendGambitTable,
} from '../src/presentation/games/GambitGame/gambitTypes';

export const buildBackendGambitTable = (
  overrides: Partial<BackendGambitTable> = {}
): BackendGambitTable => ({
  Active: true,
  CardPrice: 10,
  Description: 'Gambit table used by mapper tests',
  EventInterval: 3,
  GambitTableId: 17,
  MaxCardsPurchased: 25,
  MinimumCardsPurchased: 1,
  MinimumChipsRequired: 10,
  Name: 'Gambit Test Table',
  PurchaseMultiplierScale: 1.2,
  TableMultiplier: 2,
  ...overrides,
});

export const buildBackendGambitGridPosition = (
  overrides: Partial<BackendGambitGridPosition> = {}
): BackendGambitGridPosition => ({
  Effect: 'DOBRO_DE_POTASSIO',
  Points: 25,
  Position: 0,
  ...overrides,
});

export const buildBackendGambitPendingEvent = (
  overrides: Partial<BackendGambitPendingEvent> = {}
): BackendGambitPendingEvent => ({
  CardsOffered: ['DOBRO_DE_POTASSIO', 'MELANCIDIO'],
  EventType: 'CardChoice',
  ...overrides,
});

export const buildBackendGambitCurrentGridSnapshot = (
  overrides: Partial<BackendGambitCurrentGridSnapshot> = {}
): BackendGambitCurrentGridSnapshot => ({
  PendingEvent: null,
  Revealed: [],
  ...overrides,
});

export const buildBackendGambitSession = (
  overrides: Partial<BackendGambitSession> = {}
): BackendGambitSession => ({
  AccumulatedPoints: 0,
  CardsPurchased: 5,
  CreatedAt: '2026-06-01T12:00:00.000Z',
  CurrentGridSnapshot: buildBackendGambitCurrentGridSnapshot(),
  GambitSessionId: 101,
  GambitTable: buildBackendGambitTable(),
  GambitTableId: 17,
  ManualFlipsCount: 0,
  NextEffect: null,
  Result: null,
  Status: 'InProgress',
  UpdatedAt: '2026-06-01T12:00:00.000Z',
  UserId: 'user-7',
  ...overrides,
});
