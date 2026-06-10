import type {
  RewardCardDefinition,
  RewardCardOption,
} from '../../types/CardReward';

const shuffleCards = <T>(items: T[], random: () => number) => {
  const nextItems = [...items];

  for (let index = nextItems.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    const currentItem = nextItems[index];

    nextItems[index] = nextItems[swapIndex] as T;
    nextItems[swapIndex] = currentItem as T;
  }

  return nextItems;
};

export const selectRewardCardDefinitions = (
  pool: RewardCardDefinition[],
  amount: number,
  random: () => number = Math.random
) => {
  if (!pool.length || amount <= 0) {
    return [];
  }

  return shuffleCards(pool, random).slice(0, Math.min(amount, pool.length));
};

export const buildRewardCardOptions = (
  pool: RewardCardDefinition[],
  amount: number,
  sessionId: string,
  random: () => number = Math.random
): RewardCardOption[] =>
  selectRewardCardDefinitions(pool, amount, random).map((card, index) => ({
    ...card,
    optionId: `${sessionId}-${card.id}-${index}`,
    optionIndex: index,
    sessionId,
  }));
