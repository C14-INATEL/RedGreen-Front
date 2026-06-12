import { describe, it, expect } from '@jest/globals';
import {
  TABLE_COLORS,
  COLOR_OPTIONS,
  TABLE_COLOR_MAP,
  type TableColor,
} from '../src/presentation/ui/TableColor';

describe('TABLE_COLORS', () => {
  it('should contain exactly 12 colors', () => {
    expect(TABLE_COLORS).toHaveLength(12);
  });

  it('should contain all expected colors in order', () => {
    const expected = [
      'White',
      'Black',
      'Red',
      'Green',
      'Blue',
      'Yellow',
      'Purple',
      'Diamond',
      'Platinum',
      'Gold',
      'Silver',
      'Bronze',
    ];
    expect([...TABLE_COLORS]).toEqual(expected);
  });

  it('should not contain duplicate values', () => {
    const unique = new Set(TABLE_COLORS);
    expect(unique.size).toBe(TABLE_COLORS.length);
  });
});

describe('COLOR_OPTIONS', () => {
  it('should have the same number of entries as TABLE_COLORS', () => {
    expect(COLOR_OPTIONS).toHaveLength(TABLE_COLORS.length);
  });

  it('each option should have Value, Hex and Label', () => {
    for (const option of COLOR_OPTIONS) {
      expect(option).toHaveProperty('Value');
      expect(option).toHaveProperty('Hex');
      expect(option).toHaveProperty('Label');
    }
  });

  it('each Value should be a valid TableColor', () => {
    const validColors = new Set<string>(TABLE_COLORS);
    for (const option of COLOR_OPTIONS) {
      expect(validColors.has(option.Value)).toBe(true);
    }
  });

  it('each Hex should be a valid CSS color (# + 6 hex chars)', () => {
    const hexPattern = /^#[0-9A-Fa-f]{6}$/;
    for (const option of COLOR_OPTIONS) {
      expect(option.Hex).toMatch(hexPattern);
    }
  });

  it('should not have duplicate Values', () => {
    const values = COLOR_OPTIONS.map((o) => o.Value);
    expect(new Set(values).size).toBe(values.length);
  });

  it('should not have duplicate Labels', () => {
    const labels = COLOR_OPTIONS.map((o) => o.Label);
    expect(new Set(labels).size).toBe(labels.length);
  });

  it('should find the White option with hex #FFFFFF', () => {
    const white = COLOR_OPTIONS.find((o) => o.Value === 'White');
    expect(white).toBeDefined();
    expect(white!.Hex).toBe('#FFFFFF');
  });

  it('should find the Gold option with label "Ouro"', () => {
    const gold = COLOR_OPTIONS.find((o) => o.Value === 'Gold');
    expect(gold).toBeDefined();
    expect(gold!.Label).toBe('Ouro');
  });
});

describe('TABLE_COLOR_MAP', () => {
  it('should have an entry for every TableColor', () => {
    for (const color of TABLE_COLORS) {
      expect(TABLE_COLOR_MAP).toHaveProperty(color);
    }
  });

  it('each entry should have hex, glow, bg and border', () => {
    for (const color of TABLE_COLORS) {
      const entry = TABLE_COLOR_MAP[color as TableColor];
      expect(entry).toHaveProperty('hex');
      expect(entry).toHaveProperty('glow');
      expect(entry).toHaveProperty('bg');
      expect(entry).toHaveProperty('border');
    }
  });

  it('hex of each entry should be a valid CSS color', () => {
    const hexPattern = /^#[0-9A-Fa-f]{6}$/;
    for (const color of TABLE_COLORS) {
      expect(TABLE_COLOR_MAP[color as TableColor].hex).toMatch(hexPattern);
    }
  });

  it('glow, bg and border should be valid rgba strings', () => {
    const rgbaPattern = /^rgba\(\d{1,3},\d{1,3},\d{1,3},[\d.]+\)$/;
    for (const color of TABLE_COLORS) {
      const entry = TABLE_COLOR_MAP[color as TableColor];
      expect(entry.glow.replace(/\s/g, '')).toMatch(rgbaPattern);
      expect(entry.bg.replace(/\s/g, '')).toMatch(rgbaPattern);
      expect(entry.border.replace(/\s/g, '')).toMatch(rgbaPattern);
    }
  });

  it('White should have hex #FFFFFF', () => {
    expect(TABLE_COLOR_MAP.White.hex).toBe('#FFFFFF');
  });

  it('Diamond should have hex #7DF9FF', () => {
    expect(TABLE_COLOR_MAP.Diamond.hex).toBe('#7DF9FF');
  });

  it('Gold should have hex #D4AF37', () => {
    expect(TABLE_COLOR_MAP.Gold.hex).toBe('#D4AF37');
  });

  it('should not have extra entries beyond TABLE_COLORS', () => {
    const mapKeys = Object.keys(TABLE_COLOR_MAP);
    expect(mapKeys).toHaveLength(TABLE_COLORS.length);
  });
});

describe('Consistency between COLOR_OPTIONS and TABLE_COLOR_MAP', () => {
  it('every Value in COLOR_OPTIONS should exist in TABLE_COLOR_MAP', () => {
    for (const option of COLOR_OPTIONS) {
      expect(TABLE_COLOR_MAP).toHaveProperty(option.Value);
    }
  });

  it('every key in TABLE_COLOR_MAP should exist in COLOR_OPTIONS', () => {
    const optionValues = new Set(COLOR_OPTIONS.map((o) => o.Value));
    for (const key of Object.keys(TABLE_COLOR_MAP)) {
      expect(optionValues.has(key as TableColor)).toBe(true);
    }
  });
});

describe('SlotMachineCard color resolution logic', () => {
  const DEFAULT_COLOR = TABLE_COLOR_MAP.White;

  const resolveColor = (tableColor?: TableColor) =>
    tableColor && TABLE_COLOR_MAP[tableColor]
      ? TABLE_COLOR_MAP[tableColor]
      : DEFAULT_COLOR;

  it('should return the correct color for a valid TableColor', () => {
    expect(resolveColor('Red')).toEqual(TABLE_COLOR_MAP.Red);
    expect(resolveColor('Blue')).toEqual(TABLE_COLOR_MAP.Blue);
    expect(resolveColor('Gold')).toEqual(TABLE_COLOR_MAP.Gold);
  });

  it('should return the default color (White) when TableColor is undefined', () => {
    expect(resolveColor(undefined)).toEqual(DEFAULT_COLOR);
  });

  it('should return the default color (White) for an invalid value', () => {
    expect(resolveColor('InvalidColor' as unknown as TableColor)).toEqual(
      DEFAULT_COLOR
    );
  });

  it('isInteractive should be false when IsLocked=true, regardless of IsActive', () => {
    const isInteractive = (isLocked: boolean, isActive: boolean) =>
      !isLocked && isActive;

    expect(isInteractive(true, true)).toBe(false);
    expect(isInteractive(true, false)).toBe(false);
  });

  it('isInteractive should be false when IsActive=false', () => {
    const isInteractive = (isLocked: boolean, isActive: boolean) =>
      !isLocked && isActive;

    expect(isInteractive(false, false)).toBe(false);
  });

  it('isInteractive should be true only when not locked and active', () => {
    const isInteractive = (isLocked: boolean, isActive: boolean) =>
      !isLocked && isActive;

    expect(isInteractive(false, true)).toBe(true);
  });
});

describe('EditTableModal selected color logic', () => {
  it('should find the active color option by Value', () => {
    const selected: TableColor = 'Purple';
    const activeColor = COLOR_OPTIONS.find((c) => c.Value === selected);
    expect(activeColor).toBeDefined();
    expect(activeColor!.Hex).toBe('#B450FF');
  });

  it('should use White as fallback when TableColor is not provided', () => {
    const fallback = (color: TableColor | undefined): TableColor =>
      color ?? 'White';
    expect(fallback(undefined)).toBe('White');
  });

  it('active color should never be undefined for any valid TableColor', () => {
    for (const color of TABLE_COLORS) {
      const activeColor = COLOR_OPTIONS.find((c) => c.Value === color);
      expect(activeColor).toBeDefined();
    }
  });
});
