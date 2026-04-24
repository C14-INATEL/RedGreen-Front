import type {
  SlotMachineApiMachine,
  SlotMachineApiSession,
} from '../src/presentation/games/SlotMachineGame/slotMachineApi';

export const createSlotMachine = (
  overrides: Partial<SlotMachineApiMachine> = {}
): SlotMachineApiMachine => ({
  Active: true,
  Description: 'Machine used by slot tests',
  MaxRerolls: 5,
  MinimumChipsRequired: 10,
  MinimumRerollValue: 5,
  MinimumSpinValue: 10,
  Name: 'Slot Test Machine',
  SlotMachineId: 7,
  ...overrides,
});

export const createSlotMachineSession = (
  overrides: Partial<SlotMachineApiSession> = {}
): SlotMachineApiSession => ({
  CurrentRewardSnapshot: 0,
  CurrentRerollsSpent: {
    Rerolls: {
      Max: 5,
      Used: 0,
    },
  },
  CurrentSpinResult: {
    Reels: [
      { ReelIndex: 0, SymbolId: 'Watermelon' },
      { ReelIndex: 1, SymbolId: 'Pig' },
      { ReelIndex: 2, SymbolId: 'Orange' },
      { ReelIndex: 3, SymbolId: 'Cheese' },
    ],
  },
  EndedAt: null,
  LastInteractionAt: '2026-04-24T12:00:00.000Z',
  SlotMachineId: 7,
  SlotSessionId: 101,
  StartedAt: '2026-04-24T12:00:00.000Z',
  Status: 'Active',
  ...overrides,
});
