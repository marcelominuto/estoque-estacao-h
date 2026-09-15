import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ArrowLeft,
  Bike,
  CalendarDays,
  CircleDollarSign,
  NotebookPen,
  Pencil,
  Tag,
  TrendingUp,
} from 'lucide-react';

import { StatusForm } from '@/components/status-form';
import { MotorcycleNotesForm } from '@/components/motorcycle-notes-form';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  getFipePriceHistory,
  type FipePriceHistoryPoint,
} from '@/lib/fipe';
import { calculateDaysInStock, calculateTotalCostCents } from '@/lib/inventory';
import { findMotorcycle } from '@/lib/motorcycles';
import {
  MOTORCYCLE_STATUS_COLORS,
  MOTORCYCLE_STATUS_LABELS,
  type MotorcycleStatus,
} from '@/lib/constants/motorcycle';
import { formatCurrencyFromCents, formatDate, formatDateTime } from '@/lib/format';

export const dynamic = 'force-dynamic';

export default async function MotorcycleDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const motorcycle = await findMotorcycle(id);
  if (!motorcycle) notFound();

  let fipeHistory: FipePriceHistoryPoint[] = [];
  if (motorcycle.fipePriceId) {
    try {
      fipeHistory = await getFipePriceHistory(motorcycle.fipePriceId);
    } catch {
      // A FIPE indisponível não impede a visualização dos dados cadastrados.
    }
  }

  const status = motorcycle.status as MotorcycleStatus;
  const totalCostCents = calculateTotalCostCents(
    motorcycle.purchasePriceCents,
    motorcycle.costsCents,
  );
  const daysInStock = calculateDaysInStock(motorcycle.entryDate);
  const currentFipePoint = motorcycle.fipePriceCents !== null && motorcycle.fipeReferenceMonth && motorcycle.fipeReferenceYear
    ? [{
        priceCents: motorcycle.fipePriceCents,
        referenceMonth: motorcycle.fipeReferenceMonth,
        referenceYear: motorcycle.fipeReferenceYear,
        referenceId: motorcycle.fipePriceId,
      } satisfies FipePriceHistoryPoint]
    : [];
  const history = fipeHistory.length > 0 ? fipeHistory : currentFipePoint;
  const potentialMarginCents = totalCostCents !== null && motorcycle.salePriceCents !== null
    ? motorcycle.salePriceCents - totalCostCents
    : null;
  const saleVsFipeCents = motorcycle.salePriceCents !== null && motorcycle.fipePriceCents !== null
    ? motorcycle.salePriceCents - motorcycle.fipePriceCents
    : null;

  return (
    <div className="space-y-6">
      <Link href="/estoque" className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 transition-colors hover:text-primary">
        <ArrowLeft className="size-4" />Voltar para o estoque
      </Link>

      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="section-kicker mb-2">Detalhes da moto</p>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            {motorcycle.make} {motorcycle.model}
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            {motorcycle.plate} · {motorcycle.color} · {motorcycle.mileage.toLocaleString('pt-BR')} km
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <StatusForm id={motorcycle.id} status={status} size="toolbar" />
          <Button
            nativeButton={false}
            render={<Link href={`/motos/${motorcycle.id}/editar`} />}
            variant="outline"
            className="h-10 rounded-md px-4"
          >
            <Pencil className="size-4" />Editar moto
          </Button>
        </div>
      </div>

      <section aria-label="Resumo financeiro e operacional" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard label="Dias em estoque" value={`${daysInStock} dias`} detail={`Entrada em ${formatDate(motorcycle.entryDate)}`} icon={CalendarDays} tone="amber" />
        <SummaryCard label="Custo total" value={formatCurrencyFromCents(totalCostCents)} detail="Preço pago + custos/despesas" icon={CircleDollarSign} tone="slate" />
        <SummaryCard label="Preço de venda" value={formatCurrencyFromCents(motorcycle.salePriceCents)} detail="Valor definido para venda" icon={Tag} tone="green" />
        <SummaryCard label="Valor FIPE" value={formatCurrencyFromCents(motorcycle.fipePriceCents)} detail={formatReference(motorcycle.fipeReferenceMonth, motorcycle.fipeReferenceYear)} icon={TrendingUp} tone="blue" />
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_minmax(320px,0.75fr)]">
        <Card>
          <CardHeader className="border-b border-slate-100">
            <div className="flex items-start gap-3">
              <div className="flex size-9 items-center justify-center rounded-lg bg-red-50 text-primary">
                <Bike className="size-4" />
              </div>
              <div>
                <CardTitle>Dados da unidade</CardTitle>
                <CardDescription>Informações cadastradas desta motocicleta.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="grid gap-x-8 gap-y-5 pt-6 sm:grid-cols-2">
            <DetailItem label="Marca" value={motorcycle.make} />
            <DetailItem label="Modelo / versão" value={motorcycle.model} />
            <DetailItem label="Ano de fabricação" value={String(motorcycle.manufactureYear)} />
            <DetailItem label="Ano/modelo" value={String(motorcycle.modelYear)} />
            <DetailItem label="Entrada no estoque" value={formatDate(motorcycle.entryDate)} />
            <DetailItem label="Placa" value={motorcycle.plate} mono />
            <DetailItem label="Chassi" value={motorcycle.chassis ?? '—'} mono />
            <DetailItem label="RENAVAM" value={motorcycle.renavam ?? '—'} mono />
            <DetailItem label="Cor" value={motorcycle.color} />
            <DetailItem label="Quilometragem" value={`${motorcycle.mileage.toLocaleString('pt-BR')} km`} />
            <DetailItem label="Preço pago na moto" value={formatCurrencyFromCents(motorcycle.purchasePriceCents)} />
            <DetailItem label="Custos / despesas" value={formatCurrencyFromCents(motorcycle.costsCents)} />
            <DetailItem label="Status" value={MOTORCYCLE_STATUS_LABELS[status]} badgeClassName={MOTORCYCLE_STATUS_COLORS[status].badge} />
          </CardContent>
        </Card>

        <CommercialInsights
          totalCostCents={totalCostCents}
          salePriceCents={motorcycle.salePriceCents}
          fipePriceCents={motorcycle.fipePriceCents}
          potentialMarginCents={potentialMarginCents}
          saleVsFipeCents={saleVsFipeCents}
          daysInStock={daysInStock}
          fipeUpdatedAt={motorcycle.fipeUpdatedAt}
        />
      </section>

      <NotesCard id={motorcycle.id} notes={motorcycle.notes} />

      <Card>
        <CardHeader className="border-b border-slate-100">
          <div className="flex items-start gap-3">
            <div className="flex size-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
              <TrendingUp className="size-4" />
            </div>
            <div>
              <CardTitle>Referência FIPE</CardTitle>
              <CardDescription>Snapshot associado à moto e evolução mensal do preço.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid gap-6 pt-6 lg:grid-cols-[minmax(0,1fr)_280px]">
          <div className="grid content-start gap-x-8 gap-y-5 sm:grid-cols-2">
            <DetailItem label="Marca FIPE" value={motorcycle.fipeMakeName ?? '—'} />
            <DetailItem label="Modelo FIPE" value={motorcycle.fipeModelName ?? '—'} />
            <DetailItem label="Combustível" value={motorcycle.fipeFuelName ?? '—'} />
            <DetailItem label="Código FIPE" value={motorcycle.fipeCode ?? '—'} mono />
            <DetailItem label="Ano/modelo FIPE" value={String(motorcycle.modelYear)} />
            <DetailItem label="Referência da tabela" value={formatReference(motorcycle.fipeReferenceMonth, motorcycle.fipeReferenceYear)} />
            <DetailItem label="Valor atual" value={formatCurrencyFromCents(motorcycle.fipePriceCents)} />
            <DetailItem label="Última atualização" value={formatDateTime(motorcycle.fipeUpdatedAt)} />
          </div>
          <FipeHistory history={history} hasRemoteHistory={fipeHistory.length > 0} hasFipe={!!motorcycle.fipeCode} />
        </CardContent>
      </Card>
    </div>
  );
}

function NotesCard({ id, notes }: { id: string; notes: string | null }) {
  return (
    <Card>
      <CardHeader className="border-b border-slate-100">
        <div className="flex items-start gap-3">
          <div className="flex size-9 items-center justify-center rounded-lg bg-amber-50 text-amber-700">
            <NotebookPen className="size-4" />
          </div>
          <div>
            <CardTitle>Anotações / observações</CardTitle>
            <CardDescription>Informações internas para acompanhar esta moto.</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-5">
        <MotorcycleNotesForm id={id} initialNotes={notes} />
      </CardContent>
    </Card>
  );
}

function SummaryCard({
  label,
  value,
  detail,
  icon: Icon,
  tone = 'slate',
}: {
  label: string;
  value: string;
  detail: string;
  icon: typeof Bike;
  tone?: 'red' | 'green' | 'amber' | 'slate' | 'blue';
}) {
  const toneMap = {
    red: { icon: 'bg-red-50 text-primary ring-1 ring-red-100', value: 'text-slate-950', hover: 'hover:border-red-200/80' },
    green: { icon: 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100', value: 'text-emerald-950', hover: 'hover:border-emerald-200/80' },
    amber: { icon: 'bg-amber-50 text-amber-600 ring-1 ring-amber-100', value: 'text-amber-950', hover: 'hover:border-amber-200/80' },
    slate: { icon: 'bg-slate-100 text-slate-700 ring-1 ring-slate-200/80', value: 'text-slate-950', hover: 'hover:border-slate-300' },
    blue: { icon: 'bg-sky-50 text-sky-600 ring-1 ring-sky-100', value: 'text-sky-950', hover: 'hover:border-sky-200/80' },
  };
  const config = toneMap[tone];

  return (
    <Card className={`group/summary min-w-0 py-0 rounded-2xl bg-white transition-[box-shadow,border-color,transform] duration-150 hover:-translate-y-0.5 ${config.hover} shadow-[var(--shadow-surface)]`}>
      <CardContent className="flex min-h-[118px] flex-col justify-between gap-4 p-5">
        <div className="flex items-start justify-between gap-3">
          <span className="text-xs font-semibold text-slate-500 transition-colors group-hover/summary:text-slate-700">{label}</span>
          <span className={`flex size-8 shrink-0 items-center justify-center rounded-xl shadow-[0_1px_2px_rgba(0,0,0,0.02)] ${config.icon}`}>
            <Icon className="size-4" strokeWidth={2} />
          </span>
        </div>
        <div>
          <p className={`text-2xl font-bold tracking-tight tabular-nums ${config.value}`}>{value}</p>
          <p className="mt-1 text-[11px] font-medium text-slate-400">{detail}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function DetailItem({
  label,
  value,
  mono = false,
  badgeClassName,
}: {
  label: string;
  value: string;
  mono?: boolean;
  badgeClassName?: string;
}) {
  return (
    <div className="min-w-0">
      <p className="text-xs font-medium text-slate-400">{label}</p>
      {badgeClassName ? (
        <span className={`mt-1 inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold ${badgeClassName}`}>
          {value}
        </span>
      ) : (
        <p className={`mt-1 truncate text-sm font-semibold text-slate-800 ${mono ? 'font-mono text-xs' : ''}`}>{value}</p>
      )}
    </div>
  );
}

function CommercialInsights({
  totalCostCents,
  salePriceCents,
  fipePriceCents,
  potentialMarginCents,
  saleVsFipeCents,
  daysInStock,
  fipeUpdatedAt,
}: {
  totalCostCents: number | null;
  salePriceCents: number | null;
  fipePriceCents: number | null;
  potentialMarginCents: number | null;
  saleVsFipeCents: number | null;
  daysInStock: number;
  fipeUpdatedAt: Date | null;
}) {
  const marginPercent = totalCostCents && totalCostCents > 0 && potentialMarginCents !== null
    ? (potentialMarginCents / totalCostCents) * 100
    : null;
  const comparisonValues = [totalCostCents, salePriceCents, fipePriceCents].filter(
    (value): value is number => value !== null,
  );
  const comparisonMax = Math.max(...comparisonValues, 1);
  const marginIsPositive = potentialMarginCents !== null && potentialMarginCents >= 0;

  return (
    <Card className="rounded-2xl bg-white shadow-[var(--shadow-surface)]">
      <CardHeader className="border-b border-slate-100">
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle>Leitura comercial</CardTitle>
            <CardDescription>Indicadores para apoiar a decisão de venda.</CardDescription>
          </div>
          <span className="shrink-0 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-[11px] font-semibold text-slate-600">Tempo real</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 pt-5">
        <div className={`rounded-2xl border p-4 shadow-[0_1px_2px_rgba(0,0,0,0.02)] ${marginIsPositive ? 'border-emerald-200 bg-gradient-to-br from-emerald-50/80 to-emerald-50/30' : 'border-red-200 bg-gradient-to-br from-red-50/80 to-red-50/30'}`}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Margem estimada</p>
              <p className={`mt-1.5 text-2xl font-bold tracking-tight tabular-nums ${marginIsPositive ? 'text-emerald-800' : 'text-rose-700'}`}>
                {formatSignedCurrency(potentialMarginCents)}
              </p>
            </div>
            <div className={`text-right text-sm font-bold tabular-nums ${marginIsPositive ? 'text-emerald-800' : 'text-rose-700'}`}>
              <span className="rounded-lg bg-white/80 px-2 py-0.5 shadow-xs">{formatPercent(marginPercent)}</span>
              <p className="mt-1 text-[11px] font-normal text-slate-500">sobre o custo total</p>
            </div>
          </div>
          <p className="mt-3 text-xs leading-5 text-slate-600">Estimativa antes de outros descontos, impostos ou negociação.</p>
        </div>

        <div>
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-bold text-slate-900">Comparativo de valores</p>
            <p className="text-xs font-medium text-slate-400">Base: maior valor</p>
          </div>
          <div className="mt-4 space-y-3.5">
            <ComparisonBar label="Custo total" valueCents={totalCostCents} maxCents={comparisonMax} tone="slate" />
            <ComparisonBar label="Preço de venda" valueCents={salePriceCents} maxCents={comparisonMax} tone="red" />
            <ComparisonBar label="FIPE atual" valueCents={fipePriceCents} maxCents={comparisonMax} tone="green" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-x-5 gap-y-4 border-t border-slate-100 pt-5">
          <SmallInsight label="Venda x FIPE" value={formatSignedCurrency(saleVsFipeCents)} tone={saleVsFipeCents !== null && saleVsFipeCents >= 0 ? 'positive' : 'negative'} />
          <SmallInsight label="Tempo no estoque" value={`${daysInStock} dias`} />
          <SmallInsight label="Preço de venda" value={formatCurrencyFromCents(salePriceCents)} />
          <SmallInsight label="FIPE atualizada" value={formatDateTime(fipeUpdatedAt)} />
        </div>
      </CardContent>
    </Card>
  );
}

function ComparisonBar({
  label,
  valueCents,
  maxCents,
  tone,
}: {
  label: string;
  valueCents: number | null;
  maxCents: number;
  tone: 'slate' | 'red' | 'green';
}) {
  const width = valueCents === null ? 0 : Math.max(4, Math.min(100, (valueCents / maxCents) * 100));
  const toneClass = tone === 'red' ? 'bg-primary' : tone === 'green' ? 'bg-emerald-500' : 'bg-slate-700';

  return (
    <div>
      <div className="flex items-center justify-between gap-3 text-xs">
        <span className="font-medium text-slate-600">{label}</span>
        <span className="font-bold text-slate-900 tabular-nums">{formatCurrencyFromCents(valueCents)}</span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
        <div className={`h-full rounded-full ${toneClass} transition-all duration-300`} style={{ width: `${width}%` }} />
      </div>
    </div>
  );
}

function SmallInsight({
  label,
  value,
  tone = 'neutral',
}: {
  label: string;
  value: string;
  tone?: 'positive' | 'negative' | 'neutral';
}) {
  const toneClass = tone === 'positive'
    ? 'text-emerald-700'
    : tone === 'negative'
      ? 'text-red-700'
      : 'text-slate-900';

  return (
    <div className="min-w-0">
      <p className="text-[11px] font-medium text-slate-400">{label}</p>
      <p className={`mt-1 truncate text-xs font-semibold ${toneClass}`}>{value}</p>
    </div>
  );
}

function formatSignedCurrency(value: number | null) {
  if (value === null) return '—';
  if (value > 0) return `+${formatCurrencyFromCents(value)}`;
  return formatCurrencyFromCents(value);
}

function formatPercent(value: number | null) {
  if (value === null) return '—';
  return `${value.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%`;
}

function FipeHistory({
  history,
  hasRemoteHistory,
  hasFipe,
}: {
  history: FipePriceHistoryPoint[];
  hasRemoteHistory: boolean;
  hasFipe: boolean;
}) {
  if (!hasFipe) {
    return <div className="flex min-h-40 items-center justify-center border border-dashed border-slate-200 px-5 text-center text-sm text-slate-500">Nenhuma referência FIPE associada.</div>;
  }

  if (history.length === 0) {
    return <div className="flex min-h-40 items-center justify-center border border-dashed border-slate-200 px-5 text-center text-sm text-slate-500">Não foi possível carregar o histórico FIPE agora. O snapshot atual continua salvo.</div>;
  }

  const chartHistory = history.slice(-12);
  const values = chartHistory.map((point) => point.priceCents);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const spread = max - min || 1;
  const chartPoints = chartHistory.map((point, index) => {
    const x = chartHistory.length === 1 ? 50 : (index / (chartHistory.length - 1)) * 100;
    const y = 88 - ((point.priceCents - min) / spread) * 68;
    return { point, x, y };
  });
  const line = chartPoints.map(({ x, y }) => `${x},${y}`).join(' ');
  const areaPolygon = chartPoints.length > 1
    ? `${chartPoints[0].x},96 ${line} ${chartPoints.at(-1)?.x},96`
    : '';

  return (
    <div>
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-slate-400">Histórico mensal</p>
          <p className="mt-1 text-lg font-bold text-slate-950">{history.length} {history.length === 1 ? 'referência' : 'referências'}</p>
        </div>
        <p className="text-right text-xs font-medium text-slate-400">{chartHistory.length === 1 ? 'Último mês' : `Últimos ${chartHistory.length} meses`}</p>
      </div>
      <div className="mt-4 overflow-hidden rounded-xl border border-slate-200/70 bg-gradient-to-b from-slate-50/70 to-slate-50/20 p-3.5 shadow-xs">
        <svg viewBox="0 0 100 100" className="h-36 w-full" aria-labelledby="fipe-history-chart-title">
          <defs>
            <linearGradient id="fipe-gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="oklch(0.50 0.20 25)" stopOpacity="0.22" />
              <stop offset="100%" stopColor="oklch(0.50 0.20 25)" stopOpacity="0.01" />
            </linearGradient>
          </defs>
          <title id="fipe-history-chart-title">Evolução do preço FIPE</title>
          {[22, 50, 78].map((y) => (
            <line key={y} x1="0" x2="100" y1={y} y2={y} stroke="currentColor" strokeDasharray="3 3" className="text-slate-200" />
          ))}
          {areaPolygon && <polygon points={areaPolygon} fill="url(#fipe-gradient)" />}
          <polyline
            points={line}
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-primary"
            vectorEffect="non-scaling-stroke"
          />
          {chartPoints.map(({ point, x, y }) => (
            <g key={`${point.referenceYear}-${point.referenceMonth}`}>
              <circle cx={x} cy={y} r="3" className="fill-white stroke-primary stroke-[1.5]" vectorEffect="non-scaling-stroke" />
              <circle cx={x} cy={y} r="1.5" className="fill-primary" vectorEffect="non-scaling-stroke" />
            </g>
          ))}
        </svg>
        <div className="mt-2 flex items-center justify-between text-[11px] font-semibold text-slate-400">
          <span>{formatReference(chartHistory[0].referenceMonth, chartHistory[0].referenceYear)}</span>
          <span className="rounded-full bg-white px-2 py-0.5 text-[10px] text-slate-600 shadow-xs ring-1 ring-slate-200/60">
            Min: {formatCurrencyFromCents(min)}
          </span>
          <span>{formatReference(chartHistory.at(-1)!.referenceMonth, chartHistory.at(-1)!.referenceYear)}</span>
        </div>
      </div>
      <div className="mt-4 space-y-1.5">
        {history.slice(-4).reverse().map((point) => (
          <div key={`${point.referenceYear}-${point.referenceMonth}`} className="flex items-center justify-between gap-3 rounded-lg bg-slate-50/70 px-3 py-2 text-xs">
            <span className="font-medium text-slate-500">{formatReference(point.referenceMonth, point.referenceYear)}</span>
            <span className="font-bold text-slate-900 tabular-nums">{formatCurrencyFromCents(point.priceCents)}</span>
          </div>
        ))}
      </div>
      {!hasRemoteHistory && <p className="mt-4 text-xs leading-5 text-slate-400">Exibindo o snapshot salvo enquanto o histórico completo não está disponível.</p>}
    </div>
  );
}

function formatReference(month?: number | null, year?: number | null) {
  if (!month || !year) return 'Sem referência';
  return new Intl.DateTimeFormat('pt-BR', { month: 'short', year: 'numeric' })
    .format(new Date(year, month - 1, 1))
    .replace('.', '');
}
