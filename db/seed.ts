import 'dotenv/config';

import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';

import { getDb } from './client';
import { users } from './schema';

const email = process.env.SEED_ADMIN_EMAIL?.trim().toLowerCase();
const password = process.env.SEED_ADMIN_PASSWORD;

if (!email || !password) {
  throw new Error(
    'SEED_ADMIN_EMAIL e SEED_ADMIN_PASSWORD são obrigatórios para executar o seed.',
  );
}

const db = getDb();
if (!db) {
  throw new Error('DATABASE_URL é obrigatório para executar o seed.');
}

const passwordHash = await bcrypt.hash(password, 12);
const existing = await db.query.users.findFirst({
  where: eq(users.email, email),
});

if (existing) {
  await db
    .update(users)
    .set({
      name: existing.name || 'Administrador',
      passwordHash,
      role: 'ADMIN',
      updatedAt: new Date(),
    })
    .where(eq(users.id, existing.id));
} else {
  await db.insert(users).values({
    name: 'Administrador',
    email,
    passwordHash,
    role: 'ADMIN',
  });
}

console.log(`Usuário administrador preparado: ${email}`);
