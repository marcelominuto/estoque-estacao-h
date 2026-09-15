'use client';

import { useState, useTransition, type ComponentProps } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

import {
  refreshAllFipeAction,
  type MotorcycleActionState,
} from '@/app/(dashboard)/motos/actions';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

type FormSubmitEvent = Parameters<NonNullable<ComponentProps<'form'>['onSubmit']>>[0];

export function RefreshAllFipeButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleSubmit(event: FormSubmitEvent) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      const state: MotorcycleActionState = await refreshAllFipeAction({}, formData);
      if (state.success) {
        toast.success(state.success);
        setOpen(false);
        router.refresh();
      }
      if (state.error) toast.error(state.error);
    });
  }

  return (
    <>
      <Button
        type="button"
        variant="outline"
        disabled={pending}
        onClick={() => setOpen(true)}
        className="h-10 rounded-xl border-slate-200/90 bg-white px-3.5 text-xs font-semibold text-slate-700 shadow-sm transition-all hover:border-slate-300 hover:bg-slate-50 hover:text-slate-950 active:scale-[0.97]"
      >
        {pending ? <Loader2 className="size-4 animate-spin" /> : <RefreshCw className="size-4 text-slate-500" strokeWidth={1.75} />}
        {pending ? 'Atualizando preços...' : 'Atualizar FIPE geral'}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Atualizar todos os preços FIPE?</DialogTitle>
            <DialogDescription>
              O sistema consultará novamente a FIPE para todas as motos com referência associada e salvará o preço e a data da nova consulta.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <DialogFooter>
              <DialogClose render={<Button type="button" variant="outline" />}>Cancelar</DialogClose>
              <Button type="submit" disabled={pending}>
                {pending && <Loader2 className="animate-spin" />}
                {pending ? 'Atualizando...' : 'Atualizar preços'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
