import type { RewardCardDefinition } from '../types/cardReward';

export const rewardCardPool: RewardCardDefinition[] = [
  {
    description: 'Multiplica os pontos da proxima carta revelada.',
    id: 'dobro-de-potassio',
    spritePath: '/Gambit/CardTest.png',
    subtitle: 'Efeito positivo',
    title: 'Dobro de Potassio',
  },
  {
    description: 'Divide os pontos da proxima carta revelada.',
    id: 'melancidio',
    spritePath: '/Gambit/CardTest1.png',
    subtitle: 'Efeito negativo',
    title: 'Melancidio',
  },
  {
    description: 'Revela uma pista neutra da mesa.',
    id: 'clarividencia',
    spritePath: '/Gambit/CardTest2.png',
    subtitle: 'Efeito neutro',
    title: 'Clarividencia',
  },
  {
    description: 'Inverte a leitura da mesa sem alterar pontos.',
    id: 'inversao-gravitacional',
    spritePath: '/Gambit/CardTest3.png',
    subtitle: 'Efeito neutro',
    title: 'Inversao Gravitacional',
  },
];
