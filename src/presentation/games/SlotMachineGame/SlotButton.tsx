import type { CSSProperties, PointerEvent } from 'react';
import { memo, useEffect, useRef, useState } from 'react';

const SLOT_MACHINE_TEXTURE_BASE_PATH = '/SlotMachine';
const PRESS_FEEDBACK_DURATION_MS = 120;

export type SlotButtonColor = 'blue' | 'red';

type SlotButtonProps = {
  color: SlotButtonColor;
  disabled?: boolean;
  isLeverAnimating?: boolean;
  isLeverToggleActive?: boolean;
  label: string;
  onPress?: () => void;
  style: CSSProperties;
};

const toPascalCase = (value: string) =>
  value.charAt(0).toUpperCase() + value.slice(1);

const getSlotButtonSpriteSources = (color: SlotButtonColor) => {
  const colorName = toPascalCase(color);
  const normal = `${SLOT_MACHINE_TEXTURE_BASE_PATH}/Sprite${colorName}Button.png`;

  return {
    idle:
      color === 'red'
        ? `${SLOT_MACHINE_TEXTURE_BASE_PATH}/SpriteRedButtonOff.png`
        : normal,
    normal,
    pressed: `${SLOT_MACHINE_TEXTURE_BASE_PATH}/Sprite${colorName}ButtonPressed.png`,
  };
};

const SlotButtonComponent = ({
  color,
  disabled = false,
  isLeverAnimating = false,
  isLeverToggleActive = false,
  label,
  onPress,
  style,
}: SlotButtonProps) => {
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);
  const resetTimeoutRef = useRef<number | null>(null);
  const spriteSources = getSlotButtonSpriteSources(color);

  const getCurrentSpriteSource = () => {
    if (pressed) {
      return spriteSources.pressed;
    }

    if (color === 'red' && isLeverAnimating) {
      return isLeverToggleActive ? spriteSources.normal : spriteSources.idle;
    }

    if (color === 'red' && hovered) {
      return spriteSources.normal;
    }

    return spriteSources.idle;
  };

  const currentSpriteSource = getCurrentSpriteSource();

  const clearResetTimeout = () => {
    if (resetTimeoutRef.current === null) {
      return;
    }

    window.clearTimeout(resetTimeoutRef.current);
    resetTimeoutRef.current = null;
  };

  const handlePointerDown = (event: PointerEvent<HTMLButtonElement>) => {
    event.preventDefault();

    if (disabled) {
      return;
    }

    clearResetTimeout();
    setPressed(true);
    onPress?.();

    resetTimeoutRef.current = window.setTimeout(() => {
      setPressed(false);
      resetTimeoutRef.current = null;
    }, PRESS_FEEDBACK_DURATION_MS);
  };

  const endPressFeedback = () => {
    clearResetTimeout();
    setPressed(false);
  };

  useEffect(() => {
    [spriteSources.idle, spriteSources.normal, spriteSources.pressed].forEach(
      (source) => {
        const image = new Image();
        image.src = source;
      }
    );
  }, [spriteSources.idle, spriteSources.normal, spriteSources.pressed]);

  useEffect(
    () => () => {
      clearResetTimeout();
    },
    []
  );

  return (
    <button
      aria-disabled={disabled}
      aria-label={label}
      aria-pressed={pressed}
      className="pointer-events-auto absolute block"
      disabled={disabled}
      onBlur={endPressFeedback}
      onPointerEnter={() => {
        setHovered(true);
      }}
      onPointerLeave={() => {
        setHovered(false);
      }}
      onPointerCancel={endPressFeedback}
      onPointerDown={handlePointerDown}
      style={{
        ...style,
        WebkitAppearance: 'none',
        WebkitTapHighlightColor: 'transparent',
        appearance: 'none',
        background: 'transparent',
        border: 'none',
        boxShadow: 'none',
        cursor: disabled ? 'default' : 'pointer',
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
