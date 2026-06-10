import { motion } from 'framer-motion';
import { useRef, useState } from 'react';
import { GambitBoard } from './GambitGame/GambitBoard';
import {
  canRevealMockGambitCard,
  getGambitSessionGridSnapshot,
  makeMockGambitSession,
  revealMockGambitCard,
  resolveMockPendingEvent,
  selectMockPendingInteractionPosition,
} from './GambitGame/gambitMockBuilders';
import {
  mapBackendGambitCardToViewModel,
  mapGambitSessionToMinefieldCards,
} from './GambitGame/gambitMapper';
import type {
  GambitCardEffect,
  GambitInteractionPeekResult,
  GambitSession,
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

const emptyPendingEventSelection: PendingEventSelection = {
  BadIndex: null,
  GoodIndex: null,
};

const formatEffectName = (effect: GambitCardEffect) =>
  mapBackendGambitCardToViewModel(effect)?.replaceAll('-', ' ').toUpperCase() ??
  effect;

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
  const [lastInteractionResult, setLastInteractionResult] =
    useState<GambitInteractionPeekResult | null>(null);
  const revealAnimationLockedRef = useRef(false);
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
  const isSelectingInteraction = Boolean(pendingInteraction);
  const isBoardLocked =
    Boolean(pendingEvent) ||
    isRevealAnimationLocked ||
    visualState.previewedCardId !== null ||
    session.Status !== 'InProgress' ||
    (!isSelectingInteraction && burnsRemaining <= 0);

  const lockRevealAnimation = () => {
    revealAnimationLockedRef.current = true;
    setIsRevealAnimationLocked(true);
  };

  const unlockRevealAnimation = () => {
    revealAnimationLockedRef.current = false;
    setIsRevealAnimationLocked(false);
  };

  const handleCardReveal = (cardId: number) => {
    if (previewedCardId !== null || revealAnimationLockedRef.current) {
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

  const handlePendingEventSelection = (
    selectionKey: keyof PendingEventSelection,
    index: number
  ) => {
    const nextSelection = {
      ...pendingEventSelection,
      [selectionKey]: index,
    };

    if (nextSelection.GoodIndex !== null && nextSelection.BadIndex !== null) {
      setSession((currentSession) =>
        resolveMockPendingEvent(currentSession, {
          BadIndex: nextSelection.BadIndex ?? 0,
          GoodIndex: nextSelection.GoodIndex ?? 0,
        })
      );
      setPendingEventSelection(emptyPendingEventSelection);
      return;
    }

    setPendingEventSelection(nextSelection);
  };

  return (
    <motion.div
      animate={{ opacity: 1, scale: 1, y: 0 }}
      className="relative w-[min(86vw,560px)]"
      initial={{ opacity: 0, scale: 0.94, y: 28 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="mb-4 grid gap-3 sm:grid-cols-3">
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

        <div className="flex items-center justify-between bg-card px-5 py-3 pixel-border">
          <span className="font-display text-xs font-bold uppercase tracking-widest text-cassino-gold">
            Efeito
          </span>

          <span className="max-w-[9rem] truncate text-right font-mono text-xs font-bold uppercase text-foreground">
            {visualState.preparedEffect
              ? formatEffectName(visualState.preparedEffect)
              : 'Nenhum'}
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

      {pendingEvent ? (
        <div className="mt-3 bg-card p-4 pixel-border">
          <p className="font-display text-xs font-bold uppercase tracking-widest text-cassino-gold">
            Evento pendente
          </p>

          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div className="grid gap-2">
              {pendingEvent.GoodOptions.map((effect, index) => (
                <button
                  className="bg-cassino-gold px-3 py-2 font-display text-[10px] font-bold uppercase tracking-widest text-background pixel-border"
                  key={`good-${effect}-${index}`}
                  onClick={() =>
                    handlePendingEventSelection('GoodIndex', index)
                  }
                  type="button"
                >
                  Boa {index + 1}
                </button>
              ))}
            </div>

            <div className="grid gap-2">
              {pendingEvent.BadOptions.map((effect, index) => (
                <button
                  className="bg-card px-3 py-2 font-display text-[10px] font-bold uppercase tracking-widest text-foreground pixel-border"
                  key={`bad-${effect}-${index}`}
                  onClick={() => handlePendingEventSelection('BadIndex', index)}
                  type="button"
                >
                  Ruim {index + 1}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}

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
    </motion.div>
  );
};
