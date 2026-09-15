import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

import * as schema from './schema';

export type Database = ReturnType<typeof drizzle<typeof schema>>;

const globalForDb = globalThis as unknown as { motorcycleDb?: Database };

export function getDb(): Database | null {
  const connectionString = process.env.DATABASE_URL?.trim();
  if (!connectionString) return null;

  globalForDb.motorcycleDb ??= drizzle(neon(connectionString), { schema });
  return globalForDb.motorcycleDb;
}
