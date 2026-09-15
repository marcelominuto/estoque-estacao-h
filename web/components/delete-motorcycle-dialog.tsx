'use client';

import { useActionState, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import {
  deleteMotorcycleAction,
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
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

export function DeleteMotorcycleDialog({
  id,
  vehicleLabel,
}: {
  id: string;
  vehicleLabel: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState<
    MotorcycleActionState,
    FormData
  >(deleteMotorcycleAction, {});

  useEffect(() => {
    if (state.success) {
      toast.success(state.success);
      router.refresh();
    }
    if (state.error) toast.error(state.error);
  }, [router, state.error, state.success]);

  return (
    <>
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => setOpen(true)}
              aria-label={`Excluir ${vehicleLabel}`}
              className="size-8 rounded-lg border border-slate-200/80 bg-white text-slate-500 shadow-sm transition-[border-color,background-color,color,transform] duration-150 hover:border-red-300 hover:bg-red-50/80 hover:text-red-700 active:scale-95"
            >
              <Trash2 className="size-3.5" strokeWidth={1.75} />
            </Button>
          }
        />
        <TooltipContent>Excluir moto</TooltipContent>
      </Tooltip>

      <Dialog open={open && !state.success} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir moto?</DialogTitle>
            <DialogDescription>
              A moto <strong className="font-semibold text-foreground">{vehicleLabel}</strong> será removida do estoque. Essa ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <form action={formAction}>
            <input type="hidden" name="id" value={id} />
            <DialogFooter>
              <DialogClose render={<Button type="button" variant="outline" />}>
                Cancelar
              </DialogClose>
              <Button type="submit" variant="destructive" disabled={pending}>
                {pending && <Loader2 className="animate-spin" />}
                {pending ? 'Excluindo...' : 'Excluir moto'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
