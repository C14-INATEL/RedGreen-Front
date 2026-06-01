import type { GambitTableType } from '../../GambitGame/gambitTableConfig';
import type { RewardCardDefinition } from '../types/cardReward';
import { rewardCardPool } from './rewardCardPool';

export const rewardCardPoolsByTableType: Record<
  GambitTableType,
  RewardCardDefinition[]
> = {
  bad: rewardCardPool,
  normal: rewardCardPool,
};

export const getRewardCardPoolByTableType = (tableType: GambitTableType) =>
  rewardCardPoolsByTableType[tableType];
