import type { CSSProperties } from 'react';
import { useEffect, useRef, useState } from 'react';
import { SlotMachineAmountDisplay } from '../SlotMachineAmountDisplay';
import { SlotMachineButtons } from './SlotMachineButtons';
import { SlotMachineCounters } from './SlotMachineCounters';
import { SlotMachineLever } from './SlotMachineLever';
import {
  SlotMachineReels,
  type SlotMachineReelsMode,
  type SlotMachineReelsRerollRequest,
} from './SlotMachineReels';

const SLOT_MACHINE_SIZE = 4096;
const MAX_REROLLS = 5;
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

const getRerollCounterStates = (rerollsRemaining: number) => {
  const rerollsUsed = Math.max(0, MAX_REROLLS - rerollsRemaining);

  return Array.from(
    { length: MAX_REROLLS },
    (_, index) => index >= MAX_REROLLS - rerollsUsed
  );
};

export const SlotMachinePixi = () => {
  const machineRef = useRef<HTMLDivElement | null>(null);
  const [machineSize, setMachineSize] = useState<{
    height: number;
    width: number;
  }>(EMPTY_MACHINE_SIZE);
  const [idleRequestId, setIdleRequestId] = useState(0);
  const [machineMode, setMachineMode] =
    useState<SlotMachineReelsMode>('idle');
  const [pendingAction, setPendingAction] = useState<
    'idle' | 'reroll' | 'spin' | null
  >(null);
  const [realSpinRequestId, setRealSpinRequestId] = useState(0);
  const [rerollRequest, setRerollRequest] =
    useState<SlotMachineReelsRerollRequest | null>(null);
  const [rerollsRemaining, setRerollsRemaining] = useState(MAX_REROLLS);
  const [isMachineAnimating, setIsMachineAnimating] = useState(false);

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

  const canReturnToIdle =
    machineMode === 'resultHold' &&
    !isMachineAnimating &&
    pendingAction === null;
  const canStartSpin =
    machineMode === 'idle' && !isMachineAnimating && pendingAction === null;
  const canUseReroll =
    machineMode === 'resultHold' &&
    !isMachineAnimating &&
    pendingAction === null &&
    rerollsRemaining > 0;

  const handleLeverPull = () => {
    if (!canStartSpin) {
      return;
    }

    setPendingAction('spin');
    setRerollsRemaining(MAX_REROLLS);
    setRealSpinRequestId((currentValue) => currentValue + 1);
  };

  const handleReturnToIdle = () => {
    if (!canReturnToIdle) {
      return;
    }

    setPendingAction('idle');
    setIdleRequestId((currentValue) => currentValue + 1);
  };

  const handleRerollReel = (reelIndex: number) => {
    if (!canUseReroll) {
      return;
    }

    setPendingAction('reroll');
    setRerollsRemaining((currentValue) => Math.max(0, currentValue - 1));
    setRerollRequest((currentValue) => ({
      id: (currentValue?.id ?? 0) + 1,
      reelIndex,
    }));
  };

  const handleMachineModeChange = (nextMode: SlotMachineReelsMode) => {
    setMachineMode(nextMode);
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

  return (
    <div className="relative w-full max-w-[960px] shrink-0" ref={machineRef}>
      <img
        alt="CaÃ§a-nÃ­quel de teste"
        className="block w-full select-none"
        draggable={false}
        src="/SlotMachine/SpriteSlotMachine.png"
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
        rerollRequest={rerollRequest}
        spinRequestId={realSpinRequestId}
        style={getMachineAreaStyle(machineSize, SLOT_MACHINE_REEL_AREA)}
      />

      <SlotMachineButtons
        canResetToIdle={canReturnToIdle}
        canReroll={canUseReroll}
        machineSize={machineSize}
        onResetToIdle={handleReturnToIdle}
        onRerollReel={handleRerollReel}
      />

      <SlotMachineCounters
        machineSize={machineSize}
        states={getRerollCounterStates(rerollsRemaining)}
      />

      <SlotMachineAmountDisplay machineSize={machineSize} value={10} />

      <SlotMachineLever
        disabled={!canStartSpin}
        machineSize={machineSize}
        onPull={handleLeverPull}
      />
    </div>
  );
};
