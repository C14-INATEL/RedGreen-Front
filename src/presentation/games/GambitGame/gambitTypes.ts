export type GambitId = number | string;

export type GambitSessionStatus = 'InProgress' | 'Finished' | 'CashedOut';

export type GambitCardEffect =
  | 'DOBRO_DE_POTASSIO'
  | 'MELANCIDIO'
  | 'CLARIVIDENCIA'
  | 'INVERSAO_GRAVITACIONAL';

export type GambitCard = GambitCardEffect;

export type GambitCardNature = 'Good' | 'Bad' | 'Neutral';

export type GambitTable = {
  Active: boolean;
  CardPrice: number;
  Description: string | null;
  EventInterval: number;
  GambitTableId: GambitId;
  MaxCardsPurchased: number;
  MinimumCardsPurchased: number;
  MinimumChipsRequired: number | null;
  Name: string;
  PurchaseMultiplierScale: number;
  TableMultiplier: number;
};

export type GambitGridCard = {
  Effect: GambitCardEffect | null;
  Points: number | null;
  Position: number;
};

export type GambitPendingEvent = {
  CardsOffered: [GambitCard, GambitCard, GambitCard];
  EventType: GambitCardNature;
};

export type GambitGridSnapshot = {
  PendingEvent: GambitPendingEvent | null;
  Revealed: GambitGridCard[];
  Unrevealed: GambitGridCard[];
};

export type GambitSession = {
  AccumulatedPoints: number;
  CardsPurchased: number;
  CreatedAt?: string;
  CurrentGridSnapshot: GambitGridSnapshot | null;
  GambitSessionId: GambitId;
  GambitTable?: GambitTable | null;
  GambitTableId: GambitId;
  ManualFlipsCount: number;
  NextEffect: GambitCardEffect | null;
  Result: number | null;
  Status: GambitSessionStatus;
  UpdatedAt?: string;
  UserId: GambitId;
};

export type CreateGambitSessionPayload = {
  CardsPurchased: number;
};

export type UpdateGambitSessionPayload = Partial<
  Pick<
    GambitSession,
    | 'AccumulatedPoints'
    | 'CurrentGridSnapshot'
    | 'ManualFlipsCount'
    | 'NextEffect'
    | 'Result'
    | 'Status'
  >
>;

export type BackendGambitStatus = GambitSessionStatus;
export type BackendGambitCard = GambitCardEffect;
export type BackendGambitEventType = GambitCardNature;
export type BackendGambitTable = GambitTable;
export type BackendGambitGridPosition = GambitGridCard;
export type BackendGambitPendingEvent = GambitPendingEvent;
export type BackendGambitCurrentGridSnapshot = GambitGridSnapshot;
export type BackendGambitSession = GambitSession;

export type GambitStatusViewModel = 'in-progress' | 'finished' | 'cashed-out';

export type GambitCardEffectViewModel =
  | 'dobro-de-potassio'
  | 'melancidio'
  | 'clarividencia'
  | 'inversao-gravitacional';

export type GambitEventTypeViewModel = 'good' | 'bad' | 'neutral';

export type GambitTableViewModel = {
  active: boolean;
  cardPrice: number;
  description: string | null;
  eventInterval: number;
  gambitTableId: GambitId;
  maxCardsPurchased: number;
  minimumCardsPurchased: number;
  minimumChipsRequired: number | null;
  name: string;
  purchaseMultiplierScale: number;
  tableId: GambitId;
  tableMultiplier: number;
};

export type GambitGridCardViewModel = {
  effect: GambitCardEffectViewModel | null;
  id: number;
  points: number | null;
  position: number;
  revealed: boolean;
};

export type GambitVisualCard = GambitGridCardViewModel & {
  previewed: boolean;
};

export type GambitPendingEventViewModel = {
  cardsOffered: [
    GambitCardEffectViewModel,
    GambitCardEffectViewModel,
    GambitCardEffectViewModel,
  ];
  eventType: GambitEventTypeViewModel;
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
  result: number | null;
  sessionId: GambitId;
  status: GambitStatusViewModel;
  table: GambitTableViewModel | null;
  tableId: GambitId;
  updatedAt: string;
  userId: GambitId;
};

export type GambitViewModel = GambitSessionViewModel;
