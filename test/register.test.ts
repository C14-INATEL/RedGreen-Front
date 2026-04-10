import { IsValidBirthDate } from '../src/validators';
import { describe, expect, it } from '@jest/globals';

describe('IsValidBirthDate', () => {
  it('valid date', () => {
    expect(IsValidBirthDate('01/01/2001')).toBe(true);
  });

  it('invalid date', () => {
    expect(IsValidBirthDate('30/02/2000')).toBe(false);
  });

  it('future date', () => {
    expect(IsValidBirthDate('01/01/3001')).toBe(false);
  });
});
