import type { GambitTableType } from '../../GambitGame/gambitTableConfig';
import type { RewardCardDefinition } from '../types/CardReward';
import { rewardCardPool } from './RewardCardPool';

export const rewardCardPoolsByTableType: Record<
  GambitTableType,
  RewardCardDefinition[]
> = {
  bad: rewardCardPool,
  normal: rewardCardPool,
};

export const getRewardCardPoolByTableType = (tableType: GambitTableType) =>
  rewardCardPoolsByTableType[tableType];
