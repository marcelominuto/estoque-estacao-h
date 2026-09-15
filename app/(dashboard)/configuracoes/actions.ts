'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

import { getDb } from '@/db';
import { users } from '@/db/schema';
import { requireAdmin } from '@/lib/auth';
import { TOAST_MESSAGES } from '@/lib/constants/toasts';

export type AccountActionState = {
  error?: string;
  success?: string;
  fieldErrors?: Record<string, string[]>;
};

const accountSchema = z.object({
  name: z.string().trim().min(2, 'Informe seu nome.').max(80, 'O nome deve ter até 80 caracteres.'),
  email: z.email('Informe um e-mail válido.').trim().toLowerCase(),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Informe sua senha atual.'),
  newPassword: z.string().min(8, 'A nova senha deve ter pelo menos 8 caracteres.').max(100, 'A nova senha é muito longa.'),
  confirmPassword: z.string().min(1, 'Confirme a nova senha.'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  path: ['confirmPassword'],
  message: 'As senhas não coincidem.',
});

export async function updateAccountAction(
  _previousState: AccountActionState = {},
  formData: FormData,
): Promise<AccountActionState> {
  const session = await requireAdmin();
  const parsed = accountSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
  });

  if (!parsed.success) {
    return {
      error: 'Revise os campos destacados.',
      fieldErrors: z.flattenError(parsed.error).fieldErrors,
    };
  }

  const db = getDb();
  if (!db) return { error: 'Não foi possível acessar os dados da conta.' };

  try {
    await db
      .update(users)
      .set({
        name: parsed.data.name,
        email: parsed.data.email,
        updatedAt: new Date(),
      })
      .where(eq(users.id, session.user.id));

    revalidatePath('/configuracoes');
    return { success: TOAST_MESSAGES.accountUpdated };
  } catch (error) {
    console.error('update_account_failed', error);
    return { error: 'Não foi possível atualizar a conta. Verifique se o e-mail já está em uso.' };
  }
}

export async function changePasswordAction(
  _previousState: AccountActionState = {},
  formData: FormData,
): Promise<AccountActionState> {
  const session = await requireAdmin();
  const parsed = passwordSchema.safeParse({
    currentPassword: formData.get('currentPassword'),
    newPassword: formData.get('newPassword'),
    confirmPassword: formData.get('confirmPassword'),
  });

  if (!parsed.success) {
    return {
      error: 'Revise os campos destacados.',
      fieldErrors: z.flattenError(parsed.error).fieldErrors,
    };
  }

  const db = getDb();
  if (!db) return { error: 'Não foi possível acessar os dados da conta.' };

  const user = await db.query.users.findFirst({ where: eq(users.id, session.user.id) });
  if (!user || !(await bcrypt.compare(parsed.data.currentPassword, user.passwordHash))) {
    return {
      error: 'A senha atual não confere.',
      fieldErrors: { currentPassword: ['Confira a senha atual e tente novamente.'] },
    };
  }

  try {
    const passwordHash = await bcrypt.hash(parsed.data.newPassword, 12);
    await db
      .update(users)
      .set({ passwordHash, updatedAt: new Date() })
      .where(eq(users.id, session.user.id));

    revalidatePath('/configuracoes');
    return { success: TOAST_MESSAGES.passwordUpdated };
  } catch (error) {
    console.error('change_password_failed', error);
    return { error: 'Não foi possível alterar a senha. Tente novamente.' };
  }
}
