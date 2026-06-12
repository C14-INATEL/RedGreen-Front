import axios from 'axios';
import { motion } from 'framer-motion';
import { useEffect, useMemo, useRef, useState } from 'react';
import { RewardChoiceModal, type RewardCardOption } from './cardReward';
import { GambitBoard } from './GambitGame/GambitBoard';
import { GambitRevealCinematic } from './GambitGame/GambitRevealCinematic';
import {
  burnActiveGambitCard,
  cashOutActiveGambitSession,
  getGambitResolveEffectPeekResult,
  getGambitResolveEffectSession,
  resolveActiveGambitEffect,
  resolveActiveGambitEvent,
} from './GambitGame/gambitGameplayClient';
import {
  applyGambitCashOutResponseToSession,
  getGambitBurnsRemaining,
  isFinalGambitSessionStatus,
  shouldAutoCashOutGambitSession,
} from './GambitGame/gambitAutoCashOut';
import { getGambitEffectPresentation } from './GambitGame/gambitEffectPresentation';
import {
  mapBackendGambitCardToViewModel,
  mapGambitSessionToVisualCards,
} from './GambitGame/gambitMapper';
import {
  createRewardChoiceSessionFromPendingEvent,
  parseGambitPendingEventOptionId,
} from './GambitGame/gambitPendingEventRewardAdapter';
import { PreparedGambitEffectPanel } from './GambitGame/PreparedGambitEffectPanel';
import type {
  GambitCardEffect,
  GambitGridSnapshot,
  GambitInteractionPeekResult,
  GambitPendingInteraction,
  GambitSession,
  GambitVisualCard,
} from './GambitGame/gambitTypes';

export type GambitProps = {
  initialSession?: GambitSession;
  onNewGame?: () => void;
};

type GambitVisualState = {
  cards: ReturnType<typeof mapGambitSessionToVisualCards>;
  preparedEffect: GambitCardEffect | null;
  previewedCardId: number | null;
};

type PendingEventSelection = {
  BadIndex: number | null;
  GoodIndex: number | null;
};

type PendingEventResolution = PendingEventSelection & {
  sessionId: string;
};

const emptyPendingEventSelection: PendingEventSelection = {
  BadIndex: null,
  GoodIndex: null,
};

const PENDING_EVENT_PRESENTATION_DELAY_MS = 350;
const GAMBIT_GAMEPLAY_ROUTES_NOT_FOUND_MESSAGE =
  'Rotas de gameplay do Gambit não encontradas. Verifique se o backend está na branch feat/gambit-game-logic.';
const GAMBIT_SESSION_EXPIRED_MESSAGE = 'Sessão expirada. Faça login novamente.';

const getGambitActionErrorMessage = (
  error: unknown,
  fallbackMessage: string
) => {
  if (axios.isAxiosError(error) && error.response?.status === 404) {
    return GAMBIT_GAMEPLAY_ROUTES_NOT_FOUND_MESSAGE;
  }

  if (axios.isAxiosError(error) && error.response?.status === 401) {
    return GAMBIT_SESSION_EXPIRED_MESSAGE;
  }

  return fallbackMessage;
};

const getGambitSessionGridSnapshot = (
  session: GambitSession | null
): GambitGridSnapshot | null =>
  session?.Grid ?? session?.CurrentGridSnapshot ?? null;

const mergeSelectedPositions = (
  pendingInteraction: GambitPendingInteraction | null,
  localSelections: number[]
) => {
  const selectedPositions = new Set<number>(
    pendingInteraction?.SelectedPositions ?? []
  );

  localSelections.forEach((position) => {
    selectedPositions.add(position);
  });

  return [...selectedPositions];
};

const formatEffectName = (effect: GambitCardEffect) =>
  getGambitEffectPresentation(effect).title.toUpperCase();

const formatPeekResult = (peekResult: GambitInteractionPeekResult | null) => {
  if (!peekResult) {
    return null;
  }

  if ('AtLeastOneBad' in peekResult) {
    return peekResult.AtLeastOneBad ? 'Ha carta ruim' : 'Sem carta ruim';
  }

  if (peekResult.Effect) {
    return `Carta ${peekResult.Position}: ${formatEffectName(peekResult.Effect)}`;
  }

  const points = peekResult.Points ?? 0;

  return `Carta ${peekResult.Position}: ${points > 0 ? '+' : ''}${points}`;
};

const applyPeekResultToVisualCards = (
  cards: GambitVisualCard[],
  peekResult: GambitInteractionPeekResult | null
) => {
  if (!peekResult || !('Position' in peekResult)) {
    return cards;
  }

  return cards.map((card) =>
    card.position === peekResult.Position
      ? {
          ...card,
          effect: mapBackendGambitCardToViewModel(peekResult.Effect),
          points: peekResult.Points,
          previewed: true,
        }
      : card
  );
};

export const Gambit = ({ initialSession, onNewGame }: GambitProps = {}) => {
  const [session, setSession] = useState<GambitSession | null>(
    () => initialSession ?? null
  );
  const [actionErrorMessage, setActionErrorMessage] = useState<string | null>(
    null
  );
  const [isGameActionPending, setIsGameActionPending] = useState(false);
  const [previewedCardId, setPreviewedCardId] = useState<number | null>(null);
  const [isRevealAnimationLocked, setIsRevealAnimationLocked] = useState(false);
  const [pendingEventSelection, setPendingEventSelection] =
    useState<PendingEventSelection>(emptyPendingEventSelection);
  const [pendingInteractionSelections, setPendingInteractionSelections] =
    useState<number[]>([]);
  const [hasPendingEventTableSettled, setHasPendingEventTableSettled] =
    useState(false);
  const [isPendingEventSelectionLocked, setIsPendingEventSelectionLocked] =
    useState(false);
  const [lastInteractionResult, setLastInteractionResult] =
    useState<GambitInteractionPeekResult | null>(null);
  const [revealedCinematicCard, setRevealedCinematicCard] =
    useState<GambitVisualCard | null>(null);
  const [isPreparedEffectPreviewOpen, setIsPreparedEffectPreviewOpen] =
    useState(false);
  const [
    isPendingEventPresentationDelayed,
    setIsPendingEventPresentationDelayed,
  ] = useState(false);
  const [isAutoCashOutPending, setIsAutoCashOutPending] = useState(false);
  const revealAnimationLockedRef = useRef(false);
  const autoCashOutSessionIdRef = useRef<string | null>(null);
  const isAutoCashOutPendingRef = useRef(false);
  const pendingEventResolutionRef = useRef<PendingEventResolution | null>(null);
  const pendingEventPresentationDelayTimeoutRef = useRef<number | null>(null);
  const snapshot = getGambitSessionGridSnapshot(session);
  const pendingEvent = snapshot?.PendingEvent ?? null;
  const pendingInteraction = snapshot?.PendingInteraction ?? null;
  const pendingInteractionSelectedPositions = useMemo(
    () =>
      mergeSelectedPositions(pendingInteraction, pendingInteractionSelections),
    [pendingInteraction, pendingInteractionSelections]
  );
  const burnsRemaining = session ? getGambitBurnsRemaining(session) : 0;
  const cards = useMemo(() => {
    if (!session) {
      return [];
    }

    return applyPeekResultToVisualCards(
      mapGambitSessionToVisualCards(session, previewedCardId),
      lastInteractionResult
    );
  }, [lastInteractionResult, previewedCardId, session]);
  const visualState: GambitVisualState = {
    cards,
    preparedEffect: session?.NextEffect ?? null,
    previewedCardId,
  };
  const preparedEffectPreviewCard = useMemo(() => {
    if (!isPreparedEffectPreviewOpen || !visualState.preparedEffect) {
      return null;
    }

    const effectViewModel = mapBackendGambitCardToViewModel(
      visualState.preparedEffect
    );

    if (!effectViewModel) {
      return null;
    }

    return {
      effect: effectViewModel,
      id: -1,
      locked: false,
      points: null,
      position: -1,
      previewed: false,
      revealed: true,
    } satisfies GambitVisualCard;
  }, [isPreparedEffectPreviewOpen, visualState.preparedEffect]);
  const totalScore = session?.AccumulatedPoints ?? 0;
  const pendingEventRewardSessionId = session
    ? `gambit-pending-event-${String(session.GambitSessionId)}-${
        session.ManualFlipsCount
      }`
    : 'gambit-pending-event-empty';
  const shouldShowPendingEventModal =
    Boolean(pendingEvent) &&
    !revealedCinematicCard &&
    !isPendingEventPresentationDelayed;
  const pendingEventRewardSession = useMemo(() => {
    if (!shouldShowPendingEventModal || !pendingEvent) {
      return null;
    }

    return createRewardChoiceSessionFromPendingEvent(pendingEvent, {
      hasCompletedGoodTableTransition: hasPendingEventTableSettled,
      selection: pendingEventSelection,
      sessionId: pendingEventRewardSessionId,
    });
  }, [
    hasPendingEventTableSettled,
    pendingEvent,
    pendingEventRewardSessionId,
    pendingEventSelection,
    shouldShowPendingEventModal,
  ]);
  const isSelectingInteraction = Boolean(pendingInteraction);
  const isBoardLocked =
    !session ||
    isGameActionPending ||
    isAutoCashOutPending ||
    Boolean(pendingEvent) ||
    isRevealAnimationLocked ||
    revealedCinematicCard !== null ||
    visualState.previewedCardId !== null ||
    session.Status !== 'InProgress' ||
    (!isSelectingInteraction && burnsRemaining <= 0);

  useEffect(() => {
    setSession(initialSession ?? null);
  }, [initialSession]);

  useEffect(() => {
    if (!visualState.preparedEffect) {
      setIsPreparedEffectPreviewOpen(false);
    }
  }, [visualState.preparedEffect]);

  useEffect(() => {
    if (
      !session ||
      isGameActionPending ||
      isAutoCashOutPendingRef.current ||
      revealedCinematicCard ||
      !shouldAutoCashOutGambitSession(session)
    ) {
      return;
    }

    const sessionId = String(session.GambitSessionId);

    if (autoCashOutSessionIdRef.current === sessionId) {
      return;
    }

    autoCashOutSessionIdRef.current = sessionId;
    isAutoCashOutPendingRef.current = true;
    setIsAutoCashOutPending(true);
    setActionErrorMessage(null);

    cashOutActiveGambitSession()
      .then((response) => {
        setSession((currentSession) => {
          if (
            !currentSession ||
            String(currentSession.GambitSessionId) !== sessionId
          ) {
            return currentSession;
          }

          return applyGambitCashOutResponseToSession(currentSession, response);
        });
      })
      .catch((error) => {
        setActionErrorMessage(
          getGambitActionErrorMessage(
            error,
            'Nao foi possivel finalizar a partida do Gambit.'
          )
        );
      })
      .finally(() => {
        isAutoCashOutPendingRef.current = false;
        setIsAutoCashOutPending(false);
      });
  }, [isGameActionPending, revealedCinematicCard, session]);

  useEffect(
    () => () => {
      if (pendingEventPresentationDelayTimeoutRef.current) {
        window.clearTimeout(pendingEventPresentationDelayTimeoutRef.current);
      }
    },
    []
  );

  useEffect(() => {
    setPendingInteractionSelections([]);

    if (pendingInteraction) {
      setLastInteractionResult(null);
      setPreviewedCardId(null);
    }
  }, [pendingInteraction]);

  const clearPendingEventPresentationDelay = () => {
    if (!pendingEventPresentationDelayTimeoutRef.current) {
      return;
    }

    window.clearTimeout(pendingEventPresentationDelayTimeoutRef.current);
    pendingEventPresentationDelayTimeoutRef.current = null;
  };

  const lockRevealAnimation = () => {
    revealAnimationLockedRef.current = true;
    setIsRevealAnimationLocked(true);
  };

  const unlockRevealAnimation = () => {
    revealAnimationLockedRef.current = false;
    setIsRevealAnimationLocked(false);
  };

  const resolvePendingInteractionSelection = async (cardId: number) => {
    if (!session || !pendingInteraction || isGameActionPending) {
      return;
    }

    const selectedCard = cards.find((card) => card.id === cardId);

    if (!selectedCard || selectedCard.revealed || selectedCard.locked) {
      return;
    }

    const currentSelectedPositions = mergeSelectedPositions(
      pendingInteraction,
      pendingInteractionSelections
    );

    if (currentSelectedPositions.includes(cardId)) {
      return;
    }

    const nextSelectedPositions = mergeSelectedPositions(pendingInteraction, [
      ...pendingInteractionSelections,
      cardId,
    ]);

    setPendingInteractionSelections(nextSelectedPositions);

    setActionErrorMessage(null);
    setLastInteractionResult(null);
    setPreviewedCardId(null);

    if (nextSelectedPositions.length < pendingInteraction.RequiredSelections) {
      return;
    }

    setIsGameActionPending(true);

    try {
      const response = await resolveActiveGambitEffect(nextSelectedPositions);
      const peekResult = getGambitResolveEffectPeekResult(response);

      setSession(getGambitResolveEffectSession(response));
      setPendingInteractionSelections([]);
      setLastInteractionResult(peekResult);
      setPreviewedCardId(
        peekResult && 'Position' in peekResult ? peekResult.Position : null
      );
    } catch (error) {
      setActionErrorMessage(
        getGambitActionErrorMessage(
          error,
          'Nao foi possivel resolver o efeito do Gambit.'
        )
      );
    } finally {
      setIsGameActionPending(false);
    }
  };

  const burnCard = async (cardId: number) => {
    if (
      !session ||
      isGameActionPending ||
      previewedCardId !== null ||
      revealedCinematicCard !== null ||
      revealAnimationLockedRef.current ||
      pendingEvent ||
      pendingInteraction ||
      session.Status !== 'InProgress' ||
      burnsRemaining <= 0
    ) {
      return;
    }

    const selectedCard = cards.find((card) => card.id === cardId);

    if (!selectedCard || selectedCard.revealed || selectedCard.locked) {
      return;
    }

    setActionErrorMessage(null);
    setLastInteractionResult(null);
    setPendingEventSelection(emptyPendingEventSelection);
    clearPendingEventPresentationDelay();
    lockRevealAnimation();
    setIsGameActionPending(true);

    try {
      const nextSession = await burnActiveGambitCard(cardId);
      const revealedCard =
        mapGambitSessionToVisualCards(nextSession).find(
          (card) => card.id === cardId && card.revealed
        ) ?? null;

      setSession(nextSession);

      if (revealedCard?.effect) {
        setRevealedCinematicCard(revealedCard);
        setIsPendingEventPresentationDelayed(true);
      } else {
        setRevealedCinematicCard(null);
        setIsPendingEventPresentationDelayed(false);
      }
    } catch (error) {
      setActionErrorMessage(
        getGambitActionErrorMessage(
          error,
          'Nao foi possivel revelar a carta do Gambit.'
        )
      );
    } finally {
      setIsGameActionPending(false);
    }
  };

  const handleCardReveal = (cardId: number) => {
    if (pendingInteraction) {
      void resolvePendingInteractionSelection(cardId);
      return;
    }

    void burnCard(cardId);
  };

  const handleCardRevealAnimationComplete = () => {
    unlockRevealAnimation();
  };

  const handlePreviewClose = () => {
    setPreviewedCardId(null);
  };

  const handlePendingEventRewardCardHover = (card: RewardCardOption) => {
    void card;
  };

  const handlePreparedEffectInspect = () => {
    if (!visualState.preparedEffect) {
      return;
    }

    setIsPreparedEffectPreviewOpen(true);
  };

  const handlePreparedEffectPreviewClose = () => {
    setIsPreparedEffectPreviewOpen(false);
  };

  const handlePendingEventRewardCardSelect = (optionId: string) => {
    if (
      !pendingEvent ||
      !pendingEventRewardSession ||
      isPendingEventSelectionLocked
    ) {
      return false;
    }

    const parsedOption = parseGambitPendingEventOptionId(optionId);

    if (!parsedOption) {
      return false;
    }

    if (
      parsedOption.side === 'bad' &&
      pendingEventSelection.GoodIndex === null
    ) {
      return false;
    }

    if (pendingEventSelection[parsedOption.selectionKey] !== null) {
      return false;
    }

    const nextSelection = {
      ...pendingEventSelection,
      [parsedOption.selectionKey]: parsedOption.index,
    };

    setActionErrorMessage(null);
    setIsPendingEventSelectionLocked(true);
    setPendingEventSelection(nextSelection);

    if (nextSelection.GoodIndex !== null && nextSelection.BadIndex !== null) {
      pendingEventResolutionRef.current = {
        BadIndex: nextSelection.BadIndex,
        GoodIndex: nextSelection.GoodIndex,
        sessionId: pendingEventRewardSession.id,
      };
    }

    return true;
  };

  const handlePendingEventTableTransitionComplete = (sessionId: string) => {
    if (sessionId !== pendingEventRewardSession?.id) {
      return;
    }

    setHasPendingEventTableSettled(true);
    setIsPendingEventSelectionLocked(false);
  };

  const resolvePendingEventSelection = async (sessionId: string) => {
    const pendingResolution = pendingEventResolutionRef.current;

    if (!pendingResolution || pendingResolution.sessionId !== sessionId) {
      setIsPendingEventSelectionLocked(false);
      return;
    }

    setIsPendingEventSelectionLocked(true);
    setIsGameActionPending(true);

    try {
      const nextSession = await resolveActiveGambitEvent({
        BadIndex: pendingResolution.BadIndex ?? 0,
        GoodIndex: pendingResolution.GoodIndex ?? 0,
      });

      setSession(nextSession);
      pendingEventResolutionRef.current = null;
      setHasPendingEventTableSettled(false);
      setPendingEventSelection(emptyPendingEventSelection);
    } catch (error) {
      setActionErrorMessage(
        getGambitActionErrorMessage(
          error,
          'Nao foi possivel resolver o evento do Gambit.'
        )
      );
      pendingEventResolutionRef.current = null;
      setHasPendingEventTableSettled(false);
      setPendingEventSelection(emptyPendingEventSelection);
    } finally {
      setIsPendingEventSelectionLocked(false);
      setIsGameActionPending(false);
    }
  };

  const handlePendingEventSelectedCardCinematicComplete = (
    sessionId: string
  ) => {
    void resolvePendingEventSelection(sessionId);
  };

  const handleRevealCinematicComplete = () => {
    setRevealedCinematicCard(null);
    clearPendingEventPresentationDelay();

    pendingEventPresentationDelayTimeoutRef.current = window.setTimeout(() => {
      setIsPendingEventPresentationDelayed(false);
      pendingEventPresentationDelayTimeoutRef.current = null;
    }, PENDING_EVENT_PRESENTATION_DELAY_MS);
  };

  if (!session) {
    return (
      <motion.div
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-[min(94vw,780px)]"
        initial={{ opacity: 0, scale: 0.94, y: 28 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="bg-card px-5 py-4 text-center pixel-border-gold">
          <p className="font-display text-xs font-bold uppercase tracking-widest text-cassino-gold">
            Nenhuma sessão ativa do Gambit encontrada.
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      animate={{ opacity: 1, scale: 1, y: 0 }}
      className="relative w-[min(94vw,780px)]"
      initial={{ opacity: 0, scale: 0.94, y: 28 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="grid gap-4 md:grid-cols-[minmax(0,560px)_180px] md:items-start">
        <div className="min-w-0">
          <div className="mb-4 grid gap-3 sm:grid-cols-2">
            <div className="flex items-center justify-between bg-card px-5 py-3 pixel-border">
              <span className="font-display text-xs font-bold uppercase tracking-widest text-cassino-gold">
                Pontos
              </span>

              <span className="font-mono text-lg font-bold text-foreground">
                {totalScore.toLocaleString('pt-BR')}
              </span>
            </div>

            <div className="flex items-center justify-between bg-card px-5 py-3 pixel-border">
              <span className="font-display text-xs font-bold uppercase tracking-widest text-cassino-gold">
                Queimas
              </span>

              <span className="font-mono text-sm font-bold text-foreground">
                {session.ManualFlipsCount}/{session.BurnSlotsAvailable}
              </span>
            </div>
          </div>

          <div className="bg-card p-4 pixel-border-gold">
            <GambitBoard
              cards={cards}
              className="aspect-square w-full overflow-hidden"
              clarividenciaPreviewMode={
                isSelectingInteraction || visualState.previewedCardId !== null
              }
              interactionLocked={isBoardLocked}
              onCardReveal={handleCardReveal}
              onCardRevealAnimationComplete={handleCardRevealAnimationComplete}
            />
          </div>

          {pendingInteraction ? (
            <div className="mt-3 bg-card px-4 py-3 pixel-border">
              <p className="font-display text-xs font-bold uppercase tracking-widest text-cassino-gold">
                {formatEffectName(pendingInteraction.Effect)}
              </p>
              <p className="mt-1 text-[11px] uppercase tracking-[0.22em] text-white/55">
                {pendingInteractionSelectedPositions.length}/
                {pendingInteraction.RequiredSelections}
              </p>
            </div>
          ) : null}

          {lastInteractionResult ? (
            <div className="mt-3 flex items-center justify-between bg-card px-4 py-3 pixel-border">
              <span className="font-display text-xs font-bold uppercase tracking-widest text-cassino-gold">
                Espiada
              </span>
              <span className="font-mono text-xs font-bold uppercase text-foreground">
                {formatPeekResult(lastInteractionResult)}
              </span>
            </div>
          ) : null}

          {actionErrorMessage ? (
            <div className="mt-3 bg-card px-4 py-3 text-center pixel-border">
              <span className="font-mono text-xs font-bold uppercase text-red-200">
                {actionErrorMessage}
              </span>
            </div>
          ) : null}

          {isAutoCashOutPending ? (
            <div className="mt-3 bg-card px-4 py-3 text-center pixel-border">
              <span className="font-mono text-xs font-bold uppercase text-cassino-gold">
                Finalizando partida...
              </span>
            </div>
          ) : null}

          {visualState.previewedCardId !== null ? (
            <div className="mt-3">
              <button
                className="w-full bg-cassino-gold px-4 py-3 font-display text-xs font-bold uppercase tracking-widest text-background pixel-border"
                onClick={handlePreviewClose}
                type="button"
              >
                Fechar espiada
              </button>
            </div>
          ) : null}

          {isFinalGambitSessionStatus(session.Status) ? (
            <div className="mt-3 grid gap-3 bg-card px-4 py-3 pixel-border">
              <div className="flex items-center justify-between">
                <span className="font-display text-xs font-bold uppercase tracking-widest text-cassino-gold">
                  Resultado
                </span>
                <span className="font-mono text-sm font-bold text-foreground">
                  {(session.Result ?? session.AccumulatedPoints).toLocaleString(
                    'pt-BR'
                  )}
                </span>
              </div>

              {onNewGame ? (
                <button
                  className="w-full bg-cassino-gold px-4 py-3 font-display text-xs font-bold uppercase tracking-widest text-background pixel-border"
                  onClick={onNewGame}
                  type="button"
                >
                  Nova partida
                </button>
              ) : null}
            </div>
          ) : null}
        </div>

        <PreparedGambitEffectPanel
          effect={visualState.preparedEffect}
          onInspect={handlePreparedEffectInspect}
        />
      </div>

      <RewardChoiceModal
        isSelectionLocked={isPendingEventSelectionLocked}
        onCardHover={handlePendingEventRewardCardHover}
        onCardSelect={handlePendingEventRewardCardSelect}
        onSelectedCardCinematicComplete={
          handlePendingEventSelectedCardCinematicComplete
        }
        onTableTransitionComplete={handlePendingEventTableTransitionComplete}
        session={pendingEventRewardSession}
      />

      <GambitRevealCinematic
        card={revealedCinematicCard}
        onComplete={handleRevealCinematicComplete}
      />

      <GambitRevealCinematic
        card={preparedEffectPreviewCard}
        onComplete={handlePreparedEffectPreviewClose}
      />
    </motion.div>
  );
};
