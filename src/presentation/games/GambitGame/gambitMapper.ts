import { GAMBIT_CELL_COUNT } from './gambitGameConfig';
import type {
  BackendGambitCard,
  BackendGambitCurrentGridSnapshot,
  BackendGambitEventType,
  BackendGambitGridPosition,
  BackendGambitPendingEvent,
  BackendGambitSession,
  BackendGambitStatus,
  BackendGambitTable,
  GambitCardEffectViewModel,
  GambitCurrentGridSnapshotViewModel,
  GambitEventTypeViewModel,
  GambitGridCardViewModel,
  GambitId,
  GambitPendingEventViewModel,
  GambitSessionViewModel,
  GambitStatusViewModel,
  GambitTableViewModel,
} from './gambitTypes';

const GAMBIT_CARD_EFFECT_MAP: Record<
  BackendGambitCard,
  GambitCardEffectViewModel
> = {
  CLARIVIDENCIA: 'clarividencia',
  DOBRO_DE_POTASSIO: 'dobro-de-potassio',
  INVERSAO_GRAVITACIONAL: 'inversao-gravitacional',
  MELANCIDIO: 'melancidio',
};

const GAMBIT_STATUS_MAP: Record<BackendGambitStatus, GambitStatusViewModel> = {
  CashedOut: 'cashed-out',
  Finished: 'finished',
  InProgress: 'in-progress',
};

const GAMBIT_EVENT_TYPE_MAP: Record<
  BackendGambitEventType,
  GambitEventTypeViewModel
> = {
  Bad: 'bad',
  Good: 'good',
  Neutral: 'neutral',
};

const createHiddenGambitGridCards = (): GambitGridCardViewModel[] =>
  Array.from({ length: GAMBIT_CELL_COUNT }, (_, position) => ({
    effect: null,
    id: position,
    points: 0,
    position,
    revealed: false,
  }));

const requireFiniteNumber = (value: number, fieldName: string) => {
  if (!Number.isFinite(value)) {
    throw new Error(`Invalid Gambit ${fieldName}: expected a finite number.`);
  }

  return value;
};

const requireGridPosition = (value: number) => {
  if (!Number.isInteger(value) || value < 0 || value >= GAMBIT_CELL_COUNT) {
    throw new Error(
      `Invalid Gambit grid Position "${value}". Expected 0-${GAMBIT_CELL_COUNT - 1}.`
    );
  }

  return value;
};

const requireId = (value: GambitId, fieldName: string): GambitId => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string' && value.trim()) {
    return value;
  }

  throw new Error(`Invalid Gambit ${fieldName}: expected a valid id.`);
};

export const mapBackendGambitCardToViewModel = (
  card: BackendGambitCard | null | undefined
): GambitCardEffectViewModel | null => {
  if (card == null) {
    return null;
  }

  const mappedCard = GAMBIT_CARD_EFFECT_MAP[card];

  if (!mappedCard) {
    throw new Error(`Unknown Gambit card/effect "${String(card)}".`);
  }

  return mappedCard;
};

export const mapBackendGambitStatusToViewModel = (
  status: BackendGambitStatus
): GambitStatusViewModel => {
  const mappedStatus = GAMBIT_STATUS_MAP[status];

  if (!mappedStatus) {
    throw new Error(`Unknown Gambit status "${String(status)}".`);
  }

  return mappedStatus;
};

export const mapBackendGambitEventTypeToViewModel = (
  eventType: BackendGambitEventType
): GambitEventTypeViewModel => {
  const mappedEventType = GAMBIT_EVENT_TYPE_MAP[eventType];

  if (!mappedEventType) {
    throw new Error(`Unknown Gambit event type "${String(eventType)}".`);
  }

  return mappedEventType;
};

export const mapBackendGambitTableToViewModel = (
  table: BackendGambitTable
): GambitTableViewModel => {
  const tableId = requireId(table.GambitTableId, 'GambitTableId');

  return {
    active: table.Active,
    cardPrice: requireFiniteNumber(table.CardPrice, 'CardPrice'),
    description: table.Description ?? null,
    eventInterval: requireFiniteNumber(table.EventInterval, 'EventInterval'),
    gambitTableId: tableId,
    maxCardsPurchased: requireFiniteNumber(
      table.MaxCardsPurchased,
      'MaxCardsPurchased'
    ),
    minimumCardsPurchased: requireFiniteNumber(
      table.MinimumCardsPurchased,
      'MinimumCardsPurchased'
    ),
    minimumChipsRequired:
      table.MinimumChipsRequired == null
        ? null
        : requireFiniteNumber(
            table.MinimumChipsRequired,
            'MinimumChipsRequired'
          ),
    name: table.Name,
    purchaseMultiplierScale: requireFiniteNumber(
      table.PurchaseMultiplierScale,
      'PurchaseMultiplierScale'
    ),
    tableId,
    tableMultiplier: requireFiniteNumber(
      table.TableMultiplier,
      'TableMultiplier'
    ),
  };
};

export const mapBackendGambitPendingEventToViewModel = (
  pendingEvent: BackendGambitPendingEvent | null | undefined
): GambitPendingEventViewModel | null => {
  if (!pendingEvent) {
    return null;
  }

  if (!Array.isArray(pendingEvent.CardsOffered)) {
    throw new Error('Invalid Gambit PendingEvent.CardsOffered.');
  }

  if (pendingEvent.CardsOffered.length !== 3) {
    throw new Error('Invalid Gambit PendingEvent.CardsOffered length.');
  }

  const cardsOffered = pendingEvent.CardsOffered.map((card) => {
    const mappedCard = mapBackendGambitCardToViewModel(card);

    if (!mappedCard) {
      throw new Error('Invalid Gambit PendingEvent card.');
    }

    return mappedCard;
  }) as GambitPendingEventViewModel['cardsOffered'];

  return {
    cardsOffered,
    eventType: mapBackendGambitEventTypeToViewModel(pendingEvent.EventType),
  };
};

const mapBackendGambitGridPositionToViewModel = (
  position: BackendGambitGridPosition
): GambitGridCardViewModel => {
  const visualPosition = requireGridPosition(position.Position);

  return {
    effect: mapBackendGambitCardToViewModel(position.Effect),
    id: visualPosition,
    points: requireFiniteNumber(position.Points, 'Points'),
    position: visualPosition,
    revealed: true,
  };
};

export const mapBackendGambitGridToViewModel = (
  snapshot: BackendGambitCurrentGridSnapshot | null | undefined
): GambitCurrentGridSnapshotViewModel => {
  const cards = createHiddenGambitGridCards();

  if (!snapshot) {
    return {
      cards,
      pendingEvent: null,
    };
  }

  const revealedPositions = snapshot.Revealed ?? [];

  if (!Array.isArray(revealedPositions)) {
    throw new Error('Invalid Gambit CurrentGridSnapshot.Revealed.');
  }

  const seenPositions = new Set<number>();

  revealedPositions.forEach((revealedPosition) => {
    const revealedCard =
      mapBackendGambitGridPositionToViewModel(revealedPosition);

    if (seenPositions.has(revealedCard.position)) {
      throw new Error(
        `Invalid Gambit grid: duplicate Position "${revealedCard.position}".`
      );
    }

    seenPositions.add(revealedCard.position);
    cards[revealedCard.position] = revealedCard;
  });

  return {
    cards,
    pendingEvent: mapBackendGambitPendingEventToViewModel(
      snapshot.PendingEvent
    ),
  };
};

export const mapBackendGambitSessionToViewModel = (
  session: BackendGambitSession
): GambitSessionViewModel => {
  const sessionId = requireId(session.GambitSessionId, 'GambitSessionId');
  const tableId = requireId(session.GambitTableId, 'GambitTableId');

  return {
    accumulatedPoints: requireFiniteNumber(
      session.AccumulatedPoints,
      'AccumulatedPoints'
    ),
    cardsPurchased: requireFiniteNumber(
      session.CardsPurchased,
      'CardsPurchased'
    ),
    createdAt: session.CreatedAt,
    gambitSessionId: sessionId,
    gambitTableId: tableId,
    grid: mapBackendGambitGridToViewModel(session.CurrentGridSnapshot),
    manualFlipsCount: requireFiniteNumber(
      session.ManualFlipsCount,
      'ManualFlipsCount'
    ),
    nextEffect: mapBackendGambitCardToViewModel(session.NextEffect),
    result:
      session.Result == null
        ? null
        : requireFiniteNumber(session.Result, 'Result'),
    sessionId,
    status: mapBackendGambitStatusToViewModel(session.Status),
    table: session.GambitTable
      ? mapBackendGambitTableToViewModel(session.GambitTable)
      : null,
    tableId,
    updatedAt: session.UpdatedAt,
    userId: requireId(session.UserId, 'UserId'),
  };
};
