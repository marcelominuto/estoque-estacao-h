'use client';

import { useState, useTransition, type ComponentProps } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

import {
  saveFipeSnapshotAction,
  type MotorcycleActionState,
} from '@/app/(dashboard)/motos/actions';
import { getFipePrice } from '@/lib/fipe/browser';
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

type FipeRefreshTarget = {
  id: string;
  fipeModelId: string;
  fipeFuelId: string;
  modelYear: number;
};

type FormSubmitEvent = Parameters<NonNullable<ComponentProps<'form'>['onSubmit']>>[0];

function appendFipeSnapshot(formData: FormData, id: string, fipe: Awaited<ReturnType<typeof getFipePrice>>) {
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
}

export function RefreshAllFipeButton({ targets }: { targets: FipeRefreshTarget[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleSubmit(event: FormSubmitEvent) {
    event.preventDefault();

    startTransition(async () => {
      if (targets.length === 0) {
        toast.error('Nenhuma moto com referência FIPE para atualizar.');
        return;
      }

      let updated = 0;
      let failed = 0;
      for (const target of targets) {
        try {
          const fipe = await getFipePrice({
            modelId: target.fipeModelId,
            fuelId: target.fipeFuelId,
            year: target.modelYear,
          });
          const formData = new FormData();
          appendFipeSnapshot(formData, target.id, fipe);
          const state: MotorcycleActionState = await saveFipeSnapshotAction({}, formData);
          if (state.success) updated += 1;
          else failed += 1;
        } catch {
          failed += 1;
        }

        await new Promise((resolve) => setTimeout(resolve, 120));
      }

      if (updated > 0) {
        toast.success(failed > 0
          ? `${updated} preços FIPE atualizados. ${failed} não puderam ser consultados.`
          : `${updated} preços FIPE atualizados com sucesso.`);
        setOpen(false);
        router.refresh();
      } else {
        toast.error('Não foi possível atualizar os preços FIPE.');
      }
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
