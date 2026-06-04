import { describe, expect, it } from '@jest/globals';
import { getGambitCardVisibilityState } from '../src/presentation/games/GambitGame/GambitCard';
import {
  GAMBIT_EFFECT_CARD_SPRITES,
  getGambitEffectCardSpritePath,
} from '../src/presentation/games/GambitGame/gambitEffectCardAssets';
import type { GambitCardEffectViewModel } from '../src/presentation/games/GambitGame/gambitTypes';
import { rewardCardPool } from '../src/presentation/games/cardReward/config/rewardCardPool';

const EFFECT_TEXT_FALLBACKS = ['CLAR', 'MEL', '2X', 'INV'];
const TEMPORARY_SPRITE_PREFIX = ['Card', 'Test'].join('');
const EXPECTED_EFFECT_SPRITES: Record<GambitCardEffectViewModel, string> = {
  clarividencia: '/Gambit/Clarividencia.png',
  'dobro-de-potassio': '/Gambit/DobroDePotassio.png',
  'inversao-gravitacional': '/Gambit/InversaoGravitacional.png',
  melancidio: '/Gambit/QuantoMenosMelhor.png',
};

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

    expect(GAMBIT_EFFECT_CARD_SPRITES).toEqual(EXPECTED_EFFECT_SPRITES);
    expect(
      effects.map((effect) => getGambitEffectCardSpritePath(effect))
    ).toEqual([
      '/Gambit/DobroDePotassio.png',
      '/Gambit/QuantoMenosMelhor.png',
      '/Gambit/Clarividencia.png',
      '/Gambit/InversaoGravitacional.png',
    ]);

    effects.forEach((effect) => {
      expect(EFFECT_TEXT_FALLBACKS).not.toContain(
        getGambitEffectCardSpritePath(effect)
      );
    });
  });

  it('keeps board and reward modal effects on the same final sprite paths', () => {
    const rewardSpritesById = Object.fromEntries(
      rewardCardPool.map((card) => [card.id, card.spritePath])
    );

    expect(rewardSpritesById).toEqual(GAMBIT_EFFECT_CARD_SPRITES);
    expect(rewardSpritesById['dobro-de-potassio']).toBe(
      '/Gambit/DobroDePotassio.png'
    );
    expect(rewardSpritesById.clarividencia).toBe('/Gambit/Clarividencia.png');
    expect(rewardSpritesById['inversao-gravitacional']).toBe(
      '/Gambit/InversaoGravitacional.png'
    );
    expect(rewardSpritesById.melancidio).toBe('/Gambit/QuantoMenosMelhor.png');
  });

  it('does not use temporary placeholder sprites for official effects', () => {
    const temporarySpritePattern = new RegExp(
      `${TEMPORARY_SPRITE_PREFIX}\\d*\\.png$`
    );

    [
      ...Object.values(GAMBIT_EFFECT_CARD_SPRITES),
      ...rewardCardPool.map((card) => card.spritePath),
    ].forEach((spritePath) => {
      expect(spritePath).not.toMatch(temporarySpritePattern);
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
