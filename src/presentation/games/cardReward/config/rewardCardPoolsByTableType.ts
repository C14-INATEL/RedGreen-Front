import type { MinefieldTableType } from '../../MinefieldGame/minefieldTableConfig';
import type { RewardCardDefinition } from '../types/cardReward';
import { rewardCardPool } from './rewardCardPool';

export const rewardCardPoolsByTableType: Record<
  MinefieldTableType,
  RewardCardDefinition[]
> = {
  bad: rewardCardPool,
  normal: rewardCardPool,
};

export const getRewardCardPoolByTableType = (
  tableType: MinefieldTableType
) => rewardCardPoolsByTableType[tableType];
