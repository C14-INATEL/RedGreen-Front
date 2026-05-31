import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { BackgroundParticles } from '../../../MinefieldGame/BackgroundParticles';
import { MinefieldEventTable } from '../../../MinefieldGame/MinefieldEventTable';
import { rewardPresentationConfig } from '../../config/rewardPresentationConfig';
import { rewardTimings } from '../../config/rewardTimings';
import type {
  RewardCardOption,
  RewardChoiceSession,
  RewardPresentationConfig,
  RewardTableState,
  RewardTimingsConfig,
} from '../../types/cardReward';
import { selectedCardOverlayTransition } from '../../animations/cardSelectionAnimations';
import { RewardCard } from './RewardCard';

type RewardChoiceModalProps = {
  onCardHover: (card: RewardCardOption) => void;
  onCardSelect: (optionId: string) => void;
  onSelectedCardCinematicComplete: (sessionId: string) => void;
  onTableTransitionComplete: (sessionId: string) => void;
  presentationConfig?: RewardPresentationConfig;
  session: RewardChoiceSession | null;
  timings?: RewardTimingsConfig;
};

type SelectionOverlay = {
  optionId: string;
  cardRect: DOMRect;
  modalRect: DOMRect;
};

type CenteredCardOverlay = SelectionOverlay & {
  card: RewardCardOption;
};

type TableViewport = {
  centerX: number;
  centerY: number;
  height: number;
  width: number;
};

type FirstChoiceAnimationPhase =
  | 'idle'
  | 'centering'
  | 'holding'
  | 'flying'
  | 'waiting-transition'
  | 'transitioning';

const createDefaultTableState = (): RewardTableState => ({
  currentTable: 'normal',
  incomingTable: null,
  isTransitioning: false,
  phase: 'normal',
  transitionId: null,
});

const getCardsForTable = (
  session: RewardChoiceSession,
  tableType: RewardTableState['currentTable']
) => (tableType === 'bad' ? session.badTableCards : session.normalTableCards);

const getSelectedOptionIdsForTable = (
  session: RewardChoiceSession,
  tableType: RewardTableState['currentTable']
) =>
  session.selectionHistory
    .filter((entry) => entry.tableType === tableType)
    .map((entry) => entry.optionId);

export const RewardChoiceModal = ({
  onCardHover,
  onCardSelect,
  onSelectedCardCinematicComplete,
  onTableTransitionComplete,
  presentationConfig = rewardPresentationConfig,
  session,
  timings = rewardTimings,
}: RewardChoiceModalProps) => {
  const [cardPresentationCycle, setCardPresentationCycle] = useState(0);
  const [cardsVisible, setCardsVisible] = useState(true);
  const [firstChoiceAnimationPhase, setFirstChoiceAnimationPhase] =
    useState<FirstChoiceAnimationPhase>('idle');
  const [selectedCenterCardOverlay, setSelectedCenterCardOverlay] =
    useState<CenteredCardOverlay | null>(null);
  const [tableSceneState, setTableSceneState] = useState<RewardTableState>(
    createDefaultTableState
  );
  const [tableViewport, setTableViewport] = useState<TableViewport | null>(
    null
  );
  const handledTransitionIdRef = useRef<string | null>(null);
  const cinematicRunIdRef = useRef(0);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const modalRef = useRef<HTMLDivElement | null>(null);
  const postTransitionTimeoutRef = useRef<number | null>(null);
  const resetTimelineTimeoutRef = useRef<number | null>(null);
  const flyAwayTimeoutRef = useRef<number | null>(null);
  const transitionKickoffTimeoutRef = useRef<number | null>(null);
  const transitionDelayTimeoutRef = useRef<number | null>(null);
  const transitionPrepTimeoutRef = useRef<number | null>(null);
  const sessionRef = useRef(session);

  useEffect(() => {
    sessionRef.current = session;
  }, [session]);

  const latestSelection =
    session?.selectionHistory[session.selectionHistory.length - 1] ?? null;
  const latestSelectedOptionId = latestSelection?.optionId ?? null;
  const displayedCards = useMemo(
    () =>
      session ? getCardsForTable(session, tableSceneState.currentTable) : [],
    [session, tableSceneState.currentTable]
  );
  const displayedSelectedOptionIds = useMemo(
    () =>
      session
        ? getSelectedOptionIdsForTable(session, tableSceneState.currentTable)
        : [],
    [session, tableSceneState.currentTable]
  );

  const registerDialogSurfaceRef = useCallback(
    (node: HTMLDivElement | null) => {
      modalRef.current = node;
      dialogRef.current = node;
    },
    []
  );

  const clearOverlay = useCallback(() => {
    setSelectedCenterCardOverlay(null);
  }, []);

  useEffect(() => {
    return () => {
      if (postTransitionTimeoutRef.current) {
        window.clearTimeout(postTransitionTimeoutRef.current);
      }

      if (transitionKickoffTimeoutRef.current) {
        window.clearTimeout(transitionKickoffTimeoutRef.current);
      }

      if (flyAwayTimeoutRef.current) {
        window.clearTimeout(flyAwayTimeoutRef.current);
      }

      if (transitionDelayTimeoutRef.current) {
        window.clearTimeout(transitionDelayTimeoutRef.current);
      }

      if (transitionPrepTimeoutRef.current) {
        window.clearTimeout(transitionPrepTimeoutRef.current);
      }

      if (resetTimelineTimeoutRef.current) {
        window.clearTimeout(resetTimelineTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!session) {
      resetTimelineTimeoutRef.current = window.setTimeout(() => {
        setTableViewport(null);
        resetTimelineTimeoutRef.current = null;
      }, 0);
      return undefined;
    }

    const dialogNode = dialogRef.current;

    if (!dialogNode) {
      return undefined;
    }

    const syncViewport = () => {
      const dialogRect = dialogNode.getBoundingClientRect();

      if (!dialogRect.width || !dialogRect.height) {
        return;
      }

      setTableViewport({
        centerX: dialogRect.left + dialogRect.width / 2,
        centerY: dialogRect.top + dialogRect.height / 2,
        height: dialogRect.height,
        width: dialogRect.width,
      });
    };

    syncViewport();

    const resizeObserver =
      typeof ResizeObserver === 'undefined'
        ? null
        : new ResizeObserver(() => {
            syncViewport();
          });

    resizeObserver?.observe(dialogNode);
    window.addEventListener('resize', syncViewport);

    return () => {
      resizeObserver?.disconnect();
      window.removeEventListener('resize', syncViewport);
    };
  }, [session]);

  useEffect(() => {
    if (postTransitionTimeoutRef.current) {
      window.clearTimeout(postTransitionTimeoutRef.current);
      postTransitionTimeoutRef.current = null;
    }

    if (transitionKickoffTimeoutRef.current) {
      window.clearTimeout(transitionKickoffTimeoutRef.current);
      transitionKickoffTimeoutRef.current = null;
    }

    if (flyAwayTimeoutRef.current) {
      window.clearTimeout(flyAwayTimeoutRef.current);
      flyAwayTimeoutRef.current = null;
    }

    if (transitionDelayTimeoutRef.current) {
      window.clearTimeout(transitionDelayTimeoutRef.current);
      transitionDelayTimeoutRef.current = null;
    }

    if (transitionPrepTimeoutRef.current) {
      window.clearTimeout(transitionPrepTimeoutRef.current);
      transitionPrepTimeoutRef.current = null;
    }

    handledTransitionIdRef.current = null;

    resetTimelineTimeoutRef.current = window.setTimeout(() => {
      setCardPresentationCycle(0);
      setCardsVisible(true);
      setFirstChoiceAnimationPhase('idle');
      setSelectedCenterCardOverlay(null);
      setTableSceneState(createDefaultTableState());
      cinematicRunIdRef.current += 1;
      resetTimelineTimeoutRef.current = null;
    }, 0);
  }, [session?.id]);

  useEffect(() => {
    let cleanupTimer: number | undefined;

    const shouldPreserveCenteredCard =
      Boolean(selectedCenterCardOverlay) &&
      // A mesa bad funciona porque o overlay sobrevive durante o estado
      // cinematografico da escolha. A mesa normal sumia porque limpava esse
      // overlay antes da transicao comecar. Agora ambas usam a mesma regra:
      // enquanto a carta estiver em destaque ou a mesa estiver no fluxo
      // cinematografico, o overlay continua vivo.
      (session?.tableState.isTransitioning === true ||
        session?.status === 'resolving' ||
        firstChoiceAnimationPhase === 'centering' ||
        firstChoiceAnimationPhase === 'holding' ||
        firstChoiceAnimationPhase === 'flying');

    if (!session || !shouldPreserveCenteredCard) {
      cleanupTimer = window.setTimeout(clearOverlay, 0);
    }

    return () => {
      if (cleanupTimer) {
        window.clearTimeout(cleanupTimer);
      }
    };
  }, [
    clearOverlay,
    firstChoiceAnimationPhase,
    selectedCenterCardOverlay,
    session,
  ]);

  useEffect(() => {
    if (!session) {
      return;
    }

    const nextTableState = session.tableState;

    if (!nextTableState.isTransitioning) {
      resetTimelineTimeoutRef.current = window.setTimeout(() => {
        setTableSceneState(nextTableState);
        resetTimelineTimeoutRef.current = null;
      }, 0);
    }
  }, [session?.tableState, session]);

  const handleCardSelect = useCallback(
    (optionId: string, buttonElement: HTMLButtonElement | null) => {
      const selectedCard =
        displayedCards.find((card) => card.optionId === optionId) ?? null;
      const activeSession = sessionRef.current;

      if (!modalRef.current || !buttonElement || !selectedCard) {
        setSelectedCenterCardOverlay(null);
      } else {
        const cardRect = buttonElement.getBoundingClientRect();
        const modalRect = modalRef.current.getBoundingClientRect();

        // A carta escolhida vira uma entidade independente do grid.
        // Assim ela sobrevive quando o board escurece/limpa as outras cartas.
        setSelectedCenterCardOverlay({
          card: selectedCard,
          cardRect,
          modalRect,
          optionId,
        });
      }

      if (!activeSession) {
        onCardSelect(optionId);
        return;
      }

      cinematicRunIdRef.current += 1;
      const cinematicRunId = cinematicRunIdRef.current;
      const isTransitionOutcome =
        activeSession.tableState.phase === 'normal' &&
        activeSession.selectionHistory.length + 1 <
          activeSession.selectionLimit;

      setFirstChoiceAnimationPhase('centering');

      transitionPrepTimeoutRef.current = window.setTimeout(() => {
        if (cinematicRunIdRef.current !== cinematicRunId) {
          return;
        }

        setFirstChoiceAnimationPhase('holding');

        flyAwayTimeoutRef.current = window.setTimeout(() => {
          if (cinematicRunIdRef.current !== cinematicRunId) {
            return;
          }

          setFirstChoiceAnimationPhase('flying');

          transitionDelayTimeoutRef.current = window.setTimeout(() => {
            if (cinematicRunIdRef.current !== cinematicRunId) {
              return;
            }

            setSelectedCenterCardOverlay(null);

            if (isTransitionOutcome) {
              setFirstChoiceAnimationPhase('waiting-transition');

              transitionKickoffTimeoutRef.current = window.setTimeout(() => {
                if (cinematicRunIdRef.current !== cinematicRunId) {
                  return;
                }

                const nextSession = sessionRef.current;

                if (!nextSession) {
                  return;
                }

                handledTransitionIdRef.current =
                  nextSession.tableState.transitionId;
                setFirstChoiceAnimationPhase('transitioning');
                setCardsVisible(false);
                // A mesma timeline cinematica serve para as duas mesas.
                // A diferenca e so o desfecho: na primeira escolha ela
                // libera a entrada da mesa bad; na segunda, conclui o evento.
                setTableSceneState(nextSession.tableState);
                transitionKickoffTimeoutRef.current = null;
              }, timings.tableTransitionBreathingDelayMs);
            } else {
              setFirstChoiceAnimationPhase('idle');
              onSelectedCardCinematicComplete(activeSession.id);
            }

            transitionDelayTimeoutRef.current = null;
          }, timings.selectedCardFlyAwayDurationMs);

          flyAwayTimeoutRef.current = null;
        }, timings.tableTransitionDramaticPauseMs);

        transitionPrepTimeoutRef.current = null;
      }, timings.selectedCardCenteringDurationMs);

      onCardSelect(optionId);
    },
    [
      displayedCards,
      onCardSelect,
      onSelectedCardCinematicComplete,
      timings.selectedCardCenteringDurationMs,
      timings.selectedCardFlyAwayDurationMs,
      timings.tableTransitionBreathingDelayMs,
      timings.tableTransitionDramaticPauseMs,
    ]
  );

  const handleTableTransitionSettled = useCallback(() => {
    if (!session) {
      return;
    }

    const settledTable =
      tableSceneState.incomingTable ?? tableSceneState.currentTable;

    setTableSceneState({
      currentTable: settledTable,
      incomingTable: null,
      isTransitioning: false,
      phase: settledTable === 'bad' ? 'bad' : 'normal',
      transitionId: null,
    });
    setCardsVisible(true);
    setFirstChoiceAnimationPhase('idle');
    setCardPresentationCycle((currentCycle) => currentCycle + 1);

    postTransitionTimeoutRef.current = window.setTimeout(() => {
      onTableTransitionComplete(session.id);
      postTransitionTimeoutRef.current = null;
    }, timings.tablePostTransitionHoldMs);
  }, [
    onTableTransitionComplete,
    session,
    tableSceneState,
    timings.tablePostTransitionHoldMs,
  ]);

  const getSelectionState = useCallback(
    (optionId: string) => {
      if (!session) {
        return 'idle' as const;
      }

      const displayedTableType = tableSceneState.currentTable;
      const selectedOptionIdsForDisplayedTable = getSelectedOptionIdsForTable(
        session,
        displayedTableType
      );
      const isAlreadySelected =
        selectedOptionIdsForDisplayedTable.includes(optionId);
      const isLatestSelected = optionId === latestSelectedOptionId;

      if (firstChoiceAnimationPhase === 'centering') {
        return isAlreadySelected ? ('hidden' as const) : ('dimmed' as const);
      }

      if (firstChoiceAnimationPhase === 'holding') {
        return isAlreadySelected ? ('hidden' as const) : ('dimmed' as const);
      }

      if (firstChoiceAnimationPhase === 'flying') {
        return isAlreadySelected ? ('hidden' as const) : ('dimmed' as const);
      }

      if (firstChoiceAnimationPhase === 'waiting-transition') {
        return isAlreadySelected ? ('hidden' as const) : ('dimmed' as const);
      }

      if (tableSceneState.isTransitioning) {
        return isAlreadySelected ? ('hidden' as const) : ('dimmed' as const);
      }

      if (session.status === 'resolving') {
        if (isAlreadySelected) {
          return isLatestSelected && !selectedCenterCardOverlay
            ? ('active' as const)
            : ('hidden' as const);
        }

        return 'dimmed' as const;
      }

      if (tableSceneState.phase === 'bad' && isAlreadySelected) {
        return 'hidden' as const;
      }

      return 'idle' as const;
    },
    [
      firstChoiceAnimationPhase,
      latestSelectedOptionId,
      selectedCenterCardOverlay,
      session,
      tableSceneState,
    ]
  );

  const showSelectedCardOverlay =
    Boolean(selectedCenterCardOverlay) &&
    (session?.tableState.isTransitioning === true ||
      session?.status === 'resolving' ||
      firstChoiceAnimationPhase === 'centering' ||
      firstChoiceAnimationPhase === 'holding' ||
      firstChoiceAnimationPhase === 'flying' ||
      firstChoiceAnimationPhase === 'transitioning');
  const nextPickLabel = session
    ? Math.min(session.selectionHistory.length + 1, session.selectionLimit)
    : 1;

  const selectionOverlayNode = useMemo(() => {
    if (!selectedCenterCardOverlay || !showSelectedCardOverlay) {
      return null;
    }

    const targetX =
      selectedCenterCardOverlay.modalRect.left +
      selectedCenterCardOverlay.modalRect.width / 2 -
      selectedCenterCardOverlay.cardRect.left -
      selectedCenterCardOverlay.cardRect.width / 2;
    const targetY =
      selectedCenterCardOverlay.modalRect.top +
      selectedCenterCardOverlay.modalRect.height / 2 -
      selectedCenterCardOverlay.cardRect.top -
      selectedCenterCardOverlay.cardRect.height / 2;
    const flyAwayTargetY =
      -selectedCenterCardOverlay.cardRect.top -
      selectedCenterCardOverlay.cardRect.height -
      96;
    const isFlyingAway = firstChoiceAnimationPhase === 'flying';
    const isFirstTableSelection = latestSelection?.tableType === 'normal';
    const isCenteringFirstTableSelection =
      firstChoiceAnimationPhase === 'centering' && isFirstTableSelection;
    const x = targetX;
    const y = isFlyingAway ? flyAwayTargetY : targetY;
    const scale = isFlyingAway
      ? [1.04, 1.02, 0.98, 0.92]
      : isCenteringFirstTableSelection
        ? [1, 1.12, 1.09, 1.05, 1.02]
        : firstChoiceAnimationPhase === 'holding'
          ? [1.02, 1.06, 1.04, 1.07, 1.04]
          : [1, 1.04, 1.02, 1.05, 1.02];
    const rotate = isFlyingAway ? [0, -3, 4, -2] : [0, 2, -1.5, 1, 0];
    const opacity = isFlyingAway ? [1, 0.82, 0.45, 0] : 1;
    const selectedCardScaleTransition = isFlyingAway
      ? {
          duration: timings.selectedCardFlyAwayDurationMs / 1000,
          ease: [0.22, 0.8, 0.18, 1],
        }
      : isCenteringFirstTableSelection
        ? {
            duration: timings.selectedCardCenteringDurationMs / 1000,
            ease: [0.2, 0.9, 0.26, 1],
            times: [0, 0.16, 0.38, 0.72, 1],
          }
        : selectedCardOverlayTransition;
    const selectedCardImageTransition = isFlyingAway
      ? {
          duration: timings.selectedCardFlyAwayDurationMs / 1000,
          ease: [0.2, 0.75, 0.16, 1],
        }
      : isCenteringFirstTableSelection
        ? {
            duration: timings.selectedCardCenteringDurationMs / 1000,
            ease: [0.2, 0.9, 0.26, 1],
            times: [0, 0.16, 0.38, 0.72, 1],
          }
        : { duration: 0.68, ease: [0.22, 1, 0.36, 1] };

    return (
      <motion.div
        className="fixed left-0 top-0 z-[90] pointer-events-none"
        style={{
          left: selectedCenterCardOverlay.cardRect.left,
          top: selectedCenterCardOverlay.cardRect.top,
          width: selectedCenterCardOverlay.cardRect.width,
          height: selectedCenterCardOverlay.cardRect.height,
          willChange: 'transform, opacity',
        }}
        initial={{ x: 0, y: 0, scale: 1, rotate: 0, opacity: 1 }}
        animate={{
          opacity,
          rotate,
          scale,
          x,
          y,
        }}
        transition={selectedCardScaleTransition}
      >
        {/* A carta escolhida segura o foco e abre a pausa dramatica antes da colisao. */}
        <motion.img
          alt={selectedCenterCardOverlay.card.title}
          className="block h-full w-full select-none object-cover"
          draggable={false}
          src={selectedCenterCardOverlay.card.spritePath}
          style={{
            filter: 'brightness(1.05) drop-shadow(4px 4px 0 rgba(20,12,4,0.5))',
            imageRendering: 'pixelated',
          }}
          initial={{ scale: 1 }}
          animate={{
            opacity: isFlyingAway ? [1, 0.78, 0.34, 0] : 1,
            scale: isFlyingAway
              ? [1, 0.98, 0.92, 0.88]
              : isCenteringFirstTableSelection
                ? [1, 1.1, 1.08, 1.04, 1.01]
                : [1, 1.04, 1.02, 1.05, 1.01],
          }}
          transition={selectedCardImageTransition}
        />
      </motion.div>
    );
  }, [
    firstChoiceAnimationPhase,
    latestSelection,
    selectedCenterCardOverlay,
    showSelectedCardOverlay,
    timings.selectedCardCenteringDurationMs,
    timings.selectedCardFlyAwayDurationMs,
  ]);

  return (
    <AnimatePresence>
      {session ? (
        <motion.div
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-[80] flex items-center justify-center"
          exit={{ opacity: 0 }}
          initial={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-[rgba(4,8,7,0.88)]" />

          {selectionOverlayNode}

          {session.status === 'selecting' ? (
            <BackgroundParticles
              alphaMultiplier={0.82}
              className="absolute inset-0 z-[12] overflow-hidden opacity-95"
              maxParticles={presentationConfig.particleCount}
              spawnIntervalMs={90}
              speedMultiplier={1.22}
              tremorMultiplier={1.15}
            />
          ) : null}

          <MinefieldEventTable
            className="pointer-events-none fixed inset-0 z-[6]"
            onTransitionSettled={handleTableTransitionSettled}
            tableState={tableSceneState}
            transitionDurationMs={timings.tableTransitionDurationMs}
            viewport={tableViewport}
          />

          <motion.div
            ref={registerDialogSurfaceRef}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="relative z-10 w-full max-w-5xl bg-transparent"
            exit={{ opacity: 0, scale: 0.985, y: 8 }}
            initial={{ opacity: 0, scale: 0.97, y: 16 }}
            role="dialog"
          >
            {/* Reset local ao fechar garante que a proxima abertura volte para a mesa normal. */}
            <div className="relative z-10 px-5 py-7 sm:px-7 sm:py-8">
              <div className="text-center">
                <motion.div
                  animate={{ opacity: 1, y: 0 }}
                  className="text-[11px] font-bold uppercase tracking-[0.32em] text-[#e9d79f]"
                  initial={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.24, ease: 'easeOut' }}
                  style={{ textShadow: '2px 2px 0 rgba(18,12,5,0.85)' }}
                >
                  {presentationConfig.bannerEyebrow}
                </motion.div>

                <motion.h2
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 font-display text-3xl font-bold tracking-[0.08em] text-[#fff6d8] sm:text-4xl"
                  initial={{ opacity: 0, y: -10 }}
                  transition={{ delay: 0.04, duration: 0.28, ease: 'easeOut' }}
                  style={{ textShadow: '3px 3px 0 rgba(20,12,4,0.92)' }}
                >
                  {presentationConfig.bannerTitle}
                </motion.h2>

                <motion.p
                  animate={{ opacity: 1, y: 0 }}
                  className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-[#f0e4bd] sm:text-base"
                  initial={{ opacity: 0, y: -8 }}
                  transition={{ delay: 0.08, duration: 0.26, ease: 'easeOut' }}
                  style={{ textShadow: '2px 2px 0 rgba(20,12,4,0.85)' }}
                >
                  {presentationConfig.bannerDescription}
                </motion.p>

                <motion.div
                  animate={{ opacity: 1 }}
                  className="mt-6 text-[11px] font-bold uppercase tracking-[0.28em] text-[#f6ebc7]"
                  initial={{ opacity: 0 }}
                  transition={{ delay: 0.12, duration: 0.22, ease: 'easeOut' }}
                  style={{ textShadow: '2px 2px 0 rgba(20,12,4,0.85)' }}
                >
                  Escolha {nextPickLabel} de {session.selectionLimit}
                </motion.div>
              </div>

              {cardsVisible ? (
                <div
                  className="mt-8 grid gap-4 lg:grid-cols-3"
                  key={`${session.id}-${tableSceneState.phase}-${cardPresentationCycle}`}
                >
                  {displayedCards.map((card, index) => (
                    <RewardCard
                      card={card}
                      index={index}
                      isDisabled={
                        session.status !== 'selecting' ||
                        tableSceneState.isTransitioning
                      }
                      isResolved={session.status === 'resolving'}
                      isSelected={displayedSelectedOptionIds.includes(
                        card.optionId
                      )}
                      selectionState={getSelectionState(card.optionId)}
                      key={card.optionId}
                      onHover={onCardHover}
                      onSelect={handleCardSelect}
                    />
                  ))}
                </div>
              ) : (
                <div className="mt-8 h-[18rem] sm:h-[20rem]" />
              )}
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
};
