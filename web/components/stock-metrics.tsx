import { Bike, CircleDollarSign, Clock3, TrendingUp, UsersRound } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import type { MotorcycleListItem } from '@/lib/motorcycles';
import { formatCurrencyFromCents } from '@/lib/format';

type MetricTone = 'red' | 'green' | 'amber' | 'slate' | 'blue';

const toneStyles: Record<MetricTone, { icon: string; value: string; borderHover: string }> = {
  red: {
    icon: 'bg-red-50 text-primary ring-1 ring-red-100',
    value: 'text-slate-950',
    borderHover: 'hover:border-red-200/80',
  },
  green: {
    icon: 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100',
    value: 'text-emerald-950',
    borderHover: 'hover:border-emerald-200/80',
  },
  amber: {
    icon: 'bg-amber-50 text-amber-600 ring-1 ring-amber-100',
    value: 'text-amber-950',
    borderHover: 'hover:border-amber-200/80',
  },
  slate: {
    icon: 'bg-slate-100 text-slate-700 ring-1 ring-slate-200/80',
    value: 'text-slate-950',
    borderHover: 'hover:border-slate-300',
  },
  blue: {
    icon: 'bg-sky-50 text-sky-600 ring-1 ring-sky-100',
    value: 'text-sky-950',
    borderHover: 'hover:border-sky-200/80',
  },
};

function MetricCard({
  label,
  value,
  detail,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string;
  detail: string;
  icon: typeof Bike;
  tone: MetricTone;
}) {
  const styles = toneStyles[tone];

  return (
    <Card className={`group/metric relative min-w-0 py-0 last:col-span-2 xl:last:col-span-1 rounded-lg bg-white ${styles.borderHover}`}>
      <CardContent className="flex min-h-[116px] flex-col justify-between gap-3 p-4 sm:p-5">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[12px] font-semibold text-slate-500 transition-[color] duration-150 group-hover/metric:text-slate-700">{label}</span>
          <span className={`flex size-7 shrink-0 items-center justify-center rounded-md shadow-[0_1px_2px_rgba(0,0,0,0.02)] ${styles.icon}`}>
            <Icon className="size-3.5" strokeWidth={2} />
          </span>
        </div>
        <div>
          <p className={`text-[clamp(1.25rem,1.7vw,1.75rem)] leading-tight font-bold tracking-tight tabular-nums break-words ${styles.value}`}>{value}</p>
          <p className="mt-1 text-[11px] font-medium leading-4 text-slate-400">{detail}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export function StockMetrics({ motorcycles }: { motorcycles: MotorcycleListItem[] }) {
  const available = motorcycles.filter((motorcycle) => motorcycle.status === 'AVAILABLE').length;
  const reserved = motorcycles.filter((motorcycle) => motorcycle.status === 'RESERVED').length;
  const inStock = motorcycles.filter((motorcycle) => motorcycle.status !== 'SOLD');
  const capitalInStockCents = inStock.reduce(
    (total, motorcycle) => total + (motorcycle.totalCostCents ?? 0),
    0,
  );
  const potentialRevenueCents = inStock.reduce(
    (total, motorcycle) => total + (motorcycle.salePriceCents ?? 0),
    0,
  );
  const potentialMarginCents = potentialRevenueCents - capitalInStockCents;
  const averageDays = inStock.length > 0
    ? Math.round(inStock.reduce((total, motorcycle) => total + motorcycle.daysInStock, 0) / inStock.length)
    : 0;

  return (
    <section aria-label="Métricas do estoque" className="grid grid-cols-2 gap-3 xl:grid-cols-5">
      <MetricCard
        label="Total de motos"
        value={String(motorcycles.length)}
        detail={motorcycles.length === 1 ? 'veículo cadastrado' : 'veículos cadastrados'}
        icon={Bike}
        tone="red"
      />
      <MetricCard
        label="Disponíveis"
        value={String(available)}
        detail="prontas para venda"
        icon={UsersRound}
        tone="green"
      />
      <MetricCard
        label="Reservadas"
        value={String(reserved)}
        detail="em negociação"
        icon={Clock3}
        tone="amber"
      />
      <MetricCard
        label="Capital no estoque"
        value={formatCurrencyFromCents(capitalInStockCents)}
        detail={`${averageDays} dias médios em estoque`}
        icon={CircleDollarSign}
        tone="slate"
      />
      <MetricCard
        label="Margem potencial"
        value={formatCurrencyFromCents(potentialMarginCents)}
        detail="venda estimada − custo total"
        icon={TrendingUp}
        tone={potentialMarginCents >= 0 ? 'blue' : 'red'}
      />
    </section>
  );
}
