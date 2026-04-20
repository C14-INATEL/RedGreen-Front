import type { CSSProperties, HTMLAttributes } from 'react';
import { useEffect, useRef } from 'react';
import {
  Application,
  Assets,
  Container,
  Graphics,
  MIPMAP_MODES,
  SCALE_MODES,
  Sprite,
  Texture,
  WRAP_MODES,
} from 'pixi.js';
import type { SlotMachineAnimationRerollResult } from './slotMachineApi';
import {
  getSlotMachineTextureIndexBySymbolId,
  getSlotMachineTextureUrls,
  SLOT_MACHINE_REEL_COUNT,
  SLOT_MACHINE_SYMBOLS,
  type SlotMachineSpinDirection,
  type SlotMachineSpinResult,
} from './slotMachineGameConfig';

const REEL_VISIBLE_CELL_COUNT = 1;
const REEL_BUFFER_CELL_COUNT = 2;
const REEL_WIDTH_RATIO = 376 / 2200;
const REEL_GAP_RATIO = 232 / 2200;
const REEL_CORNER_RATIO = 0.08;
const REEL_PADDING_RATIO = 0.1;
const DEFAULT_EXTRA_SPIN_STEPS = 2;
const SLOT_MACHINE_IDLE_CONFIG = {
  baseSpeedPxPerMs: 0.42,
  randomVariancePxPerMs: 0.05,
  reelSpeedStepPxPerMs: 0.04,
  spinDirection: 'down' as const,
};

type SlotMachineReelsProps = Pick<
  HTMLAttributes<HTMLDivElement>,
  'className' | 'style'
> & {
  idleRequestId?: number;
  onMachineModeChange?: (mode: SlotMachineReelsMode) => void;
  onRealSpinStateChange?: (isRunning: boolean) => void;
  restoreRequest?: SlotMachineReelsRestoreRequest | null;
  rerollRequest?: SlotMachineReelsRerollRequest | null;
  spinRequest?: SlotMachineReelsSpinRequest | null;
};

type ReelCellState = {
  slot: number;
  sprite: Sprite;
  textureIndex: number;
};

type ReelStopPlan = {
  shouldStopOnNextBoundary: boolean;
  stepsUntilTargetInsertion: number;
  targetTextureIndex: number;
};

type ReelState = {
  cells: ReelCellState[];
  currentTextureIndex: number;
  idleSpeedPxPerMs: number;
  isSpinning: boolean;
  reelWidth: number;
  scrollOffset: number;
  speedPxPerMs: number;
  spinDirection: 1 | -1;
  stopPlan: ReelStopPlan | null;
  strip: Container;
  viewHeight: number;
};

export type SlotMachineReelsMode =
  | 'idle'
  | 'realSpin'
  | 'rerollSpin'
  | 'resultHold';

export type SlotMachineReelsRerollRequest = {
  id: number;
  reelIndex: number;
  result: SlotMachineAnimationRerollResult;
};

export type SlotMachineReelsRestoreRequest = {
  id: number;
  result: SlotMachineSpinResult;
};

export type SlotMachineReelsSpinRequest = {
  id: number;
  result: SlotMachineSpinResult;
};

type SlotMachineReelsControls = {
  enterIdleMode: () => boolean;
  restoreResult: (result: SlotMachineSpinResult) => boolean;
  startRealSpin: (result: SlotMachineSpinResult) => boolean;
  startReroll: (request: SlotMachineReelsRerollRequest) => boolean;
};

const SPIN_DIRECTION_MULTIPLIER: Record<SlotMachineSpinDirection, 1 | -1> = {
  down: 1,
  up: -1,
};

const getRandomTextureIndex = (excludeIndex?: number) => {
  if (SLOT_MACHINE_SYMBOLS.length <= 1) {
    return 0;
  }

  let nextIndex = Math.floor(Math.random() * SLOT_MACHINE_SYMBOLS.length);

  while (excludeIndex !== undefined && nextIndex === excludeIndex) {
    nextIndex = Math.floor(Math.random() * SLOT_MACHINE_SYMBOLS.length);
  }

  return nextIndex;
};

const getIdleSpeedForReel = (reelIndex: number) =>
  SLOT_MACHINE_IDLE_CONFIG.baseSpeedPxPerMs +
  reelIndex * SLOT_MACHINE_IDLE_CONFIG.reelSpeedStepPxPerMs +
  Math.random() * SLOT_MACHINE_IDLE_CONFIG.randomVariancePxPerMs;

const configurePixelArtTexture = (texture: Texture) => {
  texture.baseTexture.mipmap = MIPMAP_MODES.OFF;
  texture.baseTexture.scaleMode = SCALE_MODES.NEAREST;
  texture.baseTexture.wrapMode = WRAP_MODES.CLAMP;
  texture.baseTexture.update();

  return texture;
};

const destroyChildren = (container: Container) => {
  container.removeChildren().forEach((child) => {
    child.destroy({ children: true });
  });
};

const getVisibleCell = (reel: ReelState) =>
  reel.cells.find((cell) => cell.slot === 0) ?? reel.cells[0];

const syncReelStripPosition = (reel: ReelState) => {
  reel.strip.y = Math.round(reel.scrollOffset * reel.spinDirection);
};

const scaleSpriteToReel = (
  sprite: Sprite,
  texture: Texture,
  reelWidth: number,
  viewHeight: number
) => {
  sprite.texture = texture;

  const maxWidth = reelWidth * (1 - REEL_PADDING_RATIO * 2);
  const maxHeight = viewHeight * (1 - REEL_PADDING_RATIO * 2);
  const widthScale = maxWidth / texture.width;
  const heightScale = maxHeight / texture.height;
  const nextScale = Math.max(Math.min(widthScale, heightScale), 0.01);

  sprite.roundPixels = true;
  sprite.scale.set(nextScale);
};

const positionCellSprite = (cell: ReelCellState, reel: ReelState) => {
  cell.sprite.position.set(
    Math.round(reel.reelWidth / 2),
    Math.round(reel.viewHeight / 2 + cell.slot * reel.viewHeight)
  );
};

const applyCellTexture = (
  reel: ReelState,
  cell: ReelCellState,
  textureIndex: number,
  textures: Texture[]
) => {
  cell.textureIndex = textureIndex;
  scaleSpriteToReel(
    cell.sprite,
    textures[textureIndex],
    reel.reelWidth,
    reel.viewHeight
  );
  positionCellSprite(cell, reel);
};

const restoreVisibleReelTexture = (
  reel: ReelState,
  textureIndex: number,
  textures: Texture[]
) => {
  const visibleCell = getVisibleCell(reel);

  applyCellTexture(reel, visibleCell, textureIndex, textures);
  reel.currentTextureIndex = visibleCell.textureIndex;
  reel.isSpinning = false;
  reel.scrollOffset = 0;
  reel.speedPxPerMs = 0;
  reel.stopPlan = null;
  syncReelStripPosition(reel);
};

const getNextRecycleTextureIndex = (
  reel: ReelState,
  recycledTextureIndex: number
) => {
  if (!reel.stopPlan) {
    return getRandomTextureIndex(recycledTextureIndex);
  }

  if (reel.stopPlan.shouldStopOnNextBoundary) {
    return getRandomTextureIndex(recycledTextureIndex);
  }

  if (reel.stopPlan.stepsUntilTargetInsertion === 0) {
    reel.stopPlan.shouldStopOnNextBoundary = true;
    return reel.stopPlan.targetTextureIndex;
  }

  reel.stopPlan.stepsUntilTargetInsertion -= 1;

  return getRandomTextureIndex(recycledTextureIndex);
};

const finalizeStoppedReel = (reel: ReelState) => {
  reel.currentTextureIndex = getVisibleCell(reel).textureIndex;
  reel.isSpinning = false;
  reel.scrollOffset = 0;
  reel.speedPxPerMs = 0;
  reel.stopPlan = null;
  syncReelStripPosition(reel);
};

const advanceReelDown = (reel: ReelState, textures: Texture[]) => {
  const topSlot = Math.min(...reel.cells.map((cell) => cell.slot));
  const bottomSlot = Math.max(...reel.cells.map((cell) => cell.slot));
  const recycledCell = reel.cells.find((cell) => cell.slot === bottomSlot);

  if (!recycledCell) {
    return;
  }

  reel.cells.forEach((cell) => {
    cell.slot += 1;
    positionCellSprite(cell, reel);
  });

  recycledCell.slot = topSlot;
  applyCellTexture(
    reel,
    recycledCell,
    getNextRecycleTextureIndex(reel, recycledCell.textureIndex),
    textures
  );

  reel.currentTextureIndex = getVisibleCell(reel).textureIndex;

  if (
    reel.stopPlan?.shouldStopOnNextBoundary &&
    reel.currentTextureIndex === reel.stopPlan.targetTextureIndex
  ) {
    finalizeStoppedReel(reel);
  }
};

const advanceReelUp = (reel: ReelState, textures: Texture[]) => {
  const topSlot = Math.min(...reel.cells.map((cell) => cell.slot));
  const bottomSlot = Math.max(...reel.cells.map((cell) => cell.slot));
  const recycledCell = reel.cells.find((cell) => cell.slot === topSlot);

  if (!recycledCell) {
    return;
  }

  reel.cells.forEach((cell) => {
    cell.slot -= 1;
    positionCellSprite(cell, reel);
  });

  recycledCell.slot = bottomSlot;
  applyCellTexture(
    reel,
    recycledCell,
    getNextRecycleTextureIndex(reel, recycledCell.textureIndex),
    textures
  );

  reel.currentTextureIndex = getVisibleCell(reel).textureIndex;

  if (
    reel.stopPlan?.shouldStopOnNextBoundary &&
    reel.currentTextureIndex === reel.stopPlan.targetTextureIndex
  ) {
    finalizeStoppedReel(reel);
  }
};

const advanceReel = (reel: ReelState, textures: Texture[]) => {
  if (reel.spinDirection === SPIN_DIRECTION_MULTIPLIER.down) {
    advanceReelDown(reel, textures);
    return;
  }

  advanceReelUp(reel, textures);
};

const updateReels = (
  reels: ReelState[],
  deltaMs: number,
  textures: Texture[]
) => {
  reels.forEach((reel) => {
    if (!reel.isSpinning) {
      return;
    }

    reel.scrollOffset += reel.speedPxPerMs * deltaMs;

    while (reel.scrollOffset >= reel.viewHeight && reel.isSpinning) {
      reel.scrollOffset -= reel.viewHeight;
      advanceReel(reel, textures);
    }

    syncReelStripPosition(reel);
  });
};

const createReels = (width: number, height: number, textures: Texture[]) => {
  const root = new Container();
  const reels: ReelState[] = [];
  const reelWidth = width * REEL_WIDTH_RATIO;
  const reelGap = width * REEL_GAP_RATIO;
  const cornerRadius = Math.min(reelWidth, height) * REEL_CORNER_RATIO;

  for (let reelIndex = 0; reelIndex < SLOT_MACHINE_REEL_COUNT; reelIndex += 1) {
    const reelFrame = new Container();
    reelFrame.x = reelIndex * (reelWidth + reelGap);

    const mask = new Graphics();
    mask.beginFill(0xffffff);
    mask.drawRoundedRect(0, 0, reelWidth, height, cornerRadius);
    mask.endFill();

    const reelContent = new Container();
    reelContent.mask = mask;

    const reelBackground = new Graphics();
    reelBackground.beginFill(0x0f172a, 0.16);
    reelBackground.drawRoundedRect(0, 0, reelWidth, height, cornerRadius);
    reelBackground.endFill();

    const reelShadow = new Graphics();
    reelShadow.beginFill(0x020617, 0.18);
    reelShadow.drawRoundedRect(
      reelWidth * 0.06,
      height * 0.06,
      reelWidth * 0.88,
      height * 0.88,
      cornerRadius * 0.75
    );
    reelShadow.endFill();

    const gloss = new Graphics();
    gloss.beginFill(0xffffff, 0.08);
    gloss.drawRoundedRect(
      reelWidth * 0.08,
      height * 0.05,
      reelWidth * 0.84,
      height * 0.16,
      cornerRadius * 0.55
    );
    gloss.endFill();

    const strip = new Container();
    const reel: ReelState = {
      cells: [],
      currentTextureIndex: 0,
      idleSpeedPxPerMs: getIdleSpeedForReel(reelIndex),
      isSpinning: false,
      reelWidth,
      scrollOffset: 0,
      speedPxPerMs: 0,
      spinDirection: SPIN_DIRECTION_MULTIPLIER.down,
      stopPlan: null,
      strip,
      viewHeight: height,
    };

    let lastTextureIndex: number | undefined;

    for (
      let slot = -REEL_BUFFER_CELL_COUNT + 1;
      slot <= REEL_VISIBLE_CELL_COUNT;
      slot += 1
    ) {
      const textureIndex = getRandomTextureIndex(lastTextureIndex);
      const sprite = new Sprite(textures[textureIndex]);
      sprite.anchor.set(0.5);
      sprite.roundPixels = true;

      const cell: ReelCellState = {
        slot,
        sprite,
        textureIndex,
      };

      applyCellTexture(reel, cell, textureIndex, textures);
      strip.addChild(sprite);
      reel.cells.push(cell);
      lastTextureIndex = textureIndex;
    }

    reel.currentTextureIndex = getVisibleCell(reel).textureIndex;
    syncReelStripPosition(reel);

    reelContent.addChild(reelBackground);
    reelContent.addChild(reelShadow);
    reelContent.addChild(strip);

    reelFrame.addChild(reelContent);
    reelFrame.addChild(mask);
    reelFrame.addChild(gloss);
    root.addChild(reelFrame);
    reels.push(reel);
  }

  return { reels, root };
};

export const SlotMachineReels = ({
  className,
  idleRequestId = 0,
  onMachineModeChange,
  onRealSpinStateChange,
  restoreRequest = null,
  rerollRequest = null,
  spinRequest = null,
  style,
}: SlotMachineReelsProps) => {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const controlsRef = useRef<SlotMachineReelsControls | null>(null);
  const handledIdleRequestIdRef = useRef(0);
  const handledRestoreRequestIdRef = useRef(0);
  const handledRerollRequestIdRef = useRef(0);
  const handledSpinRequestIdRef = useRef(0);
  const latestIdleRequestIdRef = useRef(idleRequestId);
  const latestRestoreRequestRef =
    useRef<SlotMachineReelsRestoreRequest | null>(restoreRequest);
  const latestRerollRequestRef = useRef<SlotMachineReelsRerollRequest | null>(
    rerollRequest
  );
  const latestSpinRequestRef = useRef<SlotMachineReelsSpinRequest | null>(
    spinRequest
  );
  const onMachineModeChangeRef = useRef(onMachineModeChange);
  const onRealSpinStateChangeRef = useRef(onRealSpinStateChange);

  useEffect(() => {
    latestSpinRequestRef.current = spinRequest;

    if (
      !controlsRef.current ||
      !spinRequest ||
      spinRequest.id <= handledSpinRequestIdRef.current
    ) {
      return;
    }

    if (controlsRef.current.startRealSpin(spinRequest.result)) {
      handledSpinRequestIdRef.current = spinRequest.id;
    }
  }, [spinRequest]);

  useEffect(() => {
    latestIdleRequestIdRef.current = idleRequestId;

    if (
      !controlsRef.current ||
      idleRequestId <= handledIdleRequestIdRef.current
    ) {
      return;
    }

    if (controlsRef.current.enterIdleMode()) {
      handledIdleRequestIdRef.current = idleRequestId;
    }
  }, [idleRequestId]);

  useEffect(() => {
    latestRestoreRequestRef.current = restoreRequest;

    if (
      !controlsRef.current ||
      !restoreRequest ||
      restoreRequest.id <= handledRestoreRequestIdRef.current
    ) {
      return;
    }

    if (controlsRef.current.restoreResult(restoreRequest.result)) {
      handledRestoreRequestIdRef.current = restoreRequest.id;
    }
  }, [restoreRequest]);

  useEffect(() => {
    latestRerollRequestRef.current = rerollRequest;

    if (
      !controlsRef.current ||
      !rerollRequest ||
      rerollRequest.id <= handledRerollRequestIdRef.current
    ) {
      return;
    }

    if (controlsRef.current.startReroll(rerollRequest)) {
      handledRerollRequestIdRef.current = rerollRequest.id;
    }
  }, [rerollRequest]);

  useEffect(() => {
    onMachineModeChangeRef.current = onMachineModeChange;
  }, [onMachineModeChange]);

  useEffect(() => {
    onRealSpinStateChangeRef.current = onRealSpinStateChange;
  }, [onRealSpinStateChange]);

  useEffect(() => {
    const host = hostRef.current;

    if (!host) {
      return undefined;
    }

    let app: Application | null = null;
    let root: Container | null = null;
    let observer: ResizeObserver | null = null;
    let isDisposed = false;
    let reels: ReelState[] = [];
    let textures: Texture[] = [];
    let frameId: number | null = null;
    let lastWidth = 0;
    let lastHeight = 0;
    let actionTimeoutIds: number[] = [];
    let currentMode: SlotMachineReelsMode = 'idle';
    let isReady = false;

    const clearActionTimeouts = () => {
      actionTimeoutIds.forEach((timeoutId) => {
        window.clearTimeout(timeoutId);
      });
      actionTimeoutIds = [];
    };

    const scheduleTimeout = (callback: () => void, delayMs: number) => {
      const timeoutId = window.setTimeout(() => {
        actionTimeoutIds = actionTimeoutIds.filter((id) => id !== timeoutId);

        if (isDisposed) {
          return;
        }

        callback();
      }, delayMs);

      actionTimeoutIds.push(timeoutId);

      return timeoutId;
    };

    const notifyRealSpinStateChange = (isRunning: boolean) => {
      onRealSpinStateChangeRef.current?.(isRunning);
    };

    const notifyMachineModeChange = (mode: SlotMachineReelsMode) => {
      onMachineModeChangeRef.current?.(mode);
    };

    const setCurrentMode = (mode: SlotMachineReelsMode) => {
      currentMode = mode;
      notifyMachineModeChange(mode);
    };

    const restoreResult = (result: SlotMachineSpinResult) => {
      if (!isReady || !reels.length || !textures.length) {
        return false;
      }

      const textureIndexByReel = result.reels.map((reelResult) => ({
        reelIndex: reelResult.reelIndex,
        targetTextureIndex: getSlotMachineTextureIndexBySymbolId(
          reelResult.symbolId
        ),
      }));

      const hasInvalidTexture = textureIndexByReel.some(
        ({ targetTextureIndex }) => targetTextureIndex < 0
      );

      if (
        hasInvalidTexture ||
        textureIndexByReel.length < Math.min(reels.length, SLOT_MACHINE_REEL_COUNT)
      ) {
        return false;
      }

      clearActionTimeouts();

      textureIndexByReel.forEach(({ reelIndex, targetTextureIndex }) => {
        const reel = reels[reelIndex];

        if (!reel) {
          return;
        }

        restoreVisibleReelTexture(reel, targetTextureIndex, textures);
      });

      setCurrentMode('resultHold');
      notifyRealSpinStateChange(false);
      return true;
    };

    const startSpin = (
      speedPxPerMs: number,
      direction: SlotMachineSpinDirection
    ) => {
      reels.forEach((reel) => {
        reel.currentTextureIndex = getVisibleCell(reel).textureIndex;
        reel.isSpinning = true;
        reel.scrollOffset = 0;
        reel.speedPxPerMs = speedPxPerMs;
        reel.spinDirection = SPIN_DIRECTION_MULTIPLIER[direction];
        reel.stopPlan = null;
        syncReelStripPosition(reel);
      });
    };

    const startReelSpin = (
      reelIndex: number,
      speedPxPerMs: number,
      direction: SlotMachineSpinDirection
    ) => {
      const reel = reels[reelIndex];

      if (!reel) {
        return;
      }

      reels.forEach((currentReel, currentReelIndex) => {
        currentReel.currentTextureIndex =
          getVisibleCell(currentReel).textureIndex;
        currentReel.scrollOffset = 0;
        currentReel.stopPlan = null;

        if (currentReelIndex === reelIndex) {
          currentReel.isSpinning = true;
          currentReel.speedPxPerMs = speedPxPerMs;
          currentReel.spinDirection = SPIN_DIRECTION_MULTIPLIER[direction];
        } else {
          currentReel.isSpinning = false;
          currentReel.speedPxPerMs = 0;
        }

        syncReelStripPosition(currentReel);
      });
    };

    const enterIdleMode = () => {
      if (!isReady || !reels.length) {
        return false;
      }

      clearActionTimeouts();
      setCurrentMode('idle');

      reels.forEach((reel) => {
        reel.currentTextureIndex = getVisibleCell(reel).textureIndex;
        reel.isSpinning = true;
        reel.scrollOffset = 0;
        reel.speedPxPerMs = reel.idleSpeedPxPerMs;
        reel.spinDirection =
          SPIN_DIRECTION_MULTIPLIER[SLOT_MACHINE_IDLE_CONFIG.spinDirection];
        reel.stopPlan = null;
        syncReelStripPosition(reel);
      });

      notifyRealSpinStateChange(false);
      return true;
    };

    const stopReel = (
      reelIndex: number,
      targetTextureIndex: number,
      extraSpinSteps = DEFAULT_EXTRA_SPIN_STEPS
    ) => {
      const reel = reels[reelIndex];

      if (!reel) {
        return;
      }

      reel.isSpinning = true;
      reel.stopPlan = {
        shouldStopOnNextBoundary: false,
        stepsUntilTargetInsertion: Math.max(0, extraSpinSteps),
        targetTextureIndex,
      };
    };

    const stopAllInSequence = (result: SlotMachineSpinResult) => {
      result.reelStopOrder.forEach((reelIndex, stopOrderIndex) => {
        scheduleTimeout(
          () => {
            const reelResult = result.reels.find(
              (mockReelResult) => mockReelResult.reelIndex === reelIndex
            );

            if (!reelResult) {
              return;
            }

            const targetTextureIndex = getSlotMachineTextureIndexBySymbolId(
              reelResult.symbolId
            );

            if (targetTextureIndex < 0) {
              return;
            }

            stopReel(
              reelIndex,
              targetTextureIndex,
              reelResult.extraSpinSteps ?? DEFAULT_EXTRA_SPIN_STEPS
            );
          },
          result.firstStopDelayMs + result.stopDelayMs * stopOrderIndex
        );
      });
    };

    const applyMockResult = (result: SlotMachineSpinResult) => {
      stopAllInSequence(result);
    };

    const startRealSpin = (result: SlotMachineSpinResult) => {
      if (!isReady || !reels.length || currentMode !== 'idle') {
        return false;
      }

      clearActionTimeouts();
      setCurrentMode('realSpin');
      notifyRealSpinStateChange(true);
      startSpin(result.spinSpeedPxPerMs, result.spinDirection);

      scheduleTimeout(() => {
        applyMockResult(result);
      }, result.responseDelayMs);

      return true;
    };

    const startReroll = (request: SlotMachineReelsRerollRequest) => {
      if (!isReady || !reels.length || currentMode !== 'resultHold') {
        return false;
      }

      const targetTextureIndex = getSlotMachineTextureIndexBySymbolId(
        request.result.symbolId
      );

      if (
        request.result.reelIndex !== request.reelIndex ||
        targetTextureIndex < 0
      ) {
        return false;
      }

      clearActionTimeouts();
      setCurrentMode('rerollSpin');
      notifyRealSpinStateChange(true);
      startReelSpin(
        request.reelIndex,
        request.result.spinSpeedPxPerMs,
        request.result.spinDirection
      );

      scheduleTimeout(() => {
        stopReel(
          request.reelIndex,
          targetTextureIndex,
          request.result.extraSpinSteps ?? DEFAULT_EXTRA_SPIN_STEPS
        );
      }, request.result.responseDelayMs);

      return true;
    };

    const consumePendingSpinRequest = () => {
      const latestSpinRequest = latestSpinRequestRef.current;

      if (
        !latestSpinRequest ||
        latestSpinRequest.id <= handledSpinRequestIdRef.current
      ) {
        return;
      }

      if (startRealSpin(latestSpinRequest.result)) {
        handledSpinRequestIdRef.current = latestSpinRequest.id;
      }
    };

    const consumePendingIdleRequest = () => {
      if (latestIdleRequestIdRef.current <= handledIdleRequestIdRef.current) {
        return;
      }

      if (enterIdleMode()) {
        handledIdleRequestIdRef.current = latestIdleRequestIdRef.current;
      }
    };

    const consumePendingRestoreRequest = () => {
      const latestRestoreRequest = latestRestoreRequestRef.current;

      if (
        !latestRestoreRequest ||
        latestRestoreRequest.id <= handledRestoreRequestIdRef.current
      ) {
        return;
      }

      if (restoreResult(latestRestoreRequest.result)) {
        handledRestoreRequestIdRef.current = latestRestoreRequest.id;
      }
    };

    const consumePendingRerollRequest = () => {
      const latestRerollRequest = latestRerollRequestRef.current;

      if (
        !latestRerollRequest ||
        latestRerollRequest.id <= handledRerollRequestIdRef.current
      ) {
        return;
      }

      if (startReroll(latestRerollRequest)) {
        handledRerollRequestIdRef.current = latestRerollRequest.id;
      }
    };

    const rebuild = () => {
      if (!app || !root || !textures.length) {
        return false;
      }

      const width = host.clientWidth;
      const height = host.clientHeight;

      if (!width || !height) {
        return false;
      }

      if (width === lastWidth && height === lastHeight && reels.length) {
        return true;
      }

      lastWidth = width;
      lastHeight = height;
      app.renderer.resize(width, height);
      const shouldRestoreResultHold = currentMode === 'resultHold';
      const previousResultTextureIndices = shouldRestoreResultHold
        ? reels.map((reel) => getVisibleCell(reel).textureIndex)
        : [];
      destroyChildren(root);

      const scene = createReels(width, height, textures);
      root.addChild(scene.root);
      reels = scene.reels;
      isReady = true;

      if (
        shouldRestoreResultHold &&
        previousResultTextureIndices.length === SLOT_MACHINE_REEL_COUNT
      ) {
        previousResultTextureIndices.forEach((textureIndex, reelIndex) => {
          const reel = reels[reelIndex];

          if (!reel) {
            return;
          }

          restoreVisibleReelTexture(reel, textureIndex, textures);
        });

        setCurrentMode('resultHold');
        notifyRealSpinStateChange(false);
        return true;
      }

      enterIdleMode();
      consumePendingIdleRequest();
      consumePendingRestoreRequest();
      consumePendingSpinRequest();
      consumePendingRerollRequest();

      return true;
    };

    const ensureInitialized = () => {
      frameId = null;

      if (isDisposed || rebuild()) {
        return;
      }

      frameId = window.requestAnimationFrame(ensureInitialized);
    };

    const scheduleInitialization = () => {
      if (frameId !== null) {
        return;
      }

      frameId = window.requestAnimationFrame(ensureInitialized);
    };

    const handleTick = () => {
      if (!app || !reels.length || !textures.length) {
        return;
      }

      updateReels(reels, app.ticker.deltaMS, textures);

      if (
        (currentMode === 'realSpin' || currentMode === 'rerollSpin') &&
        reels.every((reel) => !reel.isSpinning)
      ) {
        setCurrentMode('resultHold');
        notifyRealSpinStateChange(false);
      }
    };

    const setup = async () => {
      const textureUrls = getSlotMachineTextureUrls();
      const loadedTextureMap = await Assets.load<Texture>(textureUrls);

      if (isDisposed) {
        return;
      }

      textures = textureUrls.map((url) =>
        configurePixelArtTexture(loadedTextureMap[url])
      );

      const nextApp = new Application({
        antialias: false,
        autoDensity: true,
        backgroundAlpha: 0,
        height: 1,
        resolution: 1,
        width: 1,
      });

      if (isDisposed) {
        nextApp.destroy(true, { children: true });
        return;
      }

      app = nextApp;

      const canvas = nextApp.view as HTMLCanvasElement;
      canvas.style.display = 'block';
      canvas.style.height = '100%';
      canvas.style.imageRendering = 'pixelated';
      canvas.style.width = '100%';

      host.appendChild(canvas);

      root = new Container();
      nextApp.stage.addChild(root);

      observer =
        typeof ResizeObserver === 'undefined'
          ? null
          : new ResizeObserver(() => {
              if (!rebuild()) {
                scheduleInitialization();
              }
            });

      [host, host.parentElement]
        .filter((target): target is HTMLElement => target !== null)
        .forEach((target) => {
          observer?.observe(target);
        });

      if (!rebuild()) {
        scheduleInitialization();
      }

      nextApp.ticker.add(handleTick);
      controlsRef.current = {
        enterIdleMode,
        restoreResult,
        startRealSpin,
        startReroll,
      };
      consumePendingIdleRequest();
      consumePendingRestoreRequest();
      consumePendingSpinRequest();
      consumePendingRerollRequest();
    };

    void setup();

    return () => {
      isDisposed = true;
      controlsRef.current = null;
      clearActionTimeouts();
      observer?.disconnect();
      isReady = false;
      reels = [];
      textures = [];
      lastWidth = 0;
      lastHeight = 0;
      app?.ticker.remove(handleTick);

      if (frameId !== null) {
        window.cancelAnimationFrame(frameId);
      }

      if (root) {
        destroyChildren(root);
      }

      app?.destroy(true, { children: true });
    };
  }, []);

  const combinedStyle: CSSProperties = {
    ...style,
  };

  return (
    <div
      className={className ? `overflow-hidden ${className}` : 'overflow-hidden'}
      ref={hostRef}
      style={combinedStyle}
    />
  );
};
