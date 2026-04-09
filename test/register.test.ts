import { IsValidBirthDate } from '../src/validators';
import { describe, expect, it } from '@jest/globals';

describe('Validação de data de nascimento', () => {
  it('Valid date', () => {
    expect(IsValidBirthDate('01/01/2000')).toBe(true);
  });

  it('Invalid date', () => {
    expect(IsValidBirthDate('31/02/2000')).toBe(false);
  });

  it('Future date', () => {
    expect(IsValidBirthDate('01/01/3000')).toBe(false);
  });
});
