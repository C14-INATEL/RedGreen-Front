import type { GambitCardEffectViewModel } from './gambitTypes';

export const FALLBACK_GAMBIT_EFFECT_CARD_SPRITE = '/Gambit/Clarividencia.png';

export const GAMBIT_EFFECT_CARD_SPRITES: Record<
  GambitCardEffectViewModel,
  string
> = {
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

export const getGambitEffectCardSpritePath = (
  effect: GambitCardEffectViewModel
) => GAMBIT_EFFECT_CARD_SPRITES[effect] ?? FALLBACK_GAMBIT_EFFECT_CARD_SPRITE;
