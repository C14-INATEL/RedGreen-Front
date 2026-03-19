import type { CSSProperties, PointerEvent } from 'react';
import { memo, useEffect, useState } from 'react';

const SLOT_MACHINE_TEXTURE_BASE_PATH = '/SlotMachine';

export type SlotButtonColor = 'blue' | 'red';

type SlotButtonProps = {
  color: SlotButtonColor;
  label: string;
  onPress?: () => void;
  style: CSSProperties;
};

const toPascalCase = (value: string) =>
  value.charAt(0).toUpperCase() + value.slice(1);

const getSlotButtonSpriteSources = (color: SlotButtonColor) => {
  const colorName = toPascalCase(color);

  return {
    normal: `${SLOT_MACHINE_TEXTURE_BASE_PATH}/Sprite${colorName}Button.png`,
    pressed: `${SLOT_MACHINE_TEXTURE_BASE_PATH}/Sprite${colorName}ButtonPressed.png`,
  };
};

const SlotButtonComponent = ({
  color,
  label,
  onPress,
  style,
}: SlotButtonProps) => {
  const [pressed, setPressed] = useState(false);
  const spriteSources = getSlotButtonSpriteSources(color);
  const currentSpriteSource = pressed
    ? spriteSources.pressed
    : spriteSources.normal;

  const handlePointerDown = (event: PointerEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setPressed(true);
    onPress?.();
  };

  const endPressFeedback = () => {
    setPressed(false);
  };

  useEffect(() => {
    [spriteSources.normal, spriteSources.pressed].forEach((source) => {
      const image = new Image();
      image.src = source;
    });
  }, [spriteSources.normal, spriteSources.pressed]);

  return (
    <button
      aria-label={label}
      aria-pressed={pressed}
      className="pointer-events-auto absolute block"
      onBlur={endPressFeedback}
      onPointerCancel={endPressFeedback}
      onPointerDown={handlePointerDown}
      onPointerLeave={endPressFeedback}
      onPointerUp={endPressFeedback}
      style={{
        ...style,
        WebkitAppearance: 'none',
        WebkitTapHighlightColor: 'transparent',
        appearance: 'none',
        background: 'transparent',
        border: 'none',
        boxShadow: 'none',
        imageRendering: 'pixelated',
        margin: 0,
        outline: 'none',
        padding: 0,
        touchAction: 'manipulation',
      }}
      type="button"
    >
      <img
        alt=""
        className="block h-full w-full select-none"
        draggable={false}
        src={currentSpriteSource}
        style={{
          imageRendering: 'pixelated',
        }}
      />
    </button>
  );
};

export const SlotButton = memo(SlotButtonComponent);
