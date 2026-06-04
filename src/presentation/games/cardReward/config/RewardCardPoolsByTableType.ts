import type { MinefieldTableType } from '../../MinefieldGame/MinefieldTableConfig';
import type { RewardCardDefinition } from '../types/CardReward';
import { rewardCardPool } from './RewardCardPool';

export const rewardCardPoolsByTableType: Record<
  MinefieldTableType,
  RewardCardDefinition[]
> = {
  bad: rewardCardPool,
  normal: rewardCardPool,
};

export const getRewardCardPoolByTableType = (tableType: MinefieldTableType) =>
  rewardCardPoolsByTableType[tableType];
