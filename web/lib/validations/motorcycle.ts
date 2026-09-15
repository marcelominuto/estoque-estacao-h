import { z } from 'zod';

import { MOTORCYCLE_STATUS } from '@/lib/constants/motorcycle';

const currentYear = new Date().getFullYear();

const optionalText = z.preprocess(
  (value) => (typeof value === 'string' && value.trim() === '' ? null : value),
  z.string().trim().max(255).nullable().optional(),
);

export const motorcycleNotesSchema = z.preprocess(
  (value) => (typeof value === 'string' && value.trim() === '' ? null : value),
  z.string().trim().max(2000, 'As anotações devem ter no máximo 2.000 caracteres.').nullable().optional(),
);

const optionalDigits = z.preprocess(
  (value) => (typeof value === 'string' && value.trim() === '' ? null : value),
  z
    .string()
    .trim()
    .regex(/^\d+$/, 'Informe apenas números.')
    .max(20)
    .nullable()
    .optional(),
);

function parseMoneyToCents(value: unknown) {
  if (value === '' || value === undefined || value === null) return undefined;
  if (typeof value === 'number') return Math.round(value * 100);

  if (typeof value !== 'string') return value;
  const text = value.trim();
  if (!text) return undefined;
  const normalized = text.includes(',')
    ? text.replace(/\./g, '').replace(',', '.')
    : text;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? Math.round(parsed * 100) : value;
}

const requiredMoneyCents = (label: string) =>
  z.preprocess(
    parseMoneyToCents,
    z
      .number({ message: `Informe ${label}.` })
      .int()
      .nonnegative(`Informe ${label} válido.`),
  );

export const motorcycleInputSchema = z.object({
  make: z.string().trim().min(2, 'Informe a marca.').max(80),
  model: z.string().trim().min(2, 'Informe o modelo.').max(120),
  manufactureYear: z.coerce
    .number({ message: 'Informe o ano de fabricação.' })
    .int()
    .min(1980, 'Ano de fabricação inválido.')
    .max(currentYear + 1, 'Ano de fabricação inválido.'),
  modelYear: z.coerce
    .number({ message: 'Informe o ano/modelo.' })
    .int()
    .min(1980, 'Ano/modelo inválido.')
    .max(currentYear + 1, 'Ano/modelo inválido.'),
  color: z.string().trim().min(2, 'Informe a cor.').max(50),
  chassis: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-HJ-NPR-Z0-9]{17}$/, 'Informe um chassi válido com 17 caracteres.'),
  plate: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$/, 'Informe uma placa válida.'),
  renavam: optionalDigits,
  mileage: z.coerce
    .number({ message: 'Informe a quilometragem.' })
    .int()
    .min(0, 'A quilometragem não pode ser negativa.')
    .max(2_000_000, 'Informe uma quilometragem válida.'),
  entryDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Informe uma data de entrada válida.'),
  status: z.enum([
    MOTORCYCLE_STATUS.AVAILABLE,
    MOTORCYCLE_STATUS.RESERVED,
    MOTORCYCLE_STATUS.SOLD,
  ]),
  costsCents: requiredMoneyCents('os custos e despesas'),
  purchasePriceCents: requiredMoneyCents('o valor de compra'),
  salePriceCents: requiredMoneyCents('o preço de venda'),
  fipeCode: optionalText,
  fipePriceId: optionalText,
  fipeModelId: optionalText,
  fipeMakeId: optionalText,
  fipeFuelId: optionalText,
  fipeTypeId: optionalText,
  fipeMakeName: optionalText,
  fipeModelName: optionalText,
  fipeFuelName: optionalText,
  fipePriceCents: z.preprocess(
    (value) => (value === '' || value === undefined ? null : Number(value)),
    z.number().int().nonnegative().nullable().optional(),
  ),
  fipeReferenceMonth: z.preprocess(
    (value) => (value === '' || value === undefined ? null : Number(value)),
    z.number().int().min(1).max(12).nullable().optional(),
  ),
  fipeReferenceYear: z.preprocess(
    (value) => (value === '' || value === undefined ? null : Number(value)),
    z.number().int().min(1981).max(currentYear + 1).nullable().optional(),
  ),
});

export type MotorcycleInput = z.infer<typeof motorcycleInputSchema>;

export function formDataToObject(formData: FormData) {
  return Object.fromEntries(formData.entries());
}
