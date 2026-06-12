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
    prize: '3x Laranja: +5',
    symbols: Array.from({ length: 3 }, () => SLOT_SYMBOL_SOURCES.orange),
  },
  {
    id: 'orange-4',
    prize: '4x Laranja: +8',
    symbols: Array.from({ length: 4 }, () => SLOT_SYMBOL_SOURCES.orange),
  },
  {
    id: 'oranges-3',
    prize: '3x Dupla: +10',
    symbols: Array.from({ length: 3 }, () => SLOT_SYMBOL_SOURCES.oranges),
  },
  {
    id: 'oranges-4',
    prize: '4x Dupla: +15',
    symbols: Array.from({ length: 4 }, () => SLOT_SYMBOL_SOURCES.oranges),
  },
  {
    id: 'pig',
    prize: 'Porco: +20 cada',
    symbols: [SLOT_SYMBOL_SOURCES.pig],
  },
  {
    id: 'multiplier',
    prize: '2X: dobra prêmio',
    symbols: [SLOT_SYMBOL_SOURCES.multiplier],
  },
  {
    id: 'rat',
    prize: 'Rato: zera prêmio',
    symbols: [SLOT_SYMBOL_SOURCES.rat],
  },
  {
    id: 'cheese',
    prize: 'Queijo + Rato: protege e dá +10 por rato',
    symbols: [SLOT_SYMBOL_SOURCES.cheese, SLOT_SYMBOL_SOURCES.rat],
  },
  {
    id: 'egg',
    prize: 'Ovo: neutro',
    symbols: [SLOT_SYMBOL_SOURCES.egg],
  },
  {
    id: 'watermelon-4',
    prize: '4x Melancia: +100',
    symbols: Array.from({ length: 4 }, () => SLOT_SYMBOL_SOURCES.watermelon),
  },
] as const;
