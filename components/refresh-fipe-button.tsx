'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

import {
  saveFipeSnapshotAction,
  type MotorcycleActionState,
} from '@/app/(dashboard)/motos/actions';
import { getFipePrice } from '@/lib/fipe/browser';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

export function RefreshFipeButton({
  id,
  vehicleLabel,
  fipeModelId,
  fipeFuelId,
  modelYear,
  disabled = false,
}: {
  id: string;
  vehicleLabel: string;
  fipeModelId: string | null;
  fipeFuelId: string | null;
  modelYear: number;
  disabled?: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleRefresh() {
    if (disabled || !fipeModelId || !fipeFuelId) return;

    startTransition(async () => {
      try {
        const fipe = await getFipePrice({ modelId: fipeModelId, fuelId: fipeFuelId, year: modelYear });
        const formData = new FormData();
        formData.set('id', id);
        formData.set('fipeCode', fipe.fipeCode);
        formData.set('fipePriceId', fipe.priceId);
        formData.set('fipeModelId', fipe.modelId);
        formData.set('fipeMakeId', fipe.makeId);
        formData.set('fipeFuelId', fipe.fuelId);
        formData.set('fipeTypeId', fipe.typeId);
        formData.set('fipeMakeName', fipe.makeName);
        formData.set('fipeModelName', fipe.modelName);
        formData.set('fipeFuelName', fipe.fuelName);
        formData.set('fipePriceCents', fipe.priceCents === null ? '' : String(fipe.priceCents));
        formData.set('fipeReferenceMonth', String(fipe.referenceMonth));
        formData.set('fipeReferenceYear', String(fipe.referenceYear));

        const state: MotorcycleActionState = await saveFipeSnapshotAction({}, formData);
        if (state.success) {
          toast.success(state.success);
          router.refresh();
        }
        if (state.error) toast.error(state.error);
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') return;
        toast.error('Não foi possível atualizar o preço FIPE. Tente novamente.');
      }
    });
  }

  const isDisabled = disabled || pending;

  return (
    <form onSubmit={(event) => { event.preventDefault(); handleRefresh(); }}>
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
