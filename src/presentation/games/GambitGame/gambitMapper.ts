import { GAMBIT_CELL_COUNT } from './gambitGameConfig';
import type {
  BackendGambitCard,
  BackendGambitCurrentGridSnapshot,
  BackendGambitEventType,
  BackendGambitGridPosition,
  BackendGambitPendingEvent,
  BackendGambitPendingInteraction,
  BackendGambitSession,
  BackendGambitStatus,
  BackendGambitTable,
  GambitCardEffectViewModel,
  GambitCurrentGridSnapshotViewModel,
  GambitEventTypeViewModel,
  GambitGridCardViewModel,
  GambitId,
  GambitPendingEventViewModel,
  GambitPendingInteractionViewModel,
  GambitSession,
  GambitSessionViewModel,
  GambitStatusViewModel,
  GambitTableViewModel,
  GambitVisualCard,
} from './gambitTypes';

const GAMBIT_CARD_EFFECT_MAP: Record<
  BackendGambitCard,
  GambitCardEffectViewModel
> = {
  ANULACAO_TOTAL: 'anulacao-total',
  BUMIS_INFILTRADOS: 'bumis-infiltrados',
  CABECINHA: 'cabecinha',
  CHRIS_JOKER: 'chris-joker',
  CLARIVIDENCIA: 'clarividencia',
  COLORIDINHO: 'coloridinho',
  CORINGA_DO_INATEL: 'coringa-do-inatel',
  DOBRO_DE_POTASSIO: 'dobro-de-potassio',
  HEADGEAR: 'headgear',
  INVERSAO_GRAVITACIONAL: 'inversao-gravitacional',
  JACKPOT: 'jackpot',
  JONAS_JOKER: 'jonas-joker',
  MELANCIDIO: 'melancidio',
  MENTE_LISA: 'mente-lisa',
  MOSCA_JOKER: 'mosca-joker',
  PAO_COM_OQUE: 'pao-com-oque',
  QUANTO_MAIS_MELHOR: 'quanto-mais-melhor',
  QUANTO_MENOS_MELHOR: 'quanto-menos-melhor',
  RATIMUNDIO: 'ratimundio',
};

const GAMBIT_STATUS_MAP: Record<BackendGambitStatus, GambitStatusViewModel> = {
  CashedOut: 'cashed-out',
  Completed: 'completed',
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
    locked: false,
    points: null,
    position,
    revealed: false,
  }));

const requireFiniteNumber = (value: number, fieldName: string) => {
  if (!Number.isFinite(value)) {
    throw new Error(`Invalid Gambit ${fieldName}: expected a finite number.`);
  }

  return value;
};

const mapOptionalFiniteNumber = (
  value: number | null | undefined,
  fieldName: string
) => {
  if (value == null) {
    return null;
  }

  return requireFiniteNumber(value, fieldName);
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

const requireThreeCards = (
  cards: BackendGambitCard[] | undefined,
  fieldName: string
) => {
  if (!Array.isArray(cards)) {
    throw new Error(`Invalid Gambit PendingEvent.${fieldName}.`);
  }

  if (cards.length !== 3) {
    throw new Error(`Invalid Gambit PendingEvent.${fieldName} length.`);
  }

  return cards.map((card) => {
    const mappedCard = mapBackendGambitCardToViewModel(card);

    if (!mappedCard) {
      throw new Error(`Invalid Gambit PendingEvent.${fieldName} card.`);
    }

    return mappedCard;
  }) as [
    GambitCardEffectViewModel,
    GambitCardEffectViewModel,
    GambitCardEffectViewModel,
  ];
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
  eventType: BackendGambitEventType | null | undefined
): GambitEventTypeViewModel | null => {
  if (eventType == null) {
    return null;
  }

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
    eventInterval: mapOptionalFiniteNumber(
      table.EventInterval,
      'EventInterval'
    ),
    gambitTableId: tableId,
    maxCardsPurchased: requireFiniteNumber(
      table.MaxCardsPurchased,
      'MaxCardsPurchased'
    ),
    minimumCardsPurchased: requireFiniteNumber(
      table.MinimumCardsPurchased,
      'MinimumCardsPurchased'
    ),
    minimumChipsRequired: mapOptionalFiniteNumber(
      table.MinimumChipsRequired,
      'MinimumChipsRequired'
    ),
    name: table.Name,
    purchaseMultiplierScale: mapOptionalFiniteNumber(
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

  return {
    badOptions: requireThreeCards(pendingEvent.BadOptions, 'BadOptions'),
    eventType: mapBackendGambitEventTypeToViewModel(pendingEvent.EventType),
    goodOptions: requireThreeCards(pendingEvent.GoodOptions, 'GoodOptions'),
  };
};

export const mapBackendGambitPendingInteractionToViewModel = (
  pendingInteraction: BackendGambitPendingInteraction | null | undefined
): GambitPendingInteractionViewModel | null => {
  if (!pendingInteraction) {
    return null;
  }

  const effect = mapBackendGambitCardToViewModel(pendingInteraction.Effect);

  if (!effect) {
    throw new Error('Invalid Gambit PendingInteraction.Effect.');
  }

  return {
    action: pendingInteraction.Action,
    effect,
    requiredSelections: requireFiniteNumber(
      pendingInteraction.RequiredSelections,
      'PendingInteraction.RequiredSelections'
    ),
    selectedPositions: pendingInteraction.SelectedPositions.map((position) =>
      requireGridPosition(position)
    ),
  };
};

const mapBackendGambitRevealedPositionToViewModel = (
  position: BackendGambitGridPosition
): GambitGridCardViewModel => {
  const visualPosition = requireGridPosition(position.Position);

  return {
    effect: mapBackendGambitCardToViewModel(position.Effect),
    id: visualPosition,
    locked: Boolean(position.Locked),
    points: mapOptionalFiniteNumber(position.Points, 'Points'),
    position: visualPosition,
    revealed: true,
  };
};

const mapBackendGambitUnrevealedPositionToViewModel = (
  position: BackendGambitGridPosition
): GambitGridCardViewModel => {
  const visualPosition = requireGridPosition(position.Position);

  return {
    effect: null,
    id: visualPosition,
    locked: Boolean(position.Locked),
    points: null,
    position: visualPosition,
    revealed: false,
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
      pendingInteraction: null,
    };
  }

  const unrevealedPositions = snapshot.Unrevealed ?? [];
  const revealedPositions = snapshot.Revealed ?? [];

  if (!Array.isArray(unrevealedPositions)) {
    throw new Error('Invalid Gambit Grid.Unrevealed.');
  }

  if (!Array.isArray(revealedPositions)) {
    throw new Error('Invalid Gambit Grid.Revealed.');
  }

  const seenPositions = new Set<number>();

  unrevealedPositions.forEach((unrevealedPosition) => {
    const unrevealedCard =
      mapBackendGambitUnrevealedPositionToViewModel(unrevealedPosition);

    if (seenPositions.has(unrevealedCard.position)) {
      throw new Error(
        `Invalid Gambit grid: duplicate Position "${unrevealedCard.position}".`
      );
    }

    seenPositions.add(unrevealedCard.position);
    cards[unrevealedCard.position] = unrevealedCard;
  });

  revealedPositions.forEach((revealedPosition) => {
    const revealedCard =
      mapBackendGambitRevealedPositionToViewModel(revealedPosition);

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
    pendingInteraction: mapBackendGambitPendingInteractionToViewModel(
      snapshot.PendingInteraction
    ),
  };
};

const getSessionGridSnapshot = (session: BackendGambitSession) =>
  session.Grid ?? session.CurrentGridSnapshot ?? null;

export const mapBackendGambitSessionToViewModel = (
  session: BackendGambitSession
): GambitSessionViewModel => {
  const sessionId = requireId(session.GambitSessionId, 'GambitSessionId');
  const tableId = requireId(session.GambitTableId, 'GambitTableId');
  const burnSlotsAvailable = requireFiniteNumber(
    session.BurnSlotsAvailable,
    'BurnSlotsAvailable'
  );
  const manualFlipsCount = requireFiniteNumber(
    session.ManualFlipsCount,
    'ManualFlipsCount'
  );

  return {
    accumulatedPoints: requireFiniteNumber(
      session.AccumulatedPoints,
      'AccumulatedPoints'
    ),
    burnSlotsAvailable,
    burnsRemaining: Math.max(
      0,
      session.BurnsRemaining ?? burnSlotsAvailable - manualFlipsCount
    ),
    cardsPurchased: requireFiniteNumber(
      session.CardsPurchased,
      'CardsPurchased'
    ),
    createdAt: session.CreatedAt ?? '',
    firstEventFlip: mapOptionalFiniteNumber(
      session.FirstEventFlip,
      'FirstEventFlip'
    ),
    gambitSessionId: sessionId,
    gambitTableId: tableId,
    grid: mapBackendGambitGridToViewModel(getSessionGridSnapshot(session)),
    manualFlipsCount,
    nextEffect: mapBackendGambitCardToViewModel(session.NextEffect),
    result: mapOptionalFiniteNumber(session.Result, 'Result'),
    secondEventFlip: mapOptionalFiniteNumber(
      session.SecondEventFlip,
      'SecondEventFlip'
    ),
    sessionId,
    status: mapBackendGambitStatusToViewModel(session.Status),
    table: session.GambitTable
      ? mapBackendGambitTableToViewModel(session.GambitTable)
      : null,
    tableId,
    updatedAt: session.UpdatedAt ?? session.CreatedAt ?? '',
    userId: requireId(session.UserId, 'UserId'),
  };
};

export const mapGambitSessionToVisualCards = (
  session: GambitSession,
  previewedCardId: number | null = null
): GambitVisualCard[] =>
  mapBackendGambitGridToViewModel(getSessionGridSnapshot(session)).cards.map(
    (card) => ({
      ...card,
      previewed: card.id === previewedCardId,
    })
  );

export const mapGambitSessionToViewModel = mapBackendGambitSessionToViewModel;
