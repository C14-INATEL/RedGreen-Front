import { getGambitEffectCardSpritePath } from './gambitEffectCardAssets';
import { mapBackendGambitCardToViewModel } from './gambitMapper';
import type {
  GambitCardEffect,
  GambitCardEffectViewModel,
} from './gambitTypes';

export type GambitEffectPresentation = {
  description: string;
  spritePath: string;
  subtitle: string;
  title: string;
  viewModel: GambitCardEffectViewModel;
};

export type GambitEffectDisplayOptions = {
  position?: number | null;
  revealed?: boolean;
  salt?: string | null;
  sessionId?: number | string | null;
};

type GambitEffectCopy = Pick<
  GambitEffectPresentation,
  'description' | 'subtitle' | 'title'
>;

export const BUMIS_DISGUISE_EFFECTS = [
  'dobro-de-potassio',
  'anulacao-total',
  'clarividencia',
  'cabecinha',
  'jackpot',
  'quanto-mais-melhor',
] as const satisfies readonly GambitCardEffectViewModel[];

const GAMBIT_EFFECT_COPY: Record<GambitCardEffectViewModel, GambitEffectCopy> =
  {
    'anulacao-total': {
      description: 'Anula o proximo efeito encontrado na mesa.',
      subtitle: 'Efeito positivo',
      title: 'Anulacao Total',
    },
    'bumis-infiltrados': {
      description: 'Mantem a mesa perigosa e exige mais cuidado.',
      subtitle: 'Efeito negativo',
      title: 'Bumis Infiltrados',
    },
    cabecinha: {
      description: 'Permite investigar um grupo de cartas fechadas.',
      subtitle: 'Efeito positivo',
      title: 'Cabecinha',
    },
    'chris-joker': {
      description: 'Um coringa ruim que derruba a rodada.',
      subtitle: 'Efeito negativo',
      title: 'Chris Joker',
    },
    clarividencia: {
      description: 'Revela uma pista sobre uma carta fechada.',
      subtitle: 'Efeito positivo',
      title: 'Clarividencia',
    },
    coloridinho: {
      description: 'Neutraliza os pontos da proxima carta.',
      subtitle: 'Efeito neutro',
      title: 'Coloridinho',
    },
    'coringa-do-inatel': {
      description: 'Coringa imprevisivel que muda o rumo da rodada.',
      subtitle: 'Efeito neutro',
      title: 'Coringa do Inatel',
    },
    'dobro-de-potassio': {
      description: 'Dobra os pontos da proxima carta revelada.',
      subtitle: 'Efeito positivo',
      title: 'Dobro de Potassio',
    },
    headgear: {
      description: 'Transforma a proxima pontuacao em prejuizo.',
      subtitle: 'Efeito negativo',
      title: 'Headgear',
    },
    'inversao-gravitacional': {
      description: 'Inverte o sinal dos pontos da proxima carta.',
      subtitle: 'Efeito neutro',
      title: 'Inversao Gravitacional',
    },
    jackpot: {
      description: 'Adiciona uma grande pontuacao instantanea.',
      subtitle: 'Efeito positivo',
      title: 'Jackpot',
    },
    'jonas-joker': {
      description: 'Adiciona pontos extras imediatamente.',
      subtitle: 'Efeito neutro',
      title: 'Jonas Joker',
    },
    melancidio: {
      description: 'Divide os pontos da proxima carta revelada.',
      subtitle: 'Efeito negativo',
      title: 'Melancidio',
    },
    'mente-lisa': {
      description: 'Trava uma carta boa ainda fechada.',
      subtitle: 'Efeito negativo',
      title: 'Mente Lisa',
    },
    'mosca-joker': {
      description: 'Espalha um novo coringa pela mesa.',
      subtitle: 'Efeito neutro',
      title: 'Mosca Joker',
    },
    'pao-com-oque': {
      description: 'Transforma uma boa oportunidade em perda.',
      subtitle: 'Efeito negativo',
      title: 'Pao Com Oque',
    },
    'quanto-mais-melhor': {
      description: 'Concede uma queima extra para continuar jogando.',
      subtitle: 'Efeito positivo',
      title: 'Quanto Mais Melhor',
    },
    'quanto-menos-melhor': {
      description: 'Remove uma queima disponivel da rodada.',
      subtitle: 'Efeito negativo',
      title: 'Quanto Menos Melhor',
    },
    ratimundio: {
      description: 'Remove uma grande quantidade de pontos.',
      subtitle: 'Efeito negativo',
      title: 'Ratimundio',
    },
  };

const formatTitleFromViewModel = (effect: GambitCardEffectViewModel) =>
  effect
    .split('-')
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(' ');

const getFallbackCopy = (
  effect: GambitCardEffectViewModel
): GambitEffectCopy => ({
  description: 'Efeito especial do Gambit.',
  subtitle: 'Efeito especial',
  title: formatTitleFromViewModel(effect),
});

const hashStableString = (value: string) => {
  let hash = 2166136261;

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return hash >>> 0;
};

export const getBumisDisguisedEffect = ({
  position = null,
  salt = null,
  sessionId = null,
}: GambitEffectDisplayOptions = {}): GambitCardEffectViewModel => {
  const seed = [
    sessionId ?? 'sessionless',
    position ?? 'positionless',
    salt ?? 'bumis-disguise',
  ].join(':');
  const effectIndex = hashStableString(seed) % BUMIS_DISGUISE_EFFECTS.length;

  return BUMIS_DISGUISE_EFFECTS[effectIndex];
};

export const getDisplayedGambitEffectViewModel = (
  effect: GambitCardEffectViewModel,
  options: GambitEffectDisplayOptions = {}
): GambitCardEffectViewModel => {
  if (effect !== 'bumis-infiltrados' || options.revealed) {
    return effect;
  }

  return getBumisDisguisedEffect(options);
};

export const getGambitEffectPresentationFromViewModel = (
  effect: GambitCardEffectViewModel
): GambitEffectPresentation => {
  const copy = GAMBIT_EFFECT_COPY[effect] ?? getFallbackCopy(effect);

  return {
    ...copy,
    spritePath: getGambitEffectCardSpritePath(effect),
    viewModel: effect,
  };
};

export const getGambitEffectPresentation = (
  effect: GambitCardEffect
): GambitEffectPresentation => {
  const viewModel = mapBackendGambitCardToViewModel(effect);

  if (!viewModel) {
    throw new Error(`Unknown Gambit effect "${effect}".`);
  }

  return getGambitEffectPresentationFromViewModel(viewModel);
};

export const getGambitEffectPresentationFromViewModelForDisplay = (
  effect: GambitCardEffectViewModel,
  options: GambitEffectDisplayOptions = {}
): GambitEffectPresentation =>
  getGambitEffectPresentationFromViewModel(
    getDisplayedGambitEffectViewModel(effect, options)
  );

export const getGambitEffectPresentationForDisplay = (
  effect: GambitCardEffect,
  options: GambitEffectDisplayOptions = {}
): GambitEffectPresentation => {
  const viewModel = mapBackendGambitCardToViewModel(effect);

  if (!viewModel) {
    throw new Error(`Unknown Gambit effect "${effect}".`);
  }

  return getGambitEffectPresentationFromViewModelForDisplay(viewModel, options);
};
