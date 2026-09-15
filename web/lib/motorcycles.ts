import 'server-only';

import { desc, eq } from 'drizzle-orm';

import { getDb } from '@/db';
import { motorcycles, type NewMotorcycle } from '@/db/schema';
import { calculateDaysInStock, calculateTotalCostCents } from '@/lib/inventory';

export type MotorcycleListItem = Omit<typeof motorcycles.$inferSelect, 'totalCostCents'> & {
  totalCostCents: number | null;
  daysInStock: number;
};

export async function listMotorcycles(): Promise<MotorcycleListItem[]> {
  const db = getDb();
  if (!db) return [];

  const rows = await db.query.motorcycles.findMany({
    orderBy: desc(motorcycles.createdAt),
  });

  return rows.map((motorcycle) => ({
    ...motorcycle,
    totalCostCents: calculateTotalCostCents(motorcycle.purchasePriceCents, motorcycle.costsCents),
    daysInStock: calculateDaysInStock(motorcycle.entryDate),
  }));
}

export async function findMotorcycle(id: string) {
  const db = getDb();
  if (!db) return null;
  return db.query.motorcycles.findFirst({ where: eq(motorcycles.id, id) });
}

export async function insertMotorcycle(values: NewMotorcycle) {
  const db = getDb();
  if (!db) throw new Error('DATABASE_NOT_CONFIGURED');
  const [created] = await db.insert(motorcycles).values(values).returning();
  return created;
}

export async function editMotorcycle(id: string, values: Partial<NewMotorcycle>) {
  const db = getDb();
  if (!db) throw new Error('DATABASE_NOT_CONFIGURED');
  const [updated] = await db
    .update(motorcycles)
    .set({ ...values, updatedAt: new Date() })
    .where(eq(motorcycles.id, id))
    .returning();
  return updated;
}

export async function changeMotorcycleStatus(
  id: string,
  status: NewMotorcycle['status'],
) {
  const db = getDb();
  if (!db) throw new Error('DATABASE_NOT_CONFIGURED');
  const [updated] = await db
    .update(motorcycles)
    .set({ status, updatedAt: new Date() })
    .where(eq(motorcycles.id, id))
    .returning();
  return updated;
}

export async function deleteMotorcycle(id: string) {
  const db = getDb();
  if (!db) throw new Error('DATABASE_NOT_CONFIGURED');
  const [deleted] = await db
    .delete(motorcycles)
    .where(eq(motorcycles.id, id))
    .returning({ id: motorcycles.id });
  return deleted;
}
