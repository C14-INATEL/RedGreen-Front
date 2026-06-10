const SLOT_MACHINE_TEXTURE_BASE_PATH = '/SlotMachine';

export type SlotPaytableEntry = {
  id: string;
  prize: string;
  symbols: readonly string[];
};

const SLOT_SYMBOL_SOURCES = {
  orange: `${SLOT_MACHINE_TEXTURE_BASE_PATH}/SpriteSlotOrange.png`,
  oranges: `${SLOT_MACHINE_TEXTURE_BASE_PATH}/SpriteSlotOranges.png`,
  pig: `${SLOT_MACHINE_TEXTURE_BASE_PATH}/SpriteSlotPig.png`,
  multiplier: `${SLOT_MACHINE_TEXTURE_BASE_PATH}/SpriteSlot2X.png`,
  rat: `${SLOT_MACHINE_TEXTURE_BASE_PATH}/SpriteSlotRat.png`,
  cheese: `${SLOT_MACHINE_TEXTURE_BASE_PATH}/SpriteSlotCheese.png`,
  egg: `${SLOT_MACHINE_TEXTURE_BASE_PATH}/SpriteSlotEgg.png`,
  watermelon: `${SLOT_MACHINE_TEXTURE_BASE_PATH}/SpriteSlotWatermelon.png`,
} as const;

export const SLOT_PAYTABLE_ENTRIES: readonly SlotPaytableEntry[] = [
  {
    id: 'orange-3',
    prize: '3 Laranjas: ganha 5 fichas',
    symbols: Array.from({ length: 3 }, () => SLOT_SYMBOL_SOURCES.orange),
  },
  {
    id: 'orange-4',
    prize: '4 Laranjas: ganha 8 fichas',
    symbols: Array.from({ length: 4 }, () => SLOT_SYMBOL_SOURCES.orange),
  },
  {
    id: 'oranges-3',
    prize: '3 Laranjas Duplas: ganha 10 fichas',
    symbols: Array.from({ length: 3 }, () => SLOT_SYMBOL_SOURCES.oranges),
  },
  {
    id: 'oranges-4',
    prize: '4 Laranjas Duplas: ganha 15 fichas',
    symbols: Array.from({ length: 4 }, () => SLOT_SYMBOL_SOURCES.oranges),
  },
  {
    id: 'pig',
    prize: 'Porquinho: +20 fichas por símbolo',
    symbols: [SLOT_SYMBOL_SOURCES.pig],
  },
  {
    id: 'multiplier',
    prize: '2X: dobra o prêmio da rodada',
    symbols: [SLOT_SYMBOL_SOURCES.multiplier],
  },
  {
    id: 'rat',
    prize: 'Rato sozinho: perde o prêmio da rodada',
    symbols: [SLOT_SYMBOL_SOURCES.rat],
  },
  {
    id: 'cheese',
    prize: 'Queijo protege do rato e dá +10 por rato',
    symbols: [SLOT_SYMBOL_SOURCES.cheese, SLOT_SYMBOL_SOURCES.rat],
  },
  {
    id: 'egg',
    prize: 'Ovo: símbolo neutro, não altera o prêmio',
    symbols: [SLOT_SYMBOL_SOURCES.egg],
  },
  {
    id: 'watermelon-4',
    prize: '4 Melancias: ganha 100 fichas',
    symbols: Array.from({ length: 4 }, () => SLOT_SYMBOL_SOURCES.watermelon),
  },
] as const;
