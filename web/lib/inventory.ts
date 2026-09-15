import type { Motorcycle } from '@/db/schema';

export function calculateDaysInStock(
  entryDate: string | Date,
  now = new Date(),
): number {
  const entry =
    entryDate instanceof Date
      ? new Date(entryDate.getFullYear(), entryDate.getMonth(), entryDate.getDate())
      : new Date(`${entryDate}T00:00:00`);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  if (Number.isNaN(entry.getTime()) || entry > today) return 0;
  return Math.floor((today.getTime() - entry.getTime()) / 86_400_000);
}

export function normalizePlate(value: string) {
  return value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
}

export function calculateTotalCostCents(
  purchasePriceCents: number | null | undefined,
  costsCents: number | null | undefined,
) {
  if (purchasePriceCents === null && costsCents === null) return null;
  if (purchasePriceCents === undefined && costsCents === undefined) return null;
  return (purchasePriceCents ?? 0) + (costsCents ?? 0);
}

export function motorcycleToFormValues(motorcycle: Motorcycle) {
  return {
    ...motorcycle,
    entryDate: motorcycle.entryDate,
    plate: normalizePlate(motorcycle.plate),
  };
}
