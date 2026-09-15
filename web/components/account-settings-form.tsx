'use client';

import { useActionState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { KeyRound, Loader2, Save } from 'lucide-react';
import { toast } from 'sonner';

import {
  changePasswordAction,
  updateAccountAction,
  type AccountActionState,
} from '@/app/(dashboard)/configuracoes/actions';
import { FieldError } from '@/components/field-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function AccountSettingsForm({
  initialName,
  initialEmail,
}: {
  initialName: string;
  initialEmail: string;
}) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState<AccountActionState, FormData>(
    updateAccountAction,
    {},
  );

  useEffect(() => {
    if (state.success) {
      toast.success(state.success);
      router.refresh();
    }
    if (state.error) toast.error(state.error);
  }, [router, state.error, state.success]);

  const errorFor = (field: string) => state.fieldErrors?.[field]?.[0];

  return (
    <form action={formAction} className="space-y-6">
      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <Label htmlFor="account-name" className="field-label">Nome</Label>
          <Input
            id="account-name"
            name="name"
            defaultValue={initialName}
            autoComplete="name"
            aria-invalid={!!errorFor('name')}
            className="field-control"
          />
          <FieldError message={errorFor('name')} />
        </div>
        <div>
          <Label htmlFor="account-email" className="field-label">E-mail</Label>
          <Input
            id="account-email"
            name="email"
            type="email"
            defaultValue={initialEmail}
            autoComplete="email"
            aria-invalid={!!errorFor('email')}
            className="field-control"
          />
          <FieldError message={errorFor('email')} />
        </div>
      </div>
      <div className="flex justify-end border-t border-slate-100 pt-5">
        <Button type="submit" disabled={pending} className="h-10 rounded-md px-4">
          {pending ? <Loader2 className="animate-spin" /> : <Save />}
          {pending ? 'Salvando...' : 'Salvar alterações'}
        </Button>
      </div>
    </form>
  );
}

export function PasswordSettingsForm() {
  const [state, formAction, pending] = useActionState<AccountActionState, FormData>(
    changePasswordAction,
    {},
  );

  useEffect(() => {
    if (state.success) toast.success(state.success);
    if (state.error) toast.error(state.error);
  }, [state.error, state.success]);

  const errorFor = (field: string) => state.fieldErrors?.[field]?.[0];

  return (
    <form action={formAction} className="space-y-6">
      <div className="grid gap-5 md:grid-cols-2">
        <div className="md:col-span-2">
          <Label htmlFor="current-password" className="field-label">Senha atual</Label>
          <Input
            id="current-password"
            name="currentPassword"
            type="password"
            autoComplete="current-password"
            aria-invalid={!!errorFor('currentPassword')}
            className="field-control"
          />
          <FieldError message={errorFor('currentPassword')} />
        </div>
        <div>
          <Label htmlFor="new-password" className="field-label">Nova senha</Label>
          <Input
            id="new-password"
            name="newPassword"
            type="password"
            autoComplete="new-password"
            aria-invalid={!!errorFor('newPassword')}
            className="field-control"
          />
          <FieldError message={errorFor('newPassword')} />
        </div>
        <div>
          <Label htmlFor="confirm-password" className="field-label">Confirmar nova senha</Label>
          <Input
            id="confirm-password"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            aria-invalid={!!errorFor('confirmPassword')}
            className="field-control"
          />
          <FieldError message={errorFor('confirmPassword')} />
        </div>
      </div>
      <div className="flex items-center justify-between gap-4 border-t border-slate-100 pt-5">
        <p className="text-xs leading-5 text-slate-400">Use pelo menos 8 caracteres.</p>
        <Button type="submit" disabled={pending} className="h-10 rounded-md px-4">
          {pending ? <Loader2 className="animate-spin" /> : <KeyRound />}
          {pending ? 'Alterando...' : 'Alterar senha'}
        </Button>
      </div>
    </form>
  );
}
