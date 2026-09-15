'use client';

import { useActionState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

import {
  refreshFipeAction,
  type MotorcycleActionState,
} from '@/app/(dashboard)/motos/actions';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

export function RefreshFipeButton({
  id,
  vehicleLabel,
  disabled = false,
}: {
  id: string;
  vehicleLabel: string;
  disabled?: boolean;
}) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState<
    MotorcycleActionState,
    FormData
  >(refreshFipeAction, {});

  useEffect(() => {
    if (state.success) {
      toast.success(state.success);
      router.refresh();
    }
    if (state.error) toast.error(state.error);
  }, [router, state.error, state.success]);

  const isDisabled = disabled || pending;

  return (
    <form action={formAction}>
      <input type="hidden" name="id" value={id} />
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              type="submit"
              variant="outline"
              size="icon"
              disabled={isDisabled}
              aria-label={disabled ? `Sem referência FIPE para ${vehicleLabel}` : `Atualizar FIPE de ${vehicleLabel}`}
              className={disabled
                ? 'size-8 rounded-lg border border-slate-100 bg-slate-50/50 text-slate-300 cursor-not-allowed'
                : 'size-8 rounded-lg border border-slate-200/80 bg-white text-slate-500 shadow-sm transition-[border-color,background-color,color,transform] duration-150 hover:border-emerald-300 hover:bg-emerald-50/80 hover:text-emerald-700 active:scale-95'}
            >
              {pending ? <Loader2 className="size-3.5 animate-spin" /> : <RefreshCw className="size-3.5" strokeWidth={1.75} />}
            </Button>
          }
        />
        <TooltipContent>{disabled ? 'Associe a FIPE para atualizar' : 'Atualizar preço FIPE'}</TooltipContent>
      </Tooltip>
    </form>
  );
}
