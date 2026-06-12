import { describe, expect, it } from '@jest/globals';
import { getGambitCardVisibilityState } from '../src/presentation/games/GambitGame/GambitCard';
import {
  GAMBIT_EFFECT_CARD_SPRITES,
  getGambitEffectCardSpritePath,
} from '../src/presentation/games/GambitGame/gambitEffectCardAssets';
import { GAMBIT_LOCKED_CARD_SPRITE } from '../src/presentation/games/GambitGame/gambitTextures';
import type { GambitCardEffectViewModel } from '../src/presentation/games/GambitGame/gambitTypes';
import { rewardCardPool } from '../src/presentation/games/cardReward/config/RewardCardPool';

const EFFECT_TEXT_FALLBACKS = ['CLAR', 'MEL', '2X', 'INV'];
const TEMPORARY_SPRITE_PREFIX = ['Card', 'Test'].join('');
const EXPECTED_EFFECT_SPRITES: Record<GambitCardEffectViewModel, string> = {
  'anulacao-total': '/Gambit/AnulacaoTotal.png',
  'bumis-infiltrados': '/Gambit/BumisInfiltrados.png',
  cabecinha: '/Gambit/Cabecinha.png',
  'chris-joker': '/Gambit/OCoringaDoInatel.png',
  clarividencia: '/Gambit/Clarividencia.png',
  coloridinho: '/Gambit/Coloridinho.png',
  'coringa-do-inatel': '/Gambit/OCoringaDoInatel.png',
  'dobro-de-potassio': '/Gambit/DobroDePotassio.png',
  headgear: '/Gambit/Headgear.png',
  'inversao-gravitacional': '/Gambit/InversaoGravitacional.png',
  jackpot: '/Gambit/Jackpot.png',
  'jonas-joker': '/Gambit/JonasJoker.png',
  melancidio: '/Gambit/Melancidio.png',
  'mente-lisa': '/Gambit/MenteLisa.png',
  'mosca-joker': '/Gambit/MoscaJoker.png',
  'pao-com-oque': '/Gambit/PaoComOque.png',
  'quanto-mais-melhor': '/Gambit/QuantoMaisMelhor.png',
  'quanto-menos-melhor': '/Gambit/QuantoMenosMelhor.png',
  ratimundio: '/Gambit/Ratimundio.png',
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
        locked: false,
        overlayState: 'closed',
        previewed: false,
        revealed: false,
      })
    ).toEqual({
      closedOverlayVisible: true,
      effectSpriteVisible: false,
      lockedClosedOverlayVisible: false,
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
      '/Gambit/Melancidio.png',
      '/Gambit/Clarividencia.png',
      '/Gambit/InversaoGravitacional.png',
      '/Gambit/AnulacaoTotal.png',
      '/Gambit/Cabecinha.png',
      '/Gambit/Jackpot.png',
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
    expect(rewardSpritesById.melancidio).toBe('/Gambit/Melancidio.png');
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
        locked: false,
        overlayState: 'hidden',
        previewed: false,
        revealed: true,
      })
    ).toEqual({
      closedOverlayVisible: false,
      effectSpriteVisible: false,
      lockedClosedOverlayVisible: false,
      revealedFaceVisible: true,
      revealedLabelVisible: true,
      revealAnimationVisible: false,
    });
  });

  it('keeps the giant effect sprite hidden during Clarividencia preview', () => {
    expect(
      getGambitCardVisibilityState({
        effect: 'clarividencia',
        locked: false,
        overlayState: 'hidden',
        previewed: true,
        revealed: false,
      })
    ).toMatchObject({
      closedOverlayVisible: false,
      effectSpriteVisible: false,
      lockedClosedOverlayVisible: false,
      revealedFaceVisible: true,
      revealedLabelVisible: true,
    });
  });

  it('uses the locked closed sprite when a hidden card is blocked by Mente Lisa', () => {
    expect(GAMBIT_LOCKED_CARD_SPRITE).toBe('/Gambit/SpriteCardsNo.png');
    expect(
      getGambitCardVisibilityState({
        effect: null,
        locked: true,
        overlayState: 'closed',
        previewed: false,
        revealed: false,
      })
    ).toEqual({
      closedOverlayVisible: false,
      effectSpriteVisible: false,
      lockedClosedOverlayVisible: true,
      revealedFaceVisible: false,
      revealedLabelVisible: false,
      revealAnimationVisible: false,
    });
  });
});
