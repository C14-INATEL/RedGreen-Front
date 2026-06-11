import { motion } from 'framer-motion';
import { useEffect, useMemo, useRef, useState } from 'react';
import { RewardChoiceModal, type RewardCardOption } from './cardReward';
import { GambitBoard } from './GambitGame/GambitBoard';
import { GambitRevealCinematic } from './GambitGame/GambitRevealCinematic';
import { getGambitEffectPresentation } from './GambitGame/gambitEffectPresentation';
import {
  canRevealMockGambitCard,
  getGambitSessionGridSnapshot,
  makeMockGambitSession,
  revealMockGambitCard,
  resolveMockPendingEvent,
  selectMockPendingInteractionPosition,
} from './GambitGame/gambitMockBuilders';
import { mapGambitSessionToMinefieldCards } from './GambitGame/gambitMapper';
import {
  createRewardChoiceSessionFromPendingEvent,
  parseGambitPendingEventOptionId,
} from './GambitGame/gambitPendingEventRewardAdapter';
import { PreparedGambitEffectPanel } from './GambitGame/PreparedGambitEffectPanel';
import type {
  GambitCardEffect,
  GambitInteractionPeekResult,
  GambitSession,
  GambitVisualCard,
} from './GambitGame/gambitTypes';

export type GambitProps = {
  initialSession?: GambitSession;
};

type GambitVisualState = {
  cards: ReturnType<typeof mapGambitSessionToMinefieldCards>;
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

export const Gambit = ({ initialSession }: GambitProps = {}) => {
  const [session, setSession] = useState(
    () => initialSession ?? makeMockGambitSession()
  );
  const [previewedCardId, setPreviewedCardId] = useState<number | null>(null);
  const [isRevealAnimationLocked, setIsRevealAnimationLocked] = useState(false);
  const [pendingEventSelection, setPendingEventSelection] =
    useState<PendingEventSelection>(emptyPendingEventSelection);
  const [hasPendingEventTableSettled, setHasPendingEventTableSettled] =
    useState(false);
  const [isPendingEventSelectionLocked, setIsPendingEventSelectionLocked] =
    useState(false);
  const [lastInteractionResult, setLastInteractionResult] =
    useState<GambitInteractionPeekResult | null>(null);
  const [revealedCinematicCard, setRevealedCinematicCard] =
    useState<GambitVisualCard | null>(null);
  const [
    isPendingEventPresentationDelayed,
    setIsPendingEventPresentationDelayed,
  ] = useState(false);
  const revealAnimationLockedRef = useRef(false);
  const pendingEventResolutionRef = useRef<PendingEventResolution | null>(null);
  const pendingEventPresentationDelayTimeoutRef = useRef<number | null>(null);
  const snapshot = getGambitSessionGridSnapshot(session);
  const pendingEvent = snapshot?.PendingEvent ?? null;
  const pendingInteraction = snapshot?.PendingInteraction ?? null;
  const burnsRemaining = Math.max(
    0,
    session.BurnSlotsAvailable - session.ManualFlipsCount
  );
  const visualState: GambitVisualState = {
    cards: mapGambitSessionToMinefieldCards(session, previewedCardId),
    preparedEffect: session.NextEffect,
    previewedCardId,
  };
  const { cards } = visualState;
  const totalScore = session.AccumulatedPoints;
  const pendingEventRewardSessionId = `gambit-pending-event-${String(
    session.GambitSessionId
  )}-${session.ManualFlipsCount}`;
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
    Boolean(pendingEvent) ||
    isRevealAnimationLocked ||
    revealedCinematicCard !== null ||
    visualState.previewedCardId !== null ||
    session.Status !== 'InProgress' ||
    (!isSelectingInteraction && burnsRemaining <= 0);

  useEffect(
    () => () => {
      if (pendingEventPresentationDelayTimeoutRef.current) {
        window.clearTimeout(pendingEventPresentationDelayTimeoutRef.current);
      }
    },
    []
  );

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

  const handleCardReveal = (cardId: number) => {
    if (
      previewedCardId !== null ||
      revealedCinematicCard !== null ||
      revealAnimationLockedRef.current
    ) {
      return;
    }

    if (pendingEvent) {
      return;
    }

    if (pendingInteraction) {
      const resolution = selectMockPendingInteractionPosition(session, cardId);

      setSession(resolution.session);

      if (resolution.PeekResult) {
        setLastInteractionResult(resolution.PeekResult);

        if ('Position' in resolution.PeekResult) {
          setPreviewedCardId(resolution.PeekResult.Position);
        }
      }

      return;
    }

    const selectedCard = cards.find((card) => card.id === cardId);

    if (
      !selectedCard ||
      selectedCard.revealed ||
      selectedCard.locked ||
      !canRevealMockGambitCard(session, cardId)
    ) {
      return;
    }

    setLastInteractionResult(null);
    setPendingEventSelection(emptyPendingEventSelection);
    clearPendingEventPresentationDelay();

    if (selectedCard.effect) {
      setRevealedCinematicCard(selectedCard);
      setIsPendingEventPresentationDelayed(true);
    } else {
      setRevealedCinematicCard(null);
      setIsPendingEventPresentationDelayed(false);
    }

    lockRevealAnimation();
    setSession((currentSession) =>
      revealMockGambitCard(currentSession, cardId)
    );
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

  const handlePendingEventSelectedCardCinematicComplete = (
    sessionId: string
  ) => {
    const pendingResolution = pendingEventResolutionRef.current;

    if (!pendingResolution || pendingResolution.sessionId !== sessionId) {
      setIsPendingEventSelectionLocked(false);
      return;
    }

    setSession((currentSession) =>
      resolveMockPendingEvent(currentSession, {
        BadIndex: pendingResolution.BadIndex ?? 0,
        GoodIndex: pendingResolution.GoodIndex ?? 0,
      })
    );
    pendingEventResolutionRef.current = null;
    setHasPendingEventTableSettled(false);
    setIsPendingEventSelectionLocked(false);
    setPendingEventSelection(emptyPendingEventSelection);
  };

  const handleRevealCinematicComplete = () => {
    setRevealedCinematicCard(null);
    clearPendingEventPresentationDelay();

    pendingEventPresentationDelayTimeoutRef.current = window.setTimeout(() => {
      setIsPendingEventPresentationDelayed(false);
      pendingEventPresentationDelayTimeoutRef.current = null;
    }, PENDING_EVENT_PRESENTATION_DELAY_MS);
  };

  return (
    <motion.div
      animate={{ opacity: 1, scale: 1, y: 0 }}
      className="relative w-[min(94vw,780px)]"
      initial={{ opacity: 0, scale: 0.94, y: 28 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="grid gap-4 md:grid-cols-[180px_minmax(0,560px)] md:items-start">
        <PreparedGambitEffectPanel effect={visualState.preparedEffect} />

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
                {pendingInteraction.SelectedPositions.length}/
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

          {session.Status === 'Finished' ? (
            <div className="mt-3 flex items-center justify-between bg-card px-4 py-3 pixel-border">
              <span className="font-display text-xs font-bold uppercase tracking-widest text-cassino-gold">
                Resultado
              </span>
              <span className="font-mono text-sm font-bold text-foreground">
                {(session.Result ?? 0).toLocaleString('pt-BR')}
              </span>
            </div>
          ) : null}
        </div>
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
    </motion.div>
  );
};
