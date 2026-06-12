export type GambitId = number | string;

export type GambitSessionStatus = 'InProgress' | 'Finished' | 'CashedOut';

export type GambitCardEffect =
  | 'DOBRO_DE_POTASSIO'
  | 'MELANCIDIO'
  | 'INVERSAO_GRAVITACIONAL'
  | 'ANULACAO_TOTAL'
  | 'COLORIDINHO'
  | 'HEADGEAR'
  | 'CLARIVIDENCIA'
  | 'CABECINHA'
  | 'JONAS_JOKER'
  | 'CHRIS_JOKER'
  | 'QUANTO_MAIS_MELHOR'
  | 'QUANTO_MENOS_MELHOR'
  | 'MENTE_LISA'
  | 'MOSCA_JOKER'
  | 'JACKPOT'
  | 'RATIMUNDIO'
  | 'PAO_COM_OQUE'
  | 'BUMIS_INFILTRADOS'
  | 'CORINGA_DO_INATEL';

export type GambitCard = GambitCardEffect;

export type GambitCardNature = 'Good' | 'Bad' | 'Neutral';

export type GambitTable = {
  Active: boolean;
  CardPrice: number;
  Description: string | null;
  EventInterval?: number | null;
  GambitTableId: GambitId;
  MaxCardsPurchased: number;
  MinimumCardsPurchased: number;
  MinimumChipsRequired: number | null;
  Name: string;
  PurchaseMultiplierScale?: number | null;
  TableMultiplier: number;
};

export type GambitGridCard = {
  Effect?: GambitCardEffect | null;
  Locked?: boolean;
  Points?: number | null;
  Position: number;
};

export type GambitPendingEvent = {
  BadOptions: GambitCard[];
  CardsOffered?: GambitCard[];
  EventType?: GambitCardNature | null;
  GoodOptions: GambitCard[];
};

export type GambitPendingInteractionAction =
  | 'SELECT_CARD'
  | 'SELECT_MULTIPLE_CARDS';

export type GambitPendingInteraction = {
  Action: GambitPendingInteractionAction;
  Effect: GambitCardEffect;
  RequiredSelections: number;
  SelectedPositions: number[];
};

export type GambitInteractionPeekResult =
  | {
      Effect: GambitCardEffect | null;
      Locked?: boolean;
      Points: number | null;
      Position: number;
    }
  | {
      AtLeastOneBad: boolean;
    };

export type GambitGridSnapshot = {
  PendingEvent: GambitPendingEvent | null;
  PendingInteraction: GambitPendingInteraction | null;
  Revealed: GambitGridCard[];
  Unrevealed: GambitGridCard[];
};

export type GambitSession = {
  AccumulatedPoints: number;
  BurnSlotsAvailable: number;
  BurnsRemaining?: number;
  CardsPurchased: number;
  CreatedAt?: string;
  CurrentGridSnapshot?: GambitGridSnapshot | null;
  FirstEventFlip?: number;
  GambitSessionId: GambitId;
  GambitTable?: GambitTable | null;
  GambitTableId: GambitId;
  Grid?: GambitGridSnapshot | null;
  ManualFlipsCount: number;
  NextEffect: GambitCardEffect | null;
  Result: number | null;
  SecondEventFlip?: number;
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
    | 'BurnSlotsAvailable'
    | 'BurnsRemaining'
    | 'CurrentGridSnapshot'
    | 'Grid'
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
export type BackendGambitPendingInteraction = GambitPendingInteraction;
export type BackendGambitCurrentGridSnapshot = GambitGridSnapshot;
export type BackendGambitSession = GambitSession;

export type GambitStatusViewModel = 'in-progress' | 'finished' | 'cashed-out';

export type GambitCardEffectViewModel =
  | 'dobro-de-potassio'
  | 'melancidio'
  | 'inversao-gravitacional'
  | 'anulacao-total'
  | 'coloridinho'
  | 'headgear'
  | 'clarividencia'
  | 'cabecinha'
  | 'jonas-joker'
  | 'chris-joker'
  | 'quanto-mais-melhor'
  | 'quanto-menos-melhor'
  | 'mente-lisa'
  | 'mosca-joker'
  | 'jackpot'
  | 'ratimundio'
  | 'pao-com-oque'
  | 'bumis-infiltrados'
  | 'coringa-do-inatel';

export type GambitEventTypeViewModel = 'good' | 'bad' | 'neutral';

export type GambitTableViewModel = {
  active: boolean;
  cardPrice: number;
  description: string | null;
  eventInterval: number | null;
  gambitTableId: GambitId;
  maxCardsPurchased: number;
  minimumCardsPurchased: number;
  minimumChipsRequired: number | null;
  name: string;
  purchaseMultiplierScale: number | null;
  tableId: GambitId;
  tableMultiplier: number;
};

export type GambitGridCardViewModel = {
  effect: GambitCardEffectViewModel | null;
  id: number;
  locked: boolean;
  points: number | null;
  position: number;
  revealed: boolean;
};

export type GambitVisualCard = GambitGridCardViewModel & {
  previewed: boolean;
};

export type GambitPendingEventViewModel = {
  badOptions: [
    GambitCardEffectViewModel,
    GambitCardEffectViewModel,
    GambitCardEffectViewModel,
  ];
  eventType: GambitEventTypeViewModel | null;
  goodOptions: [
    GambitCardEffectViewModel,
    GambitCardEffectViewModel,
    GambitCardEffectViewModel,
  ];
};

export type GambitPendingInteractionViewModel = {
  action: GambitPendingInteractionAction;
  effect: GambitCardEffectViewModel;
  requiredSelections: number;
  selectedPositions: number[];
};

export type GambitCurrentGridSnapshotViewModel = {
  cards: GambitGridCardViewModel[];
  pendingEvent: GambitPendingEventViewModel | null;
  pendingInteraction: GambitPendingInteractionViewModel | null;
};

export type GambitSessionViewModel = {
  accumulatedPoints: number;
  burnSlotsAvailable: number;
  burnsRemaining: number;
  cardsPurchased: number;
  createdAt: string;
  firstEventFlip: number | null;
  gambitSessionId: GambitId;
  gambitTableId: GambitId;
  grid: GambitCurrentGridSnapshotViewModel;
  manualFlipsCount: number;
  nextEffect: GambitCardEffectViewModel | null;
  result: number | null;
  secondEventFlip: number | null;
  sessionId: GambitId;
  status: GambitStatusViewModel;
  table: GambitTableViewModel | null;
  tableId: GambitId;
  updatedAt: string;
  userId: GambitId;
};

export type GambitViewModel = GambitSessionViewModel;
