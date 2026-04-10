import { IsValidBirthDate } from '../src/validators';
import { describe, expect, it } from '@jest/globals';

describe('isValidBirthDate', () => {
  it('valid date', () => {
    expect(IsValidBirthDate('01/01/2000')).toBe(true);
  });

  it('invalid date', () => {
    expect(IsValidBirthDate('31/02/2000')).toBe(false);
  });

  it('future date', () => {
    expect(IsValidBirthDate('01/01/3000')).toBe(false);
  });
});
