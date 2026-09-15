import { describe, expect, it } from 'vitest';

import {
  calculateDaysInStock,
  calculateTotalCostCents,
  normalizePlate,
} from '@/lib/inventory';

describe('inventory rules', () => {
  const today = new Date(2026, 8, 11, 15, 30);

  it('calculates whole days from the entry date without storing a value', () => {
    expect(calculateDaysInStock('2026-09-01', today)).toBe(10);
    expect(calculateDaysInStock('2026-09-11', today)).toBe(0);
  });

  it('does not produce negative days for a future date', () => {
    expect(calculateDaysInStock('2026-09-12', today)).toBe(0);
  });

  it('normalizes Brazilian license plates', () => {
    expect(normalizePlate('abc-1d23')).toBe('ABC1D23');
  });

  it('calculates total cost from purchase price and expenses', () => {
    expect(calculateTotalCostCents(700_000, 105_570)).toBe(805_570);
    expect(calculateTotalCostCents(700_000, 0)).toBe(700_000);
  });
});
