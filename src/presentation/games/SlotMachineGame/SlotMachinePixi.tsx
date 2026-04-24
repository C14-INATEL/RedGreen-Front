import type { CSSProperties } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useUserChips } from '@application/hooks/useUserChips';
import { SlotMachineAmountDisplay } from './SlotMachineAmountDisplay';
import { SlotMachineButtons } from './SlotMachineButtons';
import { SlotMachineCounters } from './SlotMachineCounters';
import { SlotMachineLever } from './SlotMachineLever';
import {
  buildRerollAnimationFromSession,
  buildSpinAnimationFromSession,
  cashOutActiveSlotSession,
  createSlotSession,
  fetchActiveSlotSession,
  fetchSlotMachines,
  getPreferredSlotMachine,
  getSlotMachineErrorMessage,
  getSlotMachineSessionState,
  rerollActiveSlotSession,
  type SlotMachineApiSession,
} from './slotMachineApi';
import {
  SlotMachineReels,
  type SlotMachineReelsMode,
  type SlotMachineReelsRestoreRequest,
  type SlotMachineReelsRerollRequest,
  type SlotMachineReelsSpinRequest,
} from './SlotMachineReels';

const SLOT_MACHINE_SIZE = 4096;
const SLOT_MACHINE_BASE_SPRITE = '/SlotMachine/SpriteSlotMachine.png';
const SLOT_MACHINE_ANIMATION_FRAME_SOURCES = Array.from(
  { length: 8 },
  (_, index) => `/SlotMachine/SpriteSlotMachine${index}.png`
);
const SLOT_MACHINE_ANIMATION_FRAME_DURATION_MS = 333;
const SLOT_RED_BUTTON_TOGGLE_FRAME_DURATION_MS = 120;
const SLOT_MACHINE_REEL_AREA = {
  height: 728,
  left: 928,
  top: 608,
  width: 2200,
} as const;

const EMPTY_MACHINE_SIZE = {
  height: 0,
  width: 0,
};

type SlotMachinePixiProps = {
  animateMachineSprite?: boolean;
};

type ApplySessionStateOptions = {
  deferDisplayValue?: boolean;
};

const getMachineAreaStyle = (
  machineSize: { height: number; width: number },
  area: typeof SLOT_MACHINE_REEL_AREA
): CSSProperties => {
  const xScale = machineSize.width / SLOT_MACHINE_SIZE;
  const yScale = machineSize.height / SLOT_MACHINE_SIZE;
  const hasMachineSize = machineSize.width > 0 && machineSize.height > 0;

  return {
    height: `${
      hasMachineSize ? Math.max(1, Math.round(area.height * yScale)) : 0
    }px`,
    left: `${Math.round(area.left * xScale)}px`,
    top: `${Math.round(area.top * yScale)}px`,
    width: `${
      hasMachineSize ? Math.max(1, Math.round(area.width * xScale)) : 0
    }px`,
  };
};

const getRerollCounterStates = (
  rerollsRemaining: number,
  rerollsMax: number
) => {
  const safeRerollsMax = Math.max(0, rerollsMax);
  const rerollsUsed = Math.max(0, safeRerollsMax - rerollsRemaining);

  return Array.from(
    { length: safeRerollsMax },
    (_, index) => index >= safeRerollsMax - rerollsUsed
  );
};

export const SlotMachinePixi = ({
  animateMachineSprite = false,
}: SlotMachinePixiProps) => {
  const { mutate: mutateUserChips } = useUserChips();
  const machineRef = useRef<HTMLDivElement | null>(null);
  const [machineSize, setMachineSize] = useState<{
    height: number;
    width: number;
  }>(EMPTY_MACHINE_SIZE);
  const [slotSession, setSlotSession] = useState<SlotMachineApiSession | null>(
    null
  );
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [displayValue, setDisplayValue] = useState(0);
  const [pendingDisplayValue, setPendingDisplayValue] = useState<number | null>(
    null
  );
  const [selectedMachineId, setSelectedMachineId] = useState<number | null>(
    null
  );
  const [defaultMaxRerolls, setDefaultMaxRerolls] = useState(0);
  const [idleRequestId, setIdleRequestId] = useState(0);
  const [machineMode, setMachineMode] = useState<SlotMachineReelsMode>('idle');
  const [pendingAction, setPendingAction] = useState<
    'idle' | 'reroll' | 'spin' | null
  >(null);
  const [restoreRequest, setRestoreRequest] =
    useState<SlotMachineReelsRestoreRequest | null>(null);
  const [realSpinRequest, setRealSpinRequest] =
    useState<SlotMachineReelsSpinRequest | null>(null);
  const [rerollRequest, setRerollRequest] =
    useState<SlotMachineReelsRerollRequest | null>(null);
  const [rerollsRemaining, setRerollsRemaining] = useState(0);
  const [isMachineAnimating, setIsMachineAnimating] = useState(false);
  const [isLeverAnimating, setIsLeverAnimating] = useState(false);
  const [isLeverToggleActive, setIsLeverToggleActive] = useState(false);
  const [isLoadingSlotData, setIsLoadingSlotData] = useState(true);
  const [isSubmittingAction, setIsSubmittingAction] = useState(false);
  const [machineSpriteFrameIndex, setMachineSpriteFrameIndex] = useState(0);

  useEffect(() => {
    const machine = machineRef.current;

    if (!machine) {
      return undefined;
    }

    const updateMachineSize = () => {
      setMachineSize({
        height: Math.round(machine.clientHeight),
        width: Math.round(machine.clientWidth),
      });
    };

    updateMachineSize();

    const observer =
      typeof ResizeObserver === 'undefined'
        ? null
        : new ResizeObserver(() => {
            updateMachineSize();
          });

    observer?.observe(machine);

    return () => {
      observer?.disconnect();
    };
  }, []);

  useEffect(() => {
    [SLOT_MACHINE_BASE_SPRITE, ...SLOT_MACHINE_ANIMATION_FRAME_SOURCES].forEach(
      (source) => {
        const image = new Image();
        image.src = source;
      }
    );
  }, []);

  useEffect(() => {
    if (!animateMachineSprite) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      setMachineSpriteFrameIndex(
        (currentValue) =>
          (currentValue + 1) % SLOT_MACHINE_ANIMATION_FRAME_SOURCES.length
      );
    }, SLOT_MACHINE_ANIMATION_FRAME_DURATION_MS);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [animateMachineSprite]);

  useEffect(() => {
    if (!isLeverAnimating) {
      setIsLeverToggleActive(false);
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      setIsLeverToggleActive((currentValue) => !currentValue);
    }, SLOT_RED_BUTTON_TOGGLE_FRAME_DURATION_MS);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [isLeverAnimating]);

  const applySessionState = (
    nextSession: SlotMachineApiSession,
    options: ApplySessionStateOptions = {}
  ) => {
    const sessionState = getSlotMachineSessionState(nextSession);

    setSlotSession(nextSession);
    setSelectedMachineId(nextSession.SlotMachineId);
    setDefaultMaxRerolls(sessionState.rerollsMax);
    setRerollsRemaining(sessionState.rerollsRemaining);

    if (options.deferDisplayValue) {
      setPendingDisplayValue(sessionState.reward);
      return;
    }

    setDisplayValue(sessionState.reward);
    setPendingDisplayValue(null);
  };

  const clearSessionState = (nextMaxRerolls: number) => {
    const safeMaxRerolls = Math.max(0, nextMaxRerolls);

    setSlotSession(null);
    setDisplayValue(0);
    setPendingDisplayValue(null);
    setDefaultMaxRerolls(safeMaxRerolls);
    setRerollsRemaining(safeMaxRerolls);
  };

  useEffect(() => {
    let isMounted = true;

    const loadSlotState = async () => {
      setIsLoadingSlotData(true);
      setStatusMessage(null);

      try {
        const [activeSession, slotMachines] = await Promise.all([
          fetchActiveSlotSession(),
          fetchSlotMachines(),
        ]);

        if (!isMounted) {
          return;
        }

        const preferredMachine = getPreferredSlotMachine(
          slotMachines,
          activeSession
        );

        setSelectedMachineId(
          preferredMachine?.SlotMachineId ??
            activeSession?.SlotMachineId ??
            null
        );

        if (activeSession) {
          applySessionState(activeSession);
          setRestoreRequest((currentValue) => ({
            id: (currentValue?.id ?? 0) + 1,
            result: buildSpinAnimationFromSession(activeSession),
          }));
        } else {
          const fallbackMaxRerolls = preferredMachine?.MaxRerolls ?? 0;
          clearSessionState(fallbackMaxRerolls);

          if (!preferredMachine) {
            setStatusMessage('Nenhuma slot machine disponível no backend.');
          }
        }
      } catch (error) {
        if (!isMounted) {
          return;
        }

        clearSessionState(0);
        setSelectedMachineId(null);
        setStatusMessage(
          getSlotMachineErrorMessage(
            error,
            'Não foi possível carregar a slot machine.'
          )
        );
      } finally {
        if (isMounted) {
          setIsLoadingSlotData(false);
        }
      }
    };

    void loadSlotState();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleLeverAnimationStateChange = useCallback(
    (nextIsAnimating: boolean) => {
      setIsLeverAnimating(nextIsAnimating);
      setIsLeverToggleActive(false);
    },
    []
  );

  const canReturnToIdle =
    slotSession !== null &&
    machineMode === 'resultHold' &&
    !isMachineAnimating &&
    pendingAction === null &&
    !isSubmittingAction;
  const canStartSpin =
    selectedMachineId !== null &&
    machineMode === 'idle' &&
    !isMachineAnimating &&
    pendingAction === null &&
    !isSubmittingAction &&
    !isLoadingSlotData;
  const canUseReroll =
    slotSession !== null &&
    machineMode === 'resultHold' &&
    !isMachineAnimating &&
    pendingAction === null &&
    !isSubmittingAction &&
    rerollsRemaining > 0;

  const handleLeverPull = async () => {
    if (!canStartSpin || selectedMachineId === null) {
      return;
    }

    setPendingAction('spin');
    setIsSubmittingAction(true);
    setStatusMessage(null);

    try {
      const { session } = await createSlotSession(selectedMachineId);

      applySessionState(session, {
        deferDisplayValue: true,
      });
      setRealSpinRequest((currentValue) => ({
        id: (currentValue?.id ?? 0) + 1,
        result: buildSpinAnimationFromSession(session),
      }));
      void mutateUserChips();
    } catch (error) {
      setPendingAction(null);
      setStatusMessage(
        getSlotMachineErrorMessage(error, 'Não foi possível iniciar a rodada.')
      );
    } finally {
      setIsSubmittingAction(false);
    }
  };

  const handleReturnToIdle = async () => {
    if (!canReturnToIdle || !slotSession) {
      return;
    }

    setPendingAction('idle');
    setIsSubmittingAction(true);
    setStatusMessage(null);

    try {
      const { rerollsMax } = getSlotMachineSessionState(slotSession);

      await cashOutActiveSlotSession();
      clearSessionState(rerollsMax);
      setIdleRequestId((currentValue) => currentValue + 1);
      void mutateUserChips();
    } catch (error) {
      setPendingAction(null);
      setStatusMessage(
        getSlotMachineErrorMessage(error, 'Não foi possível encerrar a rodada.')
      );
    } finally {
      setIsSubmittingAction(false);
    }
  };

  const handleRerollReel = async (reelIndex: number) => {
    if (!canUseReroll) {
      return;
    }

    setPendingAction('reroll');
    setIsSubmittingAction(true);
    setStatusMessage(null);

    try {
      const { session } = await rerollActiveSlotSession(reelIndex);

      applySessionState(session, {
        deferDisplayValue: true,
      });
      setRerollRequest((currentValue) => ({
        id: (currentValue?.id ?? 0) + 1,
        reelIndex,
        result: buildRerollAnimationFromSession(session, reelIndex),
      }));
      void mutateUserChips();
    } catch (error) {
      setPendingAction(null);
      setStatusMessage(
        getSlotMachineErrorMessage(error, 'Não foi possível refazer o reel.')
      );
    } finally {
      setIsSubmittingAction(false);
    }
  };

  const handleMachineModeChange = (nextMode: SlotMachineReelsMode) => {
    setMachineMode(nextMode);

    if (nextMode === 'resultHold' && pendingDisplayValue !== null) {
      setDisplayValue(pendingDisplayValue);
      setPendingDisplayValue(null);
    }

    setPendingAction((currentValue) => {
      if (currentValue === 'idle' && nextMode === 'idle') {
        return null;
      }

      if (currentValue === 'spin' && nextMode === 'realSpin') {
        return null;
      }

      if (currentValue === 'reroll' && nextMode === 'rerollSpin') {
        return null;
      }

      return currentValue;
    });
  };

  const handleLeverAnimationStateChange = useCallback(
    (nextIsAnimating: boolean) => {
      setIsLeverAnimating(nextIsAnimating);
      setIsLeverToggleActive(false);
    },
    []
  );

  const currentMachineSpriteSource = animateMachineSprite
    ? SLOT_MACHINE_ANIMATION_FRAME_SOURCES[machineSpriteFrameIndex]
    : SLOT_MACHINE_BASE_SPRITE;
  const currentLeverToggleActive = isLeverAnimating && isLeverToggleActive;

  return (
    <div className="relative w-full max-w-[960px] shrink-0" ref={machineRef}>
      <img
        alt="Caca-niquel de teste"
        className="block w-full select-none"
        draggable={false}
        src={currentMachineSpriteSource}
        style={{
          imageRendering: 'pixelated',
        }}
      />

      <SlotMachineReels
        className="pointer-events-none absolute"
        idleRequestId={idleRequestId}
        onMachineModeChange={handleMachineModeChange}
        onRealSpinStateChange={(isRunning) => {
          setIsMachineAnimating(isRunning);

          if (isRunning) {
            setPendingAction(null);
          }
        }}
        restoreRequest={restoreRequest}
        rerollRequest={rerollRequest}
        spinRequest={realSpinRequest}
        style={getMachineAreaStyle(machineSize, SLOT_MACHINE_REEL_AREA)}
      />

      <SlotMachineButtons
        canResetToIdle={canReturnToIdle}
        canReroll={canUseReroll}
        isLeverAnimating={isLeverAnimating}
        isLeverToggleActive={currentLeverToggleActive}
        machineSize={machineSize}
        onResetToIdle={handleReturnToIdle}
        onRerollReel={handleRerollReel}
      />

      <SlotMachineCounters
        machineSize={machineSize}
        states={getRerollCounterStates(rerollsRemaining, defaultMaxRerolls)}
      />

      <SlotMachineAmountDisplay
        machineSize={machineSize}
        value={displayValue}
      />

      <SlotMachineLever
        disabled={!canStartSpin}
        machineSize={machineSize}
        onAnimationStateChange={handleLeverAnimationStateChange}
        onPull={handleLeverPull}
      />

      {statusMessage ? (
        <div className="absolute left-1/2 top-full mt-3 w-full -translate-x-1/2 px-4 text-center">
          <span className="font-mono text-[11px] text-[#f2d680]">
            {statusMessage}
          </span>
        </div>
      ) : null}
    </div>
  );
};
