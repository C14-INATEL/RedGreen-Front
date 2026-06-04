import { describe, expect, it } from '@jest/globals';
import { getGambitCardVisibilityState } from '../src/presentation/games/GambitGame/GambitCard';
import {
  GAMBIT_EFFECT_CARD_SPRITES,
  getGambitEffectCardSpritePath,
} from '../src/presentation/games/GambitGame/gambitTextures';
import type { GambitCardEffectViewModel } from '../src/presentation/games/GambitGame/gambitTypes';

const EFFECT_TEXT_FALLBACKS = ['CLAR', 'MEL', '2X', 'INV'];

describe('GambitCard visual secrecy', () => {
  it('keeps positive, negative and effect cards visually identical while closed', () => {
    const closedPositiveCard = getGambitCardVisibilityState({
      effect: null,
      overlayState: 'closed',
      previewed: false,
      revealed: false,
    });
    const closedNegativeCard = getGambitCardVisibilityState({
      effect: null,
      overlayState: 'closed',
      previewed: false,
      revealed: false,
    });
    const closedEffectCard = getGambitCardVisibilityState({
      effect: 'clarividencia',
      overlayState: 'closed',
      previewed: false,
      revealed: false,
    });

    expect(closedPositiveCard).toEqual(closedNegativeCard);
    expect(closedEffectCard).toEqual(closedPositiveCard);
  });

  it('hides every revealed layer under a closed card', () => {
    expect(
      getGambitCardVisibilityState({
        effect: 'melancidio',
        overlayState: 'closed',
        previewed: false,
        revealed: false,
      })
    ).toEqual({
      closedOverlayVisible: true,
      effectSpriteVisible: false,
      revealedFaceVisible: false,
      revealedLabelVisible: false,
      revealAnimationVisible: false,
    });
  });

  it('uses real sprites for revealed effect cards instead of text labels', () => {
    const effects: GambitCardEffectViewModel[] = [
      'dobro-de-potassio',
      'melancidio',
      'clarividencia',
      'inversao-gravitacional',
    ];

    expect(GAMBIT_EFFECT_CARD_SPRITES).toEqual({
      clarividencia: '/Gambit/CardTest2.png',
      'dobro-de-potassio': '/Gambit/CardTest.png',
      'inversao-gravitacional': '/Gambit/CardTest3.png',
      melancidio: '/Gambit/CardTest1.png',
    });
    expect(
      effects.map((effect) => getGambitEffectCardSpritePath(effect))
    ).toEqual([
      '/Gambit/CardTest.png',
      '/Gambit/CardTest1.png',
      '/Gambit/CardTest2.png',
      '/Gambit/CardTest3.png',
    ]);

    effects.forEach((effect) => {
      expect(EFFECT_TEXT_FALLBACKS).not.toContain(
        getGambitEffectCardSpritePath(effect)
      );
    });
  });

  it('shows only the effect sprite layer for revealed effect cards', () => {
    expect(
      getGambitCardVisibilityState({
        effect: 'dobro-de-potassio',
        overlayState: 'hidden',
        previewed: false,
        revealed: true,
      })
    ).toEqual({
      closedOverlayVisible: false,
      effectSpriteVisible: true,
      revealedFaceVisible: false,
      revealedLabelVisible: false,
      revealAnimationVisible: false,
    });
  });

  it('shows the real hidden content during Clarividencia preview', () => {
    expect(
      getGambitCardVisibilityState({
        effect: 'clarividencia',
        overlayState: 'hidden',
        previewed: true,
        revealed: false,
      })
    ).toMatchObject({
      closedOverlayVisible: false,
      effectSpriteVisible: true,
    });
  });
});
