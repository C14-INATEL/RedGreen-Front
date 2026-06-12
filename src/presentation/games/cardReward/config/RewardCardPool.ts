import { getGambitEffectCardSpritePath } from '../../GambitGame/GambitEffectCardAssets';
import type { RewardCardDefinition } from '../types/CardReward';

export const rewardCardPool: RewardCardDefinition[] = [
  {
    description: 'Multiplica os pontos da proxima carta revelada.',
    id: 'dobro-de-potassio',
    spritePath: getGambitEffectCardSpritePath('dobro-de-potassio'),
    subtitle: 'Efeito positivo',
    title: 'Dobro de Potassio',
  },
  {
    description: 'Divide os pontos da proxima carta revelada.',
    id: 'melancidio',
    spritePath: getGambitEffectCardSpritePath('melancidio'),
    subtitle: 'Efeito negativo',
    title: 'Melancidio',
  },
  {
    description: 'Revela uma pista neutra da mesa.',
    id: 'clarividencia',
    spritePath: getGambitEffectCardSpritePath('clarividencia'),
    subtitle: 'Efeito neutro',
    title: 'Clarividencia',
  },
  {
    description: 'Inverte a leitura da mesa sem alterar pontos.',
    id: 'inversao-gravitacional',
    spritePath: getGambitEffectCardSpritePath('inversao-gravitacional'),
    subtitle: 'Efeito neutro',
    title: 'Inversao Gravitacional',
  },
];
