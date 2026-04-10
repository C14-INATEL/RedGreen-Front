import type { CSSProperties } from 'react';
import { useEffect, useRef, useState } from 'react';
import { SlotMachineAmountDisplay } from './SlotMachineAmountDisplay';
import { SlotMachineButtons } from './SlotMachineButtons';
import { SLOT_COUNTER_COUNT, SlotMachineCounters } from './SlotMachineCounters';
import { SlotMachineLever } from './SlotMachineLever';
import { SlotMachineReels } from './SlotMachineReels';

const SLOT_MACHINE_SIZE = 4096;
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
    height: `${hasMachineSize ? Math.max(1, Math.round(area.height * yScale)) : 0}px`,
    left: `${Math.round(area.left * xScale)}px`,
    top: `${Math.round(area.top * yScale)}px`,
    width: `${hasMachineSize ? Math.max(1, Math.round(area.width * xScale)) : 0}px`,
  };
};

export const SlotMachinePixi = () => {
  const machineRef = useRef<HTMLDivElement | null>(null);
  const [machineSize, setMachineSize] = useState<{
    height: number;
    width: number;
  }>(EMPTY_MACHINE_SIZE);
  const [redButtonPressCount, setRedButtonPressCount] = useState(0);

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

  const handleRedButtonPress = () => {
    setRedButtonPressCount((currentCount) =>
      Math.min(currentCount + 1, SLOT_COUNTER_COUNT)
    );
  };

  const handleLeverPull = () => {
    setRedButtonPressCount(0);
  };

  const counterStates = Array.from(
    { length: SLOT_COUNTER_COUNT },
    (_, index) => index >= SLOT_COUNTER_COUNT - redButtonPressCount
  );

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
        style={getMachineAreaStyle(machineSize, SLOT_MACHINE_REEL_AREA)}
      />

      <SlotMachineButtons
        machineSize={machineSize}
        onRedButtonPress={handleRedButtonPress}
      />

      <SlotMachineCounters machineSize={machineSize} states={counterStates} />

      <SlotMachineAmountDisplay machineSize={machineSize} value={10} />

      <SlotMachineLever machineSize={machineSize} onPull={handleLeverPull} />
    </div>
  );
};
