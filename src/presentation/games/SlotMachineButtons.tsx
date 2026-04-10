import type { ComponentProps } from 'react';
import { SlotMachineButtons as SlotMachineGameButtons } from './SlotMachineGame/SlotMachineButtons';

export type SlotMachineButtonsProps = ComponentProps<
  typeof SlotMachineGameButtons
> & {
  onRedButtonPress?: () => void;
};

export const SlotMachineButtons = ({
  canReroll,
  onRedButtonPress,
  onRerollReel,
  ...props
}: SlotMachineButtonsProps) => {
  const shouldUseLegacyRedButtonApi =
    onRerollReel === undefined && onRedButtonPress !== undefined;

  return (
    <SlotMachineGameButtons
      {...props}
      canReroll={shouldUseLegacyRedButtonApi ? true : canReroll}
      onRerollReel={
        shouldUseLegacyRedButtonApi ? () => onRedButtonPress?.() : onRerollReel
      }
    />
  );
};
