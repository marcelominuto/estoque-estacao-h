import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';

import { authOptions } from '@/lib/auth';
import {
  FipeApiError,
  getFipePrice,
  listFipeMakes,
  listFipeModels,
  listFipeYearOptions,
} from '@/lib/fipe';

const idSchema = z.string().trim().min(1).max(100);
const kindSchema = z.enum(['makes', 'models', 'years', 'price']);

function fipeErrorResponse(error: unknown) {
  const status = error instanceof FipeApiError ? error.status : 503;
  console.error('[API /api/fipe/catalog] FIPEX error', {
    status,
    error: error instanceof Error ? error.message : String(error),
  });
  return NextResponse.json(
    { message: 'Não foi possível consultar a FIPE.' },
    { status: status === 429 ? 429 : status >= 500 ? 502 : 503 },
  );
}

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== 'ADMIN') {
    return NextResponse.json({ message: 'Não autorizado.' }, { status: 401 });
  }

  const params = new URL(request.url).searchParams;
  const kind = kindSchema.safeParse(params.get('kind'));
  if (!kind.success) {
    return NextResponse.json({ message: 'Catálogo FIPE inválido.' }, { status: 400 });
  }

  try {
    if (kind.data === 'makes') {
      return NextResponse.json({ data: await listFipeMakes() });
    }

    if (kind.data === 'models') {
      const makeId = idSchema.safeParse(params.get('makeId'));
      if (!makeId.success) {
        return NextResponse.json({ message: 'Marca FIPE inválida.' }, { status: 400 });
      }
      return NextResponse.json({ data: await listFipeModels(makeId.data) });
    }

    if (kind.data === 'years') {
      const modelId = idSchema.safeParse(params.get('modelId'));
      if (!modelId.success) {
        return NextResponse.json({ message: 'Modelo FIPE inválido.' }, { status: 400 });
      }
      return NextResponse.json({ data: await listFipeYearOptions(modelId.data) });
    }

    const price = z
      .object({
        modelId: idSchema,
        fuelId: idSchema,
        year: z.union([z.literal('zero'), z.coerce.number().int().min(1981).max(2100)]),
      })
      .safeParse({
        modelId: params.get('modelId'),
        fuelId: params.get('fuelId'),
        year: params.get('year'),
      });
    if (!price.success) {
      return NextResponse.json({ message: 'Ano FIPE inválido.' }, { status: 400 });
    }

    return NextResponse.json({
      data: await getFipePrice({
        modelId: price.data.modelId,
        fuelId: price.data.fuelId,
        year: price.data.year === 'zero' ? null : price.data.year,
      }),
    });
  } catch (error) {
    return fipeErrorResponse(error);
  }
}
