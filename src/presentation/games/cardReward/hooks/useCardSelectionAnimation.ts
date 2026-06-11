import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type {
  RewardCardOption,
  RewardChoiceSession,
} from '../types/cardReward';

export type RewardSelectionOverlay = {
  optionId: string;
  cardRect: DOMRect;
  modalRect: DOMRect;
};

type UseCardSelectionAnimationProps = {
  session: RewardChoiceSession | null;
};

const getCardsForTable = (
  session: RewardChoiceSession,
  tableType: RewardChoiceSession['tableState']['currentTable']
) => (tableType === 'bad' ? session.badTableCards : session.normalTableCards);

export const useCardSelectionAnimation = ({
  session,
}: UseCardSelectionAnimationProps) => {
  const modalRef = useRef<HTMLDivElement | null>(null);
  const cardRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [overlayState, setOverlayState] =
    useState<RewardSelectionOverlay | null>(null);

  const latestSelection =
    session?.selectionHistory[session.selectionHistory.length - 1] ?? null;
  const selectedOptionId = latestSelection?.optionId ?? null;
  const selectedCard = useMemo(() => {
    if (!session || !latestSelection) {
      return null;
    }

    return (
      getCardsForTable(session, latestSelection.tableType).find(
        (card: RewardCardOption) => card.optionId === selectedOptionId
      ) ?? null
    );
  }, [latestSelection, selectedOptionId, session]);

  const registerCardRef = useCallback(
    (optionId: string) => (node: HTMLButtonElement | null) => {
      cardRefs.current[optionId] = node;
    },
    []
  );

  const registerModalRef = useCallback((node: HTMLDivElement | null) => {
    modalRef.current = node;
  }, []);

  useEffect(() => {
    let cleanupTimer: number | null = null;

    if (!session || session.status !== 'resolving' || !selectedOptionId) {
      cleanupTimer = window.setTimeout(() => {
        setOverlayState(null);
      }, 0);

      return () => {
        if (cleanupTimer) {
          window.clearTimeout(cleanupTimer);
        }
      };
    }

    const cardNode = cardRefs.current[selectedOptionId];
    const modalNode = modalRef.current;

    if (!cardNode || !modalNode) {
      return undefined;
    }

    const cardRect = cardNode.getBoundingClientRect();
    const modalRect = modalNode.getBoundingClientRect();

    if (
      overlayState &&
      overlayState.optionId === selectedOptionId &&
      overlayState.cardRect.width === cardRect.width &&
      overlayState.cardRect.height === cardRect.height
    ) {
      return undefined;
    }

    cleanupTimer = window.setTimeout(() => {
      setOverlayState({ optionId: selectedOptionId, cardRect, modalRect });
    }, 0);

    return () => {
      if (cleanupTimer) {
        window.clearTimeout(cleanupTimer);
      }
    };
  }, [session, selectedOptionId, overlayState]);

  const isResolvingSelection =
    session?.status === 'resolving' && Boolean(selectedOptionId);

  const getSelectionState = useCallback(
    (optionId: string) => {
      if (!isResolvingSelection) {
        return 'idle' as const;
      }

      if (optionId === selectedOptionId) {
        return overlayState ? ('hidden' as const) : ('active' as const);
      }

      return 'dimmed' as const;
    },
    [isResolvingSelection, overlayState, selectedOptionId]
  );

  return {
    registerCardRef,
    registerModalRef,
    selectedOptionId,
    selectedCard,
    overlayState,
    getSelectionState,
  };
};
