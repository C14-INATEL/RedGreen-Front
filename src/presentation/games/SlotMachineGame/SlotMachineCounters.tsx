import { SlotMachineCounter } from './SlotMachineCounter';
import { MAX_REROLLS } from './slotMachineGameConfig';

const SLOT_MACHINE_SIZE = 4096;
const SLOT_COUNTER_SIZE = {
  height: 224,
  width: 160,
} as const;
const SLOT_COUNTER_PANEL_TOP = 2240;
const SLOT_COUNTER_PANEL_LEFT = 1504;
const SLOT_COUNTER_STEP = 224;

type SlotMachineCountersProps = {
  machineSize: {
    height: number;
    width: number;
  };
  states?: readonly boolean[];
};

type SlotMachineCounterLayout = {
  id: string;
  left: number;
  top: number;
};

const DEFAULT_COUNTER_STATES = Array.from(
  { length: MAX_REROLLS },
  () => false
) as readonly boolean[];

const getSlotCounterLayouts = (counterCount: number) =>
  Array.from({ length: counterCount }, (_, index) => ({
    id: `slot-counter-${index + 1}`,
    left: SLOT_COUNTER_PANEL_LEFT + SLOT_COUNTER_STEP * index,
    top: SLOT_COUNTER_PANEL_TOP,
  })) as readonly SlotMachineCounterLayout[];

const getSlotCounterStyle = (
  left: number,
  top: number,
  machineSize: SlotMachineCountersProps['machineSize']
) => {
  const xScale = machineSize.width / SLOT_MACHINE_SIZE;
  const yScale = machineSize.height / SLOT_MACHINE_SIZE;
  const hasMachineSize = machineSize.width > 0 && machineSize.height > 0;
  const width = hasMachineSize
    ? Math.max(1, Math.round(SLOT_COUNTER_SIZE.width * xScale))
    : 0;
  const height = hasMachineSize
    ? Math.max(1, Math.round(SLOT_COUNTER_SIZE.height * yScale))
    : 0;

  return {
    height: `${height}px`,
    left: `${Math.round(left * xScale)}px`,
    top: `${Math.round(top * yScale)}px`,
    width: `${width}px`,
  };
};

export const SlotMachineCounters = ({
  machineSize,
  states = DEFAULT_COUNTER_STATES,
}: SlotMachineCountersProps) => {
  const normalizedStates = states.length > 0 ? states : DEFAULT_COUNTER_STATES;
  const counterLayouts = getSlotCounterLayouts(normalizedStates.length);

  return (
    <div className="pointer-events-none absolute inset-0">
      {counterLayouts.map(({ id, left, top }, index) => (
        <SlotMachineCounter
          active={normalizedStates[index] ?? false}
          key={id}
          style={getSlotCounterStyle(left, top, machineSize)}
        />
      ))}
    </div>
  );
};
