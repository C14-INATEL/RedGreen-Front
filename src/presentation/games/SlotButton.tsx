import type { CSSProperties, PointerEvent } from 'react';
import { memo, useEffect, useRef, useState } from 'react';

const SLOT_MACHINE_TEXTURE_BASE_PATH = '/SlotMachine';
const PRESS_FEEDBACK_DURATION_MS = 120;

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
  const resetTimeoutRef = useRef<number | null>(null);
  const spriteSources = getSlotButtonSpriteSources(color);

  const clearResetTimeout = () => {
    if (resetTimeoutRef.current === null) {
      return;
    }

    window.clearTimeout(resetTimeoutRef.current);
    resetTimeoutRef.current = null;
  };

  const startPressFeedback = () => {
    clearResetTimeout();
    setPressed(true);

    resetTimeoutRef.current = window.setTimeout(() => {
      setPressed(false);
      resetTimeoutRef.current = null;
    }, PRESS_FEEDBACK_DURATION_MS);
  };

  const handlePointerDown = (event: PointerEvent<HTMLButtonElement>) => {
    event.preventDefault();
    startPressFeedback();
    onPress?.();
  };

  useEffect(
    () => () => {
      clearResetTimeout();
    },
    []
  );

  return (
    <button
      aria-label={label}
      className="pointer-events-auto absolute block border-0 bg-transparent p-0"
      onPointerDown={handlePointerDown}
      style={{
        ...style,
        touchAction: 'manipulation',
        transform: pressed ? 'scale(0.95)' : 'scale(1)',
        transformOrigin: 'center',
        transition: 'transform 80ms ease-out',
      }}
      type="button"
    >
      <img
        alt=""
        className="block h-full w-full select-none"
        draggable={false}
        src={pressed ? spriteSources.pressed : spriteSources.normal}
      />
    </button>
  );
};

export const SlotButton = memo(SlotButtonComponent);
