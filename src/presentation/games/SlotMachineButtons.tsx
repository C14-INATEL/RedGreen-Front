import { SlotButton, type SlotButtonColor } from './SlotButton';

const SLOT_MACHINE_SIZE = 4096;
const SLOT_BUTTON_SIZE = 224;
const SLOT_BUTTON_PANEL_TOP = 1955;
const SLOT_BUTTON_PANEL_LEFT = 1411;
const SLOT_BUTTON_STEP = 352;
const SLOT_BUTTON_HALF_SIZE = SLOT_BUTTON_SIZE / 2;
const SLOT_TOP_BUTTON_COUNT = 4;
const SLOT_BLUE_BUTTON_CENTER = {
  x: 2416,
  y: 2640,
} as const;
const SLOT_BUTTON_CENTER_OFFSET = {
  x: 0,
  y: 0,
} as const;

type SlotButtonLayout = {
  centerX: number;
  centerY: number;
  color: SlotButtonColor;
  id: string;
  label: string;
};

type SlotButtonLayoutConfig = {
  centerX?: number;
  centerY?: number;
  color: SlotButtonColor;
  id: string;
  label: string;
  offsetX?: number;
  offsetY?: number;
  slotIndex?: number;
};

type SlotMachineButtonsProps = {
  machineSize: {
    height: number;
    width: number;
  };
};

const getSlotButtonStyle = (
  centerX: number,
  centerY: number,
  machineSize: SlotMachineButtonsProps['machineSize']
) => {
  const xScale = machineSize.width / SLOT_MACHINE_SIZE;
  const yScale = machineSize.height / SLOT_MACHINE_SIZE;
  const hasMachineSize = machineSize.width > 0 && machineSize.height > 0;
  const width = hasMachineSize
    ? Math.max(1, Math.round(SLOT_BUTTON_SIZE * xScale))
    : 0;
  const height = hasMachineSize
    ? Math.max(1, Math.round(SLOT_BUTTON_SIZE * yScale))
    : 0;
  const snappedCenterX = Math.round(centerX * xScale);
  const snappedCenterY = Math.round(centerY * yScale);

  // Mirror anchor 0.5 semantics with integer math to keep the overlay pixel-perfect.
  return {
    height: `${height}px`,
    left: `${snappedCenterX - Math.floor(width / 2)}px`,
    top: `${snappedCenterY - Math.floor(height / 2)}px`,
    width: `${width}px`,
  };
};

const SLOT_BUTTON_LAYOUT_CONFIGS: readonly SlotButtonLayoutConfig[] = [
  ...Array.from({ length: SLOT_TOP_BUTTON_COUNT }, (_, index) => ({
    color: 'red' as const,
    id: `slot-button-${index + 1}`,
    label: `Botao ${index + 1} da maquina`,
    slotIndex: index,
  })),
  {
    color: 'blue',
    centerX: SLOT_BLUE_BUTTON_CENTER.x,
    centerY: SLOT_BLUE_BUTTON_CENTER.y,
    id: 'slot-button-blue',
    label: 'Botao azul da maquina',
  },
];

const SLOT_BUTTON_LAYOUTS: readonly SlotButtonLayout[] =
  SLOT_BUTTON_LAYOUT_CONFIGS.map(
    ({
      centerX,
      centerY,
      color,
      id,
      label,
      offsetX = 0,
      offsetY = 0,
      slotIndex,
    }) => ({
      centerX:
        (centerX ??
          SLOT_BUTTON_PANEL_LEFT +
            SLOT_BUTTON_HALF_SIZE +
            SLOT_BUTTON_STEP * (slotIndex ?? 0)) +
        SLOT_BUTTON_CENTER_OFFSET.x +
        offsetX,
      centerY:
        (centerY ?? SLOT_BUTTON_PANEL_TOP + SLOT_BUTTON_HALF_SIZE) +
        SLOT_BUTTON_CENTER_OFFSET.y +
        offsetY,
      color,
      id,
      label,
    })
  );

export const SlotMachineButtons = ({
  machineSize,
}: SlotMachineButtonsProps) => (
  <div className="pointer-events-none absolute inset-0">
    {SLOT_BUTTON_LAYOUTS.map(({ centerX, centerY, color, id, label }) => (
      <SlotButton
        color={color}
        key={id}
        label={label}
        style={getSlotButtonStyle(centerX, centerY, machineSize)}
      />
    ))}
  </div>
);
