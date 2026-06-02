import { Assets, SCALE_MODES, Texture } from 'pixi.js';
import {
  type MinefieldTableType,
  minefieldTableThemes,
} from './minefieldTableConfig';

const CLOSED_CARD_SPRITE_TOTAL = 7;
const PARTICLE_FRAME_TOTAL = 8;
const REVEAL_FRAME_TOTAL = 24;

export const MINEFIELD_CLOSED_CARD_SPRITES = Array.from(
  { length: CLOSED_CARD_SPRITE_TOTAL },
  (_, index) => `/MineField/SpriteCards${index + 1}.png`
);

export const MINEFIELD_REVEAL_ANIMATION_FRAMES = Array.from(
  { length: REVEAL_FRAME_TOTAL },
  (_, index) =>
    `/MineField/SpriteCardOff${String(index + 1).padStart(2, '0')}.png`
);

export const MINEFIELD_PARTICLE_ANIMATION_FRAMES = Array.from(
  { length: PARTICLE_FRAME_TOTAL },
  (_, index) => `/MineField/SpriteParticle${index + 1}.png`
);

let preloadMinefieldCardTexturesPromise: Promise<void> | null = null;
let preloadMinefieldParticleTexturesPromise: Promise<void> | null = null;
let preloadMinefieldTableTexturesPromise: Promise<void> | null = null;
let minefieldTableTextureCache: Partial<Record<MinefieldTableType, Texture>> = {};

export const MINEFIELD_EVENT_TABLE_TEXTURES = Object.fromEntries(
  Object.entries(minefieldTableThemes).map(([tableType, theme]) => [
    tableType,
    theme.spritePath,
  ])
) as Record<keyof typeof minefieldTableThemes, string>;

const applyMinefieldTextureScaleMode = (texturePaths: string[]) => {
  texturePaths.forEach((texturePath) => {
    const texture = Texture.from(texturePath);
    texture.baseTexture.scaleMode = SCALE_MODES.NEAREST;
  });
};

export const preloadMinefieldCardTextures = () => {
  if (!preloadMinefieldCardTexturesPromise) {
    const texturePaths = [
      ...MINEFIELD_CLOSED_CARD_SPRITES,
      ...MINEFIELD_REVEAL_ANIMATION_FRAMES,
    ];

    preloadMinefieldCardTexturesPromise = Assets.load(texturePaths).then(() => {
      applyMinefieldTextureScaleMode(texturePaths);
    });
  }

  return preloadMinefieldCardTexturesPromise;
};

export const preloadMinefieldParticleTextures = () => {
  if (!preloadMinefieldParticleTexturesPromise) {
    preloadMinefieldParticleTexturesPromise = Assets.load(
      MINEFIELD_PARTICLE_ANIMATION_FRAMES
    ).then(() => {
      applyMinefieldTextureScaleMode(MINEFIELD_PARTICLE_ANIMATION_FRAMES);
    });
  }

  return preloadMinefieldParticleTexturesPromise;
};

export const preloadMinefieldTableTextures = () => {
  if (!preloadMinefieldTableTexturesPromise) {
    const texturePaths = Object.values(MINEFIELD_EVENT_TABLE_TEXTURES);

    preloadMinefieldTableTexturesPromise = Assets.load(texturePaths).then(() => {
      applyMinefieldTextureScaleMode(texturePaths);

      minefieldTableTextureCache = Object.fromEntries(
        (Object.keys(minefieldTableThemes) as MinefieldTableType[]).map(
          (tableType) => [tableType, Texture.from(MINEFIELD_EVENT_TABLE_TEXTURES[tableType])]
        )
      ) as Record<MinefieldTableType, Texture>;
    });
  }

  return preloadMinefieldTableTexturesPromise;
};

export const getMinefieldTableTexture = (tableType: MinefieldTableType) => {
  const cachedTexture = minefieldTableTextureCache[tableType];

  if (cachedTexture) {
    cachedTexture.baseTexture.scaleMode = SCALE_MODES.NEAREST;
    return cachedTexture;
  }

  const texture = Texture.from(MINEFIELD_EVENT_TABLE_TEXTURES[tableType]);
  texture.baseTexture.scaleMode = SCALE_MODES.NEAREST;
  minefieldTableTextureCache[tableType] = texture;

  return texture;
};

export const getRandomMinefieldClosedCardSprite = () =>
  MINEFIELD_CLOSED_CARD_SPRITES[
    Math.floor(Math.random() * MINEFIELD_CLOSED_CARD_SPRITES.length)
  ] ?? MINEFIELD_CLOSED_CARD_SPRITES[0];
