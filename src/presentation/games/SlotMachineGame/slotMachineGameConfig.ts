export const SLOT_MACHINE_SYMBOLS = [
  {
    id: 'twoX',
    textureUrl: '/SlotMachine/SpriteSlot2X.png',
  },
  {
    id: 'cheese',
    textureUrl: '/SlotMachine/SpriteSlotCheese.png',
  },
  {
    id: 'egg',
    textureUrl: '/SlotMachine/SpriteSlotEgg.png',
  },
  {
    id: 'orange',
    textureUrl: '/SlotMachine/SpriteSlotOrange.png',
  },
  {
    id: 'oranges',
    textureUrl: '/SlotMachine/SpriteSlotOranges.png',
  },
  {
    id: 'pig',
    textureUrl: '/SlotMachine/SpriteSlotPig.png',
  },
  {
    id: 'rat',
    textureUrl: '/SlotMachine/SpriteSlotRat.png',
  },
  {
    id: 'watermelon',
    textureUrl: '/SlotMachine/SpriteSlotWatermelon.png',
  },
] as const;

export const SLOT_MACHINE_REEL_COUNT = 4;
export const MAX_REROLLS = 5;

export type SlotMachineSymbolId = (typeof SLOT_MACHINE_SYMBOLS)[number]['id'];
export type SlotMachineSpinDirection = 'down' | 'up';

export type SlotMachineSpinReelResult = {
  extraSpinSteps?: number;
  reelIndex: number;
  symbolId: SlotMachineSymbolId;
};

export type SlotMachineSpinResult = {
  firstStopDelayMs: number;
  id: string;
  reelStopOrder: number[];
  reels: SlotMachineSpinReelResult[];
  responseDelayMs: number;
  spinDirection: SlotMachineSpinDirection;
  spinSpeedPxPerMs: number;
  stopDelayMs: number;
};

export const getSlotMachineTextureUrls = () =>
  SLOT_MACHINE_SYMBOLS.map((symbol) => symbol.textureUrl);

export const getSlotMachineTextureIndexBySymbolId = (
  symbolId: SlotMachineSymbolId
) => SLOT_MACHINE_SYMBOLS.findIndex((symbol) => symbol.id === symbolId);
