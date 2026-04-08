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

type SlotButtonLayout = {
  action: 'reroll' | 'resetIdle';
  centerX: number;
  centerY: number;
  color: SlotButtonColor;
  id: string;
  label: string;
  reelIndex?: number;
};

type SlotButtonLayoutConfig = {
  action?: 'reroll' | 'resetIdle';
  centerX?: number;
  centerY?: number;
  color: SlotButtonColor;
  id: string;
  label: string;
  offsetX?: number;
  offsetY?: number;
  reelIndex?: number;
};

type SlotMachineButtonsProps = {
  canResetToIdle?: boolean;
  canReroll?: boolean;
  machineSize: {
    height: number;
    width: number;
  };
  onResetToIdle?: () => void;
  onRerollReel?: (reelIndex: number) => void;
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

  return {
    height: `${height}px`,
    left: `${snappedCenterX - Math.floor(width / 2)}px`,
    top: `${snappedCenterY - Math.floor(height / 2)}px`,
    width: `${width}px`,
  };
};

const SLOT_BUTTON_LAYOUT_CONFIGS: readonly SlotButtonLayoutConfig[] = [
  ...Array.from({ length: SLOT_TOP_BUTTON_COUNT }, (_, index) => ({
    action: 'reroll' as const,
    color: 'red' as const,
    id: `slot-button-${index + 1}`,
    label: `Botao ${index + 1} da maquina`,
    reelIndex: index,
  })),
  {
    action: 'resetIdle',
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
      action = 'reroll',
      reelIndex,
    }) => ({
      action,
      centerX:
        (centerX ??
          SLOT_BUTTON_PANEL_LEFT +
            SLOT_BUTTON_HALF_SIZE +
            SLOT_BUTTON_STEP * (reelIndex ?? 0)) + offsetX,
      centerY:
        (centerY ?? SLOT_BUTTON_PANEL_TOP + SLOT_BUTTON_HALF_SIZE) + offsetY,
      color,
      id,
      label,
      reelIndex,
    })
  );

export const SlotMachineButtons = ({
  canResetToIdle = false,
  canReroll = false,
  machineSize,
  onResetToIdle,
  onRerollReel,
}: SlotMachineButtonsProps) => (
  <div className="pointer-events-none absolute inset-0">
    {SLOT_BUTTON_LAYOUTS.map(
      ({ action, centerX, centerY, color, id, label, reelIndex }) => (
        <SlotButton
          color={color}
          disabled={
            action === 'resetIdle'
              ? !canResetToIdle
              : !canReroll || reelIndex === undefined
          }
          key={id}
          label={label}
          onPress={() => {
            if (action === 'resetIdle') {
              onResetToIdle?.();
              return;
            }

            if (reelIndex === undefined) {
              return;
            }

            onRerollReel?.(reelIndex);
          }}
          style={getSlotButtonStyle(centerX, centerY, machineSize)}
        />
      )
    )}
  </div>
);
