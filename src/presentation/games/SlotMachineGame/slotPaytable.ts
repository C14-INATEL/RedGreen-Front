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
  watermelon: `${SLOT_MACHINE_TEXTURE_BASE_PATH}/SpriteSlotWatermelon.png`,
} as const;

export const SLOT_PAYTABLE_ENTRIES: readonly SlotPaytableEntry[] = [
  {
    id: 'orange-3',
    prize: '3',
    symbols: Array.from({ length: 3 }, () => SLOT_SYMBOL_SOURCES.orange),
  },
  {
    id: 'orange-4',
    prize: '5',
    symbols: Array.from({ length: 4 }, () => SLOT_SYMBOL_SOURCES.orange),
  },
  {
    id: 'oranges-3',
    prize: '9',
    symbols: Array.from({ length: 3 }, () => SLOT_SYMBOL_SOURCES.oranges),
  },
  {
    id: 'oranges-4',
    prize: '15',
    symbols: Array.from({ length: 4 }, () => SLOT_SYMBOL_SOURCES.oranges),
  },
  {
    id: 'pig',
    prize: '10 each',
    symbols: [SLOT_SYMBOL_SOURCES.pig],
  },
  {
    id: 'multiplier',
    prize: '2x Amount',
    symbols: [SLOT_SYMBOL_SOURCES.multiplier],
  },
  {
    id: 'rat',
    prize: 'Sets to 0',
    symbols: [SLOT_SYMBOL_SOURCES.rat],
  },
  {
    id: 'cheese',
    prize: '3 for each Rat',
    symbols: [SLOT_SYMBOL_SOURCES.cheese, SLOT_SYMBOL_SOURCES.rat],
  },
  {
    id: 'watermelon-4',
    prize: '100',
    symbols: Array.from({ length: 4 }, () => SLOT_SYMBOL_SOURCES.watermelon),
  },
] as const;
