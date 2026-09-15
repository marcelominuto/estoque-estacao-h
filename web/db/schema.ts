import {
  date,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';

export const userRoleEnum = pgEnum('user_role', ['ADMIN']);
export const motorcycleStatusEnum = pgEnum('motorcycle_status', [
  'AVAILABLE',
  'RESERVED',
  'SOLD',
]);

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: userRoleEnum('role').notNull().default('ADMIN'),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const motorcycles = pgTable('motorcycles', {
  id: uuid('id').defaultRandom().primaryKey(),
  make: text('make').notNull(),
  model: text('model').notNull(),
  manufactureYear: integer('manufacture_year').notNull(),
  modelYear: integer('model_year').notNull(),
  color: text('color').notNull(),
  chassis: text('chassis'),
  plate: text('plate').notNull(),
  renavam: text('renavam'),
  notes: text('notes'),
  mileage: integer('mileage').notNull().default(0),
  entryDate: date('entry_date').notNull(),
  status: motorcycleStatusEnum('status').notNull().default('AVAILABLE'),
  // Keep the legacy database column name so existing cost data is preserved.
  costsCents: integer('average_cost_cents'),
  purchasePriceCents: integer('purchase_price_cents'),
  totalCostCents: integer('total_cost_cents'),
  salePriceCents: integer('sale_price_cents'),
  fipeCode: text('fipe_code'),
  fipePriceId: text('fipe_price_id'),
  fipeModelId: text('fipe_model_id'),
  fipeMakeId: text('fipe_make_id'),
  fipeFuelId: text('fipe_fuel_id'),
  fipeTypeId: text('fipe_type_id'),
  fipeMakeName: text('fipe_make_name'),
  fipeModelName: text('fipe_model_name'),
  fipeFuelName: text('fipe_fuel_name'),
  fipePriceCents: integer('fipe_price_cents'),
  fipeReferenceMonth: integer('fipe_reference_month'),
  fipeReferenceYear: integer('fipe_reference_year'),
  fipeUpdatedAt: timestamp('fipe_updated_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Motorcycle = typeof motorcycles.$inferSelect;
export type NewMotorcycle = typeof motorcycles.$inferInsert;
