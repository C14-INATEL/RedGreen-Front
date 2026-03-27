import type { CSSProperties, PointerEvent } from 'react';
import { memo, useEffect, useRef, useState } from 'react';

const SLOT_MACHINE_TEXTURE_BASE_PATH = '/SlotMachine';
const SLOT_MACHINE_SIZE = 4096;
const SLOT_LEVER_SPRITE_SIZE = {
  height: 1024,
  width: 576,
} as const;
const SLOT_LEVER_POSITION = {
  left: 3775,
  top: 940,
} as const;
const SLOT_LEVER_FRAME_COUNT = 18;
const SLOT_LEVER_FRAME_DURATION_MS = 28;

type SlotMachineLeverProps = {
  label?: string;
  machineSize: {
    height: number;
    width: number;
  };
  onPull?: () => void;
  onPullComplete?: () => void;
};

const SLOT_LEVER_FRAME_SOURCES = Array.from(
  { length: SLOT_LEVER_FRAME_COUNT },
  (_, index) =>
    `${SLOT_MACHINE_TEXTURE_BASE_PATH}/SpriteLever${String(index).padStart(2, '0')}.png`
);

const SLOT_LEVER_ANIMATION_SEQUENCE = [
  ...Array.from({ length: SLOT_LEVER_FRAME_COUNT }, (_, index) => index),
  ...Array.from(
    { length: SLOT_LEVER_FRAME_COUNT - 1 },
    (_, index) => SLOT_LEVER_FRAME_COUNT - 2 - index
  ),
] as const;

const getSlotLeverStyle = (
  machineSize: SlotMachineLeverProps['machineSize']
): CSSProperties => {
  const xScale = machineSize.width / SLOT_MACHINE_SIZE;
  const yScale = machineSize.height / SLOT_MACHINE_SIZE;
  const hasMachineSize = machineSize.width > 0 && machineSize.height > 0;
  const width = hasMachineSize
    ? Math.max(1, Math.round(SLOT_LEVER_SPRITE_SIZE.width * xScale))
    : 0;
  const height = hasMachineSize
    ? Math.max(1, Math.round(SLOT_LEVER_SPRITE_SIZE.height * yScale))
    : 0;

  return {
    height: `${height}px`,
    left: `${Math.round(SLOT_LEVER_POSITION.left * xScale)}px`,
    top: `${Math.round(SLOT_LEVER_POSITION.top * yScale)}px`,
    width: `${width}px`,
  };
};

const SlotMachineLeverComponent = ({
  label = 'Alavanca da maquina',
  machineSize,
  onPull,
  onPullComplete,
}: SlotMachineLeverProps) => {
  const [currentFrameIndex, setCurrentFrameIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const animationTimeoutRef = useRef<number | null>(null);
  const isAnimatingRef = useRef(false);

  const clearAnimationTimeout = () => {
    if (animationTimeoutRef.current === null) {
      return;
    }

    window.clearTimeout(animationTimeoutRef.current);
    animationTimeoutRef.current = null;
  };

  const finishAnimation = () => {
    clearAnimationTimeout();
    isAnimatingRef.current = false;
    setCurrentFrameIndex(0);
    setIsAnimating(false);
    onPullComplete?.();
  };

  const runAnimationStep = (sequenceIndex: number) => {
    const nextFrameIndex = SLOT_LEVER_ANIMATION_SEQUENCE[sequenceIndex];

    if (nextFrameIndex === undefined) {
      finishAnimation();
      return;
    }

    setCurrentFrameIndex(nextFrameIndex);

    animationTimeoutRef.current = window.setTimeout(() => {
      runAnimationStep(sequenceIndex + 1);
    }, SLOT_LEVER_FRAME_DURATION_MS);
  };

  const handlePointerDown = (event: PointerEvent<HTMLButtonElement>) => {
    event.preventDefault();

    if (isAnimatingRef.current) {
      return;
    }

    clearAnimationTimeout();
    isAnimatingRef.current = true;
    setIsAnimating(true);
    onPull?.();
    runAnimationStep(0);
  };

  useEffect(() => {
    SLOT_LEVER_FRAME_SOURCES.forEach((source) => {
      const image = new Image();
      image.src = source;
    });
  }, []);

  useEffect(
    () => () => {
      clearAnimationTimeout();
      isAnimatingRef.current = false;
    },
    []
  );

  return (
    <div className="pointer-events-none absolute inset-0">
      <button
        aria-busy={isAnimating}
        aria-label={label}
        className="pointer-events-auto absolute block"
        disabled={isAnimating}
        onPointerDown={handlePointerDown}
        style={{
          ...getSlotLeverStyle(machineSize),
          WebkitAppearance: 'none',
          WebkitTapHighlightColor: 'transparent',
          appearance: 'none',
          background: 'transparent',
          border: 'none',
          boxShadow: 'none',
          cursor: isAnimating ? 'default' : 'pointer',
          margin: 0,
          outline: 'none',
          padding: 0,
          touchAction: 'manipulation',
          zIndex: 1,
        }}
        type="button"
      >
        <img
          alt=""
          className="block h-full w-full select-none"
          draggable={false}
          src={SLOT_LEVER_FRAME_SOURCES[currentFrameIndex]}
          style={{
            imageRendering: 'pixelated',
          }}
        />
      </button>
    </div>
  );
};

export const SlotMachineLever = memo(SlotMachineLeverComponent);
