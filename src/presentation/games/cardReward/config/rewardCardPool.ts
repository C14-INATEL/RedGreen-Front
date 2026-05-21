import type { RewardCardDefinition } from '../types/cardReward';

const CARD_TEST_SPRITES = [
  '/MineField/CardTest.png',
  '/MineField/CardTest1.png',
  '/MineField/CardTest2.png',
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
