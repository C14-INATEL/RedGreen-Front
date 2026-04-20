import type { CSSProperties } from 'react';

const SLOT_MACHINE_SIZE = 4096;
const SLOT_DISPLAY_AREA = {
  height: 224,
  left: 1588,
  top: 2554,
  width: 624,
} as const;

type SlotMachineAmountDisplayProps = {
  machineSize: {
    height: number;
    width: number;
  };
  value?: number;
};

const clampDisplayValue = (value: number) =>
  Math.min(1000, Math.max(0, Math.trunc(value)));

const getScaledDisplayDimensions = (
  machineSize: SlotMachineAmountDisplayProps['machineSize']
) => {
  const xScale = machineSize.width / SLOT_MACHINE_SIZE;
  const yScale = machineSize.height / SLOT_MACHINE_SIZE;
  const hasMachineSize = machineSize.width > 0 && machineSize.height > 0;

  return {
    height: hasMachineSize
      ? Math.max(1, Math.round(SLOT_DISPLAY_AREA.height * yScale))
      : 0,
    width: hasMachineSize
      ? Math.max(1, Math.round(SLOT_DISPLAY_AREA.width * xScale))
      : 0,
    xScale,
    yScale,
  };
};

const getDisplayStyle = (
  machineSize: SlotMachineAmountDisplayProps['machineSize']
): CSSProperties => {
  const { height, width, xScale, yScale } =
    getScaledDisplayDimensions(machineSize);

  return {
    height: `${height}px`,
    left: `${Math.round(SLOT_DISPLAY_AREA.left * xScale)}px`,
    top: `${Math.round(SLOT_DISPLAY_AREA.top * yScale)}px`,
    width: `${width}px`,
  };
};

export const SlotMachineAmountDisplay = ({
  machineSize,
  value = 11,
}: SlotMachineAmountDisplayProps) => {
  const displayValue = `${clampDisplayValue(value)}$`;
  const { width } = getScaledDisplayDimensions(machineSize);
  const fontSize = Math.max(7, Math.min(Math.round(width * 0.18), 26));

  return (
    <div
      aria-label={`Valor atual ${displayValue}`}
      className="pointer-events-none absolute flex items-center justify-center"
      style={getDisplayStyle(machineSize)}
    >
      <span
        className="font-mono select-none"
        style={{
          color: '#7dd3fc',
          fontSize: `${fontSize}px`,
          letterSpacing: '-0.05em',
          lineHeight: 1,
          maxWidth: '100%',
          overflow: 'hidden',
          paddingInline: '3px',
          textAlign: 'center',
          textShadow:
            '0 0 4px rgba(125, 211, 252, 0.35), 1px 1px 0 rgba(5, 18, 33, 0.9)',
          whiteSpace: 'nowrap',
        }}
      >
        {displayValue}
      </span>
    </div>
  );
};
