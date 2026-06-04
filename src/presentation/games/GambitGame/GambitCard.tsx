import { AnimatedSprite, Container, Graphics, Text, TextStyle } from 'pixi.js';
import {
  GAMBIT_CLOSED_CARD_SPRITES,
  GAMBIT_REVEAL_ANIMATION_FRAMES,
} from './gambitTextures';
import type { GambitCardEffectViewModel } from './gambitTypes';

export type GambitCardProps = {
  disabled: boolean;
  effect: GambitCardEffectViewModel | null;
  onClick: () => void;
  onRevealComplete?: () => void;
  previewed: boolean;
  revealOnClick: boolean;
  revealed: boolean;
  size: number;
  value: number;
  x: number;
  y: number;
};

type GambitCardOverlayState = 'closed' | 'animating' | 'hidden';

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
const CARD_EFFECT_COLOR = 0x20345f;
const CARD_EFFECT_BORDER_COLOR = 0x8ee7ff;
const CARD_EFFECT_TEXT_COLOR = 0xf3fbff;
const CARD_PREVIEW_BORDER_COLOR = 0xffffff;
const CLOSED_CARD_ANIMATION_SPEED = 0.12;
const REVEAL_ANIMATION_SPEED = 0.42;

const drawRevealedCardFace = (
  graphics: Graphics,
  size: number,
  value: number,
  effect: GambitCardEffectViewModel | null,
  previewed: boolean
) => {
  const borderWidth = Math.max(2, Math.round(size * 0.055));
  const inset = Math.max(3, Math.round(size * 0.08));
  const isNegative = value < 0;
  const surfaceColor = effect
    ? CARD_EFFECT_COLOR
    : isNegative
      ? CARD_NEGATIVE_COLOR
      : CARD_REVEALED_COLOR;
  const borderColor = previewed
    ? CARD_PREVIEW_BORDER_COLOR
    : effect
      ? CARD_EFFECT_BORDER_COLOR
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

const getCardTextColor = (
  value: number,
  effect: GambitCardEffectViewModel | null
) => {
  if (effect) {
    return CARD_EFFECT_TEXT_COLOR;
  }

  if (value < 0) {
    return CARD_NEGATIVE_TEXT_COLOR;
  }

  return CARD_REVEALED_TEXT_COLOR;
};

const createValueTextStyle = (
  size: number,
  value: number,
  effect: GambitCardEffectViewModel | null
) =>
  new TextStyle({
    align: 'center',
    fill: getCardTextColor(value, effect),
    fontFamily: 'Press Start 2P',
    fontSize: Math.max(9, Math.floor(size * (effect ? 0.15 : 0.2))),
    fontWeight: '700',
    wordWrap: true,
    wordWrapWidth: Math.max(24, Math.floor(size * 0.82)),
  });

const formatCardValue = (value: number) => {
  if (value > 0) {
    return `+${value}`;
  }

  return String(value);
};

const formatCardEffect = (effect: GambitCardEffectViewModel) => {
  switch (effect) {
    case 'clarividencia':
      return 'CLAR';
    case 'dobro-de-potassio':
      return '2X';
    case 'inversao-gravitacional':
      return 'INV';
    case 'melancidio':
      return 'MEL';
    default:
      return '';
  }
};

const formatCardLabel = (
  value: number,
  effect: GambitCardEffectViewModel | null
) => (effect ? formatCardEffect(effect) : formatCardValue(value));

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

export const createGambitCard = (
  initialProps: GambitCardProps
): GambitCardInstance => {
  const container = new Container();
  const revealedCardFace = new Graphics();
  const revealedCardLabel = new Text(
    formatCardLabel(initialProps.value, initialProps.effect),
    createValueTextStyle(
      initialProps.size,
      initialProps.value,
      initialProps.effect
    )
  );
  const closedCardAnimation = createClosedCardAnimation(initialProps.size);
  const revealAnimation = createRevealAnimation(initialProps.size);
  const closedCardAnimationInitialFrame = Math.floor(
    Math.random() * GAMBIT_CLOSED_CARD_SPRITES.length
  );

  let currentProps = initialProps;
  let overlayState: GambitCardOverlayState = initialProps.revealed
    ? 'hidden'
    : 'closed';

  const syncInteractivity = () => {
    const isCardClickable =
      !currentProps.disabled &&
      !currentProps.revealed &&
      !currentProps.previewed &&
      overlayState === 'closed';

    container.eventMode = isCardClickable ? 'static' : 'none';
    container.cursor = isCardClickable ? 'pointer' : 'default';
  };

  const syncLayout = () => {
    const { effect, previewed, size, value, x, y } = currentProps;

    container.position.set(x, y);

    drawRevealedCardFace(revealedCardFace, size, value, effect, previewed);

    revealedCardLabel.text = formatCardLabel(value, effect);
    revealedCardLabel.style = createValueTextStyle(size, value, effect);
    revealedCardLabel.anchor.set(0.5);
    revealedCardLabel.resolution = 2;
    revealedCardLabel.position.set(Math.round(size / 2), Math.round(size / 2));

    closedCardAnimation.width = size;
    closedCardAnimation.height = size;

    revealAnimation.width = size;
    revealAnimation.height = size;
  };

  const showClosedOverlay = () => {
    overlayState = 'closed';
    closedCardAnimation.visible = true;
    closedCardAnimation.gotoAndPlay(closedCardAnimationInitialFrame);
    revealAnimation.visible = false;
    revealAnimation.stop();
    syncInteractivity();
  };

  const hideOverlay = () => {
    overlayState = 'hidden';
    closedCardAnimation.visible = false;
    closedCardAnimation.stop();
    revealAnimation.visible = false;
    revealAnimation.stop();
    syncInteractivity();
  };

  const playRevealAnimation = () => {
    if (overlayState !== 'closed') {
      return;
    }

    overlayState = 'animating';
    closedCardAnimation.visible = false;
    closedCardAnimation.stop();
    revealAnimation.visible = true;
    revealAnimation.gotoAndStop(0);
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
    const wasRevealed = currentProps.revealed;
    const wasPreviewed = currentProps.previewed;

    currentProps = nextProps;

    syncLayout();

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

    if (!currentProps.revealed && overlayState === 'hidden') {
      showClosedOverlay();
      return;
    }

    syncInteractivity();
  };

  const destroy = () => {
    container.removeAllListeners();
    revealAnimation.onComplete = undefined;
    container.destroy({ children: true });
  };

  return {
    container,
    destroy,
    update,
  };
};
