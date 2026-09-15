'use client';

import { useActionState, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Bike, CircleDollarSign, FileText, Loader2, Save } from 'lucide-react';
import { toast } from 'sonner';

import { FieldError } from '@/components/field-error';
import { FipeVehiclePicker } from '@/components/fipe-vehicle-picker';
import { AppSelect } from '@/components/ui/app-select';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DatePicker } from '@/components/ui/date-picker';
import { MoneyInput } from '@/components/ui/money-input';
import type { MotorcycleActionState } from '@/app/(dashboard)/motos/actions';
import {
  createMotorcycleAction,
  updateMotorcycleAction,
} from '@/app/(dashboard)/motos/actions';
import type { FipeVehicleOption } from '@/lib/fipe';

type FormValues = {
  id?: string;
  make?: string | null;
  model?: string | null;
  manufactureYear?: number | null;
  modelYear?: number | null;
  color?: string | null;
  chassis?: string | null;
  plate?: string | null;
  renavam?: string | null;
  mileage?: number | null;
  entryDate?: string | null;
  status?: 'AVAILABLE' | 'RESERVED' | 'SOLD' | null;
  costsCents?: number | null;
  purchasePriceCents?: number | null;
  salePriceCents?: number | null;
  fipeCode?: string | null;
  fipePriceId?: string | null;
  fipeModelId?: string | null;
  fipeMakeId?: string | null;
  fipeFuelId?: string | null;
  fipeTypeId?: string | null;
  fipeMakeName?: string | null;
  fipeModelName?: string | null;
  fipeFuelName?: string | null;
  fipePriceCents?: number | null;
  fipeReferenceMonth?: number | null;
  fipeReferenceYear?: number | null;
};

const DEFAULT_ENTRY_DATE = new Date().toISOString().slice(0, 10);

const DEFAULT_VALUES: FormValues = {
  status: 'AVAILABLE',
  mileage: 0,
  entryDate: DEFAULT_ENTRY_DATE,
};

function initialFipe(value?: FormValues): FipeVehicleOption | null {
  if (!value?.fipeCode || !value.fipeModelName || !value.fipeMakeName) {
    return null;
  }

  return {
    priceId: value.fipePriceId ?? '',
    modelId: value.fipeModelId ?? '',
    makeId: value.fipeMakeId ?? '',
    fuelId: value.fipeFuelId ?? '',
    typeId: value.fipeTypeId ?? '',
    fipeCode: value.fipeCode,
    makeName: value.fipeMakeName,
    modelName: value.fipeModelName,
    fuelName: value.fipeFuelName ?? '—',
    modelYear: value.modelYear ?? null,
    priceCents: value.fipePriceCents ?? null,
    referenceMonth: value.fipeReferenceMonth ?? 1,
    referenceYear: value.fipeReferenceYear ?? new Date().getFullYear(),
    referenceId: '',
    bodyTypeName: null,
  };
}

function moneyInputValue(cents?: number | null) {
  return cents === null || cents === undefined
    ? ''
    : (cents / 100).toFixed(2);
}

export function MotorcycleForm({
  initialValues,
  mode,
}: {
  initialValues?: FormValues;
  mode: 'create' | 'edit';
}) {
  const router = useRouter();
  const values = useMemo(
    () => ({ ...DEFAULT_VALUES, ...initialValues }),
    [initialValues],
  );
  const action =
    mode === 'create' ? createMotorcycleAction : updateMotorcycleAction;
  const [state, formAction, pending] = useActionState<
    MotorcycleActionState,
    FormData
  >(action, {});
  const [fipe, setFipe] = useState<FipeVehicleOption | null>(() =>
    initialFipe(values),
  );
  const [manualIdentity, setManualIdentity] = useState({
    make: values.make ?? '',
    model: values.model ?? '',
    modelYear: values.modelYear?.toString() ?? '',
  });

  useEffect(() => {
    if (state.success) {
      toast.success(state.success);
      router.push('/estoque');
      router.refresh();
    }
  }, [router, state.success]);

  const errors = state.fieldErrors ?? {};
  const field = (name: string) => errors[name]?.[0];
  const selectedMake = fipe?.makeName ?? manualIdentity.make;
  const selectedModel = fipe?.modelName ?? manualIdentity.model;
  const selectedModelYear =
    fipe?.modelYear?.toString() ?? manualIdentity.modelYear;

  function handleFipeSelect(next: FipeVehicleOption | null) {
    setFipe(next);
    if (next) {
      setManualIdentity((current) => ({
        ...current,
        make: next.makeName,
        model: next.modelName,
        modelYear: next.modelYear?.toString() ?? current.modelYear,
      }));
    }
  }

  return (
    <form action={formAction} className="space-y-6">
      {mode === 'edit' && (
        <input type="hidden" name="id" value={values.id ?? ''} />
      )}

      <Card className="overflow-visible">
        <CardHeader className="border-b border-slate-100">
          <div className="flex items-start gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-red-50 text-primary">
              <Bike className="size-5" />
            </div>
            <div>
              <CardTitle>1. Escolha o veículo na FIPE</CardTitle>
              <CardDescription>
                Selecione a marca, o modelo e o ano/modelo para identificar a versão correta.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <FipeVehiclePicker initial={fipe} onSelect={handleFipeSelect} />
          <input type="hidden" name="fipeCode" value={fipe?.fipeCode ?? ''} readOnly />
          <input type="hidden" name="fipePriceId" value={fipe?.priceId ?? ''} readOnly />
          <input type="hidden" name="fipeModelId" value={fipe?.modelId ?? ''} readOnly />
          <input type="hidden" name="fipeMakeId" value={fipe?.makeId ?? ''} readOnly />
          <input type="hidden" name="fipeFuelId" value={fipe?.fuelId ?? ''} readOnly />
          <input type="hidden" name="fipeTypeId" value={fipe?.typeId ?? ''} readOnly />
          <input type="hidden" name="fipeMakeName" value={fipe?.makeName ?? ''} readOnly />
          <input type="hidden" name="fipeModelName" value={fipe?.modelName ?? ''} readOnly />
          <input type="hidden" name="fipeFuelName" value={fipe?.fuelName ?? ''} readOnly />
          <input type="hidden" name="fipePriceCents" value={fipe?.priceCents ?? ''} readOnly />
          <input type="hidden" name="fipeReferenceMonth" value={fipe?.referenceMonth ?? ''} readOnly />
          <input type="hidden" name="fipeReferenceYear" value={fipe?.referenceYear ?? ''} readOnly />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="border-b border-slate-100">
          <div className="flex items-start gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
              <FileText className="size-5" />
            </div>
            <div>
              <CardTitle>2. Dados da unidade</CardTitle>
              <CardDescription>
                Confirme os dados identificadores e as informações específicas desta moto.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid gap-5 pt-6 sm:grid-cols-3">
          <div>
            <Label htmlFor="make" className="field-label">Marca</Label>
            <Input
              id="make"
              name="make"
              value={selectedMake}
              onChange={(event) => setManualIdentity((current) => ({ ...current, make: event.target.value }))}
              readOnly={!!fipe}
              className={`field-control ${fipe ? 'bg-slate-50 text-slate-500' : ''}`}
              placeholder="Honda"
              aria-invalid={!!field('make')}
            />
            <FieldError message={field('make')} />
          </div>
          <div>
            <Label htmlFor="model" className="field-label">Modelo / versão</Label>
            <Input
              id="model"
              name="model"
              value={selectedModel}
              onChange={(event) => setManualIdentity((current) => ({ ...current, model: event.target.value }))}
              readOnly={!!fipe}
              className={`field-control ${fipe ? 'bg-slate-50 text-slate-500' : ''}`}
              placeholder="CB 500F"
              aria-invalid={!!field('model')}
            />
            <FieldError message={field('model')} />
          </div>
          <div>
            <Label htmlFor="manufactureYear" className="field-label">Ano de fabricação</Label>
            <Input id="manufactureYear" name="manufactureYear" type="number" min="1980" max="2100" defaultValue={values.manufactureYear ?? ''} className="field-control" aria-invalid={!!field('manufactureYear')} />
            <FieldError message={field('manufactureYear')} />
          </div>
          <div>
            <Label htmlFor="modelYear" className="field-label">Ano/modelo</Label>
            <Input
              id="modelYear"
              name="modelYear"
              type="number"
              min="1980"
              max="2100"
              value={selectedModelYear}
              onChange={(event) => setManualIdentity((current) => ({ ...current, modelYear: event.target.value }))}
              readOnly={!!fipe?.modelYear}
              className={`field-control ${fipe?.modelYear ? 'bg-slate-50 text-slate-500' : ''}`}
              aria-invalid={!!field('modelYear')}
            />
            <FieldError message={field('modelYear')} />
          </div>
          <div>
            <Label htmlFor="chassis" className="field-label">Chassi</Label>
            <Input id="chassis" name="chassis" defaultValue={values.chassis ?? ''} className="field-control uppercase" placeholder="17 caracteres" maxLength={17} aria-invalid={!!field('chassis')} />
            <FieldError message={field('chassis')} />
          </div>
          <div>
            <Label htmlFor="plate" className="field-label">Placa</Label>
            <Input id="plate" name="plate" defaultValue={values.plate ?? ''} className="field-control uppercase" placeholder="ABC1D23" maxLength={7} aria-invalid={!!field('plate')} />
            <FieldError message={field('plate')} />
          </div>
          <div>
            <Label htmlFor="renavam" className="field-label">
              RENAVAM <span className="font-normal text-slate-400">(opcional)</span>
            </Label>
            <Input id="renavam" name="renavam" defaultValue={values.renavam ?? ''} inputMode="numeric" className="field-control" placeholder="Número do registro" aria-invalid={!!field('renavam')} />
            <FieldError message={field('renavam')} />
          </div>
          <div>
            <Label htmlFor="color" className="field-label">Cor</Label>
            <Input id="color" name="color" defaultValue={values.color ?? ''} className="field-control" placeholder="Preta" aria-invalid={!!field('color')} />
            <FieldError message={field('color')} />
          </div>
          <div>
            <Label htmlFor="mileage" className="field-label">Quilometragem</Label>
            <div className="relative">
              <Input id="mileage" name="mileage" type="number" min="0" defaultValue={values.mileage ?? 0} inputMode="numeric" className="field-control !pr-12" aria-invalid={!!field('mileage')} />
              <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">km</span>
            </div>
            <FieldError message={field('mileage')} />
          </div>
          <div>
            <Label htmlFor="entryDate" className="field-label">Entrada no estoque</Label>
            <DatePicker id="entryDate" name="entryDate" defaultValue={values.entryDate ?? DEFAULT_ENTRY_DATE} invalid={!!field('entryDate')} />
            <FieldError message={field('entryDate')} />
          </div>
          <div>
            <Label htmlFor="status" className="field-label">Status</Label>
            <AppSelect
              id="status"
              name="status"
              defaultValue={values.status ?? 'AVAILABLE'}
              placeholder="Selecione o status"
              invalid={!!field('status')}
              options={[
                { value: 'AVAILABLE', label: 'Disponível' },
                { value: 'RESERVED', label: 'Reservada' },
                { value: 'SOLD', label: 'Vendida' },
              ]}
            />
            <FieldError message={field('status')} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="border-b border-slate-100">
          <div className="flex items-start gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
              <CircleDollarSign className="size-5" />
            </div>
            <div>
              <CardTitle>3. Valores da unidade</CardTitle>
              <CardDescription>
                Informe o investimento e o preço de venda para acompanhar a margem da moto.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid gap-5 pt-6 sm:grid-cols-2">
          <MoneyField id="purchasePriceCents" label="Preço pago na moto" value={values.purchasePriceCents} error={field('purchasePriceCents')} />
          <MoneyField id="costsCents" label="Custos / despesas" value={values.costsCents ?? 0} error={field('costsCents')} />
          <MoneyField id="salePriceCents" label="Preço de venda" value={values.salePriceCents} error={field('salePriceCents')} />
        </CardContent>
      </Card>

      {state.error && (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {state.error}
        </div>
      )}

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" onClick={() => router.push('/estoque')} className="h-11 rounded-xl px-5">
          <ArrowLeft className="size-4" />
          Cancelar
        </Button>
        <Button type="submit" disabled={pending} className="h-11 rounded-xl bg-primary px-6 text-primary-foreground shadow-lg shadow-red-900/15 hover:bg-primary/90">
          {pending ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
          {pending ? 'Salvando...' : mode === 'create' ? 'Cadastrar moto' : 'Salvar alterações'}
        </Button>
      </div>
    </form>
  );
}

function MoneyField({
  id,
  label,
  value,
  error,
}: {
  id: string;
  label: string;
  value?: number | null;
  error?: string;
}) {
  return (
    <div>
      <Label htmlFor={id} className="field-label">{label}</Label>
      <MoneyInput id={id} name={id} defaultValue={moneyInputValue(value)} placeholder="0,00" aria-invalid={!!error} />
      <FieldError message={error} />
    </div>
  );
}
