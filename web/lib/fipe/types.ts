import { z } from 'zod';

export type FipeVehicleOption = {
  priceId: string;
  modelId: string;
  makeId: string;
  fuelId: string;
  typeId: string;
  fipeCode: string;
  makeName: string;
  modelName: string;
  fuelName: string;
  modelYear: number | null;
  priceCents: number | null;
  referenceMonth: number;
  referenceYear: number;
  referenceId: string;
  bodyTypeName: string | null;
};

export type FipeMakeOption = {
  id: string;
  name: string;
  slug: string;
};

export type FipeModelOption = {
  id: string;
  name: string;
  makeId: string;
  slug: string;
};

export type FipeFuelOption = {
  id: string;
  acronym: string;
  name: string;
};

export type FipeYearOption = {
  value: number | null;
  label: string;
  isZeroKm: boolean;
  fuelId: string;
  fuelAcronym: string;
  fuelName: string;
};

export type FipePriceHistoryPoint = {
  priceCents: number;
  referenceMonth: number;
  referenceYear: number;
  referenceId: string | null;
};

export type FipePagination = {
  total: number;
  limit: number;
  page: number;
  pages: number;
};

const fipeMakeSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
});

const fipeFuelSchema = z.object({
  id: z.string(),
  acronym: z.string(),
  name: z.string(),
});

const fipeTypeSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
});

const fipePaginationSchema = z.object({
  total: z.number().int(),
  limit: z.number().int(),
  page: z.number().int(),
  pages: z.number().int(),
});

export const fipeVehicleTypesResponseSchema = z.object({
  data: z.array(fipeTypeSchema),
});

export const fipeMakesResponseSchema = z.object({
  data: z.array(fipeMakeSchema),
  pagination: fipePaginationSchema.optional(),
});

const fipeModelSchema = z.object({
  id: z.string(),
  name: z.string(),
  make_id: z.string(),
  slug: z.string(),
});

export const fipeModelsResponseSchema = z.object({
  data: z.array(fipeModelSchema),
  pagination: fipePaginationSchema.optional(),
});

const fipeModelYearFuelSchema = z.object({
  model_year: z.number().int().nullable().optional(),
  is_zero_km: z.boolean().optional(),
  fuels: z.array(fipeFuelSchema),
});

const fipeModelDetailSchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  make: fipeMakeSchema,
  type: fipeTypeSchema,
  year_fuels: z.array(fipeModelYearFuelSchema),
});

export const fipeModelDetailResponseSchema = z.object({
  data: fipeModelDetailSchema,
});

const fipePriceDetailSchema = z.object({
  id: z.string().optional(),
  price_id: z.string().optional(),
  price_cents: z.number().int().nullable(),
  model_year: z.number().int().nullable().optional(),
  is_zero_km: z.boolean().optional(),
  make: fipeMakeSchema,
  model: z.object({
    id: z.string(),
    name: z.string(),
    make_id: z.string(),
    slug: z.string(),
  }),
  fuel: fipeFuelSchema,
  type: fipeTypeSchema,
  reference: z.object({
    id: z.string(),
    month: z.number().int().min(1).max(12),
    year: z.number().int(),
  }),
  fipe_code: z.string(),
  body_type_name: z.string().nullable().optional(),
});

export const fipePriceDetailResponseSchema = z.object({
  data: fipePriceDetailSchema,
});

const fipeSearchHitSchema = z.object({
  price_id: z.string(),
  model_id: z.string(),
  model_name: z.string(),
  make_id: z.string(),
  make_name: z.string(),
  fuel_id: z.string(),
  fuel_name: z.string(),
  model_year: z.number().int().nullable().optional(),
  is_zero_km: z.boolean().optional(),
  latest_market_price_cents: z.number().int().nullable(),
  type_id: z.string(),
  type_name: z.string(),
  latest_ref_id: z.string(),
  ref_month: z.number().int().min(1).max(12),
  ref_year: z.number().int(),
  fipe_code: z.string(),
  body_type_name: z.string().nullable().optional(),
});

export const fipeSearchResponseSchema = z.object({
  data: z.array(fipeSearchHitSchema),
});

export function normalizeFipeHit(hit: z.infer<typeof fipeSearchHitSchema>) {
  return {
    priceId: hit.price_id,
    modelId: hit.model_id,
    makeId: hit.make_id,
    fuelId: hit.fuel_id,
    typeId: hit.type_id,
    fipeCode: hit.fipe_code,
    makeName: hit.make_name,
    modelName: hit.model_name,
    fuelName: hit.fuel_name.trim(),
    modelYear: hit.model_year ?? null,
    priceCents: hit.latest_market_price_cents,
    referenceMonth: hit.ref_month,
    referenceYear: hit.ref_year,
    referenceId: hit.latest_ref_id,
    bodyTypeName: hit.body_type_name ?? null,
  } satisfies FipeVehicleOption;
}

export function normalizeFipeModel(model: z.infer<typeof fipeModelSchema>) {
  return {
    id: model.id,
    name: model.name,
    makeId: model.make_id,
    slug: model.slug,
  } satisfies FipeModelOption;
}

export function normalizeFipeYearOptions(
  detail: z.infer<typeof fipeModelDetailSchema>,
) {
  return detail.year_fuels.flatMap((year) => {
    const isZeroKm = year.is_zero_km === true || year.model_year == null;
    return year.fuels.map((fuel) => ({
      value: isZeroKm ? null : year.model_year ?? null,
      label: isZeroKm ? '0 km' : String(year.model_year),
      isZeroKm,
      fuelId: fuel.id,
      fuelAcronym: fuel.acronym.trim(),
      fuelName: fuel.name,
    } satisfies FipeYearOption));
  });
}

export function normalizeFipePrice(
  price: z.infer<typeof fipePriceDetailSchema>,
) {
  const modelYear = price.is_zero_km === true ? null : price.model_year ?? null;

  return {
    priceId: price.price_id ?? price.id ?? `${price.fipe_code}:${modelYear ?? 'zero'}:${price.reference.id}`,
    modelId: price.model.id,
    makeId: price.make.id,
    fuelId: price.fuel.id,
    typeId: price.type.id,
    fipeCode: price.fipe_code,
    makeName: price.make.name,
    modelName: price.model.name,
    fuelName: price.fuel.name.trim(),
    modelYear,
    priceCents: price.price_cents,
    referenceMonth: price.reference.month,
    referenceYear: price.reference.year,
    referenceId: price.reference.id,
    bodyTypeName: price.body_type_name ?? null,
  } satisfies FipeVehicleOption;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function parseHistoryPrice(value: unknown) {
  if (typeof value === 'number' && Number.isFinite(value)) return Math.round(value);
  if (typeof value !== 'string') return null;

  const normalized = value.trim().replace(/[^\d,.-]/g, '');
  if (!normalized) return null;
  const parsed = normalized.includes(',')
    ? Number(normalized.replace(/\./g, '').replace(',', '.')) * 100
    : Number(normalized);

  return Number.isFinite(parsed) ? Math.round(parsed) : null;
}

function parseHistoryReference(value: unknown) {
  if (isRecord(value)) {
    const month = Number(value.month ?? value.ref_month ?? value.reference_month);
    const year = Number(value.year ?? value.ref_year ?? value.reference_year);
    if (Number.isInteger(month) && Number.isInteger(year)) {
      return {
        month,
        year,
        id: typeof value.id === 'string' ? value.id : null,
      };
    }
  }

  if (typeof value === 'string') {
    const numeric = value.match(/^(\d{4})[-/]?(\d{2})$/);
    if (numeric) {
      return { month: Number(numeric[2]), year: Number(numeric[1]), id: null };
    }

    const numericMonthYear = value.match(/^(0?[1-9]|1[0-2])[-/](\d{2}|\d{4})$/);
    if (numericMonthYear) {
      const year = Number(numericMonthYear[2]);
      return {
        month: Number(numericMonthYear[1]),
        year: year < 100 ? 2000 + year : year,
        id: null,
      };
    }

    const namedMonth = value.toLocaleLowerCase('pt-BR').match(
      /(jan(?:eiro)?|fev(?:ereiro)?|mar(?:ço|co)?|abr(?:il)?|mai(?:o)?|jun(?:ho)?|jul(?:ho)?|ago(?:sto)?|set(?:embro)?|out(?:ubro)?|nov(?:embro)?|dez(?:embro)?)[^\d]*(\d{2}|\d{4})/,
    );
    if (namedMonth) {
      const months = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
      const month = months.findIndex((prefix) => namedMonth[1].startsWith(prefix)) + 1;
      const year = Number(namedMonth[2]);
      return { month, year: year < 100 ? 2000 + year : year, id: null };
    }
  }

  return null;
}

function scalarToString(value: unknown) {
  return typeof value === 'string' || typeof value === 'number' ? String(value) : '';
}

function findHistoryArray(value: unknown, depth = 0): unknown[] {
  if (depth > 3) return [];
  if (Array.isArray(value)) return value;
  if (!isRecord(value)) return [];

  for (const key of ['history', 'price_history', 'prices', 'data']) {
    const result = findHistoryArray(value[key], depth + 1);
    if (result.length > 0) return result;
  }

  return [];
}

export function normalizeFipePriceHistory(payload: unknown): FipePriceHistoryPoint[] {
  const points = findHistoryArray(payload)
    .map((entry) => {
      if (!isRecord(entry)) return null;

      const priceCents = parseHistoryPrice(
        entry.price_cents ?? entry.value_cents ?? entry.valor_centavos ?? entry.price ?? entry.value,
      );
      const reference = parseHistoryReference(
        entry.reference ?? entry.ref ?? entry.reference_period,
      ) ?? parseHistoryReference(
        `${scalarToString(entry.ref_year ?? entry.reference_year)}-${scalarToString(entry.ref_month ?? entry.reference_month).padStart(2, '0')}`,
      );

      if (
        priceCents === null ||
        !reference ||
        reference.month < 1 ||
        reference.month > 12 ||
        reference.year < 2001
      ) {
        return null;
      }

      return {
        priceCents,
        referenceMonth: reference.month,
        referenceYear: reference.year,
        referenceId: reference.id,
      } satisfies FipePriceHistoryPoint;
    })
    .filter((point): point is FipePriceHistoryPoint => point !== null);

  const uniquePoints = new Map<string, FipePriceHistoryPoint>();
  for (const point of points) {
    uniquePoints.set(`${point.referenceYear}-${point.referenceMonth}`, point);
  }

  return [...uniquePoints.values()].sort((a, b) =>
    a.referenceYear - b.referenceYear || a.referenceMonth - b.referenceMonth,
  );
}
