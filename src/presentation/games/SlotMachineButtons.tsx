import type { CSSProperties } from 'react';
import { SlotButton, type SlotButtonColor } from './SlotButton';

const SLOT_MACHINE_SIZE = 4096;
const SLOT_BUTTON_SIZE = 224;
const SLOT_BUTTON_PANEL_TOP = 1955;
const SLOT_BUTTON_PANEL_LEFT = 1411;
const SLOT_BUTTON_STEP = 352;

type SlotButtonLayout = {
  color: SlotButtonColor;
  id: string;
  label: string;
  left: number;
  top: number;
};

const toPercent = (value: number) => `${(value / SLOT_MACHINE_SIZE) * 100}%`;

const getSlotButtonStyle = (
  left: number,
  top: number
): CSSProperties => ({
  height: toPercent(SLOT_BUTTON_SIZE),
  left: toPercent(left),
  top: toPercent(top),
  width: toPercent(SLOT_BUTTON_SIZE),
});

const SLOT_BUTTON_LAYOUTS: readonly SlotButtonLayout[] = Array.from(
  { length: 4 },
  (_, index) => ({
    color: 'red',
    id: `slot-button-${index + 1}`,
    label: `Botao ${index + 1} da maquina`,
    left: SLOT_BUTTON_PANEL_LEFT + SLOT_BUTTON_STEP * index,
    top: SLOT_BUTTON_PANEL_TOP,
  })
);

export const SlotMachineButtons = () => (
  <div className="pointer-events-none absolute inset-0">
    {SLOT_BUTTON_LAYOUTS.map(({ color, id, label, left, top }) => (
      <SlotButton
        color={color}
        key={id}
        label={label}
        style={getSlotButtonStyle(left, top)}
      />
    ))}
  </div>
);
