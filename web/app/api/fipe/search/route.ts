import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';

import { authOptions } from '@/lib/auth';
import { FipeApiError, searchFipeMotorcycles } from '@/lib/fipe';

const querySchema = z.string().trim().min(2).max(80);

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== 'ADMIN') {
    return NextResponse.json({ message: 'Não autorizado.' }, { status: 401 });
  }

  const query = querySchema.safeParse(
    new URL(request.url).searchParams.get('q') ?? '',
  );
  if (!query.success) {
    return NextResponse.json(
      { message: 'Informe pelo menos 2 caracteres para pesquisar.' },
      { status: 400 },
    );
  }

  try {
    return NextResponse.json({ data: await searchFipeMotorcycles(query.data) });
  } catch (error) {
    const status = error instanceof FipeApiError ? error.status : 503;
    return NextResponse.json(
      { message: 'Não foi possível consultar a FIPE.' },
      { status: status === 429 ? 429 : status >= 500 ? 502 : 503 },
    );
  }
}
