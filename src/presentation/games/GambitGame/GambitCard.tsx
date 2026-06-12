import {
  AnimatedSprite,
  BLEND_MODES,
  Container,
  Graphics,
  Sprite,
  Text,
  TextStyle,
} from 'pixi.js';
import {
  GAMBIT_CLOSED_CARD_SPRITES,
  GAMBIT_LOCKED_CARD_SPRITE,
  GAMBIT_REVEAL_ANIMATION_FRAMES,
} from './GambitTextures';
import type { GambitCardEffectViewModel } from './GambitTypes';

export type GambitCardProps = {
  disabled: boolean;
  effect: GambitCardEffectViewModel | null;
  locked: boolean;
  onClick: () => void;
  onRevealComplete?: () => void;
  previewed: boolean;
  revealOnClick: boolean;
  revealed: boolean;
  selected: boolean;
  size: number;
  value: number | null;
  x: number;
  y: number;
};

type GambitCardOverlayState = 'closed' | 'animating' | 'hidden';

export type GambitCardVisibilityState = {
  closedOverlayVisible: boolean;
  effectSpriteVisible: boolean;
  lockedClosedOverlayVisible: boolean;
  revealedFaceVisible: boolean;
  revealedLabelVisible: boolean;
  revealAnimationVisible: boolean;
  selectionHighlightVisible: boolean;
};

export type GambitCardVisibilityParams = {
  effect: GambitCardEffectViewModel | null;
  locked: boolean;
  overlayState: GambitCardOverlayState;
  previewed: boolean;
  revealed: boolean;
  selected: boolean;
};

export type GambitCardInstance = {
  container: Container;
  destroy: () => void;
  update: (nextProps: GambitCardProps) => void;
};

const CARD_REVEALED_COLOR = 0xf1d28a;
const CARD_REVEALED_BORDER_COLOR = 0xf0c350;
const CARD_REVEALED_TEXT_COLOR = 0x2a1f12;
const CARD_REVEALED_GLOW_COLOR = 0xfff4b5;
const CARD_NEGATIVE_COLOR = 0x5f2028;
const CARD_NEGATIVE_BORDER_COLOR = 0xf06a3d;
const CARD_NEGATIVE_TEXT_COLOR = 0xffefe8;
const CARD_PREVIEW_BORDER_COLOR = 0xffffff;
const CARD_SELECTION_BORDER_COLOR = 0x9ffcff;
const CARD_SELECTION_FILL_COLOR = 0x3bceff;
const CARD_SELECTION_GLOW_COLOR = 0x65f6ff;
const CLOSED_CARD_ANIMATION_SPEED = 0.12;
const LOCKED_CARD_SHAKE_DURATION_MS = 240;
const LOCKED_CARD_SHAKE_OSCILLATIONS = 8;
const REVEAL_ANIMATION_SPEED = 0.42;

export const getGambitCardVisibilityState = ({
  locked,
  overlayState,
  previewed,
  revealed,
  selected,
}: GambitCardVisibilityParams): GambitCardVisibilityState => {
  const isContentVisible = revealed || previewed;
  const isPointContentVisible = isContentVisible;
  const isLockedClosedOverlayVisible = overlayState === 'closed' && locked;

  return {
    closedOverlayVisible: overlayState === 'closed' && !locked,
    effectSpriteVisible: false,
    lockedClosedOverlayVisible: isLockedClosedOverlayVisible,
    revealedFaceVisible: isPointContentVisible && overlayState !== 'closed',
    revealedLabelVisible: isPointContentVisible && overlayState !== 'closed',
    revealAnimationVisible: overlayState === 'animating',
    selectionHighlightVisible:
      selected && overlayState === 'closed' && !previewed && !revealed,
  };
};

const drawRevealedCardFace = (
  graphics: Graphics,
  size: number,
  value: number | null,
  previewed: boolean
) => {
  const borderWidth = Math.max(2, Math.round(size * 0.055));
  const inset = Math.max(3, Math.round(size * 0.08));
  const isNegative = (value ?? 0) < 0;
  const surfaceColor = isNegative ? CARD_NEGATIVE_COLOR : CARD_REVEALED_COLOR;
  const borderColor = previewed
    ? CARD_PREVIEW_BORDER_COLOR
    : isNegative
      ? CARD_NEGATIVE_BORDER_COLOR
      : CARD_REVEALED_BORDER_COLOR;

  graphics.clear();
  graphics.lineStyle(borderWidth, borderColor, previewed ? 1 : 0.96);
  graphics.beginFill(surfaceColor, 1);
  graphics.drawRoundedRect(0, 0, size, size, Math.max(8, size * 0.11));
  graphics.endFill();

  graphics.lineStyle(2, CARD_REVEALED_GLOW_COLOR, 0.42);
  graphics.drawRoundedRect(
    inset,
    inset,
    size - inset * 2,
    size - inset * 2,
    Math.max(5, size * 0.08)
  );

  graphics.lineStyle(1, 0xffffff, 0.24);
  graphics.moveTo(inset, inset);
  graphics.lineTo(size - inset, inset);
  graphics.moveTo(inset, inset);
  graphics.lineTo(inset, size - inset);
};

const getCardTextColor = (value: number | null) => {
  if ((value ?? 0) < 0) {
    return CARD_NEGATIVE_TEXT_COLOR;
  }

  return CARD_REVEALED_TEXT_COLOR;
};

const createValueTextStyle = (size: number, value: number | null) =>
  new TextStyle({
    align: 'center',
    fill: getCardTextColor(value),
    fontFamily: 'Press Start 2P',
    fontSize: Math.max(9, Math.floor(size * 0.2)),
    fontWeight: '700',
    wordWrap: true,
    wordWrapWidth: Math.max(24, Math.floor(size * 0.82)),
  });

const formatCardValue = (value: number | null) => {
  if (value == null) {
    return '';
  }

  if (value > 0) {
    return `+${value}`;
  }

  return String(value);
};

const formatCardLabel = (value: number | null) => formatCardValue(value);

const createRevealAnimation = (size: number) => {
  const revealAnimation = AnimatedSprite.fromFrames(
    GAMBIT_REVEAL_ANIMATION_FRAMES
  );

  revealAnimation.width = size;
  revealAnimation.height = size;
  revealAnimation.loop = false;
  revealAnimation.animationSpeed = REVEAL_ANIMATION_SPEED;
  revealAnimation.roundPixels = true;
  revealAnimation.visible = false;

  return revealAnimation;
};

const createClosedCardAnimation = (size: number) => {
  const closedCardAnimation = AnimatedSprite.fromFrames(
    GAMBIT_CLOSED_CARD_SPRITES
  );

  closedCardAnimation.width = size;
  closedCardAnimation.height = size;
  closedCardAnimation.loop = true;
  closedCardAnimation.animationSpeed = CLOSED_CARD_ANIMATION_SPEED;
  closedCardAnimation.roundPixels = true;

  return closedCardAnimation;
};

const createLockedClosedCardSprite = (size: number) => {
  const lockedCardSprite = Sprite.from(GAMBIT_LOCKED_CARD_SPRITE);

  lockedCardSprite.width = size;
  lockedCardSprite.height = size;
  lockedCardSprite.roundPixels = true;
  lockedCardSprite.visible = false;

  return lockedCardSprite;
};

const drawSelectedCardHighlight = (graphics: Graphics, size: number) => {
  const borderWidth = Math.max(2, Math.round(size * 0.045));
  const innerInset = Math.max(4, Math.round(size * 0.085));
  const scanLineInset = Math.max(6, Math.round(size * 0.12));
  const scanLineGap = Math.max(7, Math.round(size * 0.18));
  const cardRadius = Math.max(8, size * 0.11);

  graphics.clear();
  graphics.beginFill(CARD_SELECTION_FILL_COLOR, 0.18);
  graphics.drawRoundedRect(0, 0, size, size, cardRadius);
  graphics.endFill();

  graphics.beginFill(CARD_SELECTION_GLOW_COLOR, 0.08);
  graphics.drawRoundedRect(
    innerInset,
    innerInset,
    size - innerInset * 2,
    size - innerInset * 2,
    Math.max(6, size * 0.08)
  );
  graphics.endFill();

  graphics.lineStyle(borderWidth, CARD_SELECTION_BORDER_COLOR, 0.78);
  graphics.drawRoundedRect(1, 1, size - 2, size - 2, cardRadius);

  graphics.lineStyle(1, CARD_SELECTION_GLOW_COLOR, 0.3);

  for (
    let lineY = scanLineInset;
    lineY < size - scanLineInset;
    lineY += scanLineGap
  ) {
    graphics.moveTo(scanLineInset, lineY);
    graphics.lineTo(size - scanLineInset, lineY);
  }
};

const resetLockedClosedCardSpriteTransform = (lockedCardSprite: Sprite) => {
  lockedCardSprite.position.set(0, 0);
};

export const createGambitCard = (
  initialProps: GambitCardProps
): GambitCardInstance => {
  const container = new Container();
  const revealedCardFace = new Graphics();
  const selectedCardHighlight = new Graphics();
  selectedCardHighlight.blendMode = BLEND_MODES.SCREEN;
  const revealedCardLabel = new Text(
    formatCardLabel(initialProps.value),
    createValueTextStyle(initialProps.size, initialProps.value)
  );
  const closedCardAnimation = createClosedCardAnimation(initialProps.size);
  const lockedClosedCardSprite = createLockedClosedCardSprite(
    initialProps.size
  );
  const revealAnimation = createRevealAnimation(initialProps.size);
  const closedCardAnimationInitialFrame = Math.floor(
    Math.random() * GAMBIT_CLOSED_CARD_SPRITES.length
  );
  let lockedCardShakeFrameId: number | null = null;

  let currentProps = initialProps;
  let overlayState: GambitCardOverlayState = initialProps.revealed
    ? 'hidden'
    : 'closed';

  const stopLockedCardShake = () => {
    if (lockedCardShakeFrameId != null && typeof window !== 'undefined') {
      window.cancelAnimationFrame(lockedCardShakeFrameId);
      lockedCardShakeFrameId = null;
    }

    resetLockedClosedCardSpriteTransform(lockedClosedCardSprite);
  };

  const playLockedCardShake = () => {
    if (!lockedClosedCardSprite.visible || typeof window === 'undefined') {
      return;
    }

    stopLockedCardShake();

    const shakeOffsetX = Math.max(3, Math.round(currentProps.size * 0.045));
    const shakeOffsetY = Math.max(1, Math.round(currentProps.size * 0.014));
    const startedAt = window.performance?.now() ?? Date.now();

    const animateLockedCardShake = (now: number) => {
      const elapsedMs = now - startedAt;
      const progress = Math.min(elapsedMs / LOCKED_CARD_SHAKE_DURATION_MS, 1);
      const decay = 1 - progress;
      const wave = Math.sin(
        progress * Math.PI * LOCKED_CARD_SHAKE_OSCILLATIONS
      );
      const sway = Math.cos(
        progress * Math.PI * (LOCKED_CARD_SHAKE_OSCILLATIONS - 2)
      );

      lockedClosedCardSprite.position.set(
        Math.round(wave * shakeOffsetX * decay),
        Math.round(sway * shakeOffsetY * decay)
      );

      if (progress >= 1) {
        lockedCardShakeFrameId = null;
        resetLockedClosedCardSpriteTransform(lockedClosedCardSprite);
        return;
      }

      lockedCardShakeFrameId = window.requestAnimationFrame(
        animateLockedCardShake
      );
    };

    lockedCardShakeFrameId = window.requestAnimationFrame(
      animateLockedCardShake
    );
  };

  const syncInteractivity = () => {
    const isLockedCardShakeEnabled =
      currentProps.locked &&
      !currentProps.revealed &&
      !currentProps.previewed &&
      overlayState === 'closed';
    const isCardClickable =
      (!currentProps.disabled || isLockedCardShakeEnabled) &&
      !currentProps.revealed &&
      !currentProps.previewed &&
      overlayState === 'closed';

    container.eventMode = isCardClickable ? 'static' : 'none';
    container.cursor = isCardClickable ? 'pointer' : 'default';
  };

  const syncLayout = () => {
    const { previewed, size, value, x, y } = currentProps;

    container.position.set(x, y);

    drawRevealedCardFace(revealedCardFace, size, value, previewed);
    drawSelectedCardHighlight(selectedCardHighlight, size);

    revealedCardLabel.text = formatCardLabel(value);
    revealedCardLabel.style = createValueTextStyle(size, value);
    revealedCardLabel.anchor.set(0.5);
    revealedCardLabel.resolution = 2;
    revealedCardLabel.position.set(Math.round(size / 2), Math.round(size / 2));

    closedCardAnimation.width = size;
    closedCardAnimation.height = size;

    lockedClosedCardSprite.width = size;
    lockedClosedCardSprite.height = size;

    revealAnimation.width = size;
    revealAnimation.height = size;
  };

  const syncVisibility = () => {
    const visibilityState = getGambitCardVisibilityState({
      effect: currentProps.effect,
      locked: currentProps.locked,
      overlayState,
      previewed: currentProps.previewed,
      revealed: currentProps.revealed,
      selected: currentProps.selected,
    });

    revealedCardFace.visible = visibilityState.revealedFaceVisible;
    revealedCardLabel.visible = visibilityState.revealedLabelVisible;
    closedCardAnimation.visible = visibilityState.closedOverlayVisible;
    lockedClosedCardSprite.visible = visibilityState.lockedClosedOverlayVisible;
    revealAnimation.visible = visibilityState.revealAnimationVisible;
    selectedCardHighlight.visible = visibilityState.selectionHighlightVisible;

    if (!visibilityState.lockedClosedOverlayVisible) {
      stopLockedCardShake();
    }
  };

  const showClosedOverlay = () => {
    overlayState = 'closed';
    stopLockedCardShake();

    if (currentProps.locked) {
      closedCardAnimation.stop();
    } else {
      closedCardAnimation.gotoAndPlay(closedCardAnimationInitialFrame);
    }

    revealAnimation.stop();
    syncVisibility();
    syncInteractivity();
  };

  const hideOverlay = () => {
    overlayState = 'hidden';
    stopLockedCardShake();
    closedCardAnimation.stop();
    revealAnimation.stop();
    syncVisibility();
    syncInteractivity();
  };

  const playRevealAnimation = () => {
    if (overlayState !== 'closed') {
      return;
    }

    overlayState = 'animating';
    closedCardAnimation.stop();
    revealAnimation.gotoAndStop(0);
    syncVisibility();
    syncInteractivity();

    revealAnimation.onComplete = () => {
      revealAnimation.onComplete = undefined;
      hideOverlay();
      currentProps.onRevealComplete?.();
    };

    revealAnimation.play();
  };

  const handlePointerTap = () => {
    if (
      currentProps.locked &&
      !currentProps.revealed &&
      !currentProps.previewed &&
      overlayState === 'closed'
    ) {
      playLockedCardShake();
      return;
    }

    if (
      currentProps.disabled ||
      currentProps.revealed ||
      currentProps.previewed ||
      overlayState !== 'closed'
    ) {
      return;
    }

    if (currentProps.revealOnClick) {
      playRevealAnimation();
    }

    currentProps.onClick();
  };

  container.addChild(
    revealedCardFace,
    revealedCardLabel,
    closedCardAnimation,
    lockedClosedCardSprite,
    selectedCardHighlight,
    revealAnimation
  );
  container.on('pointertap', handlePointerTap);

  syncLayout();

  if (currentProps.revealed || currentProps.previewed) {
    hideOverlay();
  } else {
    showClosedOverlay();
  }

  const update = (nextProps: GambitCardProps) => {
    const wasLocked = currentProps.locked;
    const wasRevealed = currentProps.revealed;
    const wasPreviewed = currentProps.previewed;

    currentProps = nextProps;

    syncLayout();
    syncVisibility();

    if (currentProps.previewed) {
      hideOverlay();
      return;
    }

    if (wasPreviewed && currentProps.revealed) {
      hideOverlay();
      currentProps.onRevealComplete?.();
      return;
    }

    if (!wasRevealed && currentProps.revealed && overlayState === 'closed') {
      playRevealAnimation();
      return;
    }

    if (overlayState === 'closed') {
      if (currentProps.locked) {
        closedCardAnimation.stop();
      } else if (wasLocked) {
        closedCardAnimation.gotoAndPlay(closedCardAnimationInitialFrame);
      }
    }

    if (!currentProps.revealed && overlayState === 'hidden') {
      showClosedOverlay();
      return;
    }

    syncInteractivity();
  };

  const destroy = () => {
    container.removeAllListeners();
    stopLockedCardShake();
    revealAnimation.onComplete = undefined;
    container.destroy({ children: true });
  };

  return {
    container,
    destroy,
    update,
  };
};
