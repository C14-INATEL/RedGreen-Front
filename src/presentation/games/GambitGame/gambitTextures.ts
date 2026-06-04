import { Assets, SCALE_MODES, Texture } from 'pixi.js';
import { type GambitTableType, gambitTableThemes } from './gambitTableConfig';
import type { GambitCardEffectViewModel } from './gambitTypes';

const CLOSED_CARD_SPRITE_TOTAL = 7;
const PARTICLE_FRAME_TOTAL = 8;
const REVEAL_FRAME_TOTAL = 24;

export const GAMBIT_CLOSED_CARD_SPRITES = Array.from(
  { length: CLOSED_CARD_SPRITE_TOTAL },
  (_, index) => `/Gambit/SpriteCards${index + 1}.png`
);

export const GAMBIT_REVEAL_ANIMATION_FRAMES = Array.from(
  { length: REVEAL_FRAME_TOTAL },
  (_, index) => `/Gambit/SpriteCardOff${String(index + 1).padStart(2, '0')}.png`
);

export const GAMBIT_PARTICLE_ANIMATION_FRAMES = Array.from(
  { length: PARTICLE_FRAME_TOTAL },
  (_, index) => `/Gambit/SpriteParticle${index + 1}.png`
);

export const GAMBIT_EFFECT_CARD_SPRITES: Record<
  GambitCardEffectViewModel,
  string
> = {
  clarividencia: '/Gambit/CardTest2.png',
  'dobro-de-potassio': '/Gambit/CardTest.png',
  'inversao-gravitacional': '/Gambit/CardTest3.png',
  melancidio: '/Gambit/CardTest1.png',
};

let preloadGambitCardTexturesPromise: Promise<void> | null = null;
let preloadGambitParticleTexturesPromise: Promise<void> | null = null;
let preloadGambitTableTexturesPromise: Promise<void> | null = null;
let gambitTableTextureCache: Partial<Record<GambitTableType, Texture>> = {};

export const GAMBIT_EVENT_TABLE_TEXTURES = Object.fromEntries(
  Object.entries(gambitTableThemes).map(([tableType, theme]) => [
    tableType,
    theme.spritePath,
  ])
) as Record<keyof typeof gambitTableThemes, string>;

const applyGambitTextureScaleMode = (texturePaths: string[]) => {
  texturePaths.forEach((texturePath) => {
    const texture = Texture.from(texturePath);
    texture.baseTexture.scaleMode = SCALE_MODES.NEAREST;
  });
};

export const preloadGambitCardTextures = () => {
  if (!preloadGambitCardTexturesPromise) {
    const texturePaths = [
      ...GAMBIT_CLOSED_CARD_SPRITES,
      ...GAMBIT_REVEAL_ANIMATION_FRAMES,
      ...Object.values(GAMBIT_EFFECT_CARD_SPRITES),
    ];

    preloadGambitCardTexturesPromise = Assets.load(texturePaths).then(() => {
      applyGambitTextureScaleMode(texturePaths);
    });
  }

  return preloadGambitCardTexturesPromise;
};

export const preloadGambitParticleTextures = () => {
  if (!preloadGambitParticleTexturesPromise) {
    preloadGambitParticleTexturesPromise = Assets.load(
      GAMBIT_PARTICLE_ANIMATION_FRAMES
    ).then(() => {
      applyGambitTextureScaleMode(GAMBIT_PARTICLE_ANIMATION_FRAMES);
    });
  }

  return preloadGambitParticleTexturesPromise;
};

export const preloadGambitTableTextures = () => {
  if (!preloadGambitTableTexturesPromise) {
    const texturePaths = Object.values(GAMBIT_EVENT_TABLE_TEXTURES);

    preloadGambitTableTexturesPromise = Assets.load(texturePaths).then(() => {
      applyGambitTextureScaleMode(texturePaths);

      gambitTableTextureCache = Object.fromEntries(
        (Object.keys(gambitTableThemes) as GambitTableType[]).map(
          (tableType) => [
            tableType,
            Texture.from(GAMBIT_EVENT_TABLE_TEXTURES[tableType]),
          ]
        )
      ) as Record<GambitTableType, Texture>;
    });
  }

  return preloadGambitTableTexturesPromise;
};

export const getGambitTableTexture = (tableType: GambitTableType) => {
  const cachedTexture = gambitTableTextureCache[tableType];

  if (cachedTexture) {
    cachedTexture.baseTexture.scaleMode = SCALE_MODES.NEAREST;
    return cachedTexture;
  }

  const texture = Texture.from(GAMBIT_EVENT_TABLE_TEXTURES[tableType]);
  texture.baseTexture.scaleMode = SCALE_MODES.NEAREST;
  gambitTableTextureCache[tableType] = texture;

  return texture;
};

export const getRandomGambitClosedCardSprite = () =>
  GAMBIT_CLOSED_CARD_SPRITES[
    Math.floor(Math.random() * GAMBIT_CLOSED_CARD_SPRITES.length)
  ] ?? GAMBIT_CLOSED_CARD_SPRITES[0];

export const getGambitEffectCardSpritePath = (
  effect: GambitCardEffectViewModel
) => GAMBIT_EFFECT_CARD_SPRITES[effect];
