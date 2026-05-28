export type MinefieldTableType = 'normal' | 'bad';

export type MinefieldTableTheme = {
  impactFlashTint: number;
  impactPushOffset: number;
  spritePath: string;
  type: MinefieldTableType;
};

export const minefieldTableThemes: Record<
  MinefieldTableType,
  MinefieldTableTheme
> = {
  bad: {
    impactFlashTint: 0xf06a3d,
    impactPushOffset: 24,
    spritePath: '/MineField/SpriteTableBad.png',
    type: 'bad',
  },
  normal: {
    impactFlashTint: 0xf0c350,
    impactPushOffset: 18,
    spritePath: '/MineField/SpriteTable.png',
    type: 'normal',
  },
};

export const getMinefieldTableTheme = (tableType: MinefieldTableType) =>
  minefieldTableThemes[tableType];

export const getNextMinefieldTableType = (
  tableType: MinefieldTableType
): MinefieldTableType => {
  if (tableType === 'normal') {
    return 'bad';
  }

  // Futuras mesas especiais podem entrar aqui sem mexer na timeline.
  return 'bad';
};
