import type { GambitCardEffectViewModel } from './gambitTypes';

export const FALLBACK_GAMBIT_EFFECT_CARD_SPRITE = '/Gambit/Clarividencia.png';

export const GAMBIT_EFFECT_CARD_SPRITES: Record<
  GambitCardEffectViewModel,
  string
> = {
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

export const getGambitEffectCardSpritePath = (
  effect: GambitCardEffectViewModel
) => GAMBIT_EFFECT_CARD_SPRITES[effect] ?? FALLBACK_GAMBIT_EFFECT_CARD_SPRITE;
