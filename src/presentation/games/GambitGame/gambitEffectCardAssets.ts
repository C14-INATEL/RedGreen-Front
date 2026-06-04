import type { GambitCardEffectViewModel } from './gambitTypes';

export const GAMBIT_EFFECT_CARD_SPRITES: Record<
  GambitCardEffectViewModel,
  string
> = {
  clarividencia: '/Gambit/Clarividencia.png',
  'dobro-de-potassio': '/Gambit/DobroDePotassio.png',
  'inversao-gravitacional': '/Gambit/InversaoGravitacional.png',
  melancidio: '/Gambit/QuantoMenosMelhor.png',
};

export const getGambitEffectCardSpritePath = (
  effect: GambitCardEffectViewModel
) => GAMBIT_EFFECT_CARD_SPRITES[effect];
