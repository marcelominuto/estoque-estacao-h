'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';

import { MOTORCYCLE_STATUS } from '@/lib/constants/motorcycle';
import { TOAST_MESSAGES } from '@/lib/constants/toasts';
import {
  changeMotorcycleStatus,
  deleteMotorcycle,
  editMotorcycle,
  findMotorcycle,
  insertMotorcycle,
  listMotorcycles,
} from '@/lib/motorcycles';
import { getFipePrice } from '@/lib/fipe';
import type { FipeVehicleOption } from '@/lib/fipe/types';
import {
  formDataToObject,
  motorcycleInputSchema,
  motorcycleNotesSchema,
} from '@/lib/validations/motorcycle';
import { requireAdmin } from '@/lib/auth';
import { calculateTotalCostCents } from '@/lib/inventory';

export type MotorcycleActionState = {
  error?: string;
  success?: string;
  fieldErrors?: Record<string, string[]>;
};

const emptyState: MotorcycleActionState = {};

function parseMotorcycle(formData: FormData) {
  return motorcycleInputSchema.safeParse(formDataToObject(formData));
}

function toDbValues(data: z.infer<typeof motorcycleInputSchema>) {
  return {
    make: data.make,
    model: data.model,
    manufactureYear: data.manufactureYear,
    modelYear: data.modelYear,
    color: data.color,
    chassis: data.chassis,
    plate: data.plate,
    renavam: data.renavam ?? null,
    mileage: data.mileage,
    entryDate: data.entryDate,
    status: data.status,
    costsCents: data.costsCents,
    purchasePriceCents: data.purchasePriceCents,
    totalCostCents: calculateTotalCostCents(data.purchasePriceCents, data.costsCents),
    salePriceCents: data.salePriceCents,
    fipeCode: data.fipeCode ?? null,
    fipePriceId: data.fipePriceId ?? null,
    fipeModelId: data.fipeModelId ?? null,
    fipeMakeId: data.fipeMakeId ?? null,
    fipeFuelId: data.fipeFuelId ?? null,
    fipeTypeId: data.fipeTypeId ?? null,
    fipeMakeName: data.fipeMakeName ?? null,
    fipeModelName: data.fipeModelName ?? null,
    fipeFuelName: data.fipeFuelName ?? null,
    fipePriceCents: data.fipePriceCents ?? null,
    fipeReferenceMonth: data.fipeReferenceMonth ?? null,
    fipeReferenceYear: data.fipeReferenceYear ?? null,
    fipeUpdatedAt: data.fipeCode ? new Date() : null,
  };
}

const fipeSnapshotSchema = z.object({
  id: z.uuid(),
  fipeCode: z.string().trim().min(1).max(50),
  fipePriceId: z.string().trim().min(1).max(255),
  fipeModelId: z.string().trim().min(1).max(255),
  fipeMakeId: z.string().trim().min(1).max(255),
  fipeFuelId: z.string().trim().min(1).max(255),
  fipeTypeId: z.string().trim().min(1).max(255),
  fipeMakeName: z.string().trim().min(1).max(255),
  fipeModelName: z.string().trim().min(1).max(255),
  fipeFuelName: z.string().trim().min(1).max(255),
  fipePriceCents: z.preprocess(
    (value) => value === '' || value === undefined || value === null ? null : Number(value),
    z.number().int().nonnegative().nullable(),
  ),
  fipeReferenceMonth: z.coerce.number().int().min(1).max(12),
  fipeReferenceYear: z.coerce.number().int().min(1981).max(new Date().getFullYear() + 1),
});

function toFipeDbValues(fipe: FipeVehicleOption) {
  return {
    fipeCode: fipe.fipeCode,
    fipePriceId: fipe.priceId,
    fipeModelId: fipe.modelId,
    fipeMakeId: fipe.makeId,
    fipeFuelId: fipe.fuelId,
    fipeTypeId: fipe.typeId,
    fipeMakeName: fipe.makeName,
    fipeModelName: fipe.modelName,
    fipeFuelName: fipe.fuelName,
    fipePriceCents: fipe.priceCents,
    fipeReferenceMonth: fipe.referenceMonth,
    fipeReferenceYear: fipe.referenceYear,
    fipeUpdatedAt: new Date(),
  };
}

async function refreshMotorcycleFipe({
  id,
  fipeModelId,
  fipeFuelId,
  modelYear,
}: {
  id: string;
  fipeModelId: string | null;
  fipeFuelId: string | null;
  modelYear: number;
}) {
  if (!fipeModelId || !fipeFuelId) {
    throw new Error('FIPEX_REFERENCE_MISSING');
  }

  const fipe = await getFipePrice({
    modelId: fipeModelId,
    fuelId: fipeFuelId,
    year: modelYear,
  });

  await editMotorcycle(id, toFipeDbValues(fipe));

  return fipe;
}

export async function createMotorcycleAction(
  _previousState: MotorcycleActionState = emptyState,
  formData: FormData,
): Promise<MotorcycleActionState> {
  await requireAdmin();
  const parsed = parseMotorcycle(formData);
  if (!parsed.success) {
    return {
      error: 'Revise os campos destacados.',
      fieldErrors: z.flattenError(parsed.error).fieldErrors,
    };
  }

  try {
    await insertMotorcycle(toDbValues(parsed.data));
    revalidatePath('/estoque');
    return { success: TOAST_MESSAGES.motorcycleCreated };
  } catch (error) {
    console.error('create_motorcycle_failed', error);
    return { error: 'Não foi possível cadastrar a moto. Tente novamente.' };
  }
}

export async function updateMotorcycleAction(
  _previousState: MotorcycleActionState = emptyState,
  formData: FormData,
): Promise<MotorcycleActionState> {
  await requireAdmin();
  const id = z.uuid().safeParse(formData.get('id'));
  if (!id.success) return { error: 'Moto inválida.' };

  const parsed = parseMotorcycle(formData);
  if (!parsed.success) {
    return {
      error: 'Revise os campos destacados.',
      fieldErrors: z.flattenError(parsed.error).fieldErrors,
    };
  }

  try {
    await editMotorcycle(id.data, toDbValues(parsed.data));
    revalidatePath('/estoque');
    revalidatePath(`/motos/${id.data}/editar`);
    return { success: TOAST_MESSAGES.motorcycleUpdated };
  } catch (error) {
    console.error('update_motorcycle_failed', error);
    return { error: 'Não foi possível atualizar a moto. Tente novamente.' };
  }
}

export async function updateStatusAction(formData: FormData): Promise<MotorcycleActionState> {
  await requireAdmin();
  const id = z.uuid().safeParse(formData.get('id'));
  const status = z
    .enum([
      MOTORCYCLE_STATUS.AVAILABLE,
      MOTORCYCLE_STATUS.RESERVED,
      MOTORCYCLE_STATUS.SOLD,
    ])
    .safeParse(formData.get('status'));

  if (!id.success || !status.success) return { error: 'Status inválido.' };

  try {
    await changeMotorcycleStatus(id.data, status.data);
    revalidatePath('/estoque');
    return { success: TOAST_MESSAGES.statusUpdated };
  } catch (error) {
    console.error('update_status_failed', error);
    return { error: 'Não foi possível atualizar o status. Tente novamente.' };
  }
}

export async function updateMotorcycleNotesAction(
  _previousState: MotorcycleActionState = emptyState,
  formData: FormData,
): Promise<MotorcycleActionState> {
  await requireAdmin();
  const id = z.uuid().safeParse(formData.get('id'));
  const notes = motorcycleNotesSchema.safeParse(formData.get('notes'));

  if (!id.success) return { error: 'Moto inválida.' };
  if (!notes.success) {
    return {
      error: 'Revise o campo de anotações.',
      fieldErrors: { notes: notes.error.issues.map((issue) => issue.message) },
    };
  }

  try {
    await editMotorcycle(id.data, { notes: notes.data ?? null });
    revalidatePath(`/motos/${id.data}`);
    return { success: TOAST_MESSAGES.notesUpdated };
  } catch (error) {
    console.error('update_motorcycle_notes_failed', error);
    return { error: 'Não foi possível salvar as anotações. Tente novamente.' };
  }
}

export async function refreshFipeAction(
  _previousState: MotorcycleActionState = emptyState,
  formData: FormData,
): Promise<MotorcycleActionState> {
  await requireAdmin();
  const id = z.uuid().safeParse(formData.get('id'));
  if (!id.success) return { error: 'Moto inválida.' };

  const motorcycle = await findMotorcycle(id.data);
  if (!motorcycle?.fipeModelId || !motorcycle.fipeFuelId) {
    return { error: 'Associe uma referência FIPE antes de atualizar o preço.' };
  }

  try {
    await refreshMotorcycleFipe({
      id: id.data,
      fipeModelId: motorcycle.fipeModelId,
      fipeFuelId: motorcycle.fipeFuelId,
      modelYear: motorcycle.modelYear,
    });

    revalidatePath('/estoque');
    revalidatePath(`/motos/${id.data}`);
    revalidatePath(`/motos/${id.data}/editar`);
    return { success: TOAST_MESSAGES.fipeUpdated };
  } catch (error) {
    console.error('refresh_fipe_failed', error);
    return { error: 'Não foi possível atualizar o preço FIPE. Tente novamente.' };
  }
}

export async function saveFipeSnapshotAction(
  _previousState: MotorcycleActionState = emptyState,
  formData: FormData,
): Promise<MotorcycleActionState> {
  await requireAdmin();
  const parsed = fipeSnapshotSchema.safeParse(formDataToObject(formData));
  if (!parsed.success) return { error: 'Referência FIPE inválida.' };

  try {
    await editMotorcycle(parsed.data.id, {
      fipeCode: parsed.data.fipeCode,
      fipePriceId: parsed.data.fipePriceId,
      fipeModelId: parsed.data.fipeModelId,
      fipeMakeId: parsed.data.fipeMakeId,
      fipeFuelId: parsed.data.fipeFuelId,
      fipeTypeId: parsed.data.fipeTypeId,
      fipeMakeName: parsed.data.fipeMakeName,
      fipeModelName: parsed.data.fipeModelName,
      fipeFuelName: parsed.data.fipeFuelName,
      fipePriceCents: parsed.data.fipePriceCents,
      fipeReferenceMonth: parsed.data.fipeReferenceMonth,
      fipeReferenceYear: parsed.data.fipeReferenceYear,
      fipeUpdatedAt: new Date(),
    });
    revalidatePath('/estoque');
    revalidatePath(`/motos/${parsed.data.id}`);
    revalidatePath(`/motos/${parsed.data.id}/editar`);
    return { success: TOAST_MESSAGES.fipeUpdated };
  } catch (error) {
    console.error('save_fipe_snapshot_failed', error);
    return { error: 'Não foi possível salvar o preço FIPE. Tente novamente.' };
  }
}

export async function refreshAllFipeAction(
  _previousState: MotorcycleActionState = emptyState,
  _formData: FormData,
): Promise<MotorcycleActionState> {
  await requireAdmin();

  const motorcycles = await listMotorcycles();
  const eligibleMotorcycles = motorcycles.filter(
    (motorcycle) => motorcycle.fipeModelId && motorcycle.fipeFuelId,
  );

  if (eligibleMotorcycles.length === 0) {
    return { error: 'Nenhuma moto com referência FIPE para atualizar.' };
  }

  let updated = 0;
  let failed = 0;

  for (const motorcycle of eligibleMotorcycles) {
    try {
      await refreshMotorcycleFipe(motorcycle);
      updated += 1;
    } catch (error) {
      failed += 1;
      console.error('refresh_all_fipe_item_failed', { id: motorcycle.id, error });
    }

    // Stay comfortably below the public FIPEX rate limit between requests.
    await new Promise((resolve) => setTimeout(resolve, 120));
  }

  revalidatePath('/estoque');
  for (const motorcycle of eligibleMotorcycles) {
    revalidatePath(`/motos/${motorcycle.id}`);
  }

  if (updated === 0) {
    return { error: 'Não foi possível atualizar os preços FIPE.' };
  }

  return {
    success: failed > 0
      ? `${updated} preços FIPE atualizados. ${failed} não puderam ser consultados.`
      : `${updated} preços FIPE atualizados com sucesso.`,
  };
}

export async function deleteMotorcycleAction(
  _previousState: MotorcycleActionState = emptyState,
  formData: FormData,
): Promise<MotorcycleActionState> {
  await requireAdmin();
  const id = z.uuid().safeParse(formData.get('id'));
  if (!id.success) return { error: 'Moto inválida.' };

  try {
    await deleteMotorcycle(id.data);
    revalidatePath('/estoque');
    return { success: TOAST_MESSAGES.motorcycleDeleted };
  } catch (error) {
    console.error('delete_motorcycle_failed', error);
    return { error: 'Não foi possível excluir a moto. Tente novamente.' };
  }
}
