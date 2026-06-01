import type { RewardCardDefinition } from '../types/cardReward';

const CARD_TEST_SPRITES = [
  '/Gambit/CardTest.png',
  '/Gambit/CardTest1.png',
  '/Gambit/CardTest2.png',
  '/Gambit/CardTest3.png',
  '/Gambit/CardTest4.png',
  '/Gambit/CardTest5.png',
  '/Gambit/CardTest6.png',
];

const IDS = [
  'golden-echo',
  'frost-veil',
  'rose-flare',
  'verdant-step',
  'astral-thread',
  'ember-surge',
  'lunar-mark',
];

export const rewardCardPool: RewardCardDefinition[] = IDS.map((id, index) => ({
  description: '',
  id,
  spritePath: CARD_TEST_SPRITES[index % CARD_TEST_SPRITES.length],
  subtitle: '',
  title: 'Carta de Poder',
}));
