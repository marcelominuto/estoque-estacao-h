'use client';

import Link from 'next/link';
import { useState, type CSSProperties } from 'react';
import {
  Bike,
  CalendarDays,
  CarFront,
  ChevronRight,
  CircleDollarSign,
  Eye,
  Gauge,
  Loader2,
  NotebookPen,
  X,
} from 'lucide-react';

import { MotorcycleNotesForm } from '@/components/motorcycle-notes-form';
import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import {
  MOTORCYCLE_STATUS_COLORS,
  MOTORCYCLE_STATUS_LABELS,
  type MotorcycleStatus,
} from '@/lib/constants/motorcycle';
import { formatCurrencyFromCents, formatDate, formatDateTime } from '@/lib/format';
import { calculateTotalCostCents } from '@/lib/inventory';
import type { FipePriceHistoryPoint } from '@/lib/fipe';

type MotorcycleDetails = {
  id: string;
  make: string;
  model: string;
  manufactureYear: number;
  modelYear: number;
  color: string;
  chassis: string | null;
  plate: string;
  renavam: string | null;
  notes: string | null;
  mileage: number;
  entryDate: string;
  status: MotorcycleStatus;
  daysInStock: number;
  purchasePriceCents: number | null;
  costsCents: number | null;
  totalCostCents: number | null;
  salePriceCents: number | null;
  fipeCode: string | null;
  fipeMakeName: string | null;
  fipeModelName: string | null;
  fipeFuelName: string | null;
  fipePriceCents: number | null;
  fipeReferenceMonth: number | null;
  fipeReferenceYear: number | null;
  fipeUpdatedAt: string | null;
  fipeHistory: FipePriceHistoryPoint[];
};

type DetailsResponse = {
  data?: MotorcycleDetails;
  message?: string;
};

export function MotorcycleDetailsDrawer({
  id,
  vehicleLabel,
}: {
  id: string;
  vehicleLabel: string;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [details, setDetails] = useState<MotorcycleDetails | null>(null);

  async function loadDetails() {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/motos/${id}`, { cache: 'no-store' });
      const payload = (await response.json()) as DetailsResponse;
      if (!response.ok || !payload.data) {
        throw new Error(payload.message ?? 'Não foi possível carregar os dados da moto.');
      }
      setDetails(payload.data);
    } catch {
      setError('Não foi possível carregar os dados da moto. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen);
    if (nextOpen && !loading) void loadDetails();
  }

  return (
    <>
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => handleOpenChange(true)}
              aria-label={`Visualizar ${vehicleLabel}`}
              className="size-8 rounded-lg border border-slate-200/80 bg-white text-slate-500 shadow-sm transition-[border-color,background-color,color,transform] duration-150 hover:border-sky-300 hover:bg-sky-50/80 hover:text-sky-700 active:scale-95"
            >
              <Eye className="size-3.5" strokeWidth={1.75} />
            </Button>
          }
        />
        <TooltipContent>Visualizar moto</TooltipContent>
      </Tooltip>

      <Drawer open={open} onOpenChange={handleOpenChange} swipeDirection="right" showSwipeHandle>
        <DrawerContent
          style={{ '--drawer-content-width': 'min(100vw, 64rem)' } as CSSProperties}
          className="sm:[--drawer-content-width:64rem]"
        >
          <DrawerHeader className="border-b border-slate-100 p-5 pb-5 text-left">
            <div className="flex items-start justify-between gap-4">
              <div className="flex min-w-0 items-start gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-red-50 text-primary">
                  <Bike className="size-5" />
                </span>
                <div className="min-w-0">
                  <p className="section-kicker mb-1">Detalhes da moto</p>
                  <DrawerTitle className="truncate text-xl font-semibold tracking-tight text-slate-950">{details ? `${details.make} ${details.model}` : vehicleLabel}</DrawerTitle>
                  <DrawerDescription className="mt-1 truncate text-left">{details ? `${details.plate} · ${details.color}` : 'Carregando informações completas...'}</DrawerDescription>
                </div>
              </div>
              <DrawerClose
                render={
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Fechar detalhes"
                    className="shrink-0 rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-900"
                  />
                }
              >
                <X />
              </DrawerClose>
            </div>
          </DrawerHeader>

          <div className="min-h-0 flex-1 overflow-y-auto bg-[#fbfbfa] p-5">
            {loading && !details && <DetailsSkeleton />}
            {error && !details && (
              <div className="flex min-h-56 flex-col items-center justify-center border border-red-200 bg-red-50 px-6 text-center">
                <p className="text-sm font-semibold text-red-800">{error}</p>
                <Button type="button" variant="outline" onClick={() => void loadDetails()} className="mt-4 rounded-md border-red-200 bg-white text-red-700 hover:bg-red-100">
                  Tentar novamente
                </Button>
              </div>
            )}
            {details && <DetailsContent details={details} />}
          </div>

          <DrawerFooter className="border-t border-slate-100 bg-white p-4 pt-4 sm:flex-row sm:justify-end">
            <DrawerClose render={<Button type="button" variant="outline" className="rounded-md" />}>Fechar</DrawerClose>
            <Button nativeButton={false} render={<Link href={`/motos/${id}`} />} className="rounded-md bg-primary text-primary-foreground hover:bg-primary/90">
              Abrir página completa
              <ChevronRight className="size-4" />
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
}

function DetailsContent({ details }: { details: MotorcycleDetails }) {
  const totalCostCents = details.totalCostCents ?? calculateTotalCostCents(details.purchasePriceCents, details.costsCents);
  const potentialMarginCents = totalCostCents !== null && details.salePriceCents !== null
    ? details.salePriceCents - totalCostCents
    : null;
  const statusColor = MOTORCYCLE_STATUS_COLORS[details.status];

  return (
    <div className="space-y-5">
      <section className="grid grid-cols-2 gap-3" aria-label="Resumo da moto">
        <DrawerMetric label="Dias em estoque" value={`${details.daysInStock} dias`} icon={CalendarDays} tone="red" />
        <DrawerMetric label="Custo total" value={formatCurrencyFromCents(totalCostCents)} icon={CircleDollarSign} tone="slate" />
        <DrawerMetric label="Preço de venda" value={formatCurrencyFromCents(details.salePriceCents)} icon={CarFront} tone="amber" />
        <DrawerMetric label="Margem potencial" value={formatSignedCurrency(potentialMarginCents)} icon={Gauge} tone={potentialMarginCents !== null && potentialMarginCents >= 0 ? 'green' : 'red'} />
      </section>

      <DrawerSection title="Dados da unidade" icon={<Bike className="size-4" />}>
        <div className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
          <DetailItem label="Marca" value={details.make} />
          <DetailItem label="Modelo / versão" value={details.model} />
          <DetailItem label="Ano de fabricação" value={String(details.manufactureYear)} />
          <DetailItem label="Ano/modelo" value={String(details.modelYear)} />
          <DetailItem label="Placa" value={details.plate} mono />
          <DetailItem label="Chassi" value={details.chassis ?? '—'} mono />
          <DetailItem label="RENAVAM" value={details.renavam ?? '—'} mono />
          <DetailItem label="Cor" value={details.color} />
          <DetailItem label="Quilometragem" value={`${details.mileage.toLocaleString('pt-BR')} km`} />
          <DetailItem label="Entrada no estoque" value={formatDate(details.entryDate)} />
          <DetailItem label="Preço pago" value={formatCurrencyFromCents(details.purchasePriceCents)} />
          <DetailItem label="Custos / despesas" value={formatCurrencyFromCents(details.costsCents)} />
          <div>
            <p className="text-xs font-medium text-slate-400">Status</p>
            <span className={`mt-1 inline-flex ${statusColor.badge}`}>
              {MOTORCYCLE_STATUS_LABELS[details.status]}
            </span>
          </div>
        </div>
      </DrawerSection>

      <DrawerSection title="Anotações / observações" description="Informações internas visíveis apenas para a equipe." icon={<NotebookPen className="size-4" />} tone="amber">
        <MotorcycleNotesForm id={details.id} initialNotes={details.notes} />
      </DrawerSection>

      <DrawerSection title="Referência FIPE" description="Snapshot salvo e histórico mensal disponível." icon={<CircleDollarSign className="size-4" />} tone="green">
        <div className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
          <DetailItem label="Marca FIPE" value={details.fipeMakeName ?? '—'} />
          <DetailItem label="Modelo FIPE" value={details.fipeModelName ?? '—'} />
          <DetailItem label="Combustível" value={details.fipeFuelName ?? '—'} />
          <DetailItem label="Código FIPE" value={details.fipeCode ?? '—'} mono />
          <DetailItem label="Valor atual" value={formatCurrencyFromCents(details.fipePriceCents)} />
          <DetailItem label="Referência" value={formatReference(details.fipeReferenceMonth, details.fipeReferenceYear)} />
          <DetailItem label="Atualizado em" value={formatDateTime(details.fipeUpdatedAt)} />
        </div>
        <FipeHistory history={details.fipeHistory} currentPriceCents={details.fipePriceCents} referenceMonth={details.fipeReferenceMonth} referenceYear={details.fipeReferenceYear} hasFipe={!!details.fipeCode} />
      </DrawerSection>
    </div>
  );
}

function DrawerMetric({ label, value, icon: Icon, tone }: { label: string; value: string; icon: typeof Bike; tone: 'red' | 'slate' | 'amber' | 'green' }) {
  const styles = {
    red: 'bg-red-50 text-primary ring-1 ring-red-100',
    slate: 'bg-slate-100 text-slate-700 ring-1 ring-slate-200/70',
    amber: 'bg-amber-50 text-amber-700 ring-1 ring-amber-100',
    green: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100',
  }[tone];

  return (
    <div className="rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-xs transition-shadow hover:shadow-sm">
      <div className="flex items-start justify-between gap-2">
        <span className={`flex size-7 shrink-0 items-center justify-center rounded-lg shadow-[0_1px_2px_rgba(0,0,0,0.02)] ${styles}`}><Icon className="size-3.5" strokeWidth={2} /></span>
        <span className="text-right text-sm font-bold tracking-tight text-slate-950 tabular-nums">{value}</span>
      </div>
      <p className="mt-2.5 text-xs font-medium text-slate-500">{label}</p>
    </div>
  );
}

function DrawerSection({ title, description, icon, tone = 'red', children }: { title: string; description?: string; icon: React.ReactNode; tone?: 'red' | 'amber' | 'green'; children: React.ReactNode }) {
  const iconClass = {
    red: 'bg-red-50 text-primary ring-1 ring-red-100',
    amber: 'bg-amber-50 text-amber-700 ring-1 ring-amber-100',
    green: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100',
  }[tone];

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[var(--shadow-surface)]">
      <div className="flex items-start gap-3 border-b border-slate-100 px-4 py-3.5">
        <span className={`flex size-8 shrink-0 items-center justify-center rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.02)] ${iconClass}`}>{icon}</span>
        <div className="min-w-0">
          <h2 className="text-sm font-bold text-slate-950">{title}</h2>
          {description && <p className="mt-0.5 text-xs leading-5 text-slate-500">{description}</p>}
        </div>
      </div>
      <div className="p-4 sm:p-5">{children}</div>
    </section>
  );
}

function DetailItem({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="min-w-0">
      <p className="text-xs font-medium text-slate-400">{label}</p>
      <p className={`mt-1 truncate text-sm font-medium text-slate-800 ${mono ? 'font-mono text-xs' : ''}`}>{value}</p>
    </div>
  );
}

function FipeHistory({ history, currentPriceCents, referenceMonth, referenceYear, hasFipe }: { history: FipePriceHistoryPoint[]; currentPriceCents: number | null; referenceMonth: number | null; referenceYear: number | null; hasFipe: boolean }) {
  if (!hasFipe) return <p className="mt-5 border border-dashed border-slate-200 px-4 py-5 text-center text-xs text-slate-500">Nenhuma referência FIPE associada.</p>;

  const points = history.length > 0 ? history : currentPriceCents !== null && referenceMonth && referenceYear
    ? [{ priceCents: currentPriceCents, referenceMonth, referenceYear, referenceId: null }]
    : [];

  return (
    <div className="mt-5 border-t border-slate-100 pt-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold text-slate-900">Histórico mensal</p>
          <p className="mt-0.5 text-xs text-slate-400">{points.length} {points.length === 1 ? 'referência salva' : 'referências salvas'}</p>
        </div>
        <span className="text-xs text-slate-400">Últimas 6</span>
      </div>
      {points.length > 0 ? (
        <div className="mt-3 space-y-2">
          {points.slice(-6).reverse().map((point) => (
            <div key={`${point.referenceYear}-${point.referenceMonth}`} className="flex items-center justify-between border-b border-slate-100 py-1.5 text-xs last:border-0">
              <span className="text-slate-500">{formatReference(point.referenceMonth, point.referenceYear)}</span>
              <span className="font-semibold text-slate-800">{formatCurrencyFromCents(point.priceCents)}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-3 text-xs text-slate-500">O preço atual está salvo, mas o histórico não está disponível.</p>
      )}
    </div>
  );
}

function DetailsSkeleton() {
  return (
    <div className="space-y-5" aria-label="Carregando detalhes" aria-busy="true">
      <div className="grid grid-cols-2 gap-3">
        {Array.from({ length: 4 }, (_, index) => <div key={index} className="h-[92px] animate-pulse bg-slate-200/70" />)}
      </div>
      <div className="space-y-4 border border-slate-200 bg-white p-5">
        <div className="h-5 w-36 animate-pulse bg-slate-200" />
        <div className="grid grid-cols-2 gap-4">
          {Array.from({ length: 8 }, (_, index) => <div key={index} className="h-10 animate-pulse bg-slate-100" />)}
        </div>
      </div>
      <div className="flex items-center justify-center gap-2 py-4 text-sm text-slate-400">
        <Loader2 className="size-4 animate-spin" /> Carregando informações...
      </div>
    </div>
  );
}

function formatSignedCurrency(value: number | null) {
  if (value === null) return '—';
  if (value > 0) return `+${formatCurrencyFromCents(value)}`;
  return formatCurrencyFromCents(value);
}

function formatReference(month: number | null, year: number | null) {
  if (!month || !year) return 'Sem referência';
  return new Intl.DateTimeFormat('pt-BR', { month: 'short', year: 'numeric' })
    .format(new Date(year, month - 1, 1))
    .replace('.', '');
}
