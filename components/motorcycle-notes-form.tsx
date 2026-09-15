'use client';

import { useActionState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Save } from 'lucide-react';
import { toast } from 'sonner';

import {
  updateMotorcycleNotesAction,
  type MotorcycleActionState,
} from '@/app/(dashboard)/motos/actions';
import { FieldError } from '@/components/field-error';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

export function MotorcycleNotesForm({
  id,
  initialNotes,
}: {
  id: string;
  initialNotes: string | null;
}) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState<
    MotorcycleActionState,
    FormData
  >(updateMotorcycleNotesAction, {});

  useEffect(() => {
    if (state.success) {
      toast.success(state.success);
      router.refresh();
    }
    if (state.error) toast.error(state.error);
  }, [router, state.error, state.success]);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="id" value={id} />
      <Textarea
        id="motorcycle-notes"
        name="notes"
        defaultValue={initialNotes ?? ''}
        maxLength={2000}
        placeholder="Registre observações, pendências, acessórios ou próximos passos"
        aria-describedby="motorcycle-notes-help"
        aria-invalid={!!state.fieldErrors?.notes}
        className="field-control h-auto min-h-28 resize-y rounded-md py-3 leading-6"
      />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p id="motorcycle-notes-help" className="text-xs text-slate-400">
            Até 2.000 caracteres. Este conteúdo é visível apenas para a equipe.
          </p>
          <FieldError message={state.fieldErrors?.notes?.[0]} />
          {state.error && !state.fieldErrors?.notes && (
            <p role="alert" className="mt-1 text-xs font-medium text-red-700">{state.error}</p>
          )}
        </div>
        <Button type="submit" disabled={pending} className="h-10 rounded-md px-4">
          {pending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
          {pending ? 'Salvando...' : 'Salvar anotações'}
        </Button>
      </div>
    </form>
  );
}
