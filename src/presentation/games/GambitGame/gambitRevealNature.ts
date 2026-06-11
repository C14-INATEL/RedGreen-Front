import type {
  GambitCardEffectViewModel,
  GambitVisualCard,
} from './gambitTypes';

export type GambitRevealNature = 'bad' | 'good' | 'neutral';

const GOOD_EFFECTS = new Set<GambitCardEffectViewModel>([
  'anulacao-total',
  'cabecinha',
  'clarividencia',
  'dobro-de-potassio',
  'jackpot',
  'quanto-mais-melhor',
]);

const BAD_EFFECTS = new Set<GambitCardEffectViewModel>([
  'bumis-infiltrados',
  'chris-joker',
  'headgear',
  'melancidio',
  'mente-lisa',
  'pao-com-oque',
  'quanto-menos-melhor',
  'ratimundio',
]);

export const classifyGambitRevealNature = (
  card: Pick<GambitVisualCard, 'effect' | 'points'> | null
): GambitRevealNature => {
  if (!card) {
    return 'neutral';
  }

  if ((card.points ?? 0) < 0) {
    return 'bad';
  }

  if (card.effect && BAD_EFFECTS.has(card.effect)) {
    return 'bad';
  }

  if ((card.points ?? 0) > 0) {
    return 'good';
  }

  if (card.effect && GOOD_EFFECTS.has(card.effect)) {
    return 'good';
  }

  return 'neutral';
};
