import { describe, expect, it } from 'vitest';

import {
  fipeSearchResponseSchema,
  normalizeFipeHit,
  normalizeFipePriceHistory,
} from '@/lib/fipe/types';

describe('fipe adapter contract', () => {
  it('maps the fipeX response to the internal snapshot shape', () => {
    const vehicle = normalizeFipeHit({
      price_id: 'price-1',
      model_id: 'model-1',
      model_name: 'CB 500',
      make_id: 'make-1',
      make_name: 'HONDA',
      fuel_id: 'fuel-1',
      fuel_name: 'Gasolina ',
      model_year: 2022,
      latest_market_price_cents: 36_842_00,
      type_id: 'type-1',
      type_name: 'moto',
      latest_ref_id: 'ref-1',
      ref_month: 9,
      ref_year: 2026,
      fipe_code: '811049-7',
      body_type_name: 'Street/Naked',
    });

    expect(vehicle).toEqual({
      priceId: 'price-1',
      modelId: 'model-1',
      makeId: 'make-1',
      fuelId: 'fuel-1',
      typeId: 'type-1',
      fipeCode: '811049-7',
      makeName: 'HONDA',
      modelName: 'CB 500',
      fuelName: 'Gasolina',
      modelYear: 2022,
      priceCents: 36_842_00,
      referenceMonth: 9,
      referenceYear: 2026,
      referenceId: 'ref-1',
      bodyTypeName: 'Street/Naked',
    });
  });

  it('accepts zero-kilometer results without model_year', () => {
    const parsed = fipeSearchResponseSchema.safeParse({
      data: [
        {
          price_id: 'price-zero',
          model_id: 'model-zero',
          model_name: 'CB 500 HORNET',
          make_id: 'make-1',
          make_name: 'HONDA',
          fuel_id: 'fuel-1',
          fuel_name: 'Gasolina',
          is_zero_km: true,
          latest_market_price_cents: 49_664_00,
          type_id: 'type-1',
          type_name: 'moto',
          latest_ref_id: 'ref-1',
          ref_month: 9,
          ref_year: 2026,
          fipe_code: '811188-0',
          body_type_name: 'Street/Naked',
        },
      ],
    });

    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(normalizeFipeHit(parsed.data.data[0]).modelYear).toBeNull();
    }
  });

  it('normalizes and orders the monthly FIPE price history', () => {
    const history = normalizeFipePriceHistory({
      data: {
        history: [
          { price_cents: 36_842_00, reference: { id: 'ref-09', month: 9, year: 2026 } },
          { price_cents: 36_500_00, reference: { id: 'ref-08', month: 8, year: 2026 } },
          { price_cents: 37_100_00, reference: { id: 'ref-09-new', month: 9, year: 2026 } },
        ],
      },
    });

    expect(history).toEqual([
      { priceCents: 36_500_00, referenceMonth: 8, referenceYear: 2026, referenceId: 'ref-08' },
      { priceCents: 37_100_00, referenceMonth: 9, referenceYear: 2026, referenceId: 'ref-09-new' },
    ]);
  });
});
