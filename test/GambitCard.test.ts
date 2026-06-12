import { describe, expect, it } from '@jest/globals';
import { getGambitCardVisibilityState } from '../src/presentation/games/GambitGame/GambitCard';
import {
  FALLBACK_GAMBIT_EFFECT_CARD_SPRITE,
  GAMBIT_EFFECT_CARD_SPRITES,
  getGambitEffectCardSpritePath,
} from '../src/presentation/games/GambitGame/gambitEffectCardAssets';
import type { GambitCardEffectViewModel } from '../src/presentation/games/GambitGame/gambitTypes';
import { rewardCardPool } from '../src/presentation/games/cardReward/config/RewardCardPool';

const EFFECT_TEXT_FALLBACKS = ['CLAR', 'MEL', '2X', 'INV'];
const TEMPORARY_SPRITE_PREFIX = ['Card', 'Test'].join('');
const EXPECTED_EFFECT_SPRITES: Record<GambitCardEffectViewModel, string> = {
  'anulacao-total': '/Gambit/AnulacaoTotal.png',
  'bumis-infiltrados': FALLBACK_GAMBIT_EFFECT_CARD_SPRITE,
  cabecinha: FALLBACK_GAMBIT_EFFECT_CARD_SPRITE,
  'chris-joker': '/Gambit/OCoringaDoInatel.png',
  clarividencia: '/Gambit/Clarividencia.png',
  coloridinho: FALLBACK_GAMBIT_EFFECT_CARD_SPRITE,
  'coringa-do-inatel': '/Gambit/OCoringaDoInatel.png',
  'dobro-de-potassio': '/Gambit/DobroDePotassio.png',
  headgear: FALLBACK_GAMBIT_EFFECT_CARD_SPRITE,
  'inversao-gravitacional': '/Gambit/InversaoGravitacional.png',
  jackpot: FALLBACK_GAMBIT_EFFECT_CARD_SPRITE,
  'jonas-joker': FALLBACK_GAMBIT_EFFECT_CARD_SPRITE,
  melancidio: '/Gambit/QuantoMenosMelhor.png',
  'mente-lisa': FALLBACK_GAMBIT_EFFECT_CARD_SPRITE,
  'mosca-joker': FALLBACK_GAMBIT_EFFECT_CARD_SPRITE,
  'pao-com-oque': FALLBACK_GAMBIT_EFFECT_CARD_SPRITE,
  'quanto-mais-melhor': '/Gambit/QuantoMaisMelhor.png',
  'quanto-menos-melhor': '/Gambit/QuantoMenosMelhor.png',
  ratimundio: FALLBACK_GAMBIT_EFFECT_CARD_SPRITE,
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
      'anulacao-total',
      'cabecinha',
      'jackpot',
    ];

    expect(GAMBIT_EFFECT_CARD_SPRITES).toEqual(EXPECTED_EFFECT_SPRITES);
    expect(
      effects.map((effect) => getGambitEffectCardSpritePath(effect))
    ).toEqual([
      '/Gambit/DobroDePotassio.png',
      '/Gambit/QuantoMenosMelhor.png',
      '/Gambit/Clarividencia.png',
      '/Gambit/InversaoGravitacional.png',
      '/Gambit/AnulacaoTotal.png',
      FALLBACK_GAMBIT_EFFECT_CARD_SPRITE,
      FALLBACK_GAMBIT_EFFECT_CARD_SPRITE,
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

  it('shows points instead of the effect sprite for revealed board effect cards', () => {
    expect(
      getGambitCardVisibilityState({
        effect: 'dobro-de-potassio',
        overlayState: 'hidden',
        previewed: false,
        revealed: true,
      })
    ).toEqual({
      closedOverlayVisible: false,
      effectSpriteVisible: false,
      revealedFaceVisible: true,
      revealedLabelVisible: true,
      revealAnimationVisible: false,
    });
  });

  it('keeps the giant effect sprite hidden during Clarividencia preview', () => {
    expect(
      getGambitCardVisibilityState({
        effect: 'clarividencia',
        overlayState: 'hidden',
        previewed: true,
        revealed: false,
      })
    ).toMatchObject({
      closedOverlayVisible: false,
      effectSpriteVisible: false,
      revealedFaceVisible: true,
      revealedLabelVisible: true,
    });
  });
});
