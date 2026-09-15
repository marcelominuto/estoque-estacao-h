import { describe, expect, it } from 'vitest';

import { motorcycleInputSchema } from '@/lib/validations/motorcycle';

const validInput = {
  make: 'Honda',
  model: 'CB 500F',
  manufactureYear: '2023',
  modelYear: '2024',
  color: 'Cinza',
  chassis: '9C2PC4820RR004482',
  plate: 'JDM2E55',
  renavam: '00123456789',
  mileage: '4789',
  entryDate: '2026-09-10',
  status: 'AVAILABLE',
  costsCents: '162,76',
  purchasePriceCents: '36.000,00',
  salePriceCents: '42.900,00',
};

describe('motorcycleInputSchema', () => {
  it('normalizes Brazilian money values to cents and preserves RENAVAM text', () => {
    const result = motorcycleInputSchema.safeParse(validInput);

    expect(result.success).toBe(true);
    if (!result.success) return;

    expect(result.data.costsCents).toBe(16_276);
    expect(result.data.salePriceCents).toBe(4_290_000);
    expect(result.data.renavam).toBe('00123456789');
  });

  it('rejects a chassis that is not a valid 17-character identifier', () => {
    const result = motorcycleInputSchema.safeParse({
      ...validInput,
      chassis: '123',
    });

    expect(result.success).toBe(false);
  });
});
