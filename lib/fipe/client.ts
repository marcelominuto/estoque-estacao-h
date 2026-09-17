import 'server-only';

import { z } from 'zod';

import {
  fipeMakesResponseSchema,
  fipeModelDetailResponseSchema,
  fipeModelsResponseSchema,
  fipePriceDetailResponseSchema,
  fipeSearchResponseSchema,
  fipeVehicleTypesResponseSchema,
  normalizeFipeHit,
  normalizeFipeModel,
  normalizeFipePrice,
  normalizeFipePriceHistory,
  normalizeFipeYearOptions,
} from './types';

const DEFAULT_BASE_URL = 'https://api.fipex.com.br';
const PAGE_SIZE = 50;

export class FipeApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = 'FipeApiError';
  }
}

let motorcycleTypeIdPromise: Promise<string> | null = null;

function createFipeUrl(path: string, params?: Record<string, string>) {
  const url = new URL(path, process.env.FIPEX_API_BASE_URL ?? DEFAULT_BASE_URL);
  for (const [key, value] of Object.entries(params ?? {})) {
    url.searchParams.set(key, value);
  }
  return url;
}

async function requestFipe<T>(
  path: string,
  schema: {
    safeParse: (
      value: unknown,
    ) => { success: true; data: T } | { success: false };
  },
  params?: Record<string, string>,
) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5_000);

  try {
    const url = createFipeUrl(path, params);
    const response = await fetch(url, {
      headers: { Accept: 'application/json' },
      signal: controller.signal,
      cache: 'no-store',
    });

    if (!response.ok) {
      console.error('[FIPEX] upstream request failed', {
        path: url.pathname,
        status: response.status,
      });
      throw new FipeApiError('FIPEX_REQUEST_FAILED', response.status);
    }

    const payload = await response.json();
    const parsed = schema.safeParse(payload);
    if (!parsed.success) {
      throw new FipeApiError('FIPEX_INVALID_RESPONSE', 502);
    }

    return parsed.data;
  } catch (error) {
    if (error instanceof FipeApiError) throw error;
    console.error('[FIPEX] upstream request unavailable', {
      path,
      error: error instanceof Error ? error.message : String(error),
    });
    throw new FipeApiError('FIPEX_UNAVAILABLE', 503);
  } finally {
    clearTimeout(timeout);
  }
}

async function getMotorcycleTypeId() {
  if (!motorcycleTypeIdPromise) {
    motorcycleTypeIdPromise = requestFipe(
      '/v1/vehicle-types',
      fipeVehicleTypesResponseSchema,
    ).then((response) => {
      const motorcycle = response.data.find(
        (type) => type.slug === 'moto' || type.name.toLowerCase() === 'moto',
      );
      if (!motorcycle) throw new FipeApiError('FIPEX_MOTO_TYPE_NOT_FOUND', 502);
      return motorcycle.id;
    });
  }

  try {
    return await motorcycleTypeIdPromise;
  } catch (error) {
    motorcycleTypeIdPromise = null;
    throw error;
  }
}

async function requestAllPages<T>(
  path: string,
  schema: {
    safeParse: (
      value: unknown,
    ) => {
      success: true;
      data: { data: T[]; pagination?: { pages: number } };
    } | { success: false };
  },
  params: Record<string, string>,
) {
  const results: T[] = [];
  let page = 1;
  let pages = 1;

  do {
    const response = await requestFipe(path, schema, {
      ...params,
      limit: String(PAGE_SIZE),
      page: String(page),
    });
    results.push(...response.data);
    pages = response.pagination?.pages ?? page;
    page += 1;
  } while (page <= pages && page <= 20);

  return results;
}

export async function listFipeMakes() {
  const typeId = await getMotorcycleTypeId();
  return requestAllPages('/v1/makes', fipeMakesResponseSchema, {
    type_id: typeId,
  });
}

export async function listFipeModels(makeId: string) {
  const typeId = await getMotorcycleTypeId();
  const models = await requestAllPages('/v1/models', fipeModelsResponseSchema, {
    make_id: makeId,
    type_id: typeId,
  });
  return models.map(normalizeFipeModel);
}

export async function listFipeYearOptions(modelId: string) {
  const response = await requestFipe(
    `/v1/models/${encodeURIComponent(modelId)}`,
    fipeModelDetailResponseSchema,
  );
  return normalizeFipeYearOptions(response.data);
}

export async function getFipePrice({
  modelId,
  fuelId,
  year,
}: {
  modelId: string;
  fuelId: string;
  year: number | null;
}) {
  const response = await requestFipe('/v1/prices', fipePriceDetailResponseSchema, {
    model_id: modelId,
    fuel_id: fuelId,
    year: year === null ? 'zero' : String(year),
  });
  return normalizeFipePrice(response.data);
}

export async function getFipePriceHistory(priceId: string) {
  const response = await requestFipe(
    `/v1/prices/${encodeURIComponent(priceId)}`,
    z.unknown(),
  );

  return normalizeFipePriceHistory(response);
}

export async function searchFipeMotorcycles(query: string) {
  const response = await requestFipe('/v1/search', fipeSearchResponseSchema, {
    q: query.trim(),
    limit: String(PAGE_SIZE),
  });

  return response.data
    .filter((hit) => hit.type_name.toLowerCase().includes('moto'))
    .map(normalizeFipeHit);
}
