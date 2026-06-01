export type BackendGambitStatus = 'InProgress' | 'Finished' | 'CashedOut';

export type BackendGambitCard =
  | 'DOBRO_DE_POTASSIO'
  | 'MELANCIDIO'
  | 'CLARIVIDENCIA'
  | 'INVERSAO_GRAVITACIONAL';

export type BackendGambitTable = {
  Active: boolean;
  CardPrice: number;
  Description: string | null;
  EventInterval: number;
  GambitTableId: number | string;
  MaxCardsPurchased: number;
  MinimumCardsPurchased: number;
  MinimumChipsRequired: number;
  Name: string;
  PurchaseMultiplierScale: number;
  TableMultiplier: number;
};

export type BackendGambitGridPosition = {
  Effect: BackendGambitCard | null;
  Points: number;
  Position: number;
};

export type BackendGambitPendingEvent = {
  CardsOffered: BackendGambitCard[];
  EventType: string;
};

export type BackendGambitCurrentGridSnapshot = {
  PendingEvent: BackendGambitPendingEvent | null;
  Revealed: BackendGambitGridPosition[];
  Unrevealed?: BackendGambitGridPosition[];
};

export type BackendGambitSession = {
  AccumulatedPoints: number;
  CardsPurchased: number;
  CreatedAt: string;
  CurrentGridSnapshot: BackendGambitCurrentGridSnapshot | null;
  GambitSessionId: number | string;
  GambitTable: BackendGambitTable | null;
  GambitTableId: number | string;
  ManualFlipsCount: number;
  NextEffect: BackendGambitCard | null;
  Result: string | null;
  Status: BackendGambitStatus;
  UpdatedAt: string;
  UserId: number | string;
};

export type GambitId = number | string;

export type GambitStatusViewModel = 'in-progress' | 'finished' | 'cashed-out';

export type GambitCardEffectViewModel =
  | 'dobro-de-potassio'
  | 'melancidio'
  | 'clarividencia'
  | 'inversao-gravitacional';

export type GambitTableViewModel = {
  active: boolean;
  cardPrice: number;
  description: string | null;
  eventInterval: number;
  gambitTableId: GambitId;
  maxCardsPurchased: number;
  minimumCardsPurchased: number;
  minimumChipsRequired: number;
  name: string;
  purchaseMultiplierScale: number;
  tableId: GambitId;
  tableMultiplier: number;
};

export type GambitGridCardViewModel = {
  effect: GambitCardEffectViewModel | null;
  id: number;
  points: number;
  position: number;
  revealed: boolean;
};

export type GambitPendingEventViewModel = {
  cardsOffered: GambitCardEffectViewModel[];
  eventType: string;
};

export type GambitCurrentGridSnapshotViewModel = {
  cards: GambitGridCardViewModel[];
  pendingEvent: GambitPendingEventViewModel | null;
};

export type GambitSessionViewModel = {
  accumulatedPoints: number;
  cardsPurchased: number;
  createdAt: string;
  gambitSessionId: GambitId;
  gambitTableId: GambitId;
  grid: GambitCurrentGridSnapshotViewModel;
  manualFlipsCount: number;
  nextEffect: GambitCardEffectViewModel | null;
  result: string | null;
  sessionId: GambitId;
  status: GambitStatusViewModel;
  table: GambitTableViewModel | null;
  tableId: GambitId;
  updatedAt: string;
  userId: GambitId;
};

export type GambitViewModel = GambitSessionViewModel;
