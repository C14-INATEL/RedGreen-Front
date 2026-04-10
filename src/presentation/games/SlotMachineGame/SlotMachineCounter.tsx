import type { CSSProperties } from 'react';
import { memo, useEffect } from 'react';

const SLOT_MACHINE_TEXTURE_BASE_PATH = '/SlotMachine';

type SlotMachineCounterProps = {
  active?: boolean;
  style: CSSProperties;
};

const getSlotMachineCounterSpriteSources = () => ({
  off: `${SLOT_MACHINE_TEXTURE_BASE_PATH}/SpriteCounterOff.png`,
  on: `${SLOT_MACHINE_TEXTURE_BASE_PATH}/SpriteCounterOn.png`,
});

const SlotMachineCounterComponent = ({
  active = false,
  style,
}: SlotMachineCounterProps) => {
  const spriteSources = getSlotMachineCounterSpriteSources();
  const currentSpriteSource = active ? spriteSources.on : spriteSources.off;

  useEffect(() => {
    [spriteSources.off, spriteSources.on].forEach((source) => {
      const image = new Image();
      image.src = source;
    });
  }, [spriteSources.off, spriteSources.on]);

  return (
    <img
      alt=""
      aria-hidden
      className="absolute block select-none"
      draggable={false}
      src={currentSpriteSource}
      style={{
        ...style,
        imageRendering: 'pixelated',
      }}
    />
  );
};

export const SlotMachineCounter = memo(SlotMachineCounterComponent);
