'use client';

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
  normalizeFipeYearOptions,
} from './types';

const FIPEX_BASE_URL = 'https://api.fipex.com.br';
const PAGE_SIZE = 50;

export class FipeBrowserApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = 'FipeBrowserApiError';
  }
}

function createFipeUrl(path: string, params?: Record<string, string>) {
  const url = new URL(path, FIPEX_BASE_URL);
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
  signal?: AbortSignal,
) {
  const url = createFipeUrl(path, params);
  let response: Response;

  try {
    response = await fetch(url, {
      headers: { Accept: 'application/json' },
      signal,
      cache: 'no-store',
      mode: 'cors',
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw error;
    throw new FipeBrowserApiError('FIPEX_UNAVAILABLE', 503);
  }

  if (!response.ok) {
    throw new FipeBrowserApiError('FIPEX_REQUEST_FAILED', response.status);
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new FipeBrowserApiError('FIPEX_INVALID_RESPONSE', 502);
  }

  const parsed = schema.safeParse(payload);
  if (!parsed.success) {
    throw new FipeBrowserApiError('FIPEX_INVALID_RESPONSE', 502);
  }

  return parsed.data;
}

let motorcycleTypeIdPromise: Promise<string> | null = null;

async function getMotorcycleTypeId(signal?: AbortSignal) {
  if (!motorcycleTypeIdPromise) {
    motorcycleTypeIdPromise = requestFipe(
      '/v1/vehicle-types',
      fipeVehicleTypesResponseSchema,
      undefined,
      signal,
    ).then((response) => {
      const motorcycle = response.data.find(
        (type) => type.slug === 'moto' || type.name.toLowerCase() === 'moto',
      );
      if (!motorcycle) throw new FipeBrowserApiError('FIPEX_MOTO_TYPE_NOT_FOUND', 502);
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
  signal?: AbortSignal,
) {
  const results: T[] = [];
  let page = 1;
  let pages = 1;

  do {
    const response = await requestFipe(path, schema, {
      ...params,
      limit: String(PAGE_SIZE),
      page: String(page),
    }, signal);
    results.push(...response.data);
    pages = response.pagination?.pages ?? page;
    page += 1;
  } while (page <= pages && page <= 20);

  return results;
}

export async function listFipeMakes(signal?: AbortSignal) {
  const typeId = await getMotorcycleTypeId(signal);
  return requestAllPages('/v1/makes', fipeMakesResponseSchema, {
    type_id: typeId,
  }, signal);
}

export async function listFipeModels(makeId: string, signal?: AbortSignal) {
  const typeId = await getMotorcycleTypeId(signal);
  const models = await requestAllPages('/v1/models', fipeModelsResponseSchema, {
    make_id: makeId,
    type_id: typeId,
  }, signal);
  return models.map(normalizeFipeModel);
}

export async function listFipeYearOptions(modelId: string, signal?: AbortSignal) {
  const response = await requestFipe(
    `/v1/models/${encodeURIComponent(modelId)}`,
    fipeModelDetailResponseSchema,
    undefined,
    signal,
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
}, signal?: AbortSignal) {
  const response = await requestFipe('/v1/prices', fipePriceDetailResponseSchema, {
    model_id: modelId,
    fuel_id: fuelId,
    year: year === null ? 'zero' : String(year),
  }, signal);
  return normalizeFipePrice(response.data);
}

export async function searchFipeMotorcycles(query: string, signal?: AbortSignal) {
  const response = await requestFipe('/v1/search', fipeSearchResponseSchema, {
    q: query.trim(),
    limit: String(PAGE_SIZE),
  }, signal);

  return response.data
    .filter((hit) => hit.type_name.toLowerCase().includes('moto'))
    .map(normalizeFipeHit);
}
