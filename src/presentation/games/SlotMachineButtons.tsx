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

type SlotMachineButtonsProps = {
  machineSize: {
    height: number;
    width: number;
  };
};

const getSlotButtonStyle = (
  left: number,
  top: number,
  machineSize: SlotMachineButtonsProps['machineSize']
) => {
  const xScale = machineSize.width / SLOT_MACHINE_SIZE;
  const yScale = machineSize.height / SLOT_MACHINE_SIZE;
  const hasMachineSize = machineSize.width > 0 && machineSize.height > 0;

  return {
    height: `${hasMachineSize ? Math.max(1, Math.round(SLOT_BUTTON_SIZE * yScale)) : 0}px`,
    left: `${Math.round(left * xScale)}px`,
    top: `${Math.round(top * yScale)}px`,
    width: `${hasMachineSize ? Math.max(1, Math.round(SLOT_BUTTON_SIZE * xScale)) : 0}px`,
  };
};

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

export const SlotMachineButtons = ({ machineSize }: SlotMachineButtonsProps) => (
  <div className="pointer-events-none absolute inset-0">
    {SLOT_BUTTON_LAYOUTS.map(({ color, id, label, left, top }) => (
      <SlotButton
        color={color}
        key={id}
        label={label}
        style={getSlotButtonStyle(left, top, machineSize)}
      />
    ))}
  </div>
);
