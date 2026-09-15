import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';

import { authOptions } from '@/lib/auth';
import { calculateDaysInStock, calculateTotalCostCents } from '@/lib/inventory';
import { getFipePriceHistory, type FipePriceHistoryPoint } from '@/lib/fipe';
import { findMotorcycle } from '@/lib/motorcycles';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== 'ADMIN') {
    return NextResponse.json({ message: 'Não autorizado.' }, { status: 401 });
  }

  const id = z.uuid().safeParse((await params).id);
  if (!id.success) {
    return NextResponse.json({ message: 'Moto inválida.' }, { status: 400 });
  }

  const motorcycle = await findMotorcycle(id.data);
  if (!motorcycle) {
    return NextResponse.json({ message: 'Moto não encontrada.' }, { status: 404 });
  }

  let fipeHistory: FipePriceHistoryPoint[] = [];
  if (motorcycle.fipePriceId) {
    try {
      fipeHistory = await getFipePriceHistory(motorcycle.fipePriceId);
    } catch {
      // O drawer continua útil mesmo quando o histórico externo está indisponível.
    }
  }

  return NextResponse.json({
    data: {
      id: motorcycle.id,
      make: motorcycle.make,
      model: motorcycle.model,
      manufactureYear: motorcycle.manufactureYear,
      modelYear: motorcycle.modelYear,
      color: motorcycle.color,
      chassis: motorcycle.chassis,
      plate: motorcycle.plate,
      renavam: motorcycle.renavam,
      notes: motorcycle.notes,
      mileage: motorcycle.mileage,
      entryDate: motorcycle.entryDate,
      status: motorcycle.status,
      daysInStock: calculateDaysInStock(motorcycle.entryDate),
      purchasePriceCents: motorcycle.purchasePriceCents,
      costsCents: motorcycle.costsCents,
      totalCostCents: calculateTotalCostCents(
        motorcycle.purchasePriceCents,
        motorcycle.costsCents,
      ),
      salePriceCents: motorcycle.salePriceCents,
      fipeCode: motorcycle.fipeCode,
      fipeMakeName: motorcycle.fipeMakeName,
      fipeModelName: motorcycle.fipeModelName,
      fipeFuelName: motorcycle.fipeFuelName,
      fipePriceCents: motorcycle.fipePriceCents,
      fipeReferenceMonth: motorcycle.fipeReferenceMonth,
      fipeReferenceYear: motorcycle.fipeReferenceYear,
      fipeUpdatedAt: motorcycle.fipeUpdatedAt?.toISOString() ?? null,
      fipeHistory,
    },
  });
}
