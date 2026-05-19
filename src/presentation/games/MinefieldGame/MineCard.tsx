import { AnimatedSprite, Container, Graphics, Text, TextStyle } from 'pixi.js';
import {
  MINEFIELD_CLOSED_CARD_SPRITES,
  MINEFIELD_REVEAL_ANIMATION_FRAMES,
} from './minefieldTextures';

export type MineCardProps = {
  onClick: () => void;
  revealed: boolean;
  size: number;
  value: number;
  x: number;
  y: number;
};

type MineCardOverlayState = 'closed' | 'animating' | 'hidden';

export type MineCardInstance = {
  container: Container;
  destroy: () => void;
  update: (nextProps: MineCardProps) => void;
};

const CARD_REVEALED_COLOR = 0xf1d28a;
const CARD_REVEALED_BORDER_COLOR = 0xf0c350;
const CARD_REVEALED_TEXT_COLOR = 0x2a1f12;
const CARD_REVEALED_GLOW_COLOR = 0xfff4b5;
const CLOSED_CARD_ANIMATION_SPEED = 0.12;
const REVEAL_ANIMATION_SPEED = 0.42;

const drawRevealedCardFace = (graphics: Graphics, size: number) => {
  const borderWidth = Math.max(2, Math.round(size * 0.055));
  const inset = Math.max(3, Math.round(size * 0.08));

  graphics.clear();
  graphics.lineStyle(borderWidth, CARD_REVEALED_BORDER_COLOR, 0.96);
  graphics.beginFill(CARD_REVEALED_COLOR, 1);
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

const createValueTextStyle = (size: number) =>
  new TextStyle({
    align: 'center',
    fill: CARD_REVEALED_TEXT_COLOR,
    fontFamily: 'Press Start 2P',
    fontSize: Math.max(10, Math.floor(size * 0.2)),
    fontWeight: '700',
  });

const createRevealAnimation = (size: number) => {
  const revealAnimation = AnimatedSprite.fromFrames(
    MINEFIELD_REVEAL_ANIMATION_FRAMES
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
    MINEFIELD_CLOSED_CARD_SPRITES
  );

  closedCardAnimation.width = size;
  closedCardAnimation.height = size;
  closedCardAnimation.loop = true;
  closedCardAnimation.animationSpeed = CLOSED_CARD_ANIMATION_SPEED;
  closedCardAnimation.roundPixels = true;

  return closedCardAnimation;
};

export const createMineCard = (initialProps: MineCardProps): MineCardInstance => {
  const container = new Container();
  const revealedCardFace = new Graphics();
  const revealedCardLabel = new Text(
    `+${initialProps.value}`,
    createValueTextStyle(initialProps.size)
  );
  const closedCardAnimation = createClosedCardAnimation(initialProps.size);
  const revealAnimation = createRevealAnimation(initialProps.size);
  const closedCardAnimationInitialFrame = Math.floor(
    Math.random() * MINEFIELD_CLOSED_CARD_SPRITES.length
  );

  let currentProps = initialProps;
  let overlayState: MineCardOverlayState = initialProps.revealed
    ? 'hidden'
    : 'closed';

  const syncInteractivity = () => {
    const isCardClickable =
      !currentProps.revealed && overlayState === 'closed';

    container.eventMode = isCardClickable ? 'static' : 'none';
    container.cursor = isCardClickable ? 'pointer' : 'default';
  };

  const syncLayout = () => {
    const { size, value, x, y } = currentProps;

    container.position.set(x, y);

    drawRevealedCardFace(revealedCardFace, size);

    revealedCardLabel.text = `+${value}`;
    revealedCardLabel.style = createValueTextStyle(size);
    revealedCardLabel.anchor.set(0.5);
    revealedCardLabel.resolution = 2;
    revealedCardLabel.position.set(
      Math.round(size / 2),
      Math.round(size / 2)
    );

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
    };

    revealAnimation.play();
  };

  const handlePointerTap = () => {
    if (currentProps.revealed || overlayState !== 'closed') {
      return;
    }

    playRevealAnimation();
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

  if (currentProps.revealed) {
    hideOverlay();
  } else {
    showClosedOverlay();
  }

  const update = (nextProps: MineCardProps) => {
    const wasRevealed = currentProps.revealed;

    currentProps = nextProps;

    syncLayout();

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
