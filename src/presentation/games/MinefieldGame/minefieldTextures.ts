import { Assets, SCALE_MODES, Texture } from 'pixi.js';

const CLOSED_CARD_SPRITE_TOTAL = 7;
const REVEAL_FRAME_TOTAL = 24;

export const MINEFIELD_CLOSED_CARD_SPRITES = Array.from(
  { length: CLOSED_CARD_SPRITE_TOTAL },
  (_, index) => `/MineField/SpriteCards${index + 1}.png`
);

export const MINEFIELD_REVEAL_ANIMATION_FRAMES = Array.from(
  { length: REVEAL_FRAME_TOTAL },
  (_, index) => `/MineField/SpriteCardOff${String(index + 1).padStart(2, '0')}.png`
);

let preloadMinefieldCardTexturesPromise: Promise<void> | null = null;

export const preloadMinefieldCardTextures = () => {
  if (!preloadMinefieldCardTexturesPromise) {
    const texturePaths = [
      ...MINEFIELD_CLOSED_CARD_SPRITES,
      ...MINEFIELD_REVEAL_ANIMATION_FRAMES,
    ];

    preloadMinefieldCardTexturesPromise = Assets.load(texturePaths).then(() => {
      texturePaths.forEach((texturePath) => {
        const texture = Texture.from(texturePath);
        texture.baseTexture.scaleMode = SCALE_MODES.NEAREST;
      });
    });
  }

  return preloadMinefieldCardTexturesPromise;
};

export const getRandomMinefieldClosedCardSprite = () =>
  MINEFIELD_CLOSED_CARD_SPRITES[
    Math.floor(Math.random() * MINEFIELD_CLOSED_CARD_SPRITES.length)
  ] ?? MINEFIELD_CLOSED_CARD_SPRITES[0];
