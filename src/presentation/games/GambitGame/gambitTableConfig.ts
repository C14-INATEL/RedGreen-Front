export type GambitTableType = 'normal' | 'bad';

export type GambitTableTheme = {
  impactFlashTint: number;
  impactPushOffset: number;
  spritePath: string;
  type: GambitTableType;
};

export const gambitTableThemes: Record<GambitTableType, GambitTableTheme> = {
  bad: {
    impactFlashTint: 0xf06a3d,
    impactPushOffset: 24,
    spritePath: '/Gambit/SpriteTableBad.png',
    type: 'bad',
  },
  normal: {
    impactFlashTint: 0xf0c350,
    impactPushOffset: 18,
    spritePath: '/Gambit/SpriteTable.png',
    type: 'normal',
  },
};

export const getGambitTableTheme = (tableType: GambitTableType) =>
  gambitTableThemes[tableType];

export const getNextGambitTableType = (
  tableType: GambitTableType
): GambitTableType => {
  if (tableType === 'normal') {
    return 'bad';
  }

  // Futuras mesas especiais podem entrar aqui sem mexer na timeline.
  return 'bad';
};
